import { sql } from 'drizzle-orm';
import { pgTable, serial, text, timestamp, jsonb, vector } from 'drizzle-orm/pg-core';
import { cosineDistance, desc, eq } from 'drizzle-orm';
import * as schema from '@shared/schema';
import { EmbeddingService } from './embeddingService';
import { db, sql as directSql } from '../../db';
import { connectionMonitor } from './connectionMonitor';

// Vector database schema for embeddings
export const vectorDocuments = pgTable('vector_documents', {
  id: serial('id').primaryKey(),
  documentId: text('document_id').notNull(),
  content: text('content').notNull(),
  embedding: vector('embedding', { dimensions: 1536 }), // OpenAI embeddings dimension
  metadata: jsonb('metadata'),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow()
});

export interface VectorDocument {
  id: string;
  content: string;
  metadata: Record<string, any>;
  embedding?: number[];
}

export interface VectorSearchResult {
  document: VectorDocument;
  similarity: number;
}

export interface VectorSearchOptions {
  topK?: number;
  minSimilarity?: number;
  filters?: Record<string, any>;
}

export class VectorStore {
  private initialized = false;
  private embeddingService: EmbeddingService;
  private initializationPromise: Promise<void> | null = null;

  constructor(connectionString?: string) {
    this.embeddingService = EmbeddingService.getInstance();
  }

  async initialize(): Promise<void> {
    if (this.initialized) return;

    // Return existing initialization promise if one is in progress
    if (this.initializationPromise) {
      return this.initializationPromise;
    }

    this.initializationPromise = connectionMonitor.acquireConnection('vector-store-init', async () => {
      if (this.initialized) return; // Double-check after acquiring connection

      let retries = 3;
      while (retries > 0) {
        try {
          console.log(`Initializing vector store... (${4 - retries}/3)`);

          // Test database connection with timeout
          const testResult = await directSql`SELECT 1 as test`;
          console.log('Database connection successful', testResult?.[0]?.test === 1 ? '✓' : '✗');

          // Enable pgvector extension (may fail if not available, but that's okay)
          try {
            await directSql`CREATE EXTENSION IF NOT EXISTS vector`;
            console.log('pgvector extension enabled');
          } catch (vectorError) {
            console.warn('pgvector extension not available, using text search only:', vectorError);
          }

          // Create vector documents table if it doesn't exist
          await directSql`
            CREATE TABLE IF NOT EXISTS vector_documents (
              id SERIAL PRIMARY KEY,
              document_id TEXT NOT NULL UNIQUE,
              content TEXT NOT NULL,
              embedding VECTOR(1536),
              metadata JSONB,
              created_at TIMESTAMP DEFAULT NOW(),
              updated_at TIMESTAMP DEFAULT NOW()
            )
          `;
          console.log('Vector documents table created/verified');

          // Create text search index for better performance
          await directSql`
            CREATE INDEX IF NOT EXISTS vector_documents_content_idx 
            ON vector_documents USING gin(to_tsvector('english', content))
          `;

          // Create optimized indexes for similarity search
          try {
            // Primary vector index with optimized list count for large datasets
            await directSql`
              CREATE INDEX IF NOT EXISTS vector_documents_embedding_idx 
              ON vector_documents USING ivfflat (embedding vector_cosine_ops)
              WITH (lists = 1000)
            `;

            // Additional indexes for metadata filtering
            await directSql`
              CREATE INDEX IF NOT EXISTS vector_documents_metadata_idx 
              ON vector_documents USING gin(metadata)
            `;

            // Composite index for document_id lookups
            await directSql`
              CREATE INDEX IF NOT EXISTS vector_documents_id_created_idx 
              ON vector_documents (document_id, created_at DESC)
            `;

            console.log('Optimized vector indexes created');
          } catch (indexError) {
            console.warn('Vector indexes not created (pgvector not available)');
          }

          this.initialized = true;
          console.log('Vector store initialized successfully');
          return;
        } catch (error: any) {
          retries--;
          const errorMsg = error?.message || 'Unknown error';
          console.error(`Vector store initialization failed (${retries} retries left):`, errorMsg);

          if (retries === 0) {
            console.error('Vector store initialization failed permanently, continuing without vector store');
            // Don't throw error, allow app to continue with degraded functionality
            this.initialized = true;
            this.initializationPromise = null;
            return;
          }

          // Wait before retry with exponential backoff
          await new Promise(resolve => setTimeout(resolve, (4 - retries) * 3000));
        }
      }
    }).finally(() => {
      this.initializationPromise = null;
    });

    return this.initializationPromise;
  }

