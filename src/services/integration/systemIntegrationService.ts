
import { ProjectSpec } from "@/types/ipa-types";
import { ragService } from "../rag/ragService";
import { a2aService } from "../a2a/a2aService";
import { mcpService } from "../mcp/mcpService";
import { realTimeResponseService } from "./realTimeResponseService";

export interface SystemHealth {
  overall: boolean;
  services: {
    rag: boolean;
    a2a: boolean;
    mcp: boolean;
    deepseek: boolean;
  };
  details: any;
  lastCheck: number;
  overallStatus: "healthy" | "degraded" | "unhealthy";
}

export class SystemIntegrationService {
  private initialized = false;

  async initialize(spec: ProjectSpec): Promise<void> {
    if (this.initialized) return;

    realTimeResponseService.addResponse({
      source: "system-integration",
      status: "processing",
      message: "Initializing integrated AI system"
    });

    // Initialize all services
    await Promise.all([
      ragService.initialize(),
      a2aService.initialize(),
      mcpService.initialize()
    ]);

    realTimeResponseService.addResponse({
      source: "system-integration",
      status: "success",
      message: "All system services initialized successfully",
      data: { 
        projectDescription: spec.projectDescription,
        ragEnabled: true,
        a2aEnabled: true,
        mcpEnabled: true
      }
    });

    this.initialized = true;
  }

  isInitialized(): boolean {
    return this.initialized;
  }

  async getSystemHealth(): Promise<SystemHealth> {
    const services = {
      rag: await ragService.healthCheck(),
      a2a: await a2aService.healthCheck(),
      mcp: await mcpService.healthCheck(),
      deepseek: true // Assume DeepSeek API is available
    };

    const healthyCount = Object.values(services).filter(Boolean).length;
    const totalServices = Object.keys(services).length;

    let overallStatus: "healthy" | "degraded" | "unhealthy";
    if (healthyCount === totalServices) {
      overallStatus = "healthy";
    } else if (healthyCount >= totalServices / 2) {
      overallStatus = "degraded";
    } else {
      overallStatus = "unhealthy";
    }

    return {
      overall: healthyCount === totalServices,
      services,
      details: {
        healthyServices: healthyCount,
        totalServices,
        initializationStatus: this.initialized
      },
      lastCheck: Date.now(),
      overallStatus
    };
  }

  async demonstrateIntegration(): Promise<any> {
    realTimeResponseService.addResponse({
      source: "system-integration",
      status: "processing",
      message: "Running integration demonstration"
    });

    // Test RAG integration
    const ragDemo = await ragService.query({
      query: "RAG 2.0 architecture",
      limit: 2
    });

    // Test A2A integration
    const a2aDemo = await a2aService.sendMessage({
      id: `demo-${Date.now()}`,
      from: "integration-test",
      to: "agent-rag-coordinator",
      type: "request",
      payload: { test: "integration demo" },
      timestamp: Date.now()
    });

    // Test MCP integration
    const mcpDemo = await mcpService.callTool("process_data", {
      data: { test: "integration" },
      operation: "validate"
    });

    const demo = {
      ragDemo,
      a2aDemo,
      mcpDemo,
      timestamp: Date.now(),
      status: "completed"
    };

    realTimeResponseService.addResponse({
      source: "system-integration",
      status: "success",
      message: "Integration demonstration completed successfully",
      data: demo
    });

    return demo;
  }
}

export const systemIntegrationService = new SystemIntegrationService();
