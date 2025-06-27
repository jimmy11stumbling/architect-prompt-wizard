import { EventEmitter } from "events";
import { MCPMessage, MCPTool, MCPResource, MCPPrompt } from "./mcpServer";

export interface MCPClientConfig {
  serverName: string;
  transport: "stdio" | "sse";
  endpoint?: string;
}

export class MCPClient extends EventEmitter {
  private config: MCPClientConfig;
  private initialized = false;
  private messageId = 0;
  private pendingRequests = new Map<string | number, {
    resolve: (value: any) => void;
    reject: (error: any) => void;
  }>();

  constructor(config: MCPClientConfig) {
    super();
    this.config = config;
  }

  /**
   * Initialize connection to MCP server
   */
  async initialize(): Promise<void> {
    try {
      const initResult = await this.sendRequest("initialize", {
        protocolVersion: "2024-11-05",
        capabilities: {
          tools: {},
          resources: { subscribe: true },
          prompts: {}
        },
        clientInfo: {
          name: "IPA-MCP-Client",
          version: "1.0.0"
        }
      });

      this.initialized = true;
      console.log(`MCP Client initialized for ${this.config.serverName}:`, initResult);
    } catch (error) {
      console.error("Failed to initialize MCP client:", error);
      throw error;
    }
  }

  /**
   * List available tools
   */
  async listTools(): Promise<MCPTool[]> {
    if (!this.initialized) {
      await this.initialize();
    }

    const response = await this.sendRequest("tools/list");
    return response.tools || [];
  }

  /**
   * Call a tool
   */
  async callTool(name: string, arguments_: any = {}): Promise<any> {
    if (!this.initialized) {
      await this.initialize();
    }

    const response = await this.sendRequest("tools/call", {
      name,
      arguments: arguments_
    });

    return response;
  }

  /**
   * List available resources
   */
  async listResources(): Promise<MCPResource[]> {
    if (!this.initialized) {
      await this.initialize();
    }

    const response = await this.sendRequest("resources/list");
    return response.resources || [];
  }

  /**
   * Read a resource
   */
  async readResource(uri: string): Promise<any> {
    if (!this.initialized) {
      await this.initialize();
    }

    const response = await this.sendRequest("resources/read", { uri });
    return response;
  }

  /**
   * List available prompts
   */
  async listPrompts(): Promise<MCPPrompt[]> {
    if (!this.initialized) {
      await this.initialize();
    }

    const response = await this.sendRequest("prompts/list");
    return response.prompts || [];
  }

  /**
   * Get a prompt
   */
  async getPrompt(name: string, arguments_: any = {}): Promise<any> {
    if (!this.initialized) {
      await this.initialize();
    }

    const response = await this.sendRequest("prompts/get", {
      name,
      arguments: arguments_
    });

    return response;
  }

  /**
   * Send a request to the MCP server
   */
  private async sendRequest(method: string, params?: any): Promise<any> {
    return new Promise((resolve, reject) => {
      const id = ++this.messageId;
      
      this.pendingRequests.set(id, { resolve, reject });

      const message: MCPMessage = {
        jsonrpc: "2.0",
        id,
        method,
        params
      };

      // For now, simulate local server communication
      // In a real implementation, this would send over stdio/SSE
      this.simulateServerResponse(message, resolve, reject);
    });
  }

  /**
   * Simulate server response (for local development)
   * In production, this would be replaced with actual transport layer
   */
  private async simulateServerResponse(
    message: MCPMessage, 
    resolve: (value: any) => void, 
    reject: (error: any) => void
  ): Promise<void> {
    try {
      // Import and use local MCP server
      const { MCPServer } = await import("./mcpServer");
      const server = new MCPServer({
        tools: { listChanged: true },
        resources: { subscribe: true, listChanged: true },
        prompts: { listChanged: true }
      });

      const response = await server.handleMessage(message);
      
      if (response?.error) {
        reject(new Error(`MCP Error ${response.error.code}: ${response.error.message}`));
      } else {
        resolve(response?.result);
      }
    } catch (error) {
      reject(error);
    }
  }

  /**
   * Check if client is ready
   */
  isReady(): boolean {
    return this.initialized;
  }

