
import { ProjectSpec } from "@/types/ipa-types";
import { realTimeResponseService } from "./realTimeResponseService";
import { ragService } from "../rag/ragService";
import { a2aService } from "../a2a/a2aService";
import { mcpService } from "../mcp/mcpService";
import { deepseekReasonerService } from "../deepseek/deepseekReasonerService";

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
  private static instance: SystemIntegrationService;
  private isInitialized = false;

  static getInstance(): SystemIntegrationService {
    if (!SystemIntegrationService.instance) {
      SystemIntegrationService.instance = new SystemIntegrationService();
    }
    return SystemIntegrationService.instance;
  }

  async initialize(spec: ProjectSpec): Promise<void> {
    if (this.isInitialized) return;

    realTimeResponseService.addResponse({
      source: "system-integration",
      status: "processing",
      message: "Initializing integrated AI system",
      data: { 
        projectDescription: spec.projectDescription.substring(0, 100),
        ragEnabled: spec.ragVectorDb !== "None",
        a2aEnabled: !!spec.a2aIntegrationDetails,
        mcpEnabled: spec.mcpType !== "None"
      }
    });

    try {
      // Initialize all services in parallel for better performance
      await Promise.all([
        ragService.initialize(),
        a2aService.initialize(),
        mcpService.initialize(),
        deepseekReasonerService.initialize()
      ]);

      this.isInitialized = true;

      realTimeResponseService.addResponse({
        source: "system-integration",
        status: "success",
        message: "All system services initialized successfully",
        data: {
          projectDescription: spec.projectDescription,
          ragEnabled: ragService.isInitialized(),
          a2aEnabled: a2aService.isInitialized(),
          mcpEnabled: mcpService.isInitialized(),
          deepseekEnabled: true
        }
      });

    } catch (error) {
      realTimeResponseService.addResponse({
        source: "system-integration",
        status: "error",
        message: `System initialization failed: ${error instanceof Error ? error.message : "Unknown error"}`,
        data: { error: error instanceof Error ? error.message : String(error) }
      });
      throw error;
    }
  }

  async getSystemHealth(): Promise<SystemHealth> {
    realTimeResponseService.addResponse({
      source: "system-integration",
      status: "processing",
      message: "Checking system health across all services"
    });

    const healthChecks = await Promise.allSettled([
      ragService.healthCheck(),
      a2aService.healthCheck(),
      mcpService.healthCheck(),
      deepseekReasonerService.healthCheck()
    ]);

    const services = {
      rag: healthChecks[0].status === "fulfilled" && healthChecks[0].value,
      a2a: healthChecks[1].status === "fulfilled" && healthChecks[1].value,
      mcp: healthChecks[2].status === "fulfilled" && healthChecks[2].value,
      deepseek: healthChecks[3].status === "fulfilled" && healthChecks[3].value
    };

    const overall = Object.values(services).every(status => status === true);
    const overallStatus = overall ? "healthy" : 
                         Object.values(services).some(status => status === true) ? "degraded" : "unhealthy";

    const health: SystemHealth = {
      overall,
      services,
      details: {
        ragDocuments: ragService.getDocumentCount(),
        a2aAgents: a2aService.getAllAgents().length,
        mcpServers: mcpService.getServers().length,
        lastHealthCheck: Date.now()
      },
      lastCheck: Date.now(),
      overallStatus
    };

    realTimeResponseService.addResponse({
      source: "system-integration",
      status: overall ? "success" : "error",
      message: `System health check completed - Status: ${overallStatus}`,
      data: {
        overallHealth: overall,
        serviceHealth: services,
        details: health.details
      }
    });

    return health;
  }

  async executeIntegratedQuery(query: string): Promise<any> {
    realTimeResponseService.addResponse({
      source: "system-integration",
      status: "processing",
      message: "Executing integrated query across all systems",
      data: { query: query.substring(0, 100) }
    });

    try {
      // Step 1: Query RAG for context
      const ragResults = await ragService.query({
        query,
        limit: 5,
        threshold: 0.3
      });

      // Step 2: Coordinate with A2A agents
      const a2aCoordination = await a2aService.delegateTask(
        `Integrated query: ${query}`,
        ["query-processing", "context-analysis"]
      );

      // Step 3: Use MCP tools if needed
      const mcpTools = await mcpService.listTools();
      let mcpResults = [];
      
      if (query.toLowerCase().includes("search")) {
        const searchResult = await mcpService.callTool("search_web", { query });
        mcpResults.push({ tool: "search_web", result: searchResult });
      }

      // Step 4: Process with DeepSeek Reasoner
      const contextData = `
RAG Results: ${ragResults.documents.map(doc => doc.title).join(", ")}
A2A Coordination: ${a2aCoordination.assignedAgent?.name || "No agent assigned"}
MCP Tools Used: ${mcpResults.map(r => r.tool).join(", ")}
      `;

      const reasoningResult = await deepseekReasonerService.processQuery({
        prompt: query,
        context: contextData,
        maxTokens: 4096,
        ragEnabled: false, // Already done
        a2aEnabled: false, // Already done
        mcpEnabled: false  // Already done
      });

      const result = {
        query,
        ragResults,
        a2aCoordination,
        mcpResults,
        reasoning: reasoningResult,
        success: true
      };

      realTimeResponseService.addResponse({
        source: "system-integration",
        status: "success",
        message: "Integrated query completed successfully",
        data: {
          ragDocuments: ragResults.documents.length,
          a2aAgent: a2aCoordination.assignedAgent?.name,
          mcpTools: mcpResults.length,
          reasoningTokens: reasoningResult.usage.totalTokens
        }
      });

      return result;

    } catch (error) {
      realTimeResponseService.addResponse({
        source: "system-integration",
        status: "error",
        message: `Integrated query failed: ${error instanceof Error ? error.message : "Unknown error"}`,
        data: { error: error instanceof Error ? error.message : String(error) }
      });
      throw error;
    }
  }

  async demonstrateIntegration(): Promise<any> {
    realTimeResponseService.addResponse({
      source: "system-integration",
      status: "processing",
      message: "Running system integration demonstration"
    });

    try {
      // Test RAG
      const ragDemo = await ragService.query({
        query: "integration test",
        limit: 3,
        threshold: 0.1
      });

      // Test A2A
      const a2aDemo = await a2aService.sendMessage({
        from: "demo-system",
        to: "test-agent",
        type: "notification",
        payload: { test: "integration demo" }
      });

      // Test MCP
      const mcpDemo = await mcpService.callTool("demo_tool", { test: true });

      const result = {
        ragDemo,
        a2aDemo,
        mcpDemo,
        timestamp: Date.now(),
        success: true
      };

      realTimeResponseService.addResponse({
        source: "system-integration",
        status: "success",
        message: "Integration demonstration completed successfully",
        data: result
      });

      return result;

    } catch (error) {
      realTimeResponseService.addResponse({
        source: "system-integration",
        status: "error",
        message: `Integration demonstration failed: ${error instanceof Error ? error.message : "Unknown error"}`,
        data: { error: error instanceof Error ? error.message : String(error) }
      });
      throw error;
    }
  }

  isSystemInitialized(): boolean {
    return this.isInitialized;
  }

  // Public method to check initialization status
  isInitialized(): boolean {
    return this.isInitialized;
  }
}

export const systemIntegrationService = SystemIntegrationService.getInstance();