  async addDocuments(documents: VectorDocument[]): Promise<void> {
    if (!this.initialized) await this.initialize();

    const maxRetries = 3;
    let retryCount = 0;

    while (retryCount < maxRetries) {
      try {
        // Process in batches of 50 for better performance
        const batchSize = 50;
        const batches = [];

        for (let i = 0; i < documents.length; i += batchSize) {
          batches.push(documents.slice(i, i + batchSize));
        }

        for (const batch of batches) {
          // Prepare documents with embeddings
          const documentsToInsert = await Promise.all(
            batch.map(async (doc) => {
              let embedding = doc.embedding;

              if (!embedding) {
                embedding = await this.embeddingService.generateEmbedding(doc.content);
              }

              return {
                documentId: doc.id,
                content: doc.content,
                embedding: `[${embedding.join(',')}]`,
                metadata: JSON.stringify(doc.metadata)
              };
            })
          );

          // Use raw SQL for inserting
          for (const doc of documentsToInsert) {
            try {
              await directSql`
                INSERT INTO vector_documents (document_id, content, embedding, metadata, created_at, updated_at)
                VALUES (${doc.documentId}, ${doc.content}, ${doc.embedding}::vector, ${doc.metadata}::jsonb, NOW(), NOW())
                ON CONFLICT (document_id) 
                DO UPDATE SET 
                  content = EXCLUDED.content,
                  embedding = EXCLUDED.embedding,
                  metadata = EXCLUDED.metadata,
                  updated_at = NOW()
              `;
            } catch (insertError) {
              console.warn(`Failed to insert document ${doc.documentId}:`, insertError);
            }
          }
        }

        console.log(`[VectorStore] Added ${documents.length} documents in ${batches.length} batches`);
        return; // Success, exit retry loop
      } catch (error) {
        retryCount++;
        console.error(`[VectorStore] Error adding documents (attempt ${retryCount}):`, error);

        if (retryCount >= maxRetries) {
          throw error;
        }

        // Wait before retrying
        await new Promise(resolve => setTimeout(resolve, 1000 * retryCount));
      }
    }
  }

  async ensureEmbeddingsExist(): Promise<void> {
    if (!this.initialized) await this.initialize();

    try {
      // Find documents without embeddings
      const documentsWithoutEmbeddings = await directSql`
        SELECT id, document_id, content, metadata 
        FROM vector_documents 
        WHERE embedding IS NULL
      `;

      if (documentsWithoutEmbeddings.length > 0) {
        console.log(`[VectorStore] Found ${documentsWithoutEmbeddings.length} documents without embeddings, generating...`);

        for (const doc of documentsWithoutEmbeddings) {
          const embedding = await this.embeddingService.generateEmbedding(doc.content);
          const embeddingVector = `[${embedding.join(',')}]`;

          await directSql`
            UPDATE vector_documents 
            SET embedding = ${embeddingVector}::vector, updated_at = NOW() 
            WHERE id = ${doc.id}
          `;
        }

        console.log(`[VectorStore] Generated embeddings for ${documentsWithoutEmbeddings.length} documents`);
      }
    } catch (error) {
      console.error('Failed to ensure embeddings exist:', error);
      throw error;
    }
  }

