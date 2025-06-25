import { ragService } from "../rag/ragService";
import { a2aService } from "../a2a/a2aService";
import { mcpService } from "../mcp/mcpService";
import { RAGResult, A2AAgent, MCPTool } from "@/types/ipa-types";
import { realTimeResponseService } from "./realTimeResponseService";

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

    // RAG Processing
    if (query.useRag) {
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

    // A2A Processing
    if (query.useA2A) {
      try {
        processingLog.push("🤖 Coordinating with A2A agents...");
        const rawAgents = a2aService.getAgents();
        // Map to match expected A2AAgent interface
        sources.a2aAgents = rawAgents.slice(0, 3).map(agent => ({
          ...agent,
          lastSeen: Date.now() // Add required lastSeen property
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

    // MCP Processing
    if (query.useMCP) {
      try {
        processingLog.push("🔧 Accessing MCP tools...");
        const rawTools = mcpService.getAvailableTools();
        // Map MCP tools to include all required fields
        sources.mcpTools = rawTools.slice(0, 5).map(tool => ({
          id: `${tool.name}-${Date.now()}`,
          name: tool.name,
          description: tool.description,
          category: "general",
          version: "1.0",
          status: "active",
          parameters: [] // Add required parameters property
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

    // Generate enhanced response
    processingLog.push("🧠 Generating enhanced response...");
    
    const response = this.generateEnhancedResponse(query, sources, processingLog);
    const reasoning = this.generateReasoning(query, sources);

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

  private generateEnhancedResponse(query: EnhancedQuery, sources: EnhancedResponse["sources"], log: string[]): string {
    let response = `# Enhanced Response to: "${query.query}"\n\n`;

    if (sources.ragDocuments && sources.ragDocuments.length > 0) {
      response += `## Knowledge Base Insights\nBased on ${sources.ragDocuments.length} relevant documents:\n\n`;
      sources.ragDocuments.slice(0, 2).forEach((doc, i) => {
        response += `**${doc.title}**: ${doc.content.substring(0, 200)}...\n\n`;
      });
    }

    if (sources.a2aAgents && sources.a2aAgents.length > 0) {
      response += `## Agent Collaboration\n${sources.a2aAgents.length} specialized agents are available for coordination:\n\n`;
      sources.a2aAgents.forEach(agent => {
        response += `- **${agent.name}**: ${agent.capabilities.join(", ")}\n`;
      });
      response += '\n';
    }

    if (sources.mcpTools && sources.mcpTools.length > 0) {
      response += `## Available Tools\n${sources.mcpTools.length} tools ready for execution:\n\n`;
      sources.mcpTools.forEach(tool => {
        response += `- **${tool.name}**: ${tool.description}\n`;
      });
      response += '\n';
    }

    response += `## Integrated Analysis\nThis response leverages `;
    const integrations = [];
    if (query.useRag) integrations.push("RAG 2.0 knowledge retrieval");
    if (query.useA2A) integrations.push("A2A agent coordination");
    if (query.useMCP) integrations.push("MCP tool integration");
    response += integrations.join(", ") + " for comprehensive assistance.\n\n";

    response += `Based on your query about "${query.query}", I recommend proceeding with a multi-faceted approach that combines the available resources and capabilities for optimal results.`;

    return response;
  }

  private generateReasoning(query: EnhancedQuery, sources: EnhancedResponse["sources"]): string {
    let reasoning = "# Chain of Thought Process\n\n";
    
    reasoning += "## 1. Query Analysis\n";
    reasoning += `The user asked: "${query.query}"\n`;
    reasoning += `This requires integration of: ${[query.useRag && "RAG", query.useA2A && "A2A", query.useMCP && "MCP"].filter(Boolean).join(", ")}\n\n`;
    
    reasoning += "## 2. Resource Assessment\n";
    if (sources.ragDocuments) {
      reasoning += `- RAG: ${sources.ragDocuments.length} relevant documents retrieved\n`;
    }
    if (sources.a2aAgents) {
      reasoning += `- A2A: ${sources.a2aAgents.length} agents available for coordination\n`;
    }
    if (sources.mcpTools) {
      reasoning += `- MCP: ${sources.mcpTools.length} tools accessible\n`;
    }
    
    reasoning += "\n## 3. Integration Strategy\n";
    reasoning += "Combined multiple information sources to provide comprehensive response\n";
    reasoning += "Prioritized accuracy and relevance based on available resources\n";
    reasoning += "Structured response to maximize user understanding and actionability\n";
    
    return reasoning;
  }
}

export const enhancedSystemService = new EnhancedSystemService();
