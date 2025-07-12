import { sql } from 'drizzle-orm';
import { pgTable, serial, text, timestamp, jsonb, vector } from 'drizzle-orm/pg-core';
import { cosineDistance, desc } from 'drizzle-orm';
import * as schema from '@shared/schema';
import { EmbeddingService } from './embeddingService';
import { db, pool } from '../../db';

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
  private db: typeof db;
  private initialized = false;
  private embeddingService: EmbeddingService;

  constructor(connectionString?: string) {
    // Use shared database connection
    this.db = db;
    this.embeddingService = EmbeddingService.getInstance();
  }

  async initialize(): Promise<void> {
    if (this.initialized) return;

    let retries = 3;
    while (retries > 0) {
      try {
        console.log(`Initializing vector store... (${4 - retries}/3)`);

        // Test database connection with timeout
        const connectionPromise = this.db.execute(sql`SELECT 1`);
        const timeoutPromise = new Promise((_, reject) => 
          setTimeout(() => reject(new Error('Database connection timeout')), 15000)
        );
        
        await Promise.race([connectionPromise, timeoutPromise]);
        console.log('Database connection successful');

        // Enable pgvector extension (may fail if not available, but that's okay)
        try {
          await this.db.execute(sql`CREATE EXTENSION IF NOT EXISTS vector`);
          console.log('pgvector extension enabled');
        } catch (vectorError) {
          console.warn('pgvector extension not available, using text search only:', vectorError);
        }

        // Create vector documents table if it doesn't exist
        await this.db.execute(sql`
        CREATE TABLE IF NOT EXISTS vector_documents (
          id SERIAL PRIMARY KEY,
          document_id TEXT NOT NULL UNIQUE,
          content TEXT NOT NULL,
          embedding VECTOR(1536),
          metadata JSONB,
          created_at TIMESTAMP DEFAULT NOW(),
          updated_at TIMESTAMP DEFAULT NOW()
        )
      `);
        console.log('Vector documents table created/verified');

        // Create text search index for better performance
        await this.db.execute(sql`
        CREATE INDEX IF NOT EXISTS vector_documents_content_idx 
        ON vector_documents USING gin(to_tsvector('english', content))
      `);

        // Create optimized indexes for similarity search
        try {
          // Primary vector index with optimized list count for large datasets
          await this.db.execute(sql`
            CREATE INDEX IF NOT EXISTS vector_documents_embedding_idx 
            ON vector_documents USING ivfflat (embedding vector_cosine_ops)
            WITH (lists = 1000)
          `);
          
          // Additional indexes for metadata filtering
          await this.db.execute(sql`
            CREATE INDEX IF NOT EXISTS vector_documents_metadata_idx 
            ON vector_documents USING gin(metadata)
          `);
          
          // Composite index for document_id lookups
          await this.db.execute(sql`
            CREATE INDEX IF NOT EXISTS vector_documents_id_created_idx 
            ON vector_documents (document_id, created_at DESC)
          `);
          
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
          return;
        }

        // Wait before retry - using shared connection, no need to recreate

        // Wait before retry with exponential backoff
        await new Promise(resolve => setTimeout(resolve, (4 - retries) * 3000));
      }
    }
  }

  async addDocuments(documents: VectorDocument[]): Promise<void> {
    if (!this.initialized) await this.initialize();

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
              embedding: embedding,
              metadata: doc.metadata
            };
          })
        );

        // Batch insert
        await this.db.insert(vectorDocuments)
          .values(documentsToInsert)
          .onConflictDoUpdate({
            target: vectorDocuments.documentId,
            set: {
              content: sql`excluded.content`,
              embedding: sql`excluded.embedding`,
              metadata: sql`excluded.metadata`,
              updatedAt: new Date()
            }
          });
      }

      console.log(`[VectorStore] Added ${documents.length} documents in ${batches.length} batches`);
    } catch (error) {
      console.error('Failed to add documents to vector store:', error);
      throw error;
    }
  }

  async ensureEmbeddingsExist(): Promise<void> {
    if (!this.initialized) await this.initialize();

    try {
      // Find documents without embeddings
      const documentsWithoutEmbeddings = await this.db
        .select({
          id: vectorDocuments.id,
          documentId: vectorDocuments.documentId,
          content: vectorDocuments.content,
          metadata: vectorDocuments.metadata
        })
        .from(vectorDocuments)
        .where(sql`${vectorDocuments.embedding} IS NULL`);

      if (documentsWithoutEmbeddings.length > 0) {
        console.log(`[VectorStore] Found ${documentsWithoutEmbeddings.length} documents without embeddings, generating...`);

        for (const doc of documentsWithoutEmbeddings) {
          const embedding = await this.embeddingService.generateEmbedding(doc.content);

          await this.db.update(vectorDocuments)
            .set({
              embedding: embedding,
              updatedAt: new Date()
            })
            .where(sql`${vectorDocuments.id} = ${doc.id}`);
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

      const queryVector = `[${queryEmbedding.join(',')}]`;
      const results = await this.db
        .select({
          id: vectorDocuments.documentId,
          content: vectorDocuments.content,
          metadata: vectorDocuments.metadata,
          similarity: sql<number>`1 - (${vectorDocuments.embedding} <=> ${queryVector})`
        })
        .from(vectorDocuments)
        .where(sql`${vectorDocuments.embedding} IS NOT NULL AND 1 - (${vectorDocuments.embedding} <=> ${queryVector}) > ${minSimilarity}`)
        .orderBy(desc(sql`1 - (${vectorDocuments.embedding} <=> ${queryVector})`))
        .limit(topK);

      return results.map(result => ({
        document: {
          id: result.id,
          content: result.content,
          metadata: result.metadata as Record<string, any>
        },
        similarity: result.similarity
      }));
    } catch (error) {
      console.error('Failed to search vector store:', error);
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
      // Optimized query with better performance
      const queryVector = `[${queryEmbedding.join(',')}]`;
      const results = await this.db
        .select({
          id: vectorDocuments.documentId,
          content: vectorDocuments.content,
          metadata: vectorDocuments.metadata,
          similarity: sql<number>`1 - (${vectorDocuments.embedding} <=> ${queryVector})`
        })
        .from(vectorDocuments)
        .where(sql`
          ${vectorDocuments.embedding} IS NOT NULL AND 
          1 - (${vectorDocuments.embedding} <=> ${queryVector}) > 0.1
        `)
        .orderBy(desc(sql`1 - (${vectorDocuments.embedding} <=> ${queryVector})`))
        .limit(limit);

      const formattedResults = results.map(result => ({
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

      // Clean old cache entries (keep cache size manageable)
      if (this.searchCache.size > 1000) {
        const now = Date.now();
        for (const [key, value] of this.searchCache.entries()) {
          if (now - value.timestamp > this.CACHE_TTL) {
            this.searchCache.delete(key);
          }
        }
      }

      return formattedResults;
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
      const results = await this.db
        .select({
          id: vectorDocuments.documentId,
          content: vectorDocuments.content,
          metadata: vectorDocuments.metadata,
          score: sql<number>`
            CASE 
              WHEN ${vectorDocuments.content} ILIKE ${`%${query}%`} THEN 0.9
              WHEN ${vectorDocuments.content} ILIKE ${`%${query.toLowerCase()}%`} THEN 0.8
              ELSE 0.5
            END
          `
        })
        .from(vectorDocuments)
        .where(sql`
          ${vectorDocuments.content} ILIKE ${`%${query}%`} OR 
          ${vectorDocuments.content} ILIKE ${`%${query.toLowerCase()}%`} OR
          ${vectorDocuments.metadata}::text ILIKE ${`%${query}%`}
        `)
        .orderBy(sql`
          CASE 
            WHEN ${vectorDocuments.content} ILIKE ${`%${query}%`} THEN 0.9
            WHEN ${vectorDocuments.content} ILIKE ${`%${query.toLowerCase()}%`} THEN 0.8
            ELSE 0.5
          END DESC
        `)
        .limit(limit);

      console.log(`[VectorStore] Text search found ${results.length} results for query: "${query}"`);

      return results.map(result => ({
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
      await this.db.delete(vectorDocuments).where(sql`document_id = ${documentId}`);
      console.log(`Deleted document ${documentId} from vector store`);
    } catch (error) {
      console.error('Failed to delete document from vector store:', error);
      throw error;
    }
  }

  async getStats(): Promise<{ totalDocuments: number; indexSize: string }> {
    if (!this.initialized) await this.initialize();

    try {
      const countResult = await this.db
        .select({ count: sql<number>`count(*)` })
        .from(vectorDocuments);

      const sizeResult = await this.db.execute(sql`
        SELECT pg_size_pretty(pg_total_relation_size('vector_documents')) as size
      `);

      return {
        totalDocuments: countResult[0]?.count || 0,
        indexSize: sizeResult.rows[0]?.size || '0 bytes'
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