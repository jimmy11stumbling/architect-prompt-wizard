// import { storage } from '../storage'; // Temporarily disable to avoid Drizzle ORM issues
import type { Platform, PlatformFeature, PlatformIntegration, PlatformPricing, KnowledgeBase } from '@shared/schema';

export interface MCPPlatformData {
  platform: Platform;
  features: PlatformFeature[];
  integrations: PlatformIntegration[];
  pricing: PlatformPricing[];
  knowledgeBase: KnowledgeBase[];
}

export interface MCPTechnologyData {
  rag2: {
    description: string;
    features: string[];
    bestPractices: string[];
    implementation: string[];
    vectorDatabases: string[];
  };
  mcp: {
    description: string;
    tools: string[];
    resources: string[];
    bestPractices: string[];
    protocols: string[];
  };
  a2a: {
    description: string;
    protocols: string[];
    patterns: string[];
    bestPractices: string[];
    coordination: string[];
  };
}

export interface MCPHubData {
  platforms: MCPPlatformData[];
  technologies: MCPTechnologyData;
  platformMappings: Record<string, string>;
  lastUpdated: string;
}

export class MCPHub {
  private static instance: MCPHub;
  private cache: MCPHubData | null = null;
  private cacheTimestamp: number = 0;
  private readonly CACHE_DURATION = 10 * 60 * 1000; // 10 minutes

  static getInstance(): MCPHub {
    if (!MCPHub.instance) {
      MCPHub.instance = new MCPHub();
    }
    return MCPHub.instance;
  }

  async getAllPlatformData(): Promise<MCPHubData> {
    const now = Date.now();
    
    // Return cached data if still valid
    if (this.cache && (now - this.cacheTimestamp) < this.CACHE_DURATION) {
      return this.cache;
    }

    // Rebuild cache with fresh data
    await this.rebuildCache();
    return this.cache!;
  }

  async rebuildCache(): Promise<void> {
    console.log('MCP Hub: Rebuilding platform data cache...');
    
    try {
      // Get all platforms using direct SQL to avoid Drizzle ORM issues
      const { neon } = await import('@neondatabase/serverless');
      const sql = neon(process.env.DATABASE_URL!);
      const platformsResult = await sql`SELECT * FROM platforms ORDER BY name`;
      
      const platforms = platformsResult.map((row: any) => ({
        id: row.id,
        name: row.name,
        description: row.description,
        createdAt: row.created_at,
        updatedAt: row.updated_at
      }));
      
      // For now, use empty arrays for features/integrations/pricing to avoid DB issues
      const knowledgeBase: any[] = [];
      
      const platformsData: MCPPlatformData[] = platforms.map((platform) => ({
        platform,
        features: [], // Will be populated later when DB connection is stable
        integrations: [], // Will be populated later when DB connection is stable
        pricing: [], // Will be populated later when DB connection is stable
        knowledgeBase: []
      }));

      // Technology data with comprehensive information
      const technologies: MCPTechnologyData = {
        rag2: {
          description: "Advanced Retrieval-Augmented Generation with vector search, semantic chunking, and hybrid retrieval strategies",
          features: [
            "Vector embeddings with semantic search",
            "Hybrid search combining keyword and semantic",
            "Intelligent document chunking with overlap",
            "Context compression and relevance scoring",
            "Multi-modal document processing",
            "Real-time index updates and versioning"
          ],
          bestPractices: [
            "Use semantic chunking with 20% overlap",
            "Implement hybrid search for best results",
            "Optimize embedding dimensions for use case",
            "Use metadata filtering for precision",
            "Implement relevance scoring thresholds",
            "Cache frequent queries for performance"
          ],
          implementation: [
            "Set up vector database (Pinecone, Weaviate, or Qdrant)",
            "Process documents with semantic chunking",
            "Generate embeddings using appropriate model",
            "Implement hybrid search algorithm",
            "Add metadata and filtering capabilities",
            "Create query optimization layer"
          ],
          vectorDatabases: ["Pinecone", "Weaviate", "Qdrant", "Chroma", "Milvus", "PostgreSQL with pgvector"]
        },
        mcp: {
          description: "Model Context Protocol for standardized tool and resource access in AI systems",
          tools: [
            "list_files", "read_file", "write_file", "search_files",
            "web_search", "web_fetch", "query_database", "execute_sql",
            "analyze_code", "run_command", "process_document", "manage_resources"
          ],
          resources: [
            "Configuration files and settings",
            "API documentation and schemas", 
            "Database schemas and connections",
            "File system access and navigation",
            "External service integrations",
            "Tool registry and capabilities"
          ],
          bestPractices: [
            "Use JSON-RPC 2.0 for all communications",
            "Implement proper error handling and validation",
            "Maintain session state across requests",
            "Use capability negotiation for tool discovery",
            "Implement resource caching for performance",
            "Follow security best practices for tool access"
          ],
          protocols: ["JSON-RPC 2.0", "WebSocket", "HTTP/HTTPS", "Tool Discovery", "Capability Negotiation"]
        },
        a2a: {
          description: "Agent-to-Agent communication using FIPA ACL protocols for multi-agent coordination",
          protocols: [
            "FIPA ACL (Agent Communication Language)",
            "Contract Net Protocol for task delegation",
            "Auction protocols for resource allocation",
            "Voting protocols for consensus",
            "Subscription protocols for event handling"
          ],
          patterns: [
            "Request-Response for simple interactions",
            "Publish-Subscribe for event distribution",
            "Negotiation for complex task coordination",
            "Collaboration for shared problem solving",
            "Competition for resource optimization"
          ],
          bestPractices: [
            "Use standardized message ontologies",
            "Implement proper agent discovery mechanisms",
            "Handle message delivery guarantees",
            "Use conversation IDs for multi-turn interactions",
            "Implement timeout and retry mechanisms",
            "Follow security protocols for agent verification"
          ],
          coordination: [
            "Task decomposition and delegation",
            "Resource sharing and allocation",
            "Conflict resolution strategies",
            "Load balancing across agents",
            "Fault tolerance and recovery",
            "Performance monitoring and optimization"
          ]
        }
      };

      // Platform mappings for easy lookup
      const platformMappings: Record<string, string> = {
        'windsurf': 'Windsurf (Codeium)',
        'cursor': 'Cursor',
        'bolt': 'Bolt (StackBlitz)',
        'replit': 'Replit',
        'lovable': 'Lovable 2.0',
        'codeium': 'Windsurf (Codeium)',
        'stackblitz': 'Bolt (StackBlitz)'
      };

      this.cache = {
        platforms: platformsData,
        technologies,
        platformMappings,
        lastUpdated: new Date().toISOString()
      };
      
      this.cacheTimestamp = Date.now();
      console.log(`MCP Hub: Cache rebuilt with ${platformsData.length} platforms and complete technology data`);
      
    } catch (error) {
      console.error('MCP Hub: Error rebuilding cache:', error);
      throw error;
    }
  }

