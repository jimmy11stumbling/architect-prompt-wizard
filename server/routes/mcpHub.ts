import { Router } from 'express';
import { AuthenticatedRequest } from '../middleware/auth';
import { attachedAssetsMCPService } from '../services/attachedAssetsMcpService';

const router = Router();

// Initialize MCP Hub
router.post('/initialize', async (req: AuthenticatedRequest, res) => {
  try {
    await attachedAssetsMCPService.loadAvailableAssets();
    res.json({ success: true, message: 'MCP Hub initialized successfully' });
  } catch (error) {
    console.error('Failed to initialize MCP Hub:', error);
    res.status(500).json({ 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error' 
    });
  }
});

// Query assets with MCP protocol
router.post('/query', async (req: AuthenticatedRequest, res) => {
  try {
    const { query, categories, maxAssets, includeContent, relevanceThreshold } = req.body;
    
    const context = await attachedAssetsMCPService.queryAssets({
      query,
      categories,
      maxAssets,
      includeContent,
      relevanceThreshold
    });
    
    res.json({ success: true, data: context });
  } catch (error) {
    console.error('MCP Hub query failed:', error);
    res.status(500).json({ 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error' 
    });
  }
});

// Get assets by category
router.get('/category/:category', async (req: AuthenticatedRequest, res) => {
  try {
    const { category } = req.params;
    const assets = await attachedAssetsMCPService.getAssetsByCategory(category);
    res.json({ success: true, data: assets });
  } catch (error) {
    console.error('Failed to get assets by category:', error);
    res.status(500).json({ 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error' 
    });
  }
});

// Get asset content
router.get('/content/:filename', async (req: AuthenticatedRequest, res) => {
  try {
    const { filename } = req.params;
    const content = await attachedAssetsMCPService.getAssetContent(filename);
    res.json({ success: true, data: { filename, content } });
  } catch (error) {
    console.error('Failed to get asset content:', error);
    res.status(500).json({ 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error' 
    });
  }
});

// Generate context summary
router.post('/summary', async (req: AuthenticatedRequest, res) => {
  try {
    const { query, categories, maxAssets } = req.body;
    
    const context = await attachedAssetsMCPService.queryAssets({
      query,
      categories,
      maxAssets,
      includeContent: true
    });
    
    const summary = await attachedAssetsMCPService.getContextForPrompt(query, maxAssets);
    
    res.json({ success: true, data: { summary, context } });
  } catch (error) {
    console.error('Failed to generate context summary:', error);
    res.status(500).json({ 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error' 
    });
  }
});

// Get available categories
router.get('/categories', async (req: AuthenticatedRequest, res) => {
  try {
    const stats = attachedAssetsMCPService.getAssetStatistics();
    const categories = Object.keys(stats.categories);
    res.json({ success: true, data: categories });
  } catch (error) {
    console.error('Failed to get categories:', error);
    res.status(500).json({ 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error' 
    });
  }
});

// Get asset statistics
router.get('/stats', async (req: AuthenticatedRequest, res) => {
  try {
    const stats = attachedAssetsMCPService.getAssetStatistics();
    res.json({ success: true, data: stats });
  } catch (error) {
    console.error('Failed to get asset statistics:', error);
    res.status(500).json({ 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error' 
    });
  }
});

// MCP Protocol Methods
router.get('/mcp/resources', async (req: AuthenticatedRequest, res) => {
  try {
    const resources = await attachedAssetsMCPHub.mcpListResources();
    res.json({ success: true, data: resources });
  } catch (error) {
    console.error('MCP list resources failed:', error);
    res.status(500).json({ 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error' 
    });
  }
});

router.get('/mcp/resource', async (req: AuthenticatedRequest, res) => {
  try {
    const { uri } = req.query;
    if (!uri || typeof uri !== 'string') {
      return res.status(400).json({ success: false, error: 'URI parameter required' });
    }
    
    const resource = await attachedAssetsMCPHub.mcpReadResource(uri);
    res.json({ success: true, data: resource });
  } catch (error) {
    console.error('MCP read resource failed:', error);
    res.status(500).json({ 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error' 
    });
  }
});

router.post('/mcp/tool', async (req: AuthenticatedRequest, res) => {
  try {
    const { name, args } = req.body;
    if (!name) {
      return res.status(400).json({ success: false, error: 'Tool name required' });
    }
    
    const result = await attachedAssetsMCPHub.mcpCallTool(name, args || {});
    res.json({ success: true, data: result });
  } catch (error) {
    console.error('MCP call tool failed:', error);
    res.status(500).json({ 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error' 
    });
  }
});

// Search assets using MCP context
router.post('/search', async (req: AuthenticatedRequest, res) => {
  try {
    const mcpQuery = req.body;
    const context = await attachedAssetsMCPHub.searchAssetsWithMCP(mcpQuery);
    res.json({ success: true, data: context });
  } catch (error) {
    console.error('MCP search failed:', error);
    res.status(500).json({ 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error' 
    });
  }
});

// Preload critical assets
router.post('/preload', async (req: AuthenticatedRequest, res) => {
  try {
    await attachedAssetsMCPHub.preloadCriticalAssets();
    res.json({ success: true, message: 'Critical assets preloaded successfully' });
  } catch (error) {
    console.error('Failed to preload critical assets:', error);
    res.status(500).json({ 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error' 
    });
  }
});

// Clear cache
router.post('/clear-cache', async (req: AuthenticatedRequest, res) => {
  try {
    attachedAssetsMCPService.clearCache();
    res.json({ success: true, message: 'Cache cleared successfully' });
  } catch (error) {
    console.error('Failed to clear cache:', error);
    res.status(500).json({ 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error' 
    });
  }
});

export default router;