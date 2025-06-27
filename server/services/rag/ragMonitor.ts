/**
 * RAG System Performance Monitoring and Analytics
 * Tracks query performance, relevance metrics, and system health
 */

import { db } from "../../db";
import { sql } from "drizzle-orm";

export interface RAGQueryLog {
  id: string;
  query: string;
  resultCount: number;
  searchTime: number;
  topRelevanceScore: number;
  filters?: any;
  timestamp: Date;
}

export interface RAGPerformanceMetrics {
  avgSearchTime: number;
  avgRelevanceScore: number;
  totalQueries: number;
  queriesPerHour: number;
  popularQueries: Array<{ query: string; count: number }>;
  failureRate: number;
  indexingStatus: {
    totalDocuments: number;
    lastIndexed: Date | null;
    avgChunkSize: number;
  };
}

export class RAGMonitor {
  /**
   * Log a query execution
   */
  async logQuery(
    query: string,
    resultCount: number,
    searchTime: number,
    topRelevanceScore: number,
    filters?: any
  ): Promise<void> {
    try {
      await db.execute(sql`
        INSERT INTO rag_query_logs (id, query, result_count, search_time, top_relevance_score, filters, timestamp)
        VALUES (
          ${crypto.randomUUID()},
          ${query},
          ${resultCount},
          ${searchTime},
          ${topRelevanceScore},
          ${JSON.stringify(filters || {})},
          NOW()
        )
      `);
    } catch (error) {
      console.error("Error logging RAG query:", error);
    }
  }

  /**
   * Get performance metrics
   */
  async getPerformanceMetrics(): Promise<RAGPerformanceMetrics> {
    try {
      // Create table if not exists
      await db.execute(sql`
        CREATE TABLE IF NOT EXISTS rag_query_logs (
          id TEXT PRIMARY KEY,
          query TEXT NOT NULL,
          result_count INTEGER,
          search_time INTEGER,
          top_relevance_score REAL,
          filters JSONB,
          timestamp TIMESTAMP DEFAULT NOW()
        )
      `);

      // Average search time
      const avgSearchTimeResult = await db.execute(sql`
        SELECT AVG(search_time) as avg_time
        FROM rag_query_logs
        WHERE timestamp > NOW() - INTERVAL '24 hours'
      `);

      // Average relevance score
      const avgRelevanceResult = await db.execute(sql`
        SELECT AVG(top_relevance_score) as avg_score
        FROM rag_query_logs
        WHERE timestamp > NOW() - INTERVAL '24 hours'
        AND top_relevance_score > 0
      `);

      // Total queries
      const totalQueriesResult = await db.execute(sql`
        SELECT COUNT(*) as total
        FROM rag_query_logs
      `);

      // Queries per hour (last 24 hours)
      const queriesPerHourResult = await db.execute(sql`
        SELECT COUNT(*) as count
        FROM rag_query_logs
        WHERE timestamp > NOW() - INTERVAL '24 hours'
      `);

      // Popular queries
      const popularQueriesResult = await db.execute(sql`
        SELECT query, COUNT(*) as count
        FROM rag_query_logs
        WHERE timestamp > NOW() - INTERVAL '7 days'
        GROUP BY query
        ORDER BY count DESC
        LIMIT 10
      `);

      // Failure rate (queries with no results)
      const failureRateResult = await db.execute(sql`
        SELECT 
          COUNT(CASE WHEN result_count = 0 THEN 1 END)::FLOAT / 
          NULLIF(COUNT(*), 0) as failure_rate
        FROM rag_query_logs
        WHERE timestamp > NOW() - INTERVAL '24 hours'
      `);

      // Indexing status
      const indexingStatusResult = await db.execute(sql`
        SELECT 
          COUNT(*) as total,
          MAX(created_at) as last_indexed,
          AVG(LENGTH(content)) as avg_chunk_size
        FROM vector_embeddings
      `);

      return {
        avgSearchTime: Number(avgSearchTimeResult.rows[0]?.avg_time) || 0,
        avgRelevanceScore: Number(avgRelevanceResult.rows[0]?.avg_score) || 0,
        totalQueries: Number(totalQueriesResult.rows[0]?.total) || 0,
        queriesPerHour: (Number(queriesPerHourResult.rows[0]?.count) || 0) / 24,
        popularQueries: popularQueriesResult.rows.map((row: any) => ({
          query: row.query,
          count: Number(row.count)
        })),
        failureRate: Number(failureRateResult.rows[0]?.failure_rate) || 0,
        indexingStatus: {
          totalDocuments: Number(indexingStatusResult.rows[0]?.total) || 0,
          lastIndexed: indexingStatusResult.rows[0]?.last_indexed ? new Date(String(indexingStatusResult.rows[0].last_indexed)) : null,
          avgChunkSize: Number(indexingStatusResult.rows[0]?.avg_chunk_size) || 0
        }
      };
    } catch (error) {
      console.error("Error getting performance metrics:", error);
      return {
        avgSearchTime: 0,
        avgRelevanceScore: 0,
        totalQueries: 0,
        queriesPerHour: 0,
        popularQueries: [],
        failureRate: 0,
        indexingStatus: {
          totalDocuments: 0,
          lastIndexed: null,
          avgChunkSize: 0
        }
      };
    }
  }

