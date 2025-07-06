import { MCPAssetContext, MCPAssetQuery } from './attachedAssetsMcpHub';
import { AttachedAsset } from '../deepseek/attachedAssetsService';

export class MCPHubService {
  private static instance: MCPHubService;
  private baseUrl = '/api/mcp-hub';
  private initialized = false;

  static getInstance(): MCPHubService {
    if (!MCPHubService.instance) {
      MCPHubService.instance = new MCPHubService();
    }
    return MCPHubService.instance;
  }

  async initialize(): Promise<void> {
    if (this.initialized) return;

    try {
      const response = await fetch(`${this.baseUrl}/initialize`, {
        method: 'POST'
      });
      
      if (!response.ok) {
        throw new Error(`Failed to initialize MCP Hub: ${response.statusText}`);
      }
      
      this.initialized = true;
    } catch (error) {
      console.error('MCP Hub initialization failed:', error);
      throw error;
    }
  }

  async queryAssets(query: MCPAssetQuery): Promise<MCPAssetContext> {
    try {
      await this.ensureInitialized();

      const response = await fetch(`${this.baseUrl}/query`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(query)
      });

      if (!response.ok) {
        console.warn(`MCP query failed: ${response.statusText}`);
        // Return empty context instead of throwing
        return {
          relevantAssets: [],
          contextData: {},
          metadata: {
            totalAssets: 0,
            categoriesFound: [],
            searchQuery: query.query,
            relevanceThreshold: query.relevanceThreshold || 0.1
          }
        };
      }

      const result = await response.json();
      return result.data;
    } catch (error) {
      console.warn('MCP query error, returning empty context:', error);
      return {
        relevantAssets: [],
        contextData: {},
        metadata: {
          totalAssets: 0,
          categoriesFound: [],
          searchQuery: query.query,
          relevanceThreshold: query.relevanceThreshold || 0.1
        }
      };
    }
  }

  async getAssetsByCategory(category: string): Promise<AttachedAsset[]> {
    await this.ensureInitialized();

    const response = await fetch(`${this.baseUrl}/category/${encodeURIComponent(category)}`);
    
    if (!response.ok) {
      throw new Error(`Failed to get assets by category: ${response.statusText}`);
    }

    const result = await response.json();
    return result.data;
  }

  async getAssetContent(filename: string): Promise<string> {
    await this.ensureInitialized();

    const response = await fetch(`${this.baseUrl}/content/${encodeURIComponent(filename)}`);
    
    if (!response.ok) {
      throw new Error(`Failed to get asset content: ${response.statusText}`);
    }

    const result = await response.json();
    return result.data.content;
  }

  async generateContextSummary(query: MCPAssetQuery): Promise<{ summary: string; context: MCPAssetContext }> {
    await this.ensureInitialized();

    const response = await fetch(`${this.baseUrl}/summary`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(query)
    });

    if (!response.ok) {
      throw new Error(`Failed to generate context summary: ${response.statusText}`);
    }

    const result = await response.json();
    return result.data;
  }

  async getAvailableCategories(): Promise<string[]> {
    await this.ensureInitialized();

    const response = await fetch(`${this.baseUrl}/categories`);
    
    if (!response.ok) {
      throw new Error(`Failed to get categories: ${response.statusText}`);
    }

    const result = await response.json();
    return result.data;
  }

  async getAssetStatistics(): Promise<{
    totalAssets: number;
    categories: Record<string, number>;
    types: Record<string, number>;
    cacheSize: number;
  }> {
    await this.ensureInitialized();

    const response = await fetch(`${this.baseUrl}/stats`);
    
    if (!response.ok) {
      throw new Error(`Failed to get asset statistics: ${response.statusText}`);
    }

    const result = await response.json();
    return result.data;
  }

  // MCP Protocol Methods
  async mcpListResources(): Promise<any[]> {
    await this.ensureInitialized();

    const response = await fetch(`${this.baseUrl}/mcp/resources`);
    
    if (!response.ok) {
      throw new Error(`MCP list resources failed: ${response.statusText}`);
    }

    const result = await response.json();
    return result.data;
  }

  async mcpReadResource(uri: string): Promise<any> {
    await this.ensureInitialized();

    const response = await fetch(`${this.baseUrl}/mcp/resource?uri=${encodeURIComponent(uri)}`);
    
    if (!response.ok) {
      throw new Error(`MCP read resource failed: ${response.statusText}`);
    }

    const result = await response.json();
    return result.data;
  }

  async mcpCallTool(name: string, args: any): Promise<any> {
    try {
      await this.ensureInitialized();

      // Validate inputs
      if (!name || typeof name !== 'string') {
        console.warn('MCP tool call skipped: invalid name');
        return { error: 'Invalid tool name' };
      }

      const response = await fetch(`${this.baseUrl}/mcp/tool`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          name, 
          args: args || {} 
        })
      });

      if (!response.ok) {
        console.warn(`MCP tool call failed: ${response.statusText}`);
        return { error: `Tool call failed: ${response.statusText}` };
      }

      const result = await response.json();
      return result.data || {};
    } catch (error) {
      console.warn('MCP tool call error:', error);
      return { error: error instanceof Error ? error.message : 'Unknown error' };
    }
  }

  async searchAssetsWithMCP(mcpQuery: {
    tools?: string[];
    resources?: string[];
    context?: any;
  }): Promise<MCPAssetContext> {
    await this.ensureInitialized();

    const response = await fetch(`${this.baseUrl}/search`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(mcpQuery)
    });

    if (!response.ok) {
      throw new Error(`MCP search failed: ${response.statusText}`);
    }

    const result = await response.json();
    return result.data;
  }

  async preloadCriticalAssets(): Promise<void> {
    await this.ensureInitialized();

    const response = await fetch(`${this.baseUrl}/preload`, {
      method: 'POST'
    });

    if (!response.ok) {
      throw new Error(`Failed to preload critical assets: ${response.statusText}`);
    }
  }

  async clearCache(): Promise<void> {
    const response = await fetch(`${this.baseUrl}/clear-cache`, {
      method: 'POST'
    });

    if (!response.ok) {
      throw new Error(`Failed to clear cache: ${response.statusText}`);
    }
  }

  // Smart context retrieval for specific queries
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

      // Generate structured context
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
          // Include a meaningful excerpt
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

  // Get MCP-specific documentation context
  async getMCPContext(): Promise<string> {
    try {
      const mcpAssets = await this.getAssetsByCategory('mcp');
      
      if (mcpAssets.length === 0) {
        // Fallback to general search for MCP-related content
        const context = await this.queryAssets({
          query: "Model Context Protocol MCP architecture implementation tools resources",
          maxAssets: 3,
          includeContent: true
        });
        mcpAssets.push(...context.relevantAssets);
      }

      if (mcpAssets.length === 0) {
        return "No MCP documentation found in attached assets.";
      }

      let mcpContext = "=== MODEL CONTEXT PROTOCOL (MCP) DOCUMENTATION ===\n\n";
      
      for (const asset of mcpAssets.slice(0, 3)) { // Top 3 MCP assets
        const content = await this.getAssetContent(asset.filename);
        mcpContext += `## ${asset.filename}\n`;
        
        // Extract key MCP concepts (first 1500 chars for context window management)
        const excerpt = content.substring(0, 1500);
        mcpContext += `${excerpt}...\n\n---\n\n`;
      }

      mcpContext += "=== END MCP DOCUMENTATION ===\n";
      return mcpContext;
    } catch (error) {
      console.error('Failed to get MCP context:', error);
      return `Error retrieving MCP documentation: ${error}`;
    }
  }

  private async ensureInitialized(): Promise<void> {
    if (!this.initialized) {
      await this.initialize();
    }
  }
}

export const mcpHubService = MCPHubService.getInstance();