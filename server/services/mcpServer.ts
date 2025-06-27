import { mcpHub, MCPHubData, MCPPlatformData, MCPTechnologyData } from './mcpHub';

export interface MCPRequest {
  jsonrpc: "2.0";
  id: string | number;
  method: string;
  params?: any;
}

export interface MCPResponse {
  jsonrpc: "2.0";
  id: string | number;
  result?: any;
  error?: {
    code: number;
    message: string;
    data?: any;
  };
}

export interface MCPTool {
  name: string;
  description: string;
  inputSchema: any;
}

export interface MCPResource {
  uri: string;
  name: string;
  description?: string;
  mimeType?: string;
}

export class MCPServer {
  private static instance: MCPServer;
  
  static getInstance(): MCPServer {
    if (!MCPServer.instance) {
      MCPServer.instance = new MCPServer();
    }
    return MCPServer.instance;
  }

  async handleRequest(request: MCPRequest): Promise<MCPResponse> {
    try {
      let result: any;

      switch (request.method) {
        case 'tools/list':
          result = await this.listTools();
          break;
        case 'tools/call':
          result = await this.callTool(request.params?.name, request.params?.arguments);
          break;
        case 'resources/list':
          result = await this.listResources();
          break;
        case 'resources/read':
          result = await this.readResource(request.params?.uri);
          break;
        case 'platform/get':
          result = await this.getPlatformData(request.params?.name);
          break;
        case 'platform/search':
          result = await this.searchPlatforms(request.params?.query);
          break;
        case 'technology/get':
          result = await this.getTechnologyData(request.params?.type);
          break;
        case 'context/comprehensive':
          result = await this.getComprehensiveContext(request.params?.platform);
          break;
        case 'hub/status':
          result = await this.getHubStatus();
          break;
        case 'hub/refresh':
          result = await this.refreshHub();
          break;
        default:
          throw new Error(`Unknown method: ${request.method}`);
      }

      return {
        jsonrpc: "2.0",
        id: request.id,
        result
      };
    } catch (error) {
      return {
        jsonrpc: "2.0",
        id: request.id,
        error: {
          code: -1,
          message: error instanceof Error ? error.message : 'Unknown error',
          data: error
        }
      };
    }
  }

  private async listTools(): Promise<{ tools: MCPTool[] }> {
    return {
      tools: [
        {
          name: "get_platform_data",
          description: "Get comprehensive data for a specific no-code platform",
          inputSchema: {
            type: "object",
            properties: {
              platformName: {
                type: "string",
                description: "Name of the platform (windsurf, cursor, bolt, replit, lovable)"
              }
            },
            required: ["platformName"]
          }
        },
        {
          name: "search_platforms",
          description: "Search for platforms based on capabilities or features",
          inputSchema: {
            type: "object",
            properties: {
              query: {
                type: "string",
                description: "Search query for platform capabilities"
              },
              category: {
                type: "string",
                description: "Platform category filter"
              }
            },
            required: ["query"]
          }
        },
        {
          name: "get_technology_data",
          description: "Get detailed information about RAG 2.0, MCP, or A2A technologies",
          inputSchema: {
            type: "object",
            properties: {
              type: {
                type: "string",
                enum: ["rag2", "mcp", "a2a", "all"],
                description: "Type of technology data to retrieve"
              }
            },
            required: ["type"]
          }
        },
        {
          name: "get_comprehensive_context",
          description: "Get full context including platform data and all technology information",
          inputSchema: {
            type: "object",
            properties: {
              platform: {
                type: "string",
                description: "Target platform for context"
              }
            }
          }
        },
        {
          name: "analyze_platform_compatibility",
          description: "Analyze compatibility between platforms and technology stack",
          inputSchema: {
            type: "object",
            properties: {
              platform: { type: "string" },
              techStack: { 
                type: "array",
                items: { type: "string" }
              },
              requirements: { type: "string" }
            },
            required: ["platform", "techStack"]
          }
        }
      ]
    };
  }

  private async callTool(toolName: string, args: any): Promise<any> {
    switch (toolName) {
      case "get_platform_data":
        return await this.getPlatformData(args.platformName);
      case "search_platforms":
        return await this.searchPlatforms(args.query, args.category);
      case "get_technology_data":
        return await this.getTechnologyData(args.type);
      case "get_comprehensive_context":
        return await this.getComprehensiveContext(args.platform);
      case "analyze_platform_compatibility":
        return await this.analyzePlatformCompatibility(args.platform, args.techStack, args.requirements);
      default:
        throw new Error(`Unknown tool: ${toolName}`);
    }
  }