  /**
   * Get query history
   */
  async getQueryHistory(limit = 100): Promise<RAGQueryLog[]> {
    try {
      const result = await db.execute(sql`
        SELECT * FROM rag_query_logs
        ORDER BY timestamp DESC
        LIMIT ${limit}
      `);

      return result.rows.map((row: any) => ({
        id: row.id,
        query: row.query,
        resultCount: row.result_count,
        searchTime: row.search_time,
        topRelevanceScore: row.top_relevance_score,
        filters: row.filters,
        timestamp: row.timestamp
      }));
    } catch (error) {
      console.error("Error getting query history:", error);
      return [];
    }
  }

  /**
   * Analyze query patterns
   */
  async analyzeQueryPatterns(): Promise<{
    commonTerms: Array<{ term: string; frequency: number }>;
    queryComplexity: { simple: number; medium: number; complex: number };
    temporalPatterns: Array<{ hour: number; count: number }>;
  }> {
    try {
      // Get all queries from last 30 days
      const queriesResult = await db.execute(sql`
        SELECT query, timestamp
        FROM rag_query_logs
        WHERE timestamp > NOW() - INTERVAL '30 days'
      `);

      // Extract common terms
      const termFrequency = new Map<string, number>();
      const complexityCount = { simple: 0, medium: 0, complex: 0 };

      queriesResult.rows.forEach((row: any) => {
        const words = row.query.toLowerCase().split(/\s+/);
        
        // Count term frequency
        words.forEach((word: string) => {
          if (word.length > 3) { // Skip short words
            termFrequency.set(word, (termFrequency.get(word) || 0) + 1);
          }
        });

        // Categorize query complexity
        if (words.length <= 3) complexityCount.simple++;
        else if (words.length <= 7) complexityCount.medium++;
        else complexityCount.complex++;
      });

      // Get temporal patterns
      const temporalResult = await db.execute(sql`
        SELECT 
          EXTRACT(HOUR FROM timestamp) as hour,
          COUNT(*) as count
        FROM rag_query_logs
        WHERE timestamp > NOW() - INTERVAL '7 days'
        GROUP BY hour
        ORDER BY hour
      `);

      // Convert to sorted arrays
      const commonTerms = Array.from(termFrequency.entries())
        .map(([term, frequency]) => ({ term, frequency }))
        .sort((a, b) => b.frequency - a.frequency)
        .slice(0, 20);

      return {
        commonTerms,
        queryComplexity: complexityCount,
        temporalPatterns: temporalResult.rows.map((row: any) => ({
          hour: row.hour,
          count: row.count
        }))
      };
    } catch (error) {
      console.error("Error analyzing query patterns:", error);
      return {
        commonTerms: [],
        queryComplexity: { simple: 0, medium: 0, complex: 0 },
        temporalPatterns: []
      };
    }
  }
}

export const ragMonitor = new RAGMonitor();