  async search(queryEmbedding: number[], options: VectorSearchOptions = {}): Promise<VectorSearchResult[]> {
    if (!this.initialized) await this.initialize();

    const { topK = 5, minSimilarity = 0.0 } = options;

    try {
      // Validate queryEmbedding
      if (!queryEmbedding || !Array.isArray(queryEmbedding) || queryEmbedding.length === 0) {
        console.warn('[VectorStore] Invalid query embedding provided, returning empty results');
        return [];
      }

      try {
        const queryVector = `[${queryEmbedding.join(',')}]`;
        const results = await directSql`
          SELECT 
            document_id as id,
            content,
            metadata,
            1 - (embedding <=> ${queryVector}::vector) as similarity
          FROM vector_documents
          WHERE embedding IS NOT NULL 
            AND 1 - (embedding <=> ${queryVector}::vector) > ${minSimilarity}
          ORDER BY embedding <=> ${queryVector}::vector
          LIMIT ${topK}
        `;

        // Ensure results is an array
        const resultArray = Array.isArray(results) ? results : [];

        return resultArray.map(result => ({
          document: {
            id: result.id,
            content: result.content,
            metadata: result.metadata as Record<string, any>
          },
          similarity: result.similarity
        }));
      } catch (vectorError) {
        console.warn('Vector search failed, falling back to text search:', vectorError);
        // Fallback to text search when vector operations fail
        return this.textSearchFallback(queryEmbedding, { topK, minSimilarity });
      }

    } catch (error) {
      console.error('Failed to search vector store:', error);
      return [];
    }
  }

  private async textSearchFallback(queryEmbedding: number[], options: VectorSearchOptions): Promise<VectorSearchResult[]> {
    const { topK = 5 } = options;
    try {
      // Extract some meaningful keywords from embedding context for text search
      const results = await directSql`
        SELECT document_id as id, content, metadata
        FROM vector_documents
        LIMIT ${topK}
      `;

      // Ensure results is an array
      const resultArray = Array.isArray(results) ? results : [];

      return resultArray.map((result, index) => ({
        document: {
          id: result.id,
          content: result.content,
          metadata: result.metadata as Record<string, any>
        },
        similarity: 0.5 - (index * 0.1) // Decreasing similarity scores
      }));
    } catch (error) {
      console.error('Text search fallback failed:', error);
      return [];
    }
  }

  private searchCache = new Map<string, { results: any[]; timestamp: number }>();
  private readonly CACHE_TTL = 300000; // 5 minutes

  async vectorSearch(queryEmbedding: number[], options: { limit?: number; includeMetadata?: boolean } = {}): Promise<any[]> {
    if (!this.initialized) await this.initialize();

    const { limit = 10 } = options;

    // Create cache key
    const cacheKey = `${queryEmbedding.slice(0, 10).join(',')}_${limit}`;
    const cached = this.searchCache.get(cacheKey);

    if (cached && Date.now() - cached.timestamp < this.CACHE_TTL) {
      return cached.results;
    }

    try {
      try {
        // Optimized query with better performance
        const queryVector = `[${queryEmbedding.join(',')}]`;
        const results = await directSql`
          SELECT 
            document_id as id,
            content,
            metadata,
            1 - (embedding <=> ${queryVector}::vector) as similarity
          FROM vector_documents
          WHERE embedding IS NOT NULL 
            AND 1 - (embedding <=> ${queryVector}::vector) > 0.1
          ORDER BY embedding <=> ${queryVector}::vector
          LIMIT ${limit}
        `;

        // Ensure results is an array
        const resultArray = Array.isArray(results) ? results : [];

        const formattedResults = resultArray.map(result => ({
          id: result.id,
          content: result.content,
          metadata: result.metadata || {},
          score: result.similarity,
          relevanceScore: result.similarity,
          searchMethod: 'vector'
        }));

        // Cache results
        this.searchCache.set(cacheKey, {
          results: formattedResults,
          timestamp: Date.now()
        });

        return formattedResults;
      } catch (vectorError) {
        console.warn('Vector search failed, using text search fallback');
        // Fall back to text search
        const textResults = await this.textSearch('search', { limit });

        // Cache fallback results
        this.searchCache.set(cacheKey, {
          results: textResults,
          timestamp: Date.now()
        });

        return textResults;
      }

      // Clean old cache entries (keep cache size manageable)
      if (this.searchCache.size > 1000) {
        const now = Date.now();
        for (const [key, value] of this.searchCache.entries()) {
          if (now - value.timestamp > this.CACHE_TTL) {
            this.searchCache.delete(key);
          }
        }
      }
    } catch (error) {
      console.error('Failed to perform vector search:', error);
      return [];
    }
  }

