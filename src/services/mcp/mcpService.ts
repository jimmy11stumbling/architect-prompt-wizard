
import { realTimeResponseService } from "../integration/realTimeResponseService";
import { MCPServerManager } from "./core/mcpServerManager";
import { MCPToolManager } from "./core/mcpToolManager";
import { MCPResourceManager } from "./core/mcpResourceManager";

export type { MCPServer, MCPTool, MCPResource } from "@/types/ipa-types";

export class MCPService {
  private serverManager: MCPServerManager;
  private toolManager: MCPToolManager;
  private resourceManager: MCPResourceManager;
  private initialized = false;

  constructor() {
    this.serverManager = new MCPServerManager();
    this.toolManager = new MCPToolManager();
    this.resourceManager = new MCPResourceManager();
  }

  async initialize(): Promise<void> {
    if (this.initialized) return;

    realTimeResponseService.addResponse({
      source: "mcp-service",
      status: "processing",
      message: "Initializing MCP hub service"
    });

    // Initialize all components
    const servers = this.serverManager.initialize();
    const tools = this.toolManager.initialize();
    const resources = this.resourceManager.initialize();

    realTimeResponseService.addResponse({
      source: "mcp-service",
      status: "success",
      message: "MCP hub initialized successfully",
      data: {
        serverCount: servers.length,
        toolCount: tools.length,
        resourceCount: resources.length
      }
    });

    this.initialized = true;
  }

  isInitialized(): boolean {
    return this.initialized;
  }

  getServers() {
    return this.serverManager.getServers();
  }

  async listTools() {
    realTimeResponseService.addResponse({
      source: "mcp-service",
      status: "processing",
      message: "Listing available MCP tools"
    });

    const tools = await this.toolManager.listTools();
    
    realTimeResponseService.addResponse({
      source: "mcp-service",
      status: "success",
      message: `Retrieved ${tools.length} MCP tools`,
      data: { toolCount: tools.length, tools: tools.map(t => t.name) }
    });

    return tools;
  }

  async listResources() {
    realTimeResponseService.addResponse({
      source: "mcp-service",
      status: "processing",
      message: "Listing available MCP resources"
    });

    const resources = await this.resourceManager.listResources();
    
    realTimeResponseService.addResponse({
      source: "mcp-service",
      status: "success",
      message: `Retrieved ${resources.length} MCP resources`,
      data: { resourceCount: resources.length, resources: resources.map(r => r.name) }
    });

    return resources;
  }

  async callTool(toolName: string, parameters: any) {
    realTimeResponseService.addResponse({
      source: "mcp-service",
      status: "processing",
      message: `Calling MCP tool: ${toolName}`,
      data: { toolName, parameters }
    });

    try {
      const result = await this.toolManager.callTool(toolName, parameters);
      
      realTimeResponseService.addResponse({
        source: "mcp-service",
        status: "success",
        message: `MCP tool ${toolName} executed successfully`,
        data: { toolName, result: typeof result === 'string' ? result.substring(0, 200) : result }
      });

      return result;
    } catch (error) {
      realTimeResponseService.addResponse({
        source: "mcp-service",
        status: "error",
        message: `MCP tool ${toolName} failed: ${error instanceof Error ? error.message : "Unknown error"}`,
        data: { toolName, error: error instanceof Error ? error.message : String(error) }
      });
      throw error;
    }
  }

  async readResource(uri: string) {
    realTimeResponseService.addResponse({
      source: "mcp-service",
      status: "processing",
      message: `Reading MCP resource: ${uri}`,
      data: { uri }
    });

    try {
      const content = await this.resourceManager.readResource(uri);
      
      realTimeResponseService.addResponse({
        source: "mcp-service",
        status: "success",
        message: `MCP resource ${uri} read successfully`,
        data: { uri, contentLength: typeof content === 'string' ? content.length : JSON.stringify(content).length }
      });

      return content;
    } catch (error) {
      realTimeResponseService.addResponse({
        source: "mcp-service",
        status: "error",
        message: `Failed to read MCP resource ${uri}: ${error instanceof Error ? error.message : "Unknown error"}`,
        data: { uri, error: error instanceof Error ? error.message : String(error) }
      });
      throw error;
    }
  }

  async healthCheck(): Promise<boolean> {
    realTimeResponseService.addResponse({
      source: "mcp-service",
      status: "processing",
      message: "Performing MCP health check"
    });

    const isHealthy = await this.serverManager.healthCheck();
    
    realTimeResponseService.addResponse({
      source: "mcp-service",
      status: isHealthy ? "success" : "error",
      message: `MCP health check ${isHealthy ? "passed" : "failed"}`,
      data: { healthy: isHealthy }
    });

    return isHealthy;
  }
}

export const mcpService = new MCPService();
