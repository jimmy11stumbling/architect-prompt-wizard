import { Pool } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-serverless';
import { sql } from 'drizzle-orm';
import { pgTable, serial, text, timestamp, jsonb, vector } from 'drizzle-orm/pg-core';
import { cosineDistance, desc } from 'drizzle-orm';
import * as schema from '@shared/schema';

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

  constructor(connectionString: string) {
    this.pool = new Pool({ connectionString });
    this.db = drizzle(this.pool, { schema: { ...schema, vectorDocuments } });
  }

  async initialize(): Promise<void> {
    if (this.initialized) return;

    try {
      // Enable pgvector extension
      await this.db.execute(sql`CREATE EXTENSION IF NOT EXISTS vector`);
      
      // Create vector documents table if it doesn't exist
      await this.db.execute(sql`
        CREATE TABLE IF NOT EXISTS vector_documents (
          id SERIAL PRIMARY KEY,
          document_id TEXT NOT NULL,
          content TEXT NOT NULL,
          embedding VECTOR(1536),
          metadata JSONB,
          created_at TIMESTAMP DEFAULT NOW(),
          updated_at TIMESTAMP DEFAULT NOW()
        )
      `);

      // Create index for similarity search
      await this.db.execute(sql`
        CREATE INDEX IF NOT EXISTS vector_documents_embedding_idx 
        ON vector_documents USING ivfflat (embedding vector_cosine_ops)
        WITH (lists = 100)
      `);

      this.initialized = true;
      console.log('Vector store initialized successfully');
    } catch (error) {
      console.error('Failed to initialize vector store:', error);
      throw error;
    }
  }

  async addDocuments(documents: VectorDocument[]): Promise<void> {
    if (!this.initialized) await this.initialize();

    try {
      for (const doc of documents) {
        if (!doc.embedding) {
          throw new Error(`Document ${doc.id} missing embedding`);
        }

        await this.db.insert(vectorDocuments).values({
          documentId: doc.id,
          content: doc.content,
          embedding: doc.embedding,
          metadata: doc.metadata
        }).onConflictDoUpdate({
          target: vectorDocuments.documentId,
          set: {
            content: doc.content,
            embedding: doc.embedding,
            metadata: doc.metadata,
            updatedAt: new Date()
          }
        });
      }
      
      console.log(`Added ${documents.length} documents to vector store`);
    } catch (error) {
      console.error('Failed to add documents to vector store:', error);
      throw error;
    }
  }

  async search(queryEmbedding: number[], options: VectorSearchOptions = {}): Promise<VectorSearchResult[]> {
    if (!this.initialized) await this.initialize();

    const { topK = 5, minSimilarity = 0.0 } = options;

    try {
      const results = await this.db
        .select({
          id: vectorDocuments.documentId,
          content: vectorDocuments.content,
          metadata: vectorDocuments.metadata,
          similarity: sql<number>`1 - (${vectorDocuments.embedding} <=> ${JSON.stringify(queryEmbedding)}::vector)`
        })
        .from(vectorDocuments)
        .where(sql`1 - (${vectorDocuments.embedding} <=> ${JSON.stringify(queryEmbedding)}::vector) > ${minSimilarity}`)
        .orderBy(desc(sql`1 - (${vectorDocuments.embedding} <=> ${JSON.stringify(queryEmbedding)}::vector)`))
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
      throw error;
    }
  }

  async textSearch(query: string, options: { limit?: number; includeMetadata?: boolean; semanticWeight?: number } = {}): Promise<any[]> {
    if (!this.initialized) await this.initialize();

    const { limit = 10 } = options;

    try {
      // For now, return a basic text search using LIKE until we implement proper embedding search
      const results = await this.db
        .select({
          content: vectorDocuments.content,
          metadata: vectorDocuments.metadata,
          score: sql<number>`1.0` // Mock score for now
        })
        .from(vectorDocuments)
        .where(sql`${vectorDocuments.content} ILIKE ${'%' + query + '%'}`)
        .limit(limit);

      return results.map(result => ({
        content: result.content,
        metadata: result.metadata,
        score: result.score,
        relevanceScore: result.score
      }));
    } catch (error) {
      console.error('Failed to perform text search:', error);
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