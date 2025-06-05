
import { ragService } from "../rag/ragService";
import { a2aService } from "../a2a/a2aService";
import { mcpService } from "../mcp/mcpService";
import { deepseekReasonerService, ReasonerQuery } from "../deepseek/deepseekReasonerService";
import { systemIntegrationService } from "./systemIntegrationService";
import { realTimeResponseService } from "./realTimeResponseService";
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

    // Real-time response tracking
    realTimeResponseService.addResponse({
      source: "enhanced-system",
      status: "processing",
      message: "Starting enhanced query processing",
      data: { query: query.query }
    });

    const sources: any = {
      ragDocuments: [],
      mcpTools: [],
      a2aAgents: []
    };

    let enhancedContext = query.context || "";

    // Step 1: RAG Integration
    if (query.useRag !== false) {
      this.log("📚 Retrieving relevant documentation from RAG database");
      realTimeResponseService.addResponse({
        source: "rag-service",
        status: "processing",
        message: "Querying RAG database for relevant documents"
      });

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
          
          realTimeResponseService.addResponse({
            source: "rag-service",
            status: "success",
            message: `Successfully retrieved ${ragResults.documents.length} relevant documents`,
            data: { 
              documents: ragResults.documents,
              query: ragResults.query,
              totalResults: ragResults.totalResults
            }
          });
        } else {
          this.log("⚠️ No relevant documents found in RAG database");
          
          realTimeResponseService.addResponse({
            source: "rag-service",
            status: "validation",
            message: "No relevant documents found in RAG database",
            data: { query: query.query, threshold: 0.3 }
          });
        }
      } catch (error) {
        const errorMsg = error instanceof Error ? error.message : "Unknown error";
        this.log(`❌ RAG error: ${errorMsg}`);
        
        realTimeResponseService.addResponse({
          source: "rag-service",
          status: "error",
          message: `RAG query failed: ${errorMsg}`,
          data: { error: errorMsg, query: query.query }
        });
      }
    }

    // Step 2: A2A Coordination
    if (query.useA2A !== false) {
      this.log("🤝 Coordinating with A2A agents");
      realTimeResponseService.addResponse({
        source: "a2a-service",
        status: "processing",
        message: "Coordinating with A2A agents for task delegation"
      });

      try {
        const delegation = await a2aService.delegateTask(
          `Enhanced query: ${query.query}`,
          ["reasoning-assistant", "context-analyzer", "documentation-expert"]
        );

        if (delegation.assignedAgent) {
          sources.a2aAgents = [delegation.assignedAgent];
          enhancedContext += `\n\nA2A Agent Coordination: Task assigned to ${delegation.assignedAgent.name}`;
          this.log(`✅ A2A coordination successful with ${delegation.assignedAgent.name}`);
          
          realTimeResponseService.addResponse({
            source: "a2a-service",
            status: "success",
            message: `A2A coordination successful with ${delegation.assignedAgent.name}`,
            data: { assignedAgent: delegation.assignedAgent }
          });
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

        realTimeResponseService.addResponse({
          source: "a2a-service",
          status: "success",
          message: "A2A coordination message sent successfully"
        });
      } catch (error) {
        const errorMsg = error instanceof Error ? error.message : "Unknown error";
        this.log(`❌ A2A error: ${errorMsg}`);
        
        realTimeResponseService.addResponse({
          source: "a2a-service",
          status: "error",
          message: `A2A coordination failed: ${errorMsg}`,
          data: { error: errorMsg }
        });
      }
    }

    // Step 3: MCP Tool Integration
    if (query.useMCP !== false) {
      this.log("🔧 Gathering MCP tools and resources");
      realTimeResponseService.addResponse({
        source: "mcp-service",
        status: "processing",
        message: "Gathering MCP tools and resources"
      });

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
          
          realTimeResponseService.addResponse({
            source: "mcp-service",
            status: "success",
            message: `Found ${tools.length} MCP tools, using top 3`,
            data: { tools: tools.slice(0, 3), totalTools: tools.length }
          });
        }

        // Execute a relevant tool if applicable
        if (query.query.toLowerCase().includes("file") || query.query.toLowerCase().includes("read")) {
          try {
            const fileResult = await mcpService.callTool("read_file", {
              path: "/config/system.json"
            });
            enhancedContext += `\n\nMCP Tool Result: ${fileResult.content}`;
            this.log("✅ Executed MCP file reading tool");
            
            realTimeResponseService.addResponse({
              source: "mcp-service",
              status: "success",
              message: "MCP file reading tool executed successfully",
              data: { tool: "read_file", result: fileResult }
            });
          } catch (toolError) {
            this.log("⚠️ MCP tool execution failed, continuing without tool result");
            
            realTimeResponseService.addResponse({
              source: "mcp-service",
              status: "validation",
              message: "MCP tool execution failed, continuing without tool result",
              data: { tool: "read_file", error: toolError }
            });
          }
        }
      } catch (error) {
        const errorMsg = error instanceof Error ? error.message : "Unknown error";
        this.log(`❌ MCP error: ${errorMsg}`);
        
        realTimeResponseService.addResponse({
          source: "mcp-service",
          status: "error",
          message: `MCP service error: ${errorMsg}`,
          data: { error: errorMsg }
        });
      }
    }

    // Step 4: DeepSeek Reasoner Processing
    this.log("🧠 Processing with DeepSeek Reasoner");
    realTimeResponseService.addResponse({
      source: "deepseek-reasoner",
      status: "processing",
      message: "Processing query with DeepSeek Reasoner"
    });
    
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

    realTimeResponseService.addResponse({
      source: "deepseek-reasoner",
      status: "success",
      message: "DeepSeek Reasoner processing completed successfully",
      data: {
        reasoning: reasonerResponse.reasoning,
        answer: reasonerResponse.answer,
        usage: reasonerResponse.usage,
        conversationId: reasonerResponse.conversationId
      }
    });

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

      realTimeResponseService.addResponse({
        source: "enhanced-system",
        status: "success",
        message: "Enhanced query processing completed successfully",
        data: {
          totalSources: sources.ragDocuments.length + sources.mcpTools.length + sources.a2aAgents.length,
          responseLength: reasonerResponse.answer.length
        }
      });
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : "Unknown error";
      this.log(`⚠️ Notification error: ${errorMsg}`);
      
      realTimeResponseService.addResponse({
        source: "enhanced-system",
        status: "validation",
        message: `Completion notification failed: ${errorMsg}`,
        data: { error: errorMsg }
      });
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
