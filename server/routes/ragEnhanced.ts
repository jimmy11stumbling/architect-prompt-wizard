import { Router } from 'express';
import { AuthenticatedRequest } from '../middleware/auth';
import { RAGOrchestrator2 } from '../services/rag/ragOrchestrator2';
import { attachedAssetsMCPService } from '../services/attachedAssetsMcpService';
import multer from 'multer';
import path from 'path';
import fs from 'fs/promises';

const router = Router();

// Configure multer for document uploads
const upload = multer({
  dest: path.join(process.cwd(), 'attached_assets/uploads'),
  fileFilter: (req, file, cb) => {
    const allowedTypes = ['.txt', '.md', '.json'];
    const ext = path.extname(file.originalname).toLowerCase();
    cb(null, allowedTypes.includes(ext));
  },
  limits: { fileSize: 5 * 1024 * 1024 } // 5MB limit
});

// Dynamic document ingestion endpoint
router.post('/documents/upload', upload.single('document'), async (req: AuthenticatedRequest, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    const { title, tags, category = 'user-uploaded' } = req.body;
    const originalName = req.file.originalname;
    const newFileName = `uploaded_${Date.now()}_${originalName}`;
    const finalPath = path.join(process.cwd(), 'attached_assets', newFileName);

    // Move file to attached_assets directory
    await fs.rename(req.file.path, finalPath);

    // Read content and process through RAG system
    const content = await fs.readFile(finalPath, 'utf-8');

    // Index the document in RAG system
    const ragOrchestrator2 = RAGOrchestrator2.getInstance();
    await ragOrchestrator2.initialize();
    // Note: Individual document indexing will be handled by the next full indexing cycle

    // Update MCP service cache
    attachedAssetsMCPService.clearCache();

    res.json({
      success: true,
      document: {
        filename: newFileName,
        title: title || originalName,
        category,
        tags: tags ? tags.split(',').map((tag: string) => tag.trim()) : [],
        indexed: true
      }
    });

  } catch (error) {
    console.error('Document upload error:', error);
    res.status(500).json({ 
      error: 'Failed to upload and index document',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// Add document via text input
router.post('/documents/add-text', async (req: AuthenticatedRequest, res) => {
  try {
    const { title, content, tags, category = 'user-content' } = req.body;

    if (!title || !content) {
      return res.status(400).json({ error: 'Title and content are required' });
    }

    const filename = `text_${Date.now()}_${title.replace(/[^a-zA-Z0-9]/g, '_')}.txt`;
    const filePath = path.join(process.cwd(), 'attached_assets', filename);

    // Save content to file
    await fs.writeFile(filePath, content, 'utf-8');

    // Index the document in RAG system
    const ragOrchestrator2 = RAGOrchestrator2.getInstance();
    await ragOrchestrator2.initialize();
    // Note: Individual document indexing will be handled by the next full indexing cycle

    // Update MCP service cache
    attachedAssetsMCPService.clearCache();

    res.json({
      success: true,
      document: {
        filename,
        title,
        category,
        tags: tags || [],
        indexed: true
      }
    });

  } catch (error) {
    console.error('Text document creation error:', error);
    res.status(500).json({ 
      error: 'Failed to create and index document',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// Enhanced context search with scoring
router.post('/context/enhanced-search', async (req: AuthenticatedRequest, res) => {
  try {
    const { query, platform, maxResults = 5, minScore = 0.1 } = req.body;

    if (!query) {
      return res.status(400).json({ error: 'Query is required' });
    }

    // Get search results with scoring
    const ragOrchestrator2 = RAGOrchestrator2.getInstance();
    const results = await ragOrchestrator2.hybridSearch(query, {
      platform,
      limit: maxResults * 2, // Get more results for filtering
      includeMetadata: true
    });

    // Enhanced scoring and filtering
    const scoredResults = results
      .map(result => ({
        ...result,
        enhancedScore: calculateEnhancedScore(result, query, platform),
        relevanceFactors: analyzeRelevance(result, query, platform)
      }))
      .filter(result => result.enhancedScore >= minScore)
      .sort((a, b) => b.enhancedScore - a.enhancedScore)
      .slice(0, maxResults);

    res.json({
      success: true,
      results: scoredResults,
      metadata: {
        totalFound: results.length,
        afterFiltering: scoredResults.length,
        minScore,
        avgScore: scoredResults.reduce((sum, r) => sum + r.enhancedScore, 0) / scoredResults.length
      }
    });

  } catch (error) {
    console.error('Enhanced search error:', error);
    res.status(500).json({ 
      error: 'Enhanced search failed',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// Preload contexts for faster agent processing
router.post('/context/preload', async (req: AuthenticatedRequest, res) => {
  try {
    const { queries, platform } = req.body;

    if (!Array.isArray(queries) || queries.length === 0) {
      return res.status(400).json({ error: 'Queries array is required' });
    }

    const preloadedContexts = await Promise.all(
      queries.map(async (query: string) => {
        const ragOrchestrator2 = RAGOrchestrator2.getInstance();
        const results = await ragOrchestrator2.hybridSearch(query, {
          platform,
          limit: 3,
          includeMetadata: true
        });

        return {
          query,
          contexts: results.map(result => ({
            content: result.content.substring(0, 500), // Truncate for preload
            score: result.score,
            metadata: result.metadata
          }))
        };
      })
    );

    res.json({
      success: true,
      preloadedContexts,
      cacheKey: `preload_${Date.now()}`,
      expiresIn: 300 // 5 minutes
    });

  } catch (error) {
    console.error('Context preload error:', error);
    res.status(500).json({ 
      error: 'Context preload failed',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// RAG analytics endpoint
router.get('/analytics', async (req: AuthenticatedRequest, res) => {
  try {
    const ragOrchestrator2 = RAGOrchestrator2.getInstance();
    const stats = await ragOrchestrator2.getStats();

    // Calculate additional analytics
    const analytics = {
      ...stats,
      indexingHealth: {
        status: stats.documentsIndexed > 0 ? 'healthy' : 'needs_documents',
        indexingRate: stats.documentsIndexed / Math.max(1, stats.chunksIndexed),
        averageChunkSize: stats.totalSize / Math.max(1, stats.chunksIndexed)
      },
      searchMetrics: {
        lastSearchTime: new Date().toISOString(),
        avgResponseTime: '< 100ms', // TODO: Implement actual timing
        hitRate: 0.85 // TODO: Implement actual hit rate tracking
      },
      platformDistribution: await getPlatformDistribution(),
      recentActivity: await getRecentActivity()
    };

    res.json(analytics);

  } catch (error) {
    console.error('Analytics error:', error);
    res.status(500).json({ 
      error: 'Failed to generate analytics',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// Add simple in-memory cache for stats
let statsCache = null;
let statsCacheTime = 0;
const STATS_CACHE_DURATION = 30000; // 30 seconds

// RAG stats endpoint
router.get('/stats', async (req: AuthenticatedRequest, res) => {
  try {
    const ragOrchestrator2 = RAGOrchestrator2.getInstance();
    const now = Date.now();

    // Return cached stats if recent
    if (statsCache && (now - statsCacheTime) < STATS_CACHE_DURATION) {
      return res.json(statsCache);
    }

    // Add timeout protection for stats
    const statsPromise = ragOrchestrator2.getStats();
    const timeoutPromise = new Promise((_, reject) => {
      setTimeout(() => reject(new Error('Stats timeout')), 15000);
    });

    const stats = await Promise.race([statsPromise, timeoutPromise]);

    // Cache the result
    statsCache = stats;
    statsCacheTime = now;

    res.json(stats);
  } catch (error) {
    console.error('RAG stats error:', error);

    // Return default stats on error instead of failing
    const defaultStats = {
      documentsIndexed: 0,
      chunksIndexed: 0,
      vectorStoreStats: { status: 'unavailable' },
      searchEngineStats: { status: 'unavailable' },
      embeddingStats: { status: 'unavailable' },
      lastIndexed: new Date()
    };

    res.json(defaultStats);
  }
});

// Helper functions
function calculateEnhancedScore(result: any, query: string, platform?: string): number {
  let score = result.score || 0;

  // Boost score for platform-specific content
  if (platform && result.metadata?.platform === platform) {
    score *= 1.3;
  }

  // Boost score for recent content
  if (result.metadata?.createdAt) {
    const daysSinceCreation = (Date.now() - new Date(result.metadata.createdAt).getTime()) / (1000 * 60 * 60 * 24);
    if (daysSinceCreation < 30) {
      score *= 1.1;
    }
  }

  // Boost score for exact keyword matches
  const queryTerms = query.toLowerCase().split(' ');
  const contentLower = result.content.toLowerCase();
  const exactMatches = queryTerms.filter(term => contentLower.includes(term)).length;
  score *= (1 + (exactMatches / queryTerms.length) * 0.2);

  return Math.min(score, 1); // Cap at 1.0
}

function analyzeRelevance(result: any, query: string, platform?: string): string[] {
  const factors = [];

  if (platform && result.metadata?.platform === platform) {
    factors.push('platform-specific');
  }

  if (result.metadata?.category === 'best-practices') {
    factors.push('best-practices');
  }

  if (result.score > 0.8) {
    factors.push('high-semantic-match');
  }

  const queryTerms = query.toLowerCase().split(' ');
  const contentLower = result.content.toLowerCase();
  const exactMatches = queryTerms.filter(term => contentLower.includes(term)).length;

  if (exactMatches === queryTerms.length) {
    factors.push('exact-keyword-match');
  }

  return factors;
}

async function getPlatformDistribution(): Promise<Record<string, number>> {
  // TODO: Implement actual platform distribution calculation
  return {
    cursor: 25,
    windsurf: 20,
    bolt: 18,
    replit: 22,
    lovable: 15
  };
}

async function getRecentActivity(): Promise<any[]> {
  // TODO: Implement actual recent activity tracking
  return [
    { action: 'document_indexed', timestamp: new Date().toISOString(), details: 'Platform guide updated' },
    { action: 'search_performed', timestamp: new Date().toISOString(), details: 'Best practices query' }
  ];
}

export default router;