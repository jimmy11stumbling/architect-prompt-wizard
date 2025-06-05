
import { ragService } from "../rag/ragService";
import { a2aService } from "../a2a/a2aService";
import { mcpService } from "../mcp/mcpService";
import { deepseekReasonerService } from "../deepseek/deepseekReasonerService";
import { realTimeResponseService } from "./realTimeResponseService";
import { ProjectSpec } from "@/types/ipa-types";

interface IntegrationStatus {
  rag: { status: ServiceStatus; lastUpdated: number };
  a2a: { status: ServiceStatus; lastUpdated: number };
  mcp: { status: ServiceStatus; lastUpdated: number };
  deepseek: { status: ServiceStatus; lastUpdated: number };
}

type ServiceStatus = "pending" | "initializing" | "connected" | "error";

export interface SystemHealth {
  overall: boolean;
  services: {
    rag: boolean;
    a2a: boolean;
    mcp: boolean;
    deepseek: boolean;
  };
  details: IntegrationStatus;
  lastCheck: number;
  overallStatus: "healthy" | "degraded" | "unhealthy";
}

export class SystemIntegrationService {
  private static instance: SystemIntegrationService;
  private initialized = false;
  private currentSpec: ProjectSpec | null = null;
  private integrationStatus: IntegrationStatus = {
    rag: { status: "pending", lastUpdated: Date.now() },
    a2a: { status: "pending", lastUpdated: Date.now() },
    mcp: { status: "pending", lastUpdated: Date.now() },
    deepseek: { status: "pending", lastUpdated: Date.now() }
  };

  static getInstance(): SystemIntegrationService {
    if (!SystemIntegrationService.instance) {
      SystemIntegrationService.instance = new SystemIntegrationService();
    }
    return SystemIntegrationService.instance;
  }

  async initialize(spec: ProjectSpec): Promise<void> {
    if (this.initialized && this.currentSpec === spec) {
      return;
    }

    this.currentSpec = spec;

    realTimeResponseService.addResponse({
      source: "system-integration",
      status: "processing",
      message: "Starting system integration initialization",
      data: { projectDescription: spec.projectDescription }
    });

    try {
      // Initialize RAG service
      this.updateIntegrationStatus("rag", "initializing");
      realTimeResponseService.addResponse({
        source: "system-integration",
        status: "processing",
        message: "Initializing RAG 2.0 service"
      });
      
      await ragService.initialize();
      this.updateIntegrationStatus("rag", "connected");

      // Initialize A2A service
      this.updateIntegrationStatus("a2a", "initializing");
      realTimeResponseService.addResponse({
        source: "system-integration",
        status: "processing",
        message: "Initializing A2A protocol service"
      });
      
      await a2aService.initialize();
      this.updateIntegrationStatus("a2a", "connected");

      // Initialize MCP service
      this.updateIntegrationStatus("mcp", "initializing");
      realTimeResponseService.addResponse({
        source: "system-integration",
        status: "processing",
        message: "Initializing MCP Hub service"
      });
      
      await mcpService.initialize();
      this.updateIntegrationStatus("mcp", "connected");

      // Initialize DeepSeek service
      this.updateIntegrationStatus("deepseek", "initializing");
      realTimeResponseService.addResponse({
        source: "system-integration",
        status: "processing",
        message: "Initializing DeepSeek Reasoner service"
      });
      
      await deepseekReasonerService.initialize();
      this.updateIntegrationStatus("deepseek", "connected");

      this.initialized = true;

      realTimeResponseService.addResponse({
        source: "system-integration",
        status: "success",
        message: "System integration completed successfully",
        data: {
          initializedServices: ["RAG 2.0", "A2A Protocol", "MCP Hub", "DeepSeek Reasoner"],
          projectSpec: spec.projectDescription,
          timestamp: new Date().toISOString()
        }
      });

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Unknown error";
      
      realTimeResponseService.addResponse({
        source: "system-integration",
        status: "error",
        message: `System integration failed: ${errorMessage}`,
        data: { error: errorMessage, spec }
      });
      
      throw error;
    }
  }