  /**
   * Get client configuration
   */
  getConfig(): MCPClientConfig {
    return { ...this.config };
  }
}

/**
 * MCP Registry for managing multiple clients
 */
export class MCPRegistry {
  private clients = new Map<string, MCPClient>();

  /**
   * Register a new MCP client
   */
  registerClient(name: string, config: MCPClientConfig): MCPClient {
    const client = new MCPClient(config);
    this.clients.set(name, client);
    return client;
  }

  /**
   * Get a registered client
   */
  getClient(name: string): MCPClient | undefined {
    return this.clients.get(name);
  }

  /**
   * Initialize all registered clients
   */
  async initializeAll(): Promise<void> {
    const initPromises = Array.from(this.clients.values()).map(client => 
      client.initialize().catch(error => {
        console.error(`Failed to initialize MCP client:`, error);
        return null;
      })
    );

    await Promise.all(initPromises);
    console.log(`Initialized ${this.clients.size} MCP clients`);
  }

  /**
   * Get all available tools from all clients
   */
  async getAllTools(): Promise<Array<MCPTool & { clientName: string }>> {
    const allTools: Array<MCPTool & { clientName: string }> = [];

    const clientEntries = Array.from(this.clients.entries());
    for (const [clientName, client] of clientEntries) {
      try {
        const tools = await client.listTools();
        tools.forEach((tool: MCPTool) => {
          allTools.push({ ...tool, clientName });
        });
      } catch (error) {
        console.error(`Failed to get tools from client ${clientName}:`, error);
      }
    }

    return allTools;
  }

  /**
   * Get all available resources from all clients
   */
  async getAllResources(): Promise<Array<MCPResource & { clientName: string }>> {
    const allResources: Array<MCPResource & { clientName: string }> = [];

    const clientEntries = Array.from(this.clients.entries());
    for (const [clientName, client] of clientEntries) {
      try {
        const resources = await client.listResources();
        resources.forEach((resource: MCPResource) => {
          allResources.push({ ...resource, clientName });
        });
      } catch (error) {
        console.error(`Failed to get resources from client ${clientName}:`, error);
      }
    }

    return allResources;
  }

  /**
   * Call a tool from any client
   */
  async callTool(clientName: string, toolName: string, args: any): Promise<any> {
    const client = this.clients.get(clientName);
    if (!client) {
      throw new Error(`MCP client not found: ${clientName}`);
    }

    return await client.callTool(toolName, args);
  }

  /**
   * Read a resource from any client
   */
  async readResource(clientName: string, uri: string): Promise<any> {
    const client = this.clients.get(clientName);
    if (!client) {
      throw new Error(`MCP client not found: ${clientName}`);
    }

    return await client.readResource(uri);
  }

  /**
   * List all registered clients
   */
  listClients(): Array<{ name: string; config: MCPClientConfig; ready: boolean }> {
    return Array.from(this.clients.entries()).map(([name, client]) => ({
      name,
      config: client.getConfig(),
      ready: client.isReady()
    }));
  }
}

// Global MCP registry instance
export const mcpRegistry = new MCPRegistry();

// Initialize default MCP clients
export async function initializeDefaultClients() {
  // Filesystem MCP client
  mcpRegistry.registerClient("filesystem", {
    serverName: "filesystem-mcp",
    transport: "stdio",
    endpoint: "/mcp/filesystem"
  });

  // Web Search MCP client
  mcpRegistry.registerClient("websearch", {
    serverName: "websearch-mcp",
    transport: "stdio",
    endpoint: "/mcp/websearch"
  });

  // Database MCP client
  mcpRegistry.registerClient("database", {
    serverName: "database-mcp",
    transport: "stdio",
    endpoint: "/mcp/database"
  });

  // Code Analysis MCP client
  mcpRegistry.registerClient("codeanalysis", {
    serverName: "codeanalysis-mcp",
    transport: "stdio",
    endpoint: "/mcp/codeanalysis"
  });

  // Document Processing MCP client
  mcpRegistry.registerClient("docprocessing", {
    serverName: "docprocessing-mcp",
    transport: "stdio",
    endpoint: "/mcp/docprocessing"
  });
}