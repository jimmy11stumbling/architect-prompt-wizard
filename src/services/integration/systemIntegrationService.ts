
import { ProjectSpec, SystemHealth } from "@/types/ipa-types";
import { ragService } from "../rag/ragService";
import { a2aService } from "../a2a/a2aService";
import { mcpService } from "../mcp/mcpService";
import { realTimeResponseService } from "./realTimeResponseService";

export class SystemIntegrationService {
  private initialized = false;
  private currentSpec: ProjectSpec | null = null;

  async initialize(spec: ProjectSpec): Promise<void> {
    if (this.initialized) {
      return;
    }

    this.currentSpec = spec;

    realTimeResponseService.addResponse({
      source: "system-integration",
      status: "processing",
      message: "Starting system integration initialization",
      data: { 
        projectDescription: spec.projectDescription.substring(0, 100) + "...",
        services: ["RAG", "A2A", "MCP"]
      }
    });

    try {
      // Initialize all services
      await Promise.all([
        this.initializeRAG(spec),
        this.initializeA2A(spec),
        this.initializeMCP(spec)
      ]);

      this.initialized = true;

      realTimeResponseService.addResponse({
        source: "system-integration",
        status: "success",
        message: "System integration completed successfully",
        data: { 
          servicesInitialized: ["RAG", "A2A", "MCP"],
          timestamp: new Date().toISOString()
        }
      });

    } catch (error) {
      realTimeResponseService.addResponse({
        source: "system-integration",
        status: "error",
        message: `System integration failed: ${error instanceof Error ? error.message : "Unknown error"}`,
        data: { error: error instanceof Error ? error.message : String(error) }
      });
      throw error;
    }
  }

  private async initializeRAG(spec: ProjectSpec): Promise<void> {
    realTimeResponseService.addResponse({
      source: "rag-service",
      status: "processing",
      message: "Service RAG status: initializing",
      data: { service: "rag", status: "initializing", timestamp: Date.now() }
    });

    await ragService.initialize();

    realTimeResponseService.addResponse({
      source: "rag-service",
      status: "success",
      message: "Service RAG status: connected",
      data: { service: "rag", status: "connected", timestamp: Date.now() }
    });
  }

  private async initializeA2A(spec: ProjectSpec): Promise<void> {
    realTimeResponseService.addResponse({
      source: "a2a-service",
      status: "processing",
      message: "Service A2A status: initializing",
      data: { service: "a2a", status: "initializing", timestamp: Date.now() }
    });

    await a2aService.initialize();

    realTimeResponseService.addResponse({
      source: "a2a-service",
      status: "success",
      message: "Service A2A status: connected",
      data: { service: "a2a", status: "connected", timestamp: Date.now() }
    });
  }

  private async initializeMCP(spec: ProjectSpec): Promise<void> {
    realTimeResponseService.addResponse({
      source: "mcp-service",
      status: "processing",
      message: "Service MCP status: initializing",
      data: { service: "mcp", status: "initializing", timestamp: Date.now() }
    });

    await mcpService.initialize();

    realTimeResponseService.addResponse({
      source: "mcp-service",
      status: "success",
      message: "Service MCP status: connected",
      data: { service: "mcp", status: "connected", timestamp: Date.now() }
    });
  }

  async getSystemHealth(): Promise<SystemHealth> {
    const ragHealth = await ragService.healthCheck();
    const a2aHealth = await a2aService.healthCheck();
    const mcpHealth = await mcpService.healthCheck();

    const overallHealth = ragHealth && a2aHealth && mcpHealth;

    return {
      overall: overallHealth,
      services: {
        rag: ragHealth,
        a2a: a2aHealth,
        mcp: mcpHealth,
        deepseek: true // Assume healthy if no errors
      },
      details: {
        rag: ragHealth ? "Connected" : "Disconnected",
        a2a: a2aHealth ? "Connected" : "Disconnected", 
        mcp: mcpHealth ? "Connected" : "Disconnected"
      },
      lastCheck: Date.now(),
      overallStatus: overallHealth ? "healthy" : "degraded"
    };
  }

  isInitialized(): boolean {
    return this.initialized;
  }

  getCurrentSpec(): ProjectSpec | null {
    return this.currentSpec;
  }
}

export const systemIntegrationService = new SystemIntegrationService();