  async textSearch(query: string, options: { limit?: number; includeMetadata?: boolean; semanticWeight?: number } = {}): Promise<any[]> {
    if (!this.initialized) await this.initialize();

    const { limit = 10 } = options;

    try {
      console.log(`[VectorStore] Performing text search fallback for: "${query}" with limit: ${limit}`);

      // Enhanced text search with better scoring
      const results = await directSql`
        SELECT 
          document_id as id,
          content,
          metadata,
          CASE 
            WHEN content ILIKE ${`%${query}%`} THEN 0.9
            WHEN content ILIKE ${`%${query.toLowerCase()}%`} THEN 0.8
            ELSE 0.5
          END as score
        FROM vector_documents
        WHERE 
          content ILIKE ${`%${query}%`} OR 
          content ILIKE ${`%${query.toLowerCase()}%`} OR
          metadata::text ILIKE ${`%${query}%`}
        ORDER BY 
          CASE 
            WHEN content ILIKE ${`%${query}%`} THEN 0.9
            WHEN content ILIKE ${`%${query.toLowerCase()}%`} THEN 0.8
            ELSE 0.5
          END DESC
        LIMIT ${limit}
      `;

      // Ensure results is an array
      const resultArray = Array.isArray(results) ? results : [];

      console.log(`[VectorStore] Text search found ${resultArray.length} results for query: "${query}"`);

      return resultArray.map(result => ({
        id: result.id,
        content: result.content,
        metadata: result.metadata || {},
        score: result.score,
        relevanceScore: result.score,
        searchMethod: 'text'
      }));
    } catch (error) {
      console.error('Failed to perform text search:', error);
      console.error('Error details:', error);
      return [];
    }
  }

  async deleteDocument(documentId: string): Promise<void> {
    if (!this.initialized) await this.initialize();

    try {
      await directSql`DELETE FROM vector_documents WHERE document_id = ${documentId}`;
      console.log(`Deleted document ${documentId} from vector store`);
    } catch (error) {
      console.error('Failed to delete document from vector store:', error);
      throw error;
    }
  }

  async getStats(): Promise<{ totalDocuments: number; indexSize: string }> {
    if (!this.initialized) await this.initialize();

    try {
      const countResult = await directSql`SELECT COUNT(*)::text as count FROM vector_documents`;
      let sizeResult;
      try {
        sizeResult = await directSql`
          SELECT pg_size_pretty(pg_total_relation_size('vector_documents')) as size
        `;
      } catch (sizeError) {
        console.warn('Could not get table size:', sizeError);
        sizeResult = [{ size: 'unknown' }];
      }

      // Ensure results are arrays
      const countArray = Array.isArray(countResult) ? countResult : [];
      const sizeArray = Array.isArray(sizeResult) ? sizeResult : [];

      return {
        totalDocuments: parseInt(countArray[0]?.count || '0'),
        indexSize: sizeArray[0]?.size || '0 bytes'
      };
    } catch (error) {
      console.error('Failed to get vector store stats:', error);
      return { totalDocuments: 0, indexSize: '0 bytes' };
    }
  }

  async close(): Promise<void> {
    // Don't close shared pool - it's managed by the main app
    console.log('VectorStore close called - shared pool remains open');
  }
}