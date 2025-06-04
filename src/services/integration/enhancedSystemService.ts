
import { ragService } from "../rag/ragService";
import { a2aService } from "../a2a/a2aService";
import { mcpService } from "../mcp/mcpService";
import { deepseekReasonerService, ReasonerQuery } from "../deepseek/deepseekReasonerService";
import { systemIntegrationService } from "./systemIntegrationService";
import { ProjectSpec } from "@/types/ipa-types";

export interface EnhancedQuery {
  query: string;
  context?: string;
  useRag?: boolean;
  useA2A?: boolean;
  useMCP?: boolean;
  conversationId?: string;
  projectSpec?: ProjectSpec;
}

export interface EnhancedResponse {
  response: string;
  reasoning?: string;
  sources: {
    ragDocuments?: any[];
    mcpTools?: any[];
    a2aAgents?: any[];
  };
  conversationId: string;
  processingLog: string[];
}

export class EnhancedSystemService {
  private static instance: EnhancedSystemService;
  private processingLog: string[] = [];

  static getInstance(): EnhancedSystemService {
    if (!EnhancedSystemService.instance) {
      EnhancedSystemService.instance = new EnhancedSystemService();
    }
    return EnhancedSystemService.instance;
  }

  async processEnhancedQuery(query: EnhancedQuery): Promise<EnhancedResponse> {
    this.processingLog = [];
    this.log("🚀 Starting enhanced query processing");

    const sources: any = {
      ragDocuments: [],
      mcpTools: [],
      a2aAgents: []
    };

    let enhancedContext = query.context || "";

    // Step 1: RAG Integration
    if (query.useRag !== false) {
      this.log("📚 Retrieving relevant documentation from RAG database");
      try {
        const ragResults = await ragService.query({
          query: query.query,
          limit: 5,
          threshold: 0.3
        });

        sources.ragDocuments = ragResults.documents;
        
        if (ragResults.documents.length > 0) {
          const ragContext = ragResults.documents
            .map(doc => `${doc.title}: ${doc.content}`)
            .join("\n\n");
          enhancedContext += `\n\nRelevant Documentation:\n${ragContext}`;
          this.log(`✅ Retrieved ${ragResults.documents.length} relevant documents`);
        } else {
          this.log("⚠️ No relevant documents found in RAG database");
        }
      } catch (error) {
        this.log(`❌ RAG error: ${error instanceof Error ? error.message : "Unknown error"}`);
      }
    }

    // Step 2: A2A Coordination
    if (query.useA2A !== false) {
      this.log("🤝 Coordinating with A2A agents");
      try {
        const delegation = await a2aService.delegateTask(
          `Enhanced query: ${query.query}`,
          ["reasoning-assistant", "context-analyzer", "documentation-expert"]
        );

        if (delegation.assignedAgent) {
          sources.a2aAgents = [delegation.assignedAgent];
          enhancedContext += `\n\nA2A Agent Coordination: Task assigned to ${delegation.assignedAgent.name}`;
          this.log(`✅ A2A coordination successful with ${delegation.assignedAgent.name}`);
        }

        // Send coordination message
        await a2aService.sendMessage({
          id: `enhanced-query-${Date.now()}`,
          from: "enhanced-system",
          to: "reasoning-coordinator",
          type: "request",
          payload: { query: query.query, context: enhancedContext },
          timestamp: Date.now()
        });
      } catch (error) {
        this.log(`❌ A2A error: ${error instanceof Error ? error.message : "Unknown error"}`);
      }
    }

    // Step 3: MCP Tool Integration
    if (query.useMCP !== false) {
      this.log("🔧 Gathering MCP tools and resources");
      try {
        const tools = await mcpService.listTools();
        const resources = await mcpService.listResources();

        sources.mcpTools = tools.slice(0, 3);

        if (tools.length > 0) {
          const toolsContext = tools
            .slice(0, 3)
            .map(tool => `${tool.name}: ${tool.description}`)
            .join("\n");
          enhancedContext += `\n\nAvailable MCP Tools:\n${toolsContext}`;
          this.log(`✅ Found ${tools.length} MCP tools, using top 3`);
        }

        // Execute a relevant tool if applicable
        if (query.query.toLowerCase().includes("file") || query.query.toLowerCase().includes("read")) {
          try {
            const fileResult = await mcpService.callTool("read_file", {
              path: "/config/system.json"
            });
            enhancedContext += `\n\nMCP Tool Result: ${fileResult.content}`;
            this.log("✅ Executed MCP file reading tool");
          } catch (toolError) {
            this.log("⚠️ MCP tool execution failed, continuing without tool result");
          }
        }
      } catch (error) {
        this.log(`❌ MCP error: ${error instanceof Error ? error.message : "Unknown error"}`);
      }
    }

    // Step 4: DeepSeek Reasoner Processing
    this.log("🧠 Processing with DeepSeek Reasoner");
    
    const reasonerQuery: ReasonerQuery = {
      prompt: query.query,
      context: enhancedContext,
      maxTokens: 4096,
      conversationHistory: query.conversationId ? 
        deepseekReasonerService.getConversationHistory(query.conversationId) : 
        undefined
    };

    const reasonerResponse = await deepseekReasonerService.processQuery(reasonerQuery);
    this.log("✅ DeepSeek Reasoner processing completed");

    // Step 5: Post-processing coordination
    this.log("📤 Sending completion notifications");
    try {
      await a2aService.sendMessage({
        id: `completion-${Date.now()}`,
        from: "enhanced-system",
        to: "all",
        type: "notification",
        payload: {
          status: "completed",
          query: query.query,
          responseLength: reasonerResponse.answer.length,
          sourcesUsed: {
            rag: sources.ragDocuments.length,
            mcp: sources.mcpTools.length,
            a2a: sources.a2aAgents.length
          }
        },
        timestamp: Date.now()
      });
    } catch (error) {
      this.log(`⚠️ Notification error: ${error instanceof Error ? error.message : "Unknown error"}`);
    }

    this.log("🎉 Enhanced query processing completed successfully");

    return {
      response: reasonerResponse.answer,
      reasoning: reasonerResponse.reasoning,
      sources,
      conversationId: reasonerResponse.conversationId,
      processingLog: [...this.processingLog]
    };
  }

  private log(message: string): void {
    const timestamp = new Date().toLocaleTimeString();
    const logEntry = `[${timestamp}] ${message}`;
    this.processingLog.push(logEntry);
    console.log("Enhanced System:", logEntry);
  }

  getProcessingLog(): string[] {
    return [...this.processingLog];
  }
}

export const enhancedSystemService = EnhancedSystemService.getInstance();