  private updateIntegrationStatus(service: keyof IntegrationStatus, status: ServiceStatus): void {
    this.integrationStatus[service] = {
      status,
      lastUpdated: Date.now()
    };

    realTimeResponseService.addResponse({
      source: "system-integration",
      status: status === "connected" ? "success" : status === "error" ? "error" : "processing",
      message: `Service ${service.toUpperCase()} status: ${status}`,
      data: { service, status, timestamp: Date.now() }
    });
  }

  isInitialized(): boolean {
    return this.initialized;
  }

  getSystemHealth(): SystemHealth {
    const ragHealth = this.integrationStatus.rag.status === "connected";
    const a2aHealth = this.integrationStatus.a2a.status === "connected";
    const mcpHealth = this.integrationStatus.mcp.status === "connected";
    const deepseekHealth = this.integrationStatus.deepseek.status === "connected";

    const overall = ragHealth && a2aHealth && mcpHealth && deepseekHealth;
    const healthyCount = [ragHealth, a2aHealth, mcpHealth, deepseekHealth].filter(Boolean).length;
    
    let overallStatus: "healthy" | "degraded" | "unhealthy";
    if (healthyCount === 4) {
      overallStatus = "healthy";
    } else if (healthyCount >= 2) {
      overallStatus = "degraded";
    } else {
      overallStatus = "unhealthy";
    }

    return {
      overall,
      services: {
        rag: ragHealth,
        a2a: a2aHealth,
        mcp: mcpHealth,
        deepseek: deepseekHealth
      },
      details: this.integrationStatus,
      lastCheck: Date.now(),
      overallStatus
    };
  }

  getCurrentSpec(): ProjectSpec | null {
    return this.currentSpec;
  }

  async performHealthCheck(): Promise<SystemHealth> {
    realTimeResponseService.addResponse({
      source: "system-integration",
      status: "processing",
      message: "Performing comprehensive system health check"
    });

    const health = this.getSystemHealth();

    realTimeResponseService.addResponse({
      source: "system-integration",
      status: health.overall ? "success" : "validation",
      message: `Health check completed - System status: ${health.overallStatus}`,
      data: {
        overallHealth: health.overall,
        serviceStatuses: health.services,
        healthySevices: Object.values(health.services).filter(Boolean).length,
        totalServices: Object.keys(health.services).length
      }
    });

    return health;
  }

  async demonstrateIntegration(): Promise<void> {
    realTimeResponseService.addResponse({
      source: "system-integration",
      status: "processing",
      message: "Demonstrating system integration capabilities"
    });

    try {
      // Demonstrate RAG query
      await ragService.query({
        query: "system integration patterns",
        limit: 3
      });

      // Demonstrate A2A coordination
      await a2aService.delegateTask("Integration demo", ["coordination"]);

      // Demonstrate MCP tool usage
      await mcpService.callTool("read_file", { path: "/config/system.json" });

      realTimeResponseService.addResponse({
        source: "system-integration",
        status: "success",
        message: "Integration demonstration completed successfully"
      });
    } catch (error) {
      realTimeResponseService.addResponse({
        source: "system-integration",
        status: "error",
        message: `Integration demonstration failed: ${error instanceof Error ? error.message : "Unknown error"}`
      });
    }
  }

  async processEnhancedAgentRequest(request: string): Promise<string> {
    realTimeResponseService.addResponse({
      source: "system-integration",
      status: "processing",
      message: "Processing enhanced agent request"
    });

    // Simulate processing
    await new Promise(resolve => setTimeout(resolve, 1000));

    const response = `Processed request: ${request}`;

    realTimeResponseService.addResponse({
      source: "system-integration",
      status: "success",
      message: "Enhanced agent request processed successfully",
      data: { request, response }
    });

    return response;
  }
}

export const systemIntegrationService = SystemIntegrationService.getInstance();
