import fs from 'fs';
import path from 'path';

export interface AttachedAsset {
  filename: string;
  type: string;
  size: number;
  metadata?: {
    category?: string;
    description?: string;
    tags?: string[];
    relevanceScore?: number;
  };
}

export interface MCPAssetContext {
  relevantAssets: AttachedAsset[];
  contextData: Record<string, string>;
  metadata: {
    totalAssets: number;
    categoriesFound: string[];
    searchQuery: string;
    relevanceThreshold: number;
  };
}

export /**
 * Attached Assets MCP Service
 * 
 * Model Context Protocol (MCP) implementation for attached assets
 * Following Anthropic's JSON-RPC 2.0 standard for AI system integrations
 */
class AttachedAssetsMCPService {
  private static instance: AttachedAssetsMCPService;
  private assetCache: Map<string, AttachedAsset[]> = new Map();
  private contentCache: Map<string, string> = new Map();
  private assetsPath = path.join(process.cwd(), 'attached_assets');

  static getInstance(): AttachedAssetsMCPService {
    if (!AttachedAssetsMCPService.instance) {
      AttachedAssetsMCPService.instance = new AttachedAssetsMCPService();
    }
    return AttachedAssetsMCPService.instance;
  }

  async loadAvailableAssets(): Promise<AttachedAsset[]> {
    try {
      const files = fs.readdirSync(this.assetsPath);
      const assets: AttachedAsset[] = [];

      for (const filename of files) {
        if (filename.startsWith('.')) continue;
        
        const filePath = path.join(this.assetsPath, filename);
        const stats = fs.statSync(filePath);
        
        if (stats.isFile()) {
          const asset: AttachedAsset = {
            filename,
            type: this.determineFileType(filename),
            size: stats.size,
            metadata: this.generateMetadata(filename)
          };
          assets.push(asset);
        }
      }

      return assets;
    } catch (error) {
      console.error('Failed to load attached assets:', error);
      return [];
    }
  }

  async getAssetContent(filename: string): Promise<string> {
    if (this.contentCache.has(filename)) {
      return this.contentCache.get(filename)!;
    }

    try {
      const filePath = path.join(this.assetsPath, filename);
      const content = fs.readFileSync(filePath, 'utf-8');
      this.contentCache.set(filename, content);
      return content;
    } catch (error) {
      console.error(`Failed to read asset ${filename}:`, error);
      return `[Error: Could not read ${filename}]`;
    }
  }

  async queryAssets(query: {
    query: string;
    categories?: string[];
    maxAssets?: number;
    includeContent?: boolean;
    relevanceThreshold?: number;
  }): Promise<MCPAssetContext> {
    const assets = await this.loadAvailableAssets();
    const {
      query: searchQuery,
      categories = [],
      maxAssets = 5,
      includeContent = true,
      relevanceThreshold = 0.1
    } = query;

    // Basic text-based relevance scoring
    let relevantAssets = assets.filter(asset => {
      const searchTerms = searchQuery.toLowerCase().split(' ');
      const assetText = `${asset.filename} ${asset.metadata?.category || ''} ${asset.metadata?.description || ''}`.toLowerCase();
      
      const relevanceScore = searchTerms.reduce((score, term) => {
        if (assetText.includes(term)) {
          score += 1;
        }
        return score;
      }, 0) / searchTerms.length;

      asset.metadata = { ...asset.metadata, relevanceScore };
      return relevanceScore >= relevanceThreshold;
    });

    // Filter by categories if specified
    if (categories.length > 0) {
      relevantAssets = relevantAssets.filter(asset =>
        categories.includes(asset.metadata?.category || 'general')
      );
    }

    // Sort by relevance and limit
    relevantAssets = relevantAssets
      .sort((a, b) => (b.metadata?.relevanceScore || 0) - (a.metadata?.relevanceScore || 0))
      .slice(0, maxAssets);

    // Build context data
    const contextData: Record<string, string> = {};
    if (includeContent) {
      for (const asset of relevantAssets) {
        try {
          contextData[asset.filename] = await this.getAssetContent(asset.filename);
        } catch (error) {
          contextData[asset.filename] = `[Error loading content: ${error}]`;
        }
      }
    }

    const categoriesFound = [...new Set(relevantAssets.map(asset => asset.metadata?.category || 'general'))];

    return {
      relevantAssets,
      contextData,
      metadata: {
        totalAssets: assets.length,
        categoriesFound,
        searchQuery,
        relevanceThreshold
      }
    };
  }

