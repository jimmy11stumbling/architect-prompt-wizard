import { EventEmitter } from "events";

// MCP Protocol Types
export interface MCPMessage {
  jsonrpc: "2.0";
  id?: string | number;
  method?: string;
  params?: any;
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
  inputSchema: {
    type: "object";
    properties: Record<string, any>;
    required?: string[];
  };
}

export interface MCPResource {
  uri: string;
  name: string;
  description?: string;
  mimeType?: string;
}

export interface MCPPrompt {
  name: string;
  description?: string;
  arguments?: Array<{
    name: string;
    description?: string;
    required?: boolean;
  }>;
}

export interface MCPCapabilities {
  tools?: {
    listChanged?: boolean;
  };
  resources?: {
    subscribe?: boolean;
    listChanged?: boolean;
  };
  prompts?: {
    listChanged?: boolean;
  };
  sampling?: boolean;
}

export class MCPServer extends EventEmitter {
  private tools: Map<string, MCPTool> = new Map();
  private resources: Map<string, MCPResource> = new Map();
  private prompts: Map<string, MCPPrompt> = new Map();
  private capabilities: MCPCapabilities;
  private initialized = false;

  constructor(capabilities: MCPCapabilities = {}) {
    super();
    this.capabilities = capabilities;
  }

  /**
   * Initialize the MCP server
   */
  async initialize(params: any): Promise<any> {
    this.initialized = true;
    
    // Register default tools
    this.registerDefaultTools();
    this.registerDefaultResources();
    this.registerDefaultPrompts();

    return {
      protocolVersion: "2024-11-05",
      capabilities: this.capabilities,
      serverInfo: {
        name: "IPA-MCP-Server",
        version: "1.0.0"
      }
    };
  }

  /**
   * Handle incoming MCP messages
   */
  async handleMessage(message: MCPMessage): Promise<MCPMessage | null> {
    if (!this.initialized && message.method !== "initialize") {
      return this.createErrorResponse(message.id, -32002, "Server not initialized");
    }

    try {
      switch (message.method) {
        case "initialize":
          const result = await this.initialize(message.params);
          return this.createResponse(message.id, result);

        case "tools/list":
          return this.createResponse(message.id, {
            tools: Array.from(this.tools.values())
          });

        case "tools/call":
          const toolResult = await this.callTool(message.params?.name, message.params?.arguments);
          return this.createResponse(message.id, toolResult);

        case "resources/list":
          return this.createResponse(message.id, {
            resources: Array.from(this.resources.values())
          });

        case "resources/read":
          const resourceResult = await this.readResource(message.params?.uri);
          return this.createResponse(message.id, resourceResult);

        case "prompts/list":
          return this.createResponse(message.id, {
            prompts: Array.from(this.prompts.values())
          });

        case "prompts/get":
          const promptResult = await this.getPrompt(message.params?.name, message.params?.arguments);
          return this.createResponse(message.id, promptResult);

        default:
          return this.createErrorResponse(message.id, -32601, `Method not found: ${message.method}`);
      }
    } catch (error) {
      console.error("Error handling MCP message:", error);
      return this.createErrorResponse(
        message.id, 
        -32603, 
        `Internal error: ${error instanceof Error ? error.message : "Unknown error"}`
      );
    }
  }

  /**
   * Register a tool
   */
  registerTool(tool: MCPTool, handler: (args: any) => Promise<any>): void {
    this.tools.set(tool.name, tool);
    this.on(`tool:${tool.name}`, handler);
  }

  /**
   * Register a resource
   */
  registerResource(resource: MCPResource, handler: (uri: string) => Promise<any>): void {
    this.resources.set(resource.uri, resource);
    this.on(`resource:${resource.uri}`, handler);
  }

  /**
   * Register a prompt
   */
  registerPrompt(prompt: MCPPrompt, handler: (args: any) => Promise<any>): void {
    this.prompts.set(prompt.name, prompt);
    this.on(`prompt:${prompt.name}`, handler);
  }

  /**
   * Call a tool
   */
  private async callTool(toolName: string, args: any): Promise<any> {
    if (!this.tools.has(toolName)) {
      throw new Error(`Tool not found: ${toolName}`);
    }

    return new Promise((resolve, reject) => {
      this.emit(`tool:${toolName}`, args, (error: any, result: any) => {
        if (error) reject(error);
        else resolve({ content: [{ type: "text", text: result }] });
      });
    });
  }

  /**
   * Read a resource
   */
  private async readResource(uri: string): Promise<any> {
    if (!this.resources.has(uri)) {
      throw new Error(`Resource not found: ${uri}`);
    }

    return new Promise((resolve, reject) => {
      this.emit(`resource:${uri}`, uri, (error: any, result: any) => {
        if (error) reject(error);
        else resolve({ contents: [{ uri, mimeType: "text/plain", text: result }] });
      });
    });
  }

  /**
   * Get a prompt
   */
  private async getPrompt(promptName: string, args: any): Promise<any> {
    if (!this.prompts.has(promptName)) {
      throw new Error(`Prompt not found: ${promptName}`);
    }

    return new Promise((resolve, reject) => {
      this.emit(`prompt:${promptName}`, args, (error: any, result: any) => {
        if (error) reject(error);
        else resolve({ 
          description: `Generated prompt: ${promptName}`,
          messages: [{ role: "user", content: { type: "text", text: result } }]
        });
      });
    });
  }

