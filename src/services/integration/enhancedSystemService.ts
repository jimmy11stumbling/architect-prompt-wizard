
import { ragService } from "../rag/ragService";
import { a2aService } from "../a2a/a2aService";
import { mcpService } from "../mcp/mcpService";
import { RAGResult, A2AAgent, MCPTool } from "@/types/ipa-types";
import { realTimeResponseService } from "./realTimeResponseService";
import { ResponseGenerator } from "./core/responseGenerator";

export interface EnhancedQuery {
  query: string;
  useRag: boolean;
  useA2A: boolean;
  useMCP: boolean;
  conversationId?: string;
}

export interface EnhancedResponse {
  response: string;
  reasoning?: string;
  sources: {
    ragDocuments?: Array<{
      id: string;
      title: string;
      content: string;
      category: string;
      relevanceScore: number;
      metadata: Record<string, any>;
    }>;
    a2aAgents?: A2AAgent[];
    mcpTools?: MCPTool[];
  };
  processingLog: string[];
  conversationId: string;
}

export class EnhancedSystemService {
  async processEnhancedQuery(query: EnhancedQuery): Promise<EnhancedResponse> {
    const conversationId = query.conversationId || `conv-${Date.now()}`;
    const processingLog: string[] = [];
    const sources: EnhancedResponse["sources"] = {};

    realTimeResponseService.addResponse({
      source: "enhanced-system",
      status: "processing",
      message: "Starting enhanced query processing",
      data: { query: query.query.substring(0, 100), services: { rag: query.useRag, a2a: query.useA2A, mcp: query.useMCP } }
    });

    processingLog.push(`🚀 Starting enhanced query processing for: "${query.query.substring(0, 50)}..."`);

    // Process each service
    await this.processRAG(query, sources, processingLog);
    await this.processA2A(query, sources, processingLog);
    await this.processMCP(query, sources, processingLog);

    processingLog.push("🧠 Generating enhanced response...");
    
    const response = ResponseGenerator.generateEnhancedResponse(query, sources, processingLog);
    const reasoning = ResponseGenerator.generateReasoning(query, sources);

    processingLog.push("✅ Enhanced response generation completed");

    realTimeResponseService.addResponse({
      source: "enhanced-system",
      status: "success",
      message: "Enhanced query processing completed successfully",
      data: { 
        conversationId,
        responseLength: response.length,
        sourcesUsed: Object.keys(sources).length
      }
    });

    return {
      response,
      reasoning,
      sources,
      processingLog,
      conversationId
    };
  }

  private async processRAG(query: EnhancedQuery, sources: EnhancedResponse["sources"], processingLog: string[]) {
    if (!query.useRag) return;

    try {
      processingLog.push("📚 Executing RAG query...");
      const ragResult = await ragService.query({
        query: query.query,
        limit: 5
      });
      sources.ragDocuments = ragResult.results.map(result => ({
        id: result.id,
        title: result.title,
        content: result.content,
        category: result.category,
        relevanceScore: result.relevanceScore,
        metadata: result.metadata
      }));
      processingLog.push(`✅ RAG: Found ${ragResult.results.length} relevant documents`);
      
      realTimeResponseService.addResponse({
        source: "enhanced-system-rag",
        status: "success",
        message: `RAG processing completed - found ${ragResult.results.length} documents`,
        data: { documents: ragResult.results.length, query: query.query }
      });
    } catch (error) {
      processingLog.push(`❌ RAG: Error - ${error instanceof Error ? error.message : "Unknown error"}`);
    }
  }

  private async processA2A(query: EnhancedQuery, sources: EnhancedResponse["sources"], processingLog: string[]) {
    if (!query.useA2A) return;

    try {
      processingLog.push("🤖 Coordinating with A2A agents...");
      const rawAgents = a2aService.getAgents();
      sources.a2aAgents = rawAgents.slice(0, 3).map(agent => ({
        ...agent,
        status: agent.status === "inactive" ? "inactive" : agent.status as "active" | "inactive" | "busy",
        lastSeen: Date.now()
      }));
      processingLog.push(`✅ A2A: Connected to ${rawAgents.length} agents`);
      
      realTimeResponseService.addResponse({
        source: "enhanced-system-a2a",
        status: "success",
        message: `A2A coordination completed - ${rawAgents.length} agents available`,
        data: { agentCount: rawAgents.length, activeAgents: rawAgents.filter(a => a.status === "active").length }
      });
    } catch (error) {
      processingLog.push(`❌ A2A: Error - ${error instanceof Error ? error.message : "Unknown error"}`);
    }
  }

  private async processMCP(query: EnhancedQuery, sources: EnhancedResponse["sources"], processingLog: string[]) {
    if (!query.useMCP) return;

    try {
      processingLog.push("🔧 Accessing MCP tools...");
      const rawTools = mcpService.getAvailableTools();
      sources.mcpTools = rawTools.slice(0, 5).map(tool => ({
        id: `${tool.name}-${Date.now()}`,
        name: tool.name,
        description: tool.description,
        category: "general",
        version: "1.0",
        status: "active",
        parameters: []
      }));
      processingLog.push(`✅ MCP: Found ${rawTools.length} available tools`);
      
      realTimeResponseService.addResponse({
        source: "enhanced-system-mcp",
        status: "success",
        message: `MCP tool access completed - ${rawTools.length} tools available`,
        data: { toolCount: rawTools.length, tools: rawTools.map(t => t.name) }
      });
    } catch (error) {
      processingLog.push(`❌ MCP: Error - ${error instanceof Error ? error.message : "Unknown error"}`);
    }
  }
}

export const enhancedSystemService = new EnhancedSystemService();
