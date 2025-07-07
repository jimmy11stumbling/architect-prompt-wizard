import { realTimeResponseService } from "../integration/realTimeResponseService";

export interface AttachedAsset {
  filename: string;
  path: string;
  type: 'text' | 'image' | 'document';
  size: number;
  lastModified: number;
  content?: string;
  metadata?: {
    description?: string;
    tags?: string[];
    category?: string;
  };
}

export class AttachedAssetsService {
  private static instance: AttachedAssetsService;
  private assets: Map<string, AttachedAsset> = new Map();
  private contentCache: Map<string, string> = new Map();

  static getInstance(): AttachedAssetsService {
    if (!AttachedAssetsService.instance) {
      AttachedAssetsService.instance = new AttachedAssetsService();
    }
    return AttachedAssetsService.instance;
  }

  async loadAvailableAssets(): Promise<AttachedAsset[]> {
    try {
      const response = await fetch('/api/attached-assets');
      if (!response.ok) {
        throw new Error('Failed to load attached assets');
      }

      const assetList = await response.json();

      // Process and categorize assets
      const processedAssets = assetList.map((asset: any) => ({
        filename: asset.filename,
        path: asset.path || `/attached_assets/${asset.filename}`,
        type: this.determineAssetType(asset.filename),
        size: asset.size || 0,
        lastModified: asset.lastModified || Date.now(),
        metadata: this.extractMetadataFromFilename(asset.filename)
      }));

      // Cache assets
      processedAssets.forEach((asset: AttachedAsset) => {
        this.assets.set(asset.filename, asset);
      });

      realTimeResponseService.addResponse({
        source: "attached-assets-service",
        status: "success",
        message: `Loaded ${processedAssets.length} attached assets`,
        data: { assetCount: processedAssets.length }
      });

      return processedAssets;
    } catch (error) {
      realTimeResponseService.addResponse({
        source: "attached-assets-service",
        status: "error",
        message: `Failed to load assets: ${error}`,
        data: { error }
      });
      return [];
    }
  }

  async getAssetContent(filename: string): Promise<string> {
    // Check cache first
    if (this.contentCache.has(filename)) {
      return this.contentCache.get(filename)!;
    }

    try {
      const response = await fetch(`/api/attached-assets/${encodeURIComponent(filename)}`);
      if (!response.ok) {
        throw new Error(`Failed to load asset: ${filename}`);
      }

      const content = await response.text();

      // Cache the content
      this.contentCache.set(filename, content);

      realTimeResponseService.addResponse({
        source: "attached-assets-service",
        status: "success",
        message: `Loaded content for ${filename}`,
        data: { filename, contentLength: content.length }
      });

      return content;
    } catch (error) {
      realTimeResponseService.addResponse({
        source: "attached-assets-service",
        status: "error",
        message: `Failed to load content for ${filename}: ${error}`,
        data: { filename, error }
      });
      return '';
    }
  }

  async searchAssets(query: string, type?: 'text' | 'image' | 'document'): Promise<AttachedAsset[]> {
    const allAssets = Array.from(this.assets.values());

    return allAssets.filter(asset => {
      const matchesType = !type || asset.type === type;
      const matchesQuery = !query || 
        asset.filename.toLowerCase().includes(query.toLowerCase()) ||
        asset.metadata?.description?.toLowerCase().includes(query.toLowerCase()) ||
        asset.metadata?.tags?.some(tag => tag.toLowerCase().includes(query.toLowerCase()));

      return matchesType && matchesQuery;
    });
  }

  async getAllAssetContents(): Promise<Record<string, string>> {
    const assets = Array.from(this.assets.values());
    const contents: Record<string, string> = {};

    for (const asset of assets) {
      if (asset.type === 'text' || asset.type === 'document') {
        try {
          contents[asset.filename] = await this.getAssetContent(asset.filename);
        } catch (error) {
          console.error(`Failed to load content for ${asset.filename}:`, error);
        }
      }
    }

    return contents;
  }

  async getAssetsByCategory(category: string): Promise<AttachedAsset[]> {
    const allAssets = Array.from(this.assets.values());
    return allAssets.filter(asset => 
      asset.metadata?.category?.toLowerCase() === category.toLowerCase()
    );
  }

