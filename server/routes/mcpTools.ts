import { Router } from 'express';
import { AuthenticatedRequest } from '../middleware/auth';
import { attachedAssetsMCPService } from '../services/attachedAssetsMcpService';

const router = Router();

// Enhanced MCP Tool: Semantic Search
router.post('/semantic-search', async (req: AuthenticatedRequest, res) => {
  try {
    const { query, categories, maxResults = 5, includeContent = true } = req.body;
    
    const results = await attachedAssetsMCPService.queryAssets({
      query,
      categories,
      maxAssets: maxResults,
      includeContent,
      relevanceThreshold: 0.2
    });

    res.json({
      success: true,
      data: {
        ...results,
        searchType: 'semantic',
        timestamp: new Date().toISOString()
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Search failed'
    });
  }
});

// Enhanced MCP Tool: Document Analyzer
router.post('/analyze-document', async (req: AuthenticatedRequest, res) => {
  try {
    const { filename, analysisType = 'summary' } = req.body;
    
    const content = await attachedAssetsMCPService.getAssetContent(filename);
    const assets = await attachedAssetsMCPService.loadAvailableAssets();
    const asset = assets.find(a => a.filename === filename);
    
    if (!asset) {
      return res.status(404).json({
        success: false,
        error: 'Document not found'
      });
    }

    // Basic document analysis
    const wordCount = content.split(/\s+/).length;
    const lines = content.split('\n').length;
    const keywords = extractKeywords(content);
    const summary = generateSummary(content);

    res.json({
      success: true,
      data: {
        filename,
        analysisType,
        metadata: asset.metadata,
        statistics: {
          wordCount,
          lines,
          characters: content.length,
          estimatedReadTime: Math.ceil(wordCount / 200) // words per minute
        },
        keywords,
        summary: analysisType === 'summary' ? summary : null,
        contentPreview: content.substring(0, 500) + '...',
        timestamp: new Date().toISOString()
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Analysis failed'
    });
  }
});

// Enhanced MCP Tool: Knowledge Graph Builder
router.post('/build-knowledge-graph', async (req: AuthenticatedRequest, res) => {
  try {
    const { categories = [], includeRelationships = true } = req.body;
    
    const assets = await attachedAssetsMCPService.loadAvailableAssets();
    const filteredAssets = categories.length > 0 
      ? assets.filter(asset => categories.includes(asset.metadata?.category))
      : assets;

    const nodes = filteredAssets.map(asset => ({
      id: asset.filename,
      label: asset.filename.replace(/\.[^/.]+$/, ''), // Remove extension
      category: asset.metadata?.category || 'general',
      description: asset.metadata?.description,
      tags: asset.metadata?.tags || [],
      size: asset.size,
      type: asset.type
    }));

    const relationships = includeRelationships ? buildRelationships(filteredAssets) : [];

    res.json({
      success: true,
      data: {
        nodes,
        relationships,
        statistics: {
          totalNodes: nodes.length,
          totalRelationships: relationships.length,
          categories: [...new Set(nodes.map(n => n.category))]
        },
        timestamp: new Date().toISOString()
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Knowledge graph generation failed'
    });
  }
});

// Enhanced MCP Tool: Content Extraction
router.post('/extract-content', async (req: AuthenticatedRequest, res) => {
  try {
    const { filenames, extractionType = 'full', maxLength = 5000 } = req.body;
    
    if (!Array.isArray(filenames)) {
      return res.status(400).json({
        success: false,
        error: 'filenames must be an array'
      });
    }

    const extractedContent: Record<string, any> = {};
    
    for (const filename of filenames) {
      try {
        const content = await attachedAssetsMCPService.getAssetContent(filename);
        
        let processedContent = content;
        if (extractionType === 'summary') {
          processedContent = generateSummary(content);
        } else if (extractionType === 'keywords') {
          processedContent = extractKeywords(content).join(', ');
        } else if (extractionType === 'excerpt') {
          processedContent = content.substring(0, maxLength) + (content.length > maxLength ? '...' : '');
        }
        
        extractedContent[filename] = {
          content: processedContent,
          originalLength: content.length,
          processedLength: processedContent.length,
          extractionType
        };
      } catch (error) {
        extractedContent[filename] = {
          error: `Failed to extract: ${error instanceof Error ? error.message : 'Unknown error'}`
        };
      }
    }

    res.json({
      success: true,
      data: {
        extractedContent,
        metadata: {
          totalFiles: filenames.length,
          successfulExtractions: Object.keys(extractedContent).filter(k => !extractedContent[k].error).length,
          extractionType,
          timestamp: new Date().toISOString()
        }
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Content extraction failed'
    });
  }
});

// Helper functions
function extractKeywords(content: string, maxKeywords: number = 10): string[] {
  // Simple keyword extraction - remove common words and get most frequent
  const commonWords = new Set(['the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of', 'with', 'by', 'is', 'are', 'was', 'were', 'be', 'been', 'have', 'has', 'had', 'do', 'does', 'did', 'will', 'would', 'should', 'could', 'can', 'may', 'might', 'must', 'shall']);
  
  const words = content.toLowerCase()
    .replace(/[^\w\s]/g, '')
    .split(/\s+/)
    .filter(word => word.length > 3 && !commonWords.has(word));
  
  const wordCounts = words.reduce((counts: Record<string, number>, word) => {
    counts[word] = (counts[word] || 0) + 1;
    return counts;
  }, {});
  
  return Object.entries(wordCounts)
    .sort(([,a], [,b]) => b - a)
    .slice(0, maxKeywords)
    .map(([word]) => word);
}

function generateSummary(content: string, maxSentences: number = 3): string {
  // Simple extractive summary - get first few sentences
  const sentences = content.split(/[.!?]+/).filter(s => s.trim().length > 20);
  return sentences.slice(0, maxSentences).join('. ') + '.';
}

function buildRelationships(assets: any[]): any[] {
  const relationships = [];
  
  // Build relationships based on shared categories and keywords
  for (let i = 0; i < assets.length; i++) {
    for (let j = i + 1; j < assets.length; j++) {
      const asset1 = assets[i];
      const asset2 = assets[j];
      
      let relationshipStrength = 0;
      let relationshipType = 'related';
      
      // Same category = strong relationship
      if (asset1.metadata?.category === asset2.metadata?.category) {
        relationshipStrength += 0.8;
        relationshipType = 'same_category';
      }
      
      // Shared tags = medium relationship
      const sharedTags = (asset1.metadata?.tags || [])
        .filter((tag: string) => (asset2.metadata?.tags || []).includes(tag));
      if (sharedTags.length > 0) {
        relationshipStrength += 0.4 * sharedTags.length;
        relationshipType = 'shared_tags';
      }
      
      // Similar filenames = weak relationship
      const similarity = calculateStringSimilarity(asset1.filename, asset2.filename);
      if (similarity > 0.3) {
        relationshipStrength += similarity * 0.3;
      }
      
      if (relationshipStrength > 0.2) {
        relationships.push({
          source: asset1.filename,
          target: asset2.filename,
          type: relationshipType,
          strength: Math.min(relationshipStrength, 1.0),
          sharedTags: sharedTags || []
        });
      }
    }
  }
  
  return relationships;
}

function calculateStringSimilarity(str1: string, str2: string): number {
  const longer = str1.length > str2.length ? str1 : str2;
  const shorter = str1.length > str2.length ? str2 : str1;
  
  if (longer.length === 0) return 1.0;
  
  const editDistance = levenshteinDistance(longer, shorter);
  return (longer.length - editDistance) / longer.length;
}

function levenshteinDistance(str1: string, str2: string): number {
  const matrix = [];
  
  for (let i = 0; i <= str2.length; i++) {
    matrix[i] = [i];
  }
  
  for (let j = 0; j <= str1.length; j++) {
    matrix[0][j] = j;
  }
  
  for (let i = 1; i <= str2.length; i++) {
    for (let j = 1; j <= str1.length; j++) {
      if (str2.charAt(i - 1) === str1.charAt(j - 1)) {
        matrix[i][j] = matrix[i - 1][j - 1];
      } else {
        matrix[i][j] = Math.min(
          matrix[i - 1][j - 1] + 1,
          matrix[i][j - 1] + 1,
          matrix[i - 1][j] + 1
        );
      }
    }
  }
  
  return matrix[str2.length][str1.length];
}

export default router;