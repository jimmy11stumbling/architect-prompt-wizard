import { attachedAssetsService, AttachedAsset } from "../deepseek/attachedAssetsService";
import { realTimeResponseService } from "../integration/realTimeResponseService";

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

export interface MCPAssetQuery {
  query: string;
  categories?: string[];
  maxAssets?: number;
  includeContent?: boolean;
  relevanceThreshold?: number;
}

export class AttachedAssetsMCPHub {
  private static instance: AttachedAssetsMCPHub;
  private assetCache: Map<string, AttachedAsset[]> = new Map();
  private contentCache: Map<string, string> = new Map();
  private initialized = false;

  static getInstance(): AttachedAssetsMCPHub {
    if (!AttachedAssetsMCPHub.instance) {
      AttachedAssetsMCPHub.instance = new AttachedAssetsMCPHub();
    }
    return AttachedAssetsMCPHub.instance;
  }

  async initialize(): Promise<void> {
    if (this.initialized) return;

    try {
      realTimeResponseService.addResponse({
        source: "mcp-assets-hub",
        status: "processing",
        message: "Initializing MCP Assets Hub...",
        data: {}
      });

      // Load all available assets
      const assets = await attachedAssetsService.loadAvailableAssets();
      
      // Pre-categorize assets for faster retrieval
      this.categorizeAssets(assets);
      
      this.initialized = true;

      realTimeResponseService.addResponse({
        source: "mcp-assets-hub",
        status: "success",
        message: `MCP Assets Hub initialized with ${assets.length} assets`,
        data: { 
          assetCount: assets.length,
          categories: this.getAvailableCategories()
        }
      });
    } catch (error) {
      realTimeResponseService.addResponse({
        source: "mcp-assets-hub",
        status: "error",
        message: `Failed to initialize MCP Assets Hub: ${error}`,
        data: { error }
      });
      throw error;
    }
  }

  async queryAssets(query: MCPAssetQuery): Promise<MCPAssetContext> {
    await this.ensureInitialized();

    const {
      query: searchQuery,
      categories = [],
      maxAssets = 5,
      includeContent = true,
      relevanceThreshold = 0.1
    } = query;

    realTimeResponseService.addResponse({
      source: "mcp-assets-hub",
      status: "processing",
      message: `Querying assets: "${searchQuery}"`,
      data: { categories, maxAssets }
    });

    try {
      // Get relevant assets
      let relevantAssets = await attachedAssetsService.getRelevantAssetsForPrompt(searchQuery);
      
      // Filter by categories if specified
      if (categories.length > 0) {
        relevantAssets = relevantAssets.filter(asset =>
          categories.includes(asset.metadata?.category || 'general')
        );
      }

      // Apply relevance threshold and limit
      relevantAssets = relevantAssets
        .filter(asset => (asset.metadata?.relevanceScore || 0) >= relevanceThreshold)
        .slice(0, maxAssets);

      // Load content if requested
      const contextData: Record<string, string> = {};
      if (includeContent) {
        for (const asset of relevantAssets) {
          try {
            const content = await this.getAssetContent(asset.filename);
            contextData[asset.filename] = content;
          } catch (error) {
            console.error(`Failed to load content for ${asset.filename}:`, error);
          }
        }
      }

      const context: MCPAssetContext = {
        relevantAssets,
        contextData,
        metadata: {
          totalAssets: relevantAssets.length,
          categoriesFound: [...new Set(relevantAssets.map(a => a.metadata?.category || 'general'))],
          searchQuery,
          relevanceThreshold
        }
      };

      realTimeResponseService.addResponse({
        source: "mcp-assets-hub",
        status: "success",
        message: `Found ${relevantAssets.length} relevant assets`,
        data: {
          assetFiles: relevantAssets.map(a => a.filename),
          categories: context.metadata.categoriesFound
        }
      });

      return context;
    } catch (error) {
      realTimeResponseService.addResponse({
        source: "mcp-assets-hub",
        status: "error",
        message: `Asset query failed: ${error}`,
        data: { query: searchQuery, error }
      });
      throw error;
    }
  }

  async getAssetsByCategory(category: string): Promise<AttachedAsset[]> {
    await this.ensureInitialized();
    
    const cached = this.assetCache.get(category);
    if (cached) {
      return cached;
    }

    const assets = await attachedAssetsService.getAssetsByCategory(category);
    this.assetCache.set(category, assets);
    return assets;
  }

  async getAssetContent(filename: string): Promise<string> {
    // Check cache first
    if (this.contentCache.has(filename)) {
      return this.contentCache.get(filename)!;
    }

    const content = await attachedAssetsService.getAssetContent(filename);
    this.contentCache.set(filename, content);
    return content;
  }

  async generateContextSummary(assets: AttachedAsset[]): Promise<string> {
    let summary = "=== ATTACHED ASSETS CONTEXT ===\n\n";

    // Group by category
    const byCategory = assets.reduce((acc, asset) => {
      const category = asset.metadata?.category || 'general';
      if (!acc[category]) acc[category] = [];
      acc[category].push(asset);
      return acc;
    }, {} as Record<string, AttachedAsset[]>);

    for (const [category, categoryAssets] of Object.entries(byCategory)) {
      summary += `## ${category.toUpperCase()} (${categoryAssets.length} files)\n\n`;
      
      for (const asset of categoryAssets) {
        summary += `### ${asset.filename}\n`;
        if (asset.metadata?.description) {
          summary += `${asset.metadata.description}\n`;
        }
        
        // Include content preview for text files
        if (asset.type === 'text' || asset.type === 'document') {
          try {
            const content = await this.getAssetContent(asset.filename);
            const preview = content.substring(0, 500);
            summary += `\n${preview}${content.length > 500 ? '...' : ''}\n\n`;
          } catch (error) {
            summary += `[Content unavailable]\n\n`;
          }
        }
        
        summary += "---\n\n";
      }
    }

    summary += "=== END ATTACHED ASSETS CONTEXT ===\n";
    return summary;
  }