  async getRelevantAssetsForPrompt(prompt: string): Promise<AttachedAsset[]> {
    const keywords = this.extractKeywordsFromPrompt(prompt);
    const relevantAssets: AttachedAsset[] = [];

    for (const asset of this.assets.values()) {
      let relevanceScore = 0;

      // Check filename matches
      keywords.forEach(keyword => {
        if (asset.filename.toLowerCase().includes(keyword.toLowerCase())) {
          relevanceScore += 2;
        }
        if (asset.metadata?.tags?.some(tag => 
          tag.toLowerCase().includes(keyword.toLowerCase())
        )) {
          relevanceScore += 1;
        }
      });

      // Check content matches for text assets
      if (asset.type === 'text' || asset.type === 'document') {
        try {
          const content = await this.getAssetContent(asset.filename);
          keywords.forEach(keyword => {
            const regex = new RegExp(keyword, 'gi');
            const matches = content.match(regex);
            if (matches) {
              relevanceScore += matches.length * 0.1;
            }
          });
        } catch (error) {
          // Continue without content analysis
        }
      }

      if (relevanceScore > 0) {
        relevantAssets.push({
          ...asset,
          metadata: {
            ...asset.metadata,
            relevanceScore
          }
        });
      }
    }

    // Sort by relevance score
    return relevantAssets.sort((a, b) => 
      (b.metadata?.relevanceScore || 0) - (a.metadata?.relevanceScore || 0)
    );
  }

  private determineAssetType(filename: string): 'text' | 'image' | 'document' {
    const extension = filename.split('.').pop()?.toLowerCase();

    if (['txt', 'md', 'json', 'csv', 'log'].includes(extension || '')) {
      return 'text';
    }
    if (['png', 'jpg', 'jpeg', 'gif', 'svg', 'webp'].includes(extension || '')) {
      return 'image';
    }
    return 'document';
  }

  private extractMetadataFromFilename(filename: string): AttachedAsset['metadata'] {
    const metadata: AttachedAsset['metadata'] = {
      tags: [],
      category: 'general'
    };

    // Extract category from filename patterns
    if (filename.toLowerCase().includes('cursor')) {
      metadata.category = 'cursor';
      metadata.tags = ['ide', 'ai-coding', 'editor'];
      metadata.description = 'Cursor IDE related documentation';
    } else if (filename.toLowerCase().includes('bolt')) {
      metadata.category = 'bolt';
      metadata.tags = ['stackblitz', 'web-development', 'ai-agent'];
      metadata.description = 'Bolt.new platform documentation';
    } else if (filename.toLowerCase().includes('replit')) {
      metadata.category = 'replit';
      metadata.tags = ['cloud-ide', 'development', 'collaboration'];
      metadata.description = 'Replit platform documentation';
    } else if (filename.toLowerCase().includes('windsurf')) {
      metadata.category = 'windsurf';
      metadata.tags = ['agentic-ide', 'mcp', 'ai-tools'];
      metadata.description = 'Windsurf IDE documentation';
    } else if (filename.toLowerCase().includes('lovable')) {
      metadata.category = 'lovable';
      metadata.tags = ['no-code', 'ai-platform', 'ui-generation'];
      metadata.description = 'Lovable 2.0 platform documentation';
    } else if (filename.toLowerCase().includes('mcp')) {
      metadata.category = 'mcp';
      metadata.tags = ['model-context-protocol', 'ai-tools', 'integration'];
      metadata.description = 'Model Context Protocol documentation';
    } else if (filename.toLowerCase().includes('rag')) {
      metadata.category = 'rag';
      metadata.tags = ['retrieval-augmented-generation', 'ai', 'search'];
      metadata.description = 'RAG 2.0 system documentation';
    } else if (filename.toLowerCase().includes('a2a')) {
      metadata.category = 'a2a';
      metadata.tags = ['agent-to-agent', 'communication', 'ai-coordination'];
      metadata.description = 'Agent-to-Agent communication documentation';
    }

    return metadata;
  }

