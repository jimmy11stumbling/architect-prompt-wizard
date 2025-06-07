
import { MCPServer, MCPTool, MCPResource } from "@/types/ipa-types";
import { realTimeResponseService } from "../integration/realTimeResponseService";
import { MCPServerManager } from "./core/mcpServerManager";
import { MCPToolManager } from "./core/mcpToolManager";
import { MCPResourceManager } from "./core/mcpResourceManager";

export type { MCPServer, MCPTool, MCPResource };

export class MCPService {
  private initialized = false;
  private serverManager = new MCPServerManager();
  private toolManager = new MCPToolManager();
  private resourceManager = new MCPResourceManager();

  async initialize(): Promise<void> {
    if (this.initialized) return;

    realTimeResponseService.addResponse({
      source: "mcp-service",
      status: "processing",
      message: "Initializing MCP hub service"
    });

    await new Promise(resolve => setTimeout(resolve, 500));

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

  getServers(): MCPServer[] {
    return this.serverManager.getServers();
  }

  async listTools(): Promise<MCPTool[]> {
    if (!this.initialized) {
      await this.initialize();
    }
    return this.toolManager.listTools();
  }

  getAvailableTools(): MCPTool[] {
    return this.toolManager.getAvailableTools();
  }

  async listResources(): Promise<MCPResource[]> {
    if (!this.initialized) {
      await this.initialize();
    }
    return this.resourceManager.listResources();
  }

  async callTool(toolName: string, parameters: Record<string, any>): Promise<{ status: string; result?: any; error?: string }> {
    return this.toolManager.callTool(toolName, parameters);
  }

  async readResource(uri: string): Promise<any> {
    return this.resourceManager.readResource(uri);
  }

  async healthCheck(): Promise<boolean> {
    return this.initialized && this.serverManager.healthCheck();
  }
}

export const mcpService = new MCPService();