  async searchAssetsWithMCP(mcpQuery: {
    tools?: string[];
    resources?: string[];
    context?: any;
  }): Promise<MCPAssetContext> {
    await this.ensureInitialized();

    // Extract search terms from MCP context
    let searchTerms: string[] = [];
    
    if (mcpQuery.tools) {
      searchTerms.push(...mcpQuery.tools);
    }
    
    if (mcpQuery.resources) {
      searchTerms.push(...mcpQuery.resources);
    }
    
    if (mcpQuery.context) {
      // Extract relevant terms from context
      const contextText = JSON.stringify(mcpQuery.context).toLowerCase();
      const platforms = ['cursor', 'bolt', 'replit', 'windsurf', 'lovable'];
      const technologies = ['mcp', 'rag', 'a2a', 'ai', 'agent'];
      
      searchTerms.push(
        ...platforms.filter(p => contextText.includes(p)),
        ...technologies.filter(t => contextText.includes(t))
      );
    }

    const searchQuery = searchTerms.join(' ');
    
    return this.queryAssets({
      query: searchQuery,
      maxAssets: 8,
      includeContent: true,
      relevanceThreshold: 0.05
    });
  }

  getAvailableCategories(): string[] {
    const stats = attachedAssetsService.getAssetStats();
    return Object.keys(stats.byCategory);
  }

  getAssetStatistics(): {
    totalAssets: number;
    categories: Record<string, number>;
    types: Record<string, number>;
    cacheSize: number;
  } {
    const stats = attachedAssetsService.getAssetStats();
    return {
      totalAssets: stats.total,
      categories: stats.byCategory,
      types: stats.byType,
      cacheSize: this.contentCache.size
    };
  }

  async preloadCriticalAssets(): Promise<void> {
    const criticalCategories = ['cursor', 'bolt', 'replit', 'windsurf', 'lovable', 'mcp', 'rag', 'a2a'];
    
    for (const category of criticalCategories) {
      try {
        const assets = await this.getAssetsByCategory(category);
        
        // Preload content for smaller text files
        for (const asset of assets.slice(0, 2)) { // Top 2 per category
          if (asset.type === 'text' && asset.size < 50000) { // < 50KB
            await this.getAssetContent(asset.filename);
          }
        }
      } catch (error) {
        console.error(`Failed to preload ${category} assets:`, error);
      }
    }

    realTimeResponseService.addResponse({
      source: "mcp-assets-hub",
      status: "success",
      message: "Critical assets preloaded for faster MCP access",
      data: { 
        categoriesPreloaded: criticalCategories,
        cacheSize: this.contentCache.size
      }
    });
  }

  clearCache(): void {
    this.assetCache.clear();
    this.contentCache.clear();
    attachedAssetsService.clearCache();
    
    realTimeResponseService.addResponse({
      source: "mcp-assets-hub",
      status: "info",
      message: "MCP Assets Hub cache cleared",
      data: {}
    });
  }

  private categorizeAssets(assets: AttachedAsset[]): void {
    const categories = new Set<string>();
    
    assets.forEach(asset => {
      const category = asset.metadata?.category || 'general';
      categories.add(category);
      
      // Cache by category
      const existing = this.assetCache.get(category) || [];
      this.assetCache.set(category, [...existing, asset]);
    });
  }

  private async ensureInitialized(): Promise<void> {
    if (!this.initialized) {
      await this.initialize();
    }
  }

  // MCP Protocol methods
  async mcpListResources(): Promise<any[]> {
    await this.ensureInitialized();
    const stats = this.getAssetStatistics();
    
    return [
      {
        uri: "assets://all",
        name: "All Attached Assets",
        description: `Access to ${stats.totalAssets} attached assets`,
        mimeType: "application/json"
      },
      ...Object.keys(stats.categories).map(category => ({
        uri: `assets://category/${category}`,
        name: `${category.charAt(0).toUpperCase() + category.slice(1)} Assets`,
        description: `${stats.categories[category]} assets in ${category} category`,
        mimeType: "application/json"
      }))
    ];
  }

  async mcpReadResource(uri: string): Promise<any> {
    await this.ensureInitialized();
    
    if (uri === "assets://all") {
      const stats = this.getAssetStatistics();
      return {
        contents: [{
          uri,
          mimeType: "application/json",
          text: JSON.stringify(stats, null, 2)
        }]
      };
    }
    
    if (uri.startsWith("assets://category/")) {
      const category = uri.replace("assets://category/", "");
      const assets = await this.getAssetsByCategory(category);
      
      return {
        contents: [{
          uri,
          mimeType: "application/json",
          text: JSON.stringify(assets, null, 2)
        }]
      };
    }
    
    throw new Error(`Unknown resource URI: ${uri}`);
  }

  async mcpCallTool(name: string, args: any): Promise<any> {
    await this.ensureInitialized();
    
    switch (name) {
      case "search_assets":
        return this.queryAssets(args);
      
      case "get_asset_content":
        const content = await this.getAssetContent(args.filename);
        return { content, filename: args.filename };
      
      case "get_context_summary":
        const assets = await this.queryAssets(args);
        const summary = await this.generateContextSummary(assets.relevantAssets);
        return { summary, ...assets };
      
      default:
        throw new Error(`Unknown tool: ${name}`);
    }
  }
}

export const attachedAssetsMCPHub = AttachedAssetsMCPHub.getInstance();