import { db } from "../../db";
import { sql } from "drizzle-orm";
import { EmbeddingDocument, EmbeddingService } from "./embeddingService";

export interface SearchResult {
  document: EmbeddingDocument;
  similarity: number;
  rank: number;
}

export interface SearchOptions {
  topK?: number;
  minSimilarity?: number;
  filters?: {
    platform?: string;
    category?: string;
    source?: string;
  };
}

export class VectorStore {
  private embeddingService: EmbeddingService;

  constructor(embeddingService: EmbeddingService) {
    this.embeddingService = embeddingService;
  }

  /**
   * Initialize vector storage (create pgvector extension and tables)
   */
  async initialize(): Promise<void> {
    try {
      // Enable pgvector extension
      await db.execute(sql`CREATE EXTENSION IF NOT EXISTS vector`);
      
      // Create vector storage table if not exists
      await db.execute(sql`
        CREATE TABLE IF NOT EXISTS vector_embeddings (
          id TEXT PRIMARY KEY,
          content TEXT NOT NULL,
          metadata JSONB NOT NULL,
          embedding vector(1536),
          created_at TIMESTAMP DEFAULT NOW()
        )
      `);

      // Create indexes for better performance
      await db.execute(sql`
        CREATE INDEX IF NOT EXISTS vector_embeddings_embedding_idx 
        ON vector_embeddings USING ivfflat (embedding vector_cosine_ops)
      `);

      await db.execute(sql`
        CREATE INDEX IF NOT EXISTS vector_embeddings_metadata_idx 
        ON vector_embeddings USING gin (metadata)
      `);

      console.log("Vector store initialized successfully");
    } catch (error) {
      console.error("Error initializing vector store:", error);
      throw new Error(`Failed to initialize vector store: ${error instanceof Error ? error.message : "Unknown error"}`);
    }
  }

  /**
   * Store embeddings in the database
   */
  async storeEmbeddings(documents: EmbeddingDocument[]): Promise<void> {
    try {
      for (const doc of documents) {
        if (!doc.embedding) {
          throw new Error(`Document ${doc.id} missing embedding`);
        }

        await db.execute(sql`
          INSERT INTO vector_embeddings (id, content, metadata, embedding)
          VALUES (${doc.id}, ${doc.content}, ${JSON.stringify(doc.metadata)}, ${JSON.stringify(doc.embedding)})
          ON CONFLICT (id) DO UPDATE SET
            content = EXCLUDED.content,
            metadata = EXCLUDED.metadata,
            embedding = EXCLUDED.embedding
        `);
      }

      console.log(`Stored ${documents.length} embeddings successfully`);
    } catch (error) {
      console.error("Error storing embeddings:", error);
      throw new Error(`Failed to store embeddings: ${error instanceof Error ? error.message : "Unknown error"}`);
    }
  }

  /**
   * Search for similar documents using vector similarity
   */
  async search(query: string, options: SearchOptions = {}): Promise<SearchResult[]> {
    try {
      const {
        topK = 10,
        minSimilarity = 0.7,
        filters = {}
      } = options;

      // Generate query embedding
      const queryEmbedding = await this.embeddingService.generateQueryEmbedding(query);

      // Build filter conditions
      let filterConditions = sql`1=1`;
      
      if (filters.platform) {
        filterConditions = sql`${filterConditions} AND metadata->>'platform' = ${filters.platform}`;
      }
      
      if (filters.category) {
        filterConditions = sql`${filterConditions} AND metadata->>'category' = ${filters.category}`;
      }
      
      if (filters.source) {
        filterConditions = sql`${filterConditions} AND metadata->>'source' = ${filters.source}`;
      }

      // Perform vector similarity search
      const results = await db.execute(sql`
        SELECT 
          id,
          content,
          metadata,
          (1 - (embedding <=> ${JSON.stringify(queryEmbedding)}::vector)) as similarity
        FROM vector_embeddings
        WHERE ${filterConditions}
          AND (1 - (embedding <=> ${JSON.stringify(queryEmbedding)}::vector)) >= ${minSimilarity}
        ORDER BY embedding <=> ${JSON.stringify(queryEmbedding)}::vector
        LIMIT ${topK}
      `);

      return results.rows.map((row: any, index: number) => ({
        document: {
          id: row.id,
          content: row.content,
          metadata: row.metadata
        } as EmbeddingDocument,
        similarity: parseFloat(row.similarity),
        rank: index + 1
      }));
    } catch (error) {
      console.error("Error searching vectors:", error);
      throw new Error(`Failed to search vectors: ${error instanceof Error ? error.message : "Unknown error"}`);
    }
  }