  /**
   * Register default tools
   */
  private registerDefaultTools(): void {
    // Platform search tool
    this.registerTool({
      name: "search_platforms",
      description: "Search through platform data using natural language queries",
      inputSchema: {
        type: "object",
        properties: {
          query: { type: "string", description: "Search query" },
          platform: { type: "string", description: "Filter by platform name" },
          category: { type: "string", description: "Filter by category" }
        },
        required: ["query"]
      }
    }, async (args) => {
      try {
        const { RAGOrchestrator } = await import("../rag/ragOrchestrator");
        const ragOrchestrator = new RAGOrchestrator();
        const result = await ragOrchestrator.query({
          query: args.query,
          filters: {
            platform: args.platform,
            category: args.category
          }
        });
        
        return JSON.stringify(result, null, 2);
      } catch (error) {
        throw new Error(`Platform search failed: ${error instanceof Error ? error.message : "Unknown error"}`);
      }
    });

    // Database query tool
    this.registerTool({
      name: "query_database",
      description: "Execute database queries to retrieve platform information",
      inputSchema: {
        type: "object",
        properties: {
          table: { type: "string", description: "Table name (platforms, platform_features, etc.)" },
          limit: { type: "number", description: "Number of results to return" }
        },
        required: ["table"]
      }
    }, async (args) => {
      try {
        const { storage } = await import("../../storage");
        
        switch (args.table) {
          case "platforms":
            const platforms = await storage.getAllPlatforms();
            return JSON.stringify(platforms.slice(0, args.limit || 10), null, 2);
          default:
            throw new Error(`Unsupported table: ${args.table}`);
        }
      } catch (error) {
        throw new Error(`Database query failed: ${error instanceof Error ? error.message : "Unknown error"}`);
      }
    });

    // Agent orchestration tool
    this.registerTool({
      name: "orchestrate_agents",
      description: "Coordinate multiple AI agents for complex tasks",
      inputSchema: {
        type: "object",
        properties: {
          agents: { type: "array", items: { type: "string" }, description: "List of agent names" },
          task: { type: "string", description: "Task description" },
          parallel: { type: "boolean", description: "Execute agents in parallel" }
        },
        required: ["agents", "task"]
      }
    }, async (args) => {
      // This would integrate with A2A communication system
      return `Orchestrating agents: ${args.agents.join(", ")} for task: ${args.task}`;
    });
  }

  /**
   * Register default resources
   */
  private registerDefaultResources(): void {
    // Platform configuration
    this.registerResource({
      uri: "config://platforms",
      name: "Platform Configuration",
      description: "Current platform configuration settings"
    }, async (uri) => {
      const { storage } = await import("../../storage");
      const platforms = await storage.getAllPlatforms();
      return JSON.stringify(platforms, null, 2);
    });

    // Knowledge base
    this.registerResource({
      uri: "kb://all",
      name: "Knowledge Base",
      description: "Complete knowledge base entries"
    }, async (uri) => {
      const { storage } = await import("../../storage");
      const kb = await storage.getAllKnowledgeBase();
      return JSON.stringify(kb, null, 2);
    });

    // System stats
    this.registerResource({
      uri: "stats://system",
      name: "System Statistics",
      description: "Current system performance and usage statistics"
    }, async (uri) => {
      const stats = {
        uptime: process.uptime(),
        memory: process.memoryUsage(),
        timestamp: new Date().toISOString()
      };
      return JSON.stringify(stats, null, 2);
    });
  }

  /**
   * Register default prompts
   */
  private registerDefaultPrompts(): void {
    // Platform comparison prompt
    this.registerPrompt({
      name: "compare_platforms",
      description: "Generate a comparison between platforms",
      arguments: [
        { name: "platform1", description: "First platform to compare", required: true },
        { name: "platform2", description: "Second platform to compare", required: true },
        { name: "criteria", description: "Comparison criteria", required: false }
      ]
    }, async (args) => {
      return `Compare ${args.platform1} and ${args.platform2} focusing on: ${args.criteria || "features, pricing, and usability"}. 
      
Provide a detailed analysis covering:
1. Key feature differences
2. Pricing model comparison
3. Target audience
4. Strengths and weaknesses
5. Recommended use cases

Use the platform data available in the knowledge base to provide accurate, fact-based comparisons.`;
    });

    // Technical analysis prompt
    this.registerPrompt({
      name: "technical_analysis",
      description: "Generate technical analysis for a platform",
      arguments: [
        { name: "platform", description: "Platform to analyze", required: true },
        { name: "focus", description: "Technical focus area", required: false }
      ]
    }, async (args) => {
      return `Perform a comprehensive technical analysis of ${args.platform} ${args.focus ? `focusing on ${args.focus}` : ""}.

Include:
1. Architecture and technical stack
2. Performance characteristics
3. Scalability considerations
4. Integration capabilities
5. Security features
6. Development workflow
7. Deployment options

Base your analysis on the available platform data and provide specific technical details.`;
    });
  }

  /**
   * Create response message
   */
  private createResponse(id: string | number | undefined, result: any): MCPMessage {
    return {
      jsonrpc: "2.0",
      id,
      result
    };
  }

  /**
   * Create error response message
   */
  private createErrorResponse(id: string | number | undefined, code: number, message: string): MCPMessage {
    return {
      jsonrpc: "2.0",
      id,
      error: { code, message }
    };
  }
}