  async getAssetsByCategory(category: string): Promise<AttachedAsset[]> {
    const assets = await this.loadAvailableAssets();
    return assets.filter(asset => asset.metadata?.category === category);
  }

  getAssetStatistics(): {
    totalAssets: number;
    categories: Record<string, number>;
    types: Record<string, number>;
    cacheSize: number;
  } {
    try {
      const files = fs.readdirSync(this.assetsPath);
      const stats = {
        totalAssets: 0,
        categories: {} as Record<string, number>,
        types: {} as Record<string, number>,
        cacheSize: this.contentCache.size
      };

      for (const filename of files) {
        if (filename.startsWith('.')) continue;
        
        stats.totalAssets++;
        
        const type = this.determineFileType(filename);
        stats.types[type] = (stats.types[type] || 0) + 1;
        
        const category = this.generateMetadata(filename).category || 'general';
        stats.categories[category] = (stats.categories[category] || 0) + 1;
      }

      return stats;
    } catch (error) {
      return {
        totalAssets: 0,
        categories: {},
        types: {},
        cacheSize: this.contentCache.size
      };
    }
  }

  async getContextForPrompt(prompt: string, maxAssets: number = 5): Promise<string> {
    try {
      const context = await this.queryAssets({
        query: prompt,
        maxAssets,
        includeContent: true,
        relevanceThreshold: 0.1
      });

      if (context.relevantAssets.length === 0) {
        return "No relevant attached assets found for this query.";
      }

      let contextString = "=== RELEVANT ATTACHED DOCUMENTATION ===\n\n";
      
      for (const asset of context.relevantAssets) {
        contextString += `## ${asset.filename}\n`;
        if (asset.metadata?.description) {
          contextString += `Description: ${asset.metadata.description}\n`;
        }
        if (asset.metadata?.category) {
          contextString += `Category: ${asset.metadata.category}\n`;
        }
        
        const content = context.contextData[asset.filename];
        if (content) {
          const excerpt = content.length > 2000 ? 
            content.substring(0, 2000) + "..." : 
            content;
          contextString += `\nContent:\n${excerpt}\n\n`;
        }
        contextString += "---\n\n";
      }

      contextString += `Total assets found: ${context.metadata.totalAssets}\n`;
      contextString += `Categories: ${context.metadata.categoriesFound.join(', ')}\n`;
      contextString += "=== END ATTACHED DOCUMENTATION ===\n";

      return contextString;
    } catch (error) {
      console.error('Failed to get context for prompt:', error);
      return `Error retrieving attached assets context: ${error}`;
    }
  }

  clearCache(): void {
    this.assetCache.clear();
    this.contentCache.clear();
  }

  private determineFileType(filename: string): string {
    const ext = path.extname(filename).toLowerCase();
    
    if (['.txt', '.md', '.json'].includes(ext)) return 'text';
    if (['.pdf', '.doc', '.docx'].includes(ext)) return 'document';
    if (['.jpg', '.jpeg', '.png', '.gif'].includes(ext)) return 'image';
    
    return 'file';
  }

  private generateMetadata(filename: string): { category?: string; description?: string; tags?: string[] } {
    const lowerName = filename.toLowerCase();
    
    // Determine category based on filename patterns
    let category = 'general';
    if (lowerName.includes('cursor')) category = 'cursor';
    else if (lowerName.includes('bolt')) category = 'bolt';
    else if (lowerName.includes('replit')) category = 'replit';
    else if (lowerName.includes('windsurf')) category = 'windsurf';
    else if (lowerName.includes('lovable')) category = 'lovable';
    else if (lowerName.includes('mcp')) category = 'mcp';
    else if (lowerName.includes('rag')) category = 'rag';
    else if (lowerName.includes('a2a')) category = 'a2a';

    // Generate description based on content patterns
    let description = `Documentation file: ${filename}`;
    if (lowerName.includes('deep dive')) description = 'Comprehensive analysis and research';
    else if (lowerName.includes('analysis')) description = 'Technical analysis and insights';
    else if (lowerName.includes('overview')) description = 'Overview and introduction';

    return { category, description, tags: [category] };
  }
}

export const attachedAssetsMCPService = AttachedAssetsMCPService.getInstance();