  private async listResources(): Promise<{ resources: MCPResource[] }> {
    const hubData = await mcpHub.getAllPlatformData();
    
    const resources: MCPResource[] = [
      {
        uri: "platform://all",
        name: "All Platform Data",
        description: "Complete dataset of all no-code platforms",
        mimeType: "application/json"
      },
      {
        uri: "technology://all",
        name: "All Technology Data", 
        description: "RAG 2.0, MCP, and A2A technology specifications",
        mimeType: "application/json"
      }
    ];

    // Add individual platform resources
    hubData.platforms.forEach(platform => {
      resources.push({
        uri: `platform://${platform.platform.name.toLowerCase().replace(/\s+/g, '-')}`,
        name: `${platform.platform.name} Data`,
        description: `Complete data for ${platform.platform.name}`,
        mimeType: "application/json"
      });
    });

    return { resources };
  }

  private async readResource(uri: string): Promise<any> {
    const [scheme, path] = uri.split('://');
    
    if (scheme === 'platform') {
      if (path === 'all') {
        return await mcpHub.getAllPlatformData();
      } else {
        return await mcpHub.getPlatformByName(path.replace('-', ' '));
      }
    } else if (scheme === 'technology') {
      if (path === 'all') {
        return await mcpHub.getTechnologyData();
      } else {
        const techData = await mcpHub.getTechnologyData();
        return (techData as any)[path] || null;
      }
    }
    
    throw new Error(`Unknown resource URI: ${uri}`);
  }

  private async getPlatformData(platformName: string): Promise<MCPPlatformData | null> {
    return await mcpHub.getPlatformByName(platformName);
  }

  private async searchPlatforms(query: string, category?: string): Promise<MCPPlatformData[]> {
    const hubData = await mcpHub.getAllPlatformData();
    const queryLower = query.toLowerCase();
    
    return hubData.platforms.filter(platform => {
      const matchesQuery = 
        platform.platform.name.toLowerCase().includes(queryLower) ||
        (platform.platform.description?.toLowerCase().includes(queryLower) || false) ||
        platform.features.some(f => f.featureName.toLowerCase().includes(queryLower)) ||
        platform.integrations.some(i => i.serviceName.toLowerCase().includes(queryLower));
      
      const matchesCategory = !category || 
        (platform.platform.category?.toLowerCase().includes(category.toLowerCase()) || false);
      
      return matchesQuery && matchesCategory;
    });
  }

  private async getTechnologyData(type: string): Promise<any> {
    const techData = await mcpHub.getTechnologyData();
    
    if (type === 'all') {
      return techData;
    }
    
    return (techData as any)[type] || null;
  }

  private async getComprehensiveContext(platform?: string): Promise<any> {
    return await mcpHub.getComprehensiveContext(platform);
  }

  private async getHubStatus(): Promise<any> {
    return mcpHub.getCacheStatus();
  }

  private async refreshHub(): Promise<any> {
    await mcpHub.invalidateCache();
    await mcpHub.getAllPlatformData(); // Rebuild cache
    return { success: true, message: "MCP Hub refreshed successfully" };
  }

  private async analyzePlatformCompatibility(platform: string, techStack: string[], requirements?: string): Promise<any> {
    const platformData = await mcpHub.getPlatformByName(platform);
    if (!platformData) {
      throw new Error(`Platform ${platform} not found`);
    }

    const techData = await mcpHub.getTechnologyData();
    
    // Analyze compatibility
    const compatibility = {
      platform: platformData.platform.name,
      overallScore: 0,
      techStackCompatibility: {} as Record<string, any>,
      recommendations: [] as string[],
      limitations: [] as string[],
      optimizations: [] as string[]
    };

    // Check tech stack compatibility
    techStack.forEach(tech => {
      const techLower = tech.toLowerCase();
      const isSupported = platformData.features.some(f => 
        f.featureName.toLowerCase().includes(techLower) ||
        f.description?.toLowerCase().includes(techLower)
      );
      
      compatibility.techStackCompatibility[tech] = {
        supported: isSupported,
        confidence: isSupported ? 0.9 : 0.1
      };
    });

    // Generate recommendations based on platform capabilities
    if (platformData.platform.category?.includes('AI')) {
      compatibility.recommendations.push("Leverage AI-powered development features");
      compatibility.recommendations.push("Use conversational development workflows");
    }

    if (platformData.features.some(f => f.featureName.includes('Database'))) {
      compatibility.recommendations.push("Utilize built-in database integration");
    }

    if (platformData.integrations.length > 0) {
      compatibility.recommendations.push(`Take advantage of ${platformData.integrations.length} available integrations`);
    }

    // Calculate overall score
    const supportedCount = Object.values(compatibility.techStackCompatibility).filter(t => t.supported).length;
    compatibility.overallScore = Math.round((supportedCount / techStack.length) * 100);

    return compatibility;
  }
}

export const mcpServer = MCPServer.getInstance();