  private extractKeywordsFromPrompt(prompt: string): string[] {
    // Extract meaningful keywords from prompt
    const words = prompt.toLowerCase()
      .replace(/[^\w\s]/g, ' ')
      .split(/\s+/)
      .filter(word => word.length > 3);

    // Add platform-specific keywords
    const platformKeywords = ['cursor', 'bolt', 'replit', 'windsurf', 'lovable', 'mcp', 'rag', 'a2a'];
    const foundPlatforms = platformKeywords.filter(platform => 
      prompt.toLowerCase().includes(platform)
    );

    return [...new Set([...words, ...foundPlatforms])];
  }

  getAssetStats(): {
    total: number;
    byType: Record<string, number>;
    byCategory: Record<string, number>;
    totalSize: number;
  } {
    const assets = Array.from(this.assets.values());

    return {
      total: assets.length,
      byType: assets.reduce((acc, asset) => {
        acc[asset.type] = (acc[asset.type] || 0) + 1;
        return acc;
      }, {} as Record<string, number>),
      byCategory: assets.reduce((acc, asset) => {
        const category = asset.metadata?.category || 'other';
        acc[category] = (acc[category] || 0) + 1;
        return acc;
      }, {} as Record<string, number>),
      totalSize: assets.reduce((sum, asset) => sum + asset.size, 0)
    };
  }

  clearCache(): void {
    this.contentCache.clear();
    realTimeResponseService.addResponse({
      source: "attached-assets-service",
      status: "info",
      message: "Asset content cache cleared",
      data: {}
    });
  }

  private async ensureAssetsLoaded(): Promise<void> {
    if (this.assets.size === 0) {
      await this.loadAvailableAssets();
    }
  }

  async queryAssets(options: {
    query: string;
    maxAssets?: number;
    includeContent?: boolean;
    category?: string;
  }): Promise<{
    relevantAssets: AttachedAsset[];
    totalMatches: number;
    searchTerms: string[];
  }> {
    await this.ensureAssetsLoaded();

    const { query, maxAssets = 5, includeContent = false, category } = options;
    const searchTerms = query.toLowerCase().split(/\s+/).filter(term => term.length > 2);

    // Add specialized MCP search terms
    const expandedTerms = [...searchTerms];
    if (query.toLowerCase().includes('mcp') || query.toLowerCase().includes('protocol')) {
      expandedTerms.push('model', 'context', 'protocol', 'json-rpc', 'tools', 'resources');
    }
    if (query.toLowerCase().includes('rag')) {
      expandedTerms.push('retrieval', 'augmented', 'generation', 'vector', 'embedding');
    }
    if (query.toLowerCase().includes('a2a') || query.toLowerCase().includes('agent')) {
      expandedTerms.push('agent', 'communication', 'coordination', 'fipa');
    }

    const scoredAssets = Array.from(this.assets.values())
      .filter(asset => !category || asset.metadata?.category === category)
      .map(asset => {
        let score = 0;
        const assetText = `${asset.filename} ${asset.content || ''}`.toLowerCase();
        const filenameText = asset.filename.toLowerCase();

        // Filename bonus scoring
        expandedTerms.forEach(term => {
          if (filenameText.includes(term)) {
            score += 5; // High bonus for filename matches
          }
        });

        // Content scoring with enhanced term matching
        expandedTerms.forEach(term => {
          const termRegex = new RegExp(`\\b${term}\\b`, 'gi');
          const matches = assetText.match(termRegex);
          if (matches) {
            // Weight by term importance and frequency
            const termWeight = term.length >= 6 ? 2 : 1; // Longer terms are more specific
            score += matches.length * termWeight;
          }
        });

        // Special boost for exact phrase matches
        if (assetText.includes(query.toLowerCase())) {
          score += 10;
        }

        // Boost for MCP-related documents when MCP is queried
        if ((query.toLowerCase().includes('mcp') || query.toLowerCase().includes('protocol')) && 
            (filenameText.includes('mcp') || assetText.includes('model context protocol'))) {
          score += 15;
        }

        return {
          asset,
          score
        };
      })
      .filter(item => item.score > 0)
      .sort((a, b) => b.score - a.score);

    const relevantAssets = scoredAssets
      .slice(0, maxAssets)
      .map(item => ({
        ...item.asset,
        content: includeContent ? this.contentCache.get(item.asset.filename) : undefined,
        metadata: {
          ...item.asset.metadata,
          relevanceScore: Math.min(item.score / 20, 1) // Normalize score with higher ceiling
        }
      }));

    return {
      relevantAssets,
      totalMatches: scoredAssets.length,
      searchTerms: expandedTerms
    };
  }

