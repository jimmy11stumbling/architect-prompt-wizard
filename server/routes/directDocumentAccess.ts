import express from 'express';
import { sql } from 'drizzle-orm';
import { db } from '../db';
import { vectorDocuments } from '../services/rag/vectorStore';

const router = express.Router();

// Direct document access for DeepSeek Reasoner - bypasses RAG search issues
router.post('/direct-search', async (req, res) => {
  try {
    const { query, limit = 10 } = req.body;
    
    if (!query) {
      return res.status(400).json({ error: 'Query is required' });
    }

    console.log(`[DirectAccess] Searching for: "${query}" (limit: ${limit})`);

    // Direct text search without vector operations
    const results = await db
      .select({
        documentId: vectorDocuments.documentId,
        content: vectorDocuments.content,
        metadata: vectorDocuments.metadata
      })
      .from(vectorDocuments)
      .where(sql`
        ${vectorDocuments.content} ILIKE ${`%${query}%`} OR 
        ${vectorDocuments.content} ILIKE ${`%Model Context Protocol%`} OR
        ${vectorDocuments.content} ILIKE ${`%MCP%`} OR
        ${vectorDocuments.metadata}::text ILIKE ${`%${query}%`}
      `)
      .orderBy(sql`
        CASE 
          WHEN ${vectorDocuments.content} ILIKE ${`%${query}%`} THEN 1
          WHEN ${vectorDocuments.content} ILIKE ${`%Model Context Protocol%`} THEN 2
          WHEN ${vectorDocuments.content} ILIKE ${`%MCP%`} THEN 3
          ELSE 4
        END
      `)
      .limit(limit);

    console.log(`[DirectAccess] Found ${results.length} documents`);

    res.json({
      success: true,
      results: results.map(result => ({
        id: result.documentId,
        content: result.content.substring(0, 1000) + (result.content.length > 1000 ? '...' : ''),
        fullContent: result.content,
        metadata: result.metadata,
        searchMethod: 'direct_text'
      })),
      totalFound: results.length
    });

  } catch (error) {
    console.error('[DirectAccess] Search error:', error);
    res.status(500).json({ 
      error: 'Direct search failed',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// Get all documents for specific category
router.get('/category/:category', async (req, res) => {
  try {
    const { category } = req.params;
    const limit = parseInt(req.query.limit as string) || 50;

    const results = await db
      .select({
        documentId: vectorDocuments.documentId,
        content: vectorDocuments.content,
        metadata: vectorDocuments.metadata
      })
      .from(vectorDocuments)
      .where(sql`${vectorDocuments.metadata}::text ILIKE ${`%${category}%`}`)
      .limit(limit);

    res.json({
      success: true,
      results: results.map(result => ({
        id: result.documentId,
        content: result.content.substring(0, 500) + '...',
        fullContent: result.content,
        metadata: result.metadata
      })),
      totalFound: results.length
    });

  } catch (error) {
    console.error('[DirectAccess] Category search error:', error);
    res.status(500).json({ error: 'Category search failed' });
  }
});

// Get document statistics
router.get('/stats', async (req, res) => {
  try {
    const totalDocs = await db
      .select({ count: sql<number>`count(*)` })
      .from(vectorDocuments);

    const withEmbeddings = await db
      .select({ count: sql<number>`count(*)` })
      .from(vectorDocuments)
      .where(sql`${vectorDocuments.embedding} IS NOT NULL`);

    const mcpDocs = await db
      .select({ count: sql<number>`count(*)` })
      .from(vectorDocuments)
      .where(sql`
        ${vectorDocuments.content} ILIKE '%Model Context Protocol%' OR 
        ${vectorDocuments.content} ILIKE '%MCP%' OR
        ${vectorDocuments.metadata}::text ILIKE '%mcp%'
      `);

    res.json({
      totalDocuments: totalDocs[0]?.count || 0,
      documentsWithEmbeddings: withEmbeddings[0]?.count || 0,
      mcpDocuments: mcpDocs[0]?.count || 0
    });

  } catch (error) {
    console.error('[DirectAccess] Stats error:', error);
    res.status(500).json({ error: 'Stats retrieval failed' });
  }
});

export default router;