  /**
   * Hybrid search combining vector similarity and keyword search
   */
  async hybridSearch(query: string, options: SearchOptions = {}): Promise<SearchResult[]> {
    try {
      const {
        topK = 10,
        minSimilarity = 0.6,
        filters = {}
      } = options;

      // Get vector search results
      const vectorResults = await this.search(query, { ...options, topK: topK * 2 });

      // Perform keyword search using PostgreSQL full-text search
      let filterConditions = sql`1=1`;
      
      if (filters.platform) {
        filterConditions = sql`${filterConditions} AND metadata->>'platform' = ${filters.platform}`;
      }
      
      if (filters.category) {
        filterConditions = sql`${filterConditions} AND metadata->>'category' = ${filters.category}`;
      }

      const keywordResults = await db.execute(sql`
        SELECT 
          id,
          content,
          metadata,
          ts_rank(to_tsvector('english', content), plainto_tsquery('english', ${query})) as rank
        FROM vector_embeddings
        WHERE ${filterConditions}
          AND to_tsvector('english', content) @@ plainto_tsquery('english', ${query})
        ORDER BY rank DESC
        LIMIT ${topK}
      `);

      // Combine and re-rank results using Reciprocal Rank Fusion (RRF)
      const combinedResults = this.combineSearchResults(
        vectorResults,
        keywordResults.rows.map((row: any, index: number) => ({
          document: {
            id: row.id,
            content: row.content,
            metadata: row.metadata
          } as EmbeddingDocument,
          similarity: parseFloat(row.rank),
          rank: index + 1
        })),
        topK
      );

      return combinedResults;
    } catch (error) {
      console.error("Error in hybrid search:", error);
      throw new Error(`Failed to perform hybrid search: ${error instanceof Error ? error.message : "Unknown error"}`);
    }
  }

  /**
   * Combine vector and keyword search results using Reciprocal Rank Fusion
   */
  private combineSearchResults(
    vectorResults: SearchResult[],
    keywordResults: SearchResult[],
    topK: number
  ): SearchResult[] {
    const k = 60; // RRF parameter
    const scoreMap = new Map<string, number>();
    const documentMap = new Map<string, EmbeddingDocument>();

    // Add vector search scores
    vectorResults.forEach((result, index) => {
      const rrf_score = 1 / (k + index + 1);
      scoreMap.set(result.document.id, (scoreMap.get(result.document.id) || 0) + rrf_score);
      documentMap.set(result.document.id, result.document);
    });

    // Add keyword search scores
    keywordResults.forEach((result, index) => {
      const rrf_score = 1 / (k + index + 1);
      scoreMap.set(result.document.id, (scoreMap.get(result.document.id) || 0) + rrf_score);
      documentMap.set(result.document.id, result.document);
    });

    // Sort by combined score and return top K
    const sortedResults = Array.from(scoreMap.entries())
      .sort(([, a], [, b]) => b - a)
      .slice(0, topK)
      .map(([id, score], index) => ({
        document: documentMap.get(id)!,
        similarity: score,
        rank: index + 1
      }));

    return sortedResults;
  }

  /**
   * Get embedding statistics
   */
  async getStats(): Promise<{
    totalDocuments: number;
    categoryCounts: Record<string, number>;
    platformCounts: Record<string, number>;
  }> {
    try {
      const totalResult = await db.execute(sql`
        SELECT COUNT(*) as total FROM vector_embeddings
      `);
      
      const totalCount = (totalResult.rows[0] as any)?.total || "0";

      const categoryResult = await db.execute(sql`
        SELECT 
          metadata->>'category' as category,
          COUNT(*) as count
        FROM vector_embeddings
        GROUP BY metadata->>'category'
      `);

      const platformResult = await db.execute(sql`
        SELECT 
          metadata->>'platform' as platform,
          COUNT(*) as count
        FROM vector_embeddings
        GROUP BY metadata->>'platform'
      `);

      return {
        totalDocuments: parseInt(totalCount),
        categoryCounts: Object.fromEntries(
          categoryResult.rows.map((row: any) => [row.category || "unknown", parseInt(row.count || "0")])
        ),
        platformCounts: Object.fromEntries(
          platformResult.rows.map((row: any) => [row.platform || "unknown", parseInt(row.count || "0")])
        )
      };
    } catch (error) {
      console.error("Error getting vector store stats:", error);
      throw new Error(`Failed to get stats: ${error instanceof Error ? error.message : "Unknown error"}`);
    }
  }

  /**
   * Clear all embeddings (useful for re-indexing)
   */
  async clearAll(): Promise<void> {
    try {
      await db.execute(sql`DELETE FROM vector_embeddings`);
      console.log("Cleared all embeddings");
    } catch (error) {
      console.error("Error clearing embeddings:", error);
      throw new Error(`Failed to clear embeddings: ${error instanceof Error ? error.message : "Unknown error"}`);
    }
  }
}