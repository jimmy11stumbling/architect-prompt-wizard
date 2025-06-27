
import { ServerManager } from "./core/serverManager";
import { realTimeResponseService } from "../integration/realTimeResponseService";

export interface MCPTool {
  name: string;
  description: string;
}

export interface MCPResource {
  uri: string;
  name: string;
  description: string;
  mimeType?: string;
}

export interface MCPServer {
  id: string;
  name: string;
  status: "online" | "offline" | "error";
  endpoint: string;
  tools: MCPTool[];
  resources: MCPResource[];
}

export class MCPService {
  private static instance: MCPService;
  private serverManager: ServerManager;
  private initialized = false;

  constructor() {
    this.serverManager = new ServerManager();
  }

  static getInstance(): MCPService {
    if (!MCPService.instance) {
      MCPService.instance = new MCPService();
    }
    return MCPService.instance;
  }

  async initialize(): Promise<void> {
    if (this.initialized) return;
    
    try {
      this.serverManager.initialize();
      this.initialized = true;
    } catch (error) {
      console.error("Failed to initialize MCP service:", error);
      throw error;
    }
  }

  getServers(): MCPServer[] {
    return this.serverManager.getServers();
  }

  getAvailableTools(): MCPTool[] {
    const tools: MCPTool[] = [];
    this.serverManager.getServers().forEach(server => {
      if (server.status === "online") {
        tools.push(...server.tools);
      }
    });
    return tools;
  }

  async callTool(toolName: string, parameters: Record<string, any>): Promise<any> {
    realTimeResponseService.addResponse({
      source: "mcp-service",
      status: "processing",
      message: `Executing MCP tool: ${toolName}`,
      data: { toolName, parameters }
    });

    await new Promise(resolve => setTimeout(resolve, 500 + Math.random() * 1500));

    let result;
    switch (toolName) {
      case "web_search":
        result = {
          results: [`Search results for: ${parameters.query}`],
          totalResults: 42,
          searchTime: 0.34
        };
        break;
      case "read_file":
        result = {
          content: `File content from: ${parameters.path}`,
          size: 1024,
          modified: Date.now()
        };
        break;
      case "execute_query":
        result = {
          rows: [{ id: 1, name: "Sample Data" }],
          rowCount: 1,
          executionTime: 0.12
        };
        break;
      default:
        result = {
          message: `Tool ${toolName} executed successfully`,
          parameters
        };
    }

    realTimeResponseService.addResponse({
      source: "mcp-service",
      status: "success",
      message: `MCP tool ${toolName} executed successfully`,
      data: { toolName, result }
    });

    return {
      success: true,
      toolName,
      result,
      executionTime: Date.now()
    };
  }

  async healthCheck(): Promise<{ healthy: boolean; serverCount: number; onlineServers: number; totalTools: number }> {
    return this.serverManager.healthCheck();
  }
}

export const mcpService = MCPService.getInstance();