  async getContextForPrompt(prompt: string, maxAssets: number = 5): Promise<string> {
    // Ensure assets are loaded first
    await this.ensureAssetsLoaded();
    
    // Enhanced query processing for better document matching
    const queryTerms = prompt.toLowerCase();
    const isMCPQuery = queryTerms.includes('mcp') || queryTerms.includes('model context protocol') || 
                      queryTerms.includes('model-context-protocol') || queryTerms.includes('protocol');
    const isRAGQuery = queryTerms.includes('rag') || queryTerms.includes('retrieval') || 
                      queryTerms.includes('augmented generation');
    const isA2AQuery = queryTerms.includes('a2a') || queryTerms.includes('agent') || 
                      queryTerms.includes('communication');

    // Get relevant assets with enhanced filtering
    const relevantAssets = await this.queryAssets({
      query: prompt,
      maxAssets: isMCPQuery || isRAGQuery || isA2AQuery ? 8 : maxAssets,
      includeContent: true
    });

    // Prioritize specific documentation based on query type
    if (isMCPQuery) {
      // Ensure MCP documents are loaded and included
      const mcpAssets = Array.from(this.assets.values()).filter(asset => 
        asset.filename.toLowerCase().includes('mcp') || 
        asset.filename.toLowerCase().includes('model context protocol') ||
        asset.filename.toLowerCase().includes('model-context-protocol')
      );

      // Load content for MCP assets and add them if not already included
      for (const mcpAsset of mcpAssets) {
        if (!relevantAssets.relevantAssets.find(asset => asset.filename === mcpAsset.filename)) {
          const content = await this.getAssetContent(mcpAsset.filename);
          relevantAssets.relevantAssets.unshift({
            ...mcpAsset,
            content: content,
            metadata: { ...mcpAsset.metadata, relevanceScore: 0.95 }
          });
        }
      }
    }

    if (relevantAssets.relevantAssets.length === 0) {
      return "No relevant documentation found for this query.";
    }

    let context = "=== RELEVANT DOCUMENTATION ===\n\n";

    // Sort by relevance score if available
    const sortedAssets = relevantAssets.relevantAssets
      .sort((a, b) => (b.metadata?.relevanceScore || 0) - (a.metadata?.relevanceScore || 0))
      .slice(0, Math.min(8, relevantAssets.relevantAssets.length));

    sortedAssets.forEach((asset, index) => {
      context += `## Document ${index + 1}: ${asset.filename}\n`;
      if (asset.metadata?.category) {
        context += `Category: ${asset.metadata.category}\n`;
      }
      if (asset.metadata?.relevanceScore) {
        context += `Relevance: ${(asset.metadata.relevanceScore * 100).toFixed(1)}%\n`;
      }
      context += "\n";

      if (asset.content) {
        // Dynamic content length based on relevance
        const baseLength = 3000;
        const relevanceMultiplier = asset.metadata?.relevanceScore || 0.5;
        const maxContentLength = Math.floor(baseLength * (1 + relevanceMultiplier));

        const truncatedContent = asset.content.length > maxContentLength 
          ? asset.content.substring(0, maxContentLength) + "\n\n[Content truncated - this document contains more information]"
          : asset.content;
        context += `${truncatedContent}\n\n`;
      }
      context += "---\n\n";
    });

    context += "=== END DOCUMENTATION ===\n";
    context += `\nTotal documents accessed: ${sortedAssets.length} of ${Array.from(this.assets.values()).length} available\n`;

    return context;
  }
}

export const attachedAssetsService = AttachedAssetsService.getInstance();