  async getPlatformByName(platformName: string): Promise<MCPPlatformData | null> {
    const data = await this.getAllPlatformData();
    const normalizedName = platformName.toLowerCase();
    
    console.log(`[MCP Hub] Looking for platform: "${normalizedName}"`);
    console.log(`[MCP Hub] Available platforms:`, data.platforms.map(p => p.platform.name));
    
    // Try direct name match first
    let platform = data.platforms.find(p => 
      p.platform.name.toLowerCase() === normalizedName
    );
    
    if (platform) {
      console.log(`[MCP Hub] Found exact match: ${platform.platform.name}`);
      return platform;
    }
    
    // Try partial matching for known platforms
    const platformMappings: { [key: string]: string } = {
      'windsurf': 'Windsurf (Codeium)',
      'cursor': 'Cursor', 
      'bolt': 'Bolt (StackBlitz)',
      'replit': 'Replit',
      'lovable': 'Lovable 2.0'
    };
    
    const targetName = platformMappings[normalizedName];
    if (targetName) {
      platform = data.platforms.find(p => p.platform.name === targetName);
      if (platform) {
        console.log(`[MCP Hub] Found mapped platform: ${platform.platform.name}`);
        return platform;
      }
    }
    
    // Try partial matching as fallback
    platform = data.platforms.find(p => 
      p.platform.name.toLowerCase().includes(normalizedName) ||
      normalizedName.includes(p.platform.name.toLowerCase().split(' ')[0])
    );
    
    if (platform) {
      console.log(`[MCP Hub] Found partial match: ${platform.platform.name}`);
    } else {
      console.warn(`[MCP Hub] No platform found for: ${normalizedName}`);
    }
    
    return platform || null;
  }

  async getTechnologyData(): Promise<MCPTechnologyData> {
    const data = await this.getAllPlatformData();
    return data.technologies;
  }

  async getComprehensiveContext(platformName?: string): Promise<{
    platform?: MCPPlatformData;
    technologies: MCPTechnologyData;
    allPlatforms: MCPPlatformData[];
  }> {
    const data = await this.getAllPlatformData();
    const platform = platformName ? await this.getPlatformByName(platformName) : undefined;
    
    return {
      platform: platform || undefined,
      technologies: data.technologies,
      allPlatforms: data.platforms
    };
  }

  async invalidateCache(): Promise<void> {
    this.cache = null;
    this.cacheTimestamp = 0;
    console.log('MCP Hub: Cache invalidated');
  }

  getCacheStatus(): { cached: boolean; age: number; platforms: number } {
    const age = this.cache ? Date.now() - this.cacheTimestamp : 0;
    return {
      cached: !!this.cache,
      age: Math.round(age / 1000), // age in seconds
      platforms: this.cache?.platforms.length || 0
    };
  }
}

export const mcpHub = MCPHub.getInstance();