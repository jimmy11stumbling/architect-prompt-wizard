import { Pool } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-serverless';
import { sql } from 'drizzle-orm';
import { pgTable, serial, text, timestamp, jsonb, vector } from 'drizzle-orm/pg-core';
import { cosineDistance, desc } from 'drizzle-orm';
import * as schema from '@shared/schema';
import { EmbeddingService } from './embeddingService';

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
  private db: ReturnType<typeof drizzle>;
  private pool: Pool;
  private initialized = false;
  private embeddingService: EmbeddingService;

  constructor(connectionString: string) {
    this.pool = new Pool({ connectionString });
    this.db = drizzle(this.pool, { schema: { ...schema, vectorDocuments } });
    this.embeddingService = EmbeddingService.getInstance();
  }

  async initialize(): Promise<void> {
    if (this.initialized) return;

    let retries = 3;
    while (retries > 0) {
      try {
        console.log(`Initializing vector store... (${4 - retries}/3)`);

        // Test database connection first
        await this.db.execute(sql`SELECT 1`);
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

        // Create index for similarity search (only if pgvector is available)
        try {
          await this.db.execute(sql`
          CREATE INDEX IF NOT EXISTS vector_documents_embedding_idx 
          ON vector_documents USING ivfflat (embedding vector_cosine_ops)
          WITH (lists = 100)
        `);
          console.log('Vector similarity index created');
        } catch (indexError) {
          console.warn('Vector similarity index not created (pgvector not available)');
        }

        this.initialized = true;
        console.log('Vector store initialized successfully');
        return;
      } catch (error) {
        retries--;
        console.error(`Vector store initialization failed (${retries} retries left):`, error);

        if (retries === 0) {
          console.error('Vector store initialization failed permanently');
          throw error;
        }

        // Wait before retry
        await new Promise(resolve => setTimeout(resolve, 2000));
      }
    }
  }

  async addDocuments(documents: VectorDocument[]): Promise<void> {
    if (!this.initialized) await this.initialize();

    try {
      for (const doc of documents) {
        let embedding = doc.embedding;

        // Generate embedding if missing
        if (!embedding) {
          console.log(`[VectorStore] Generating embedding for document: ${doc.id}`);
          embedding = await this.embeddingService.generateEmbedding(doc.content);
        }

        await this.db.insert(vectorDocuments).values({
          documentId: doc.id,
          content: doc.content,
          embedding: embedding,
          metadata: doc.metadata
        }).onConflictDoUpdate({
          target: vectorDocuments.documentId,
          set: {
            content: doc.content,
            embedding: embedding,
            metadata: doc.metadata,
            updatedAt: new Date()
          }
        });
      }

      console.log(`[VectorStore] Added ${documents.length} documents to vector store with embeddings`);
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

  async vectorSearch(queryEmbedding: number[], options: { limit?: number; includeMetadata?: boolean } = {}): Promise<any[]> {
    if (!this.initialized) await this.initialize();

    const { limit = 10 } = options;

    try {
      console.log(`[VectorStore] Performing vector similarity search with limit: ${limit}`);

      // Check if we have any documents with embeddings
      const countResult = await this.db
        .select({ count: sql<number>`count(*)` })
        .from(vectorDocuments)
        .where(sql`${vectorDocuments.embedding} IS NOT NULL`);

      const vectorCount = countResult[0]?.count || 0;
      console.log(`[VectorStore] Found ${vectorCount} documents with embeddings`);

      if (vectorCount === 0) {
        console.warn('[VectorStore] No documents with embeddings found, falling back to text search');
        return [];
      }

      // Perform vector similarity search
      const queryVector = `[${queryEmbedding.join(',')}]`;
      const results = await this.db
        .select({
          id: vectorDocuments.documentId,
          content: vectorDocuments.content,
          metadata: vectorDocuments.metadata,
          similarity: sql<number>`1 - (${vectorDocuments.embedding} <=> ${queryVector})`
        })
        .from(vectorDocuments)
        .where(sql`${vectorDocuments.embedding} IS NOT NULL`)
        .orderBy(desc(sql`1 - (${vectorDocuments.embedding} <=> ${queryVector})`))
        .limit(limit);

      console.log(`[VectorStore] Vector search found ${results.length} results`);

      return results.map(result => ({
        id: result.id,
        content: result.content,
        metadata: result.metadata || {},
        score: result.similarity,
        relevanceScore: result.similarity,
        searchMethod: 'vector'
      }));
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
    await this.pool.end();
  }
}