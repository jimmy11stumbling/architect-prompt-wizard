import { ragService } from "../rag/ragService";
import { a2aService } from "../a2a/a2aService";
import { mcpService } from "../mcp/mcpService";
import { deepseekReasonerService } from "../deepseek/deepseekReasonerService";
import { realTimeResponseService } from "./realTimeResponseService";
import { 
  IntegratedQueryRequest, 
  IntegratedQueryResponse, 
  SystemHealthStatus,
  SystemInitializationConfig 
} from "./types";

// Export the types for external use
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
      // Initialize all services
      await Promise.all([
        ragService.initialize(),
        a2aService.initialize(),
        mcpService.initialize(),
        deepseekReasonerService.initialize()
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

    // Execute RAG query
    if (request.enableRAG !== false) {
      const ragResult = await this.executeRAGQuery(request.query);
      if (ragResult.success) {
        results.ragResults = ragResult.data;
        servicesUsed.push("RAG");
        successfulSteps++;
      }
      totalSteps++;
    }

    // Execute A2A coordination
    if (request.enableA2A !== false) {
      const a2aResult = await this.executeA2ACoordination(request.query);
      if (a2aResult.success) {
        results.a2aCoordination = a2aResult.data;
        servicesUsed.push("A2A");
        successfulSteps++;
      }
      totalSteps++;
    }

    // Execute MCP tools
    if (request.enableMCP !== false) {
      const mcpResult = await this.executeMCPTools(request.query, request.context);
      if (mcpResult.success) {
        results.mcpResults = mcpResult.data;
        servicesUsed.push("MCP");
        successfulSteps++;
      }
      totalSteps++;
    }

    // Execute DeepSeek reasoning
    if (request.enableDeepSeek !== false) {
      const reasoningResult = await this.executeDeepSeekReasoning(request.query, results);
      if (reasoningResult.success) {
        results.reasoning = reasoningResult.data;
        servicesUsed.push("DeepSeek");
        successfulSteps++;
      }
      totalSteps++;
    }

    const finalResponse = this.synthesizeFinalResponse(request.query, results);
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

  private async executeRAGQuery(query: string): Promise<{ success: boolean; data?: any }> {
    try {
      realTimeResponseService.addResponse({
        source: "system-integration",
        status: "processing",
        message: "Executing RAG database query...",
        data: { step: "rag", query }
      });

      const results = await ragService.query({
        query,
        limit: 5,
        threshold: 0.3
      });
      
      realTimeResponseService.addResponse({
        source: "system-integration", 
        status: "success",
        message: `RAG query completed: ${results.results.length} results`,
        data: { step: "rag", resultsCount: results.results.length }
      });

      return { success: true, data: results };
    } catch (error) {
      realTimeResponseService.addResponse({
        source: "system-integration",
        status: "error", 
        message: `RAG query failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
        data: { step: "rag", error }
      });
      return { success: false };
    }
  }

  private async executeA2ACoordination(query: string): Promise<{ success: boolean; data?: any }> {
    try {
      realTimeResponseService.addResponse({
        source: "system-integration",
        status: "processing",
        message: "Coordinating with specialized agents...",
        data: { step: "a2a", task: query }
      });

      const results = await a2aService.delegateTask(
        `Analyze and provide insights for: ${query}`,
        ["document-analysis", "text-processing"]
      );
      
      realTimeResponseService.addResponse({
        source: "system-integration",
        status: "success", 
        message: `A2A coordination completed with ${results.assignedAgent.name}`,
        data: { 
          step: "a2a", 
          agentName: results.assignedAgent.name,
          taskId: results.taskId
        }
      });

      return { success: true, data: results };
    } catch (error) {
      realTimeResponseService.addResponse({
        source: "system-integration",
        status: "error",
        message: `A2A coordination failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
        data: { step: "a2a", error }
      });
      return { success: false };
    }
  }

  private async executeMCPTools(query: string, context?: Record<string, any>): Promise<{ success: boolean; data?: any }> {
    try {
      realTimeResponseService.addResponse({
        source: "system-integration",
        status: "processing",
        message: "Executing relevant MCP tools...",
        data: { step: "mcp", query }
      });

      const toolName = this.selectMCPTool(query);
      const results = await mcpService.callTool(toolName, {
        query,
        context
      });
      
      realTimeResponseService.addResponse({
        source: "system-integration",
        status: "success",
        message: `MCP tool execution completed: ${toolName}`,
        data: { 
          step: "mcp", 
          toolName,
          success: results.success,
          executionTime: results.executionTime
        }
      });

      return { success: true, data: results };
    } catch (error) {
      realTimeResponseService.addResponse({
        source: "system-integration",
        status: "error",
        message: `MCP tool execution failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
        data: { step: "mcp", error }
      });
      return { success: false };
    }
  }

  private async executeDeepSeekReasoning(query: string, results: any): Promise<{ success: boolean; data?: any }> {
    try {
      realTimeResponseService.addResponse({
        source: "system-integration",
        status: "processing",
        message: "Processing with DeepSeek reasoning engine...",
        data: { step: "deepseek", contextSize: JSON.stringify(results).length }
      });

      const contextPrompt = this.buildContextPrompt(query, results);
      
      const reasoning = await deepseekReasonerService.processQuery({
        prompt: contextPrompt,
        maxTokens: 4096,
        ragEnabled: !!results.ragResults,
        a2aEnabled: !!results.a2aCoordination,
        mcpEnabled: !!results.mcpResults
      });
      
      realTimeResponseService.addResponse({
        source: "system-integration",
        status: "success",
        message: `DeepSeek reasoning completed with ${reasoning.confidence} confidence`,
        data: {
          step: "deepseek",
          confidence: reasoning.confidence,
          tokenUsage: reasoning.tokenUsage,
          processingTime: reasoning.processingTime
        }
      });

      return { success: true, data: reasoning };
    } catch (error) {
      realTimeResponseService.addResponse({
        source: "system-integration",
        status: "error",
        message: `DeepSeek reasoning failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
        data: { step: "deepseek", error }
      });
      return { success: false };
    }
  }

  private selectMCPTool(query: string): string {
    const queryLower = query.toLowerCase();
    
    if (queryLower.includes("search") || queryLower.includes("find")) {
      return "web_search";
    } else if (queryLower.includes("file") || queryLower.includes("document")) {
      return "read_file";
    } else if (queryLower.includes("database") || queryLower.includes("query")) {
      return "execute_query";
    } else if (queryLower.includes("api") || queryLower.includes("external")) {
      return "call_api";
    } else {
      return "web_search";
    }
  }

  private buildContextPrompt(originalQuery: string, results: any): string {
    let contextPrompt = `Please analyze the following query and provide comprehensive insights based on the integrated system results:\n\nOriginal Query: "${originalQuery}"\n\n`;

    if (results.ragResults) {
      contextPrompt += `RAG Database Results:\n`;
      results.ragResults.results.forEach((result: any, index: number) => {
        contextPrompt += `${index + 1}. ${result.title} (Relevance: ${result.relevanceScore.toFixed(2)})\n   ${result.content}\n\n`;
      });
    }

    if (results.a2aCoordination) {
      contextPrompt += `Agent Coordination Results:\n`;
      contextPrompt += `Assigned Agent: ${results.a2aCoordination.assignedAgent.name} (${results.a2aCoordination.assignedAgent.specialization})\n`;
      contextPrompt += `Task Result: ${JSON.stringify(results.a2aCoordination.result, null, 2)}\n\n`;
    }

    if (results.mcpResults) {
      contextPrompt += `MCP Tool Execution Results:\n`;
      contextPrompt += `Tool: ${results.mcpResults.toolName}\n`;
      contextPrompt += `Result: ${JSON.stringify(results.mcpResults.result, null, 2)}\n\n`;
    }

    contextPrompt += `Please provide a comprehensive analysis that synthesizes all this information to answer the original query effectively.`;

    return contextPrompt;
  }

  private synthesizeFinalResponse(query: string, results: any): string {
    let response = `## Integrated Analysis Results\n\n`;
    
    response += `**Query**: ${query}\n\n`;

    const sections: string[] = [];

    if (results.ragResults && results.ragResults.results.length > 0) {
      sections.push(`**Knowledge Base Insights**: Found ${results.ragResults.results.length} relevant documents with key information about ${query.toLowerCase()}.`);
    }

    if (results.a2aCoordination) {
      sections.push(`**Agent Analysis**: ${results.a2aCoordination.assignedAgent.name} provided specialized insights with ${(results.a2aCoordination.assignedAgent.performance.successRate * 100).toFixed(1)}% reliability.`);
    }

    if (results.mcpResults && results.mcpResults.success) {
      sections.push(`**Tool Execution**: Successfully executed ${results.mcpResults.toolName} to gather additional context and data.`);
    }

    if (results.reasoning) {
      sections.push(`**AI Reasoning**: Applied advanced reasoning with ${(results.reasoning.confidence * 100).toFixed(1)}% confidence to synthesize the comprehensive response.`);
    }

    response += sections.join('\n\n') + '\n\n';

    if (results.reasoning && results.reasoning.response) {
      response += `## Detailed Analysis\n\n${results.reasoning.response}`;
    } else {
      response += `## Summary\n\nBased on the integrated system analysis, your query has been processed through multiple specialized services to provide comprehensive insights. The combination of knowledge retrieval, agent coordination, tool execution, and advanced reasoning ensures a thorough and accurate response.`;
    }

    return response;
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
