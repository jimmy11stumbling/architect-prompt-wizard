
import { ragService } from "../../rag/ragService";
import { a2aService } from "../../a2a/a2aService";
import { mcpService } from "../../mcp/mcpService";
import { DeepSeekService } from "../../deepseek";
import { realTimeResponseService } from "../realTimeResponseService";

export class ServiceExecutor {
  static async executeRAG(query: string): Promise<{ success: boolean; data?: any }> {
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

  static async executeA2A(query: string): Promise<{ success: boolean; data?: any }> {
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

  static async executeMCP(query: string, context?: Record<string, any>): Promise<{ success: boolean; data?: any }> {
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

  static async executeDeepSeek(query: string, results: any): Promise<{ success: boolean; data?: any }> {
    try {
      realTimeResponseService.addResponse({
        source: "system-integration",
        status: "processing",
        message: "Processing with DeepSeek reasoning engine...",
        data: { step: "deepseek", contextSize: JSON.stringify(results).length }
      });

      const contextPrompt = this.buildContextPrompt(query, results);
      
      await DeepSeekService.processQuery(contextPrompt, {
        ragEnabled: !!results.ragResults,
        temperature: 0.1
      });
      
      realTimeResponseService.addResponse({
        source: "system-integration",
        status: "success",
        message: `DeepSeek reasoning completed successfully`,
        data: {
          step: "deepseek",
          contextLength: contextPrompt.length,
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

  private static selectMCPTool(query: string): string {
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

  private static buildContextPrompt(originalQuery: string, results: any): string {
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
}
