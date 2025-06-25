import { ragService } from "../rag/ragService";
import { a2aService } from "../a2a/a2aService";
import { mcpService } from "../mcp/mcpService";
import { deepseekReasonerService } from "../deepseek/deepseekReasonerService";
import { realTimeResponseService } from "./realTimeResponseService";

export interface IntegratedQueryRequest {
  query: string;
  enableRAG?: boolean;
  enableA2A?: boolean;
  enableMCP?: boolean;
  enableDeepSeek?: boolean;
  context?: Record<string, any>;
}

export interface IntegratedQueryResponse {
  query: string;
  ragResults?: any;
  a2aCoordination?: any;
  mcpResults?: any;
  reasoning?: any;
  finalResponse: string;
  processingTime: number;
  integrationSummary: {
    servicesUsed: string[];
    totalSteps: number;
    successRate: number;
  };
}

export interface SystemInitializationConfig {
  projectDescription: string;
  frontendTechStack: string[];
  backendTechStack: string[];
  customFrontendTech: string[];
  customBackendTech: string[];
  a2aIntegrationDetails: string;
  additionalFeatures: string;
  ragVectorDb: string;
  customRagVectorDb: string;
  mcpType: string;
  customMcpType: string;
  advancedPromptDetails: string;
}

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

    console.log("🔄 [system-integration] Initializing integrated AI system...", {
      project: "IPA System with comprehensive DeepSeek integration, RAG 2.0, A2A protocol, and MCP hub",
      techStack: ["React", "TypeScript", "Express", "Node.js"]
    });

    try {
      // Initialize RAG service
      await ragService.initialize();
      console.log("✅ [system-integration] RAG service initialized");

      // Initialize other services
      await a2aService.initialize();
      console.log("✅ [system-integration] A2A service initialized");

      await mcpService.initialize();
      console.log("✅ [system-integration] MCP service initialized");

      await deepseekReasonerService.initialize();
      console.log("✅ [system-integration] DeepSeek service initialized");

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

    // Step 1: RAG Query (enabled by default)
    if (request.enableRAG !== false) {
      try {
        totalSteps++;
        realTimeResponseService.addResponse({
          source: "system-integration",
          status: "processing",
          message: "Executing RAG database query...",
          data: { step: "rag", query: request.query }
        });

        results.ragResults = await ragService.query({
          query: request.query,
          limit: 5,
          threshold: 0.3
        });
        
        servicesUsed.push("RAG");
        successfulSteps++;

        realTimeResponseService.addResponse({
          source: "system-integration", 
          status: "success",
          message: `RAG query completed: ${results.ragResults.results.length} results`,
          data: { step: "rag", resultsCount: results.ragResults.results.length }
        });
      } catch (error) {
        realTimeResponseService.addResponse({
          source: "system-integration",
          status: "error", 
          message: `RAG query failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
          data: { step: "rag", error }
        });
      }
    }

    // Step 2: A2A Coordination (enabled by default)
    if (request.enableA2A !== false) {
      try {
        totalSteps++;
        realTimeResponseService.addResponse({
          source: "system-integration",
          status: "processing",
          message: "Coordinating with specialized agents...",
          data: { step: "a2a", task: request.query }
        });

        results.a2aCoordination = await a2aService.delegateTask(
          `Analyze and provide insights for: ${request.query}`,
          ["document-analysis", "text-processing"]
        );
        
        servicesUsed.push("A2A");
        successfulSteps++;

        realTimeResponseService.addResponse({
          source: "system-integration",
          status: "success", 
          message: `A2A coordination completed with ${results.a2aCoordination.assignedAgent.name}`,
          data: { 
            step: "a2a", 
            agentName: results.a2aCoordination.assignedAgent.name,
            taskId: results.a2aCoordination.taskId
          }
        });
      } catch (error) {
        realTimeResponseService.addResponse({
          source: "system-integration",
          status: "error",
          message: `A2A coordination failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
          data: { step: "a2a", error }
        });
      }
    }

    // Step 3: MCP Tool Execution (enabled by default)
    if (request.enableMCP !== false) {
      try {
        totalSteps++;
        realTimeResponseService.addResponse({
          source: "system-integration",
          status: "processing",
          message: "Executing relevant MCP tools...",
          data: { step: "mcp", query: request.query }
        });

        // Choose appropriate MCP tool based on query
        const toolName = this.selectMCPTool(request.query);
        results.mcpResults = await mcpService.callTool(toolName, {
          query: request.query,
          context: request.context
        });
        
        servicesUsed.push("MCP");
        successfulSteps++;

        realTimeResponseService.addResponse({
          source: "system-integration",
          status: "success",
          message: `MCP tool execution completed: ${toolName}`,
          data: { 
            step: "mcp", 
            toolName,
            success: results.mcpResults.success,
            executionTime: results.mcpResults.executionTime
          }
        });
      } catch (error) {
        realTimeResponseService.addResponse({
          source: "system-integration",
          status: "error",
          message: `MCP tool execution failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
          data: { step: "mcp", error }
        });
      }
    }

    // Step 4: DeepSeek Reasoning (enabled by default)
    if (request.enableDeepSeek !== false) {
      try {
        totalSteps++;
        realTimeResponseService.addResponse({
          source: "system-integration",
          status: "processing",
          message: "Processing with DeepSeek reasoning engine...",
          data: { step: "deepseek", contextSize: JSON.stringify(results).length }
        });

        // Prepare context from previous steps
        const contextPrompt = this.buildContextPrompt(request.query, results);
        
        results.reasoning = await deepseekReasonerService.processQuery({
          prompt: contextPrompt,
          maxTokens: 4096,
          ragEnabled: !!results.ragResults,
          a2aEnabled: !!results.a2aCoordination,
          mcpEnabled: !!results.mcpResults
        });
        
        servicesUsed.push("DeepSeek");
        successfulSteps++;

        realTimeResponseService.addResponse({
          source: "system-integration",
          status: "success",
          message: `DeepSeek reasoning completed with ${results.reasoning.confidence} confidence`,
          data: {
            step: "deepseek",
            confidence: results.reasoning.confidence,
            tokenUsage: results.reasoning.tokenUsage,
            processingTime: results.reasoning.processingTime
          }
        });
      } catch (error) {
        realTimeResponseService.addResponse({
          source: "system-integration",
          status: "error",
          message: `DeepSeek reasoning failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
          data: { step: "deepseek", error }
        });
      }
    }

    // Generate final integrated response
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
      return "web_search"; // Default fallback
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

  async getSystemHealth(): Promise<any> {
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

    const systemStatus = {
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
