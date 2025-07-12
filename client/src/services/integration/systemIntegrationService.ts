
import { ragService } from "../rag/ragService";
import { a2aService } from "../a2a/a2aService";
import { mcpService } from "../mcp/mcpService";
import { DeepSeekService } from "../deepseek";
import { realTimeResponseService } from "./realTimeResponseService";
import { 
  IntegratedQueryRequest, 
  IntegratedQueryResponse, 
  SystemHealthStatus
} from "./types";
import { ServiceExecutor } from "./core/serviceExecutor";
import { IntegrationResponseGenerator } from "./core/responseGenerator";

export type { IntegratedQueryRequest, IntegratedQueryResponse, SystemHealthStatus };

export class SystemIntegrationService {
  private initialized = false;
  
  get isInitialized(): boolean {
    return this.initialized;
  }

  async initialize(): Promise<void> {
    if (this.initialized) {
      console.log("🔄 [system-integration] System already initialized");
      return;
    }

    console.log("🔄 [system-integration] Initializing integrated AI system...");

    try {
      await Promise.all([
        ragService.initialize(),
        a2aService.initialize(),
        mcpService.initialize(),
        DeepSeekService.checkHealth()
      ]);

      this.initialized = true;
      console.log("✅ [system-integration] System initialization completed successfully");

    } catch (error) {
      console.error("🔄 [system-integration] System initialization failed:", { error });
      throw error;
    }
  }

  async executeIntegratedQuery(request: IntegratedQueryRequest): Promise<IntegratedQueryResponse> {
    const startTime = Date.now();
    const servicesUsed: string[] = [];
    let totalSteps = 0;
    let successfulSteps = 0;

    realTimeResponseService.addResponse({
      source: "system-integration",
      status: "processing",
      message: `Starting integrated query execution: "${request.query}"`,
      data: { 
        query: request.query,
        enabledServices: {
          rag: request.enableRAG !== false,
          a2a: request.enableA2A !== false, 
          mcp: request.enableMCP !== false,
          deepseek: request.enableDeepSeek !== false
        }
      }
    });

    const results: any = {};

    // Execute services
    if (request.enableRAG !== false) {
      const ragResult = await ServiceExecutor.executeRAG(request.query);
      if (ragResult.success) {
        results.ragResults = ragResult.data;
        servicesUsed.push("RAG");
        successfulSteps++;
      }
      totalSteps++;
    }

    if (request.enableA2A !== false) {
      const a2aResult = await ServiceExecutor.executeA2A(request.query);
      if (a2aResult.success) {
        results.a2aCoordination = a2aResult.data;
        servicesUsed.push("A2A");
        successfulSteps++;
      }
      totalSteps++;
    }

    if (request.enableMCP !== false) {
      const mcpResult = await ServiceExecutor.executeMCP(request.query, request.context);
      if (mcpResult.success) {
        results.mcpResults = mcpResult.data;
        servicesUsed.push("MCP");
        successfulSteps++;
      }
      totalSteps++;
    }

    if (request.enableDeepSeek !== false) {
      const reasoningResult = await ServiceExecutor.executeDeepSeek(request.query, results);
      if (reasoningResult.success) {
        results.reasoning = reasoningResult.data;
        servicesUsed.push("DeepSeek");
        successfulSteps++;
      }
      totalSteps++;
    }

    const finalResponse = IntegrationResponseGenerator.synthesizeFinalResponse(request.query, results);
    const processingTime = Date.now() - startTime;

    const integratedResponse: IntegratedQueryResponse = {
      query: request.query,
      ragResults: results.ragResults,
      a2aCoordination: results.a2aCoordination,
      mcpResults: results.mcpResults,
      reasoning: results.reasoning,
      finalResponse,
      processingTime,
      integrationSummary: {
        servicesUsed,
        totalSteps,
        successRate: totalSteps > 0 ? successfulSteps / totalSteps : 0
      }
    };

    realTimeResponseService.addResponse({
      source: "system-integration",
      status: "success",
      message: `Integrated query execution completed successfully`,
      data: {
        processingTime,
        servicesUsed: servicesUsed.length,
        successRate: integratedResponse.integrationSummary.successRate,
        finalResponseLength: finalResponse.length
      }
    });

    return integratedResponse;
  }

  async getSystemHealth(): Promise<SystemHealthStatus> {
    realTimeResponseService.addResponse({
      source: "system-integration",
      status: "processing",
      message: "Checking system health across all services",
      data: {}
    });

    const healthChecks = await Promise.all([
      ragService.healthCheck().catch(error => ({ healthy: false, error: error.message, service: "rag" })),
      a2aService.healthCheck().catch(error => ({ healthy: false, error: error.message, service: "a2a" })),
      mcpService.healthCheck().catch(error => ({ healthy: false, error: error.message, service: "mcp" })),
      deepseekReasonerService.healthCheck().catch(error => ({ healthy: false, error: error.message, service: "deepseek" }))
    ]);

    const [ragHealth, a2aHealth, mcpHealth, deepseekHealth] = healthChecks;

    const overallHealth = ragHealth.healthy && a2aHealth.healthy && mcpHealth.healthy && deepseekHealth.healthy;

    const systemStatus: SystemHealthStatus = {
      overallHealth,
      serviceHealth: {
        rag: ragHealth.healthy,
        a2a: a2aHealth.healthy,
        mcp: mcpHealth.healthy,
        deepseek: deepseekHealth.healthy
      },
      details: {
        ragDocuments: (ragHealth.healthy && 'documentCount' in ragHealth) ? ragHealth.documentCount : 0,
        a2aAgents: (a2aHealth.healthy && 'totalAgents' in a2aHealth) ? a2aHealth.totalAgents : 0,
        mcpServers: mcpService.getServers().length,
        lastHealthCheck: Date.now()
      }
    };

    realTimeResponseService.addResponse({
      source: "system-integration",
      status: overallHealth ? "success" : "error",
      message: `System health check completed - Status: ${overallHealth ? "healthy" : "issues detected"}`,
      data: systemStatus
    });

    return systemStatus;
  }
}

export const systemIntegrationService = new SystemIntegrationService();
