
import { realTimeResponseService } from "../integration/realTimeResponseService";
import { DeepSeekReasonerClient } from "./deepseekReasonerClient";
import { DeepSeekMessage } from "@/types/ipa-types";
import { ragService } from "../rag/ragService";
import { a2aService } from "../a2a/a2aService";
import { mcpService } from "../mcp/mcpService";

export interface ReasonerQuery {
  prompt: string;
  context?: string;
  maxTokens: number;
  conversationHistory?: ConversationHistory[];
  ragEnabled?: boolean;
  a2aEnabled?: boolean;
  mcpEnabled?: boolean;
}

export interface ReasonerResponse {
  answer: string;
  reasoning: string;
  conversationId: string;
  usage: {
    promptTokens: number;
    completionTokens: number;
    reasoningTokens: number;
    totalTokens: number;
  };
  integrationData?: {
    ragResults?: any;
    a2aMessages?: any[];
    mcpToolCalls?: any[];
  };
}

export interface ConversationHistory {
  conversationId: string;
  timestamp: number;
  userMessage: string;
  assistantMessage: string;
  reasoning: string;
  context?: string;
}

export class DeepSeekReasonerService {
  private static instance: DeepSeekReasonerService;
  private conversations: Map<string, ConversationHistory[]> = new Map();
  private isInitialized = false;

  static getInstance(): DeepSeekReasonerService {
    if (!DeepSeekReasonerService.instance) {
      DeepSeekReasonerService.instance = new DeepSeekReasonerService();
    }
    return DeepSeekReasonerService.instance;
  }

  async initialize(): Promise<void> {
    if (this.isInitialized) return;

    realTimeResponseService.addResponse({
      source: "deepseek-reasoner",
      status: "processing",
      message: "Initializing DeepSeek Reasoner service with integrated communication"
    });

    // Initialize integrated services
    await Promise.all([
      ragService.initialize(),
      a2aService.initialize(),
      mcpService.initialize()
    ]);

    this.isInitialized = true;

    realTimeResponseService.addResponse({
      source: "deepseek-reasoner",
      status: "success",
      message: "DeepSeek Reasoner service initialized with full integration",
      data: { 
        model: "deepseek-reasoner",
        maxTokens: 8192,
        maxReasoningTokens: 32768,
        ragIntegrated: ragService.isInitialized(),
        a2aIntegrated: a2aService.isInitialized(),
        mcpIntegrated: mcpService.isInitialized()
      }
    });
  }

  async processQuery(query: ReasonerQuery): Promise<ReasonerResponse> {
    await this.initialize();

    const conversationId = query.conversationHistory?.[0]?.conversationId || this.generateConversationId();

    realTimeResponseService.addResponse({
      source: "deepseek-reasoner",
      status: "processing",
      message: "Processing integrated reasoning query",
      data: { 
        prompt: query.prompt.substring(0, 100) + "...",
        conversationId,
        hasContext: !!query.context,
        maxTokens: query.maxTokens,
        integrations: {
          rag: query.ragEnabled,
          a2a: query.a2aEnabled,
          mcp: query.mcpEnabled
        }
      }
    });

    let integrationData: any = {};

    // Step 1: RAG Integration - Retrieve relevant context
    if (query.ragEnabled) {
      try {
        realTimeResponseService.addResponse({
          source: "deepseek-reasoner",
          status: "processing",
          message: "Retrieving context from RAG database"
        });

        const ragResults = await ragService.query({
          query: query.prompt,
          limit: 5,
          threshold: 0.3
        });

        integrationData.ragResults = ragResults;
        
        // Enhance context with RAG results
        const ragContext = ragResults.documents.map(doc => 
          `[${doc.source}] ${doc.title}: ${doc.content}`
        ).join('\n\n');
        
        query.context = (query.context || '') + '\n\nRelevant Documentation:\n' + ragContext;

        realTimeResponseService.addResponse({
          source: "deepseek-reasoner",
          status: "success",
          message: `Retrieved ${ragResults.documents.length} relevant documents from RAG database`
        });
      } catch (error) {
        realTimeResponseService.addResponse({
          source: "deepseek-reasoner",
          status: "error",
          message: `RAG integration failed: ${error instanceof Error ? error.message : "Unknown error"}`
        });
      }
    }

    // Step 2: A2A Coordination - Delegate subtasks if needed
    if (query.a2aEnabled) {
      try {
        realTimeResponseService.addResponse({
          source: "deepseek-reasoner",
          status: "processing",
          message: "Coordinating with A2A agents"
        });

        const delegation = await a2aService.delegateTask(
          `Reasoning support: ${query.prompt}`,
          ["reasoning-support", "context-analysis"]
        );

        if (delegation.assignedAgent) {
          const a2aMessage = await a2aService.sendMessage({
            from: "deepseek-reasoner",
            to: delegation.assignedAgent.id,
            type: "request",
            payload: {
              task: "reasoning-support",
              query: query.prompt,
              context: query.context
            }
          });

          integrationData.a2aMessages = [a2aMessage];
        }

        realTimeResponseService.addResponse({
          source: "deepseek-reasoner",
          status: "success",
          message: "A2A coordination completed successfully"
        });
      } catch (error) {
        realTimeResponseService.addResponse({
          source: "deepseek-reasoner",
          status: "error",
          message: `A2A coordination failed: ${error instanceof Error ? error.message : "Unknown error"}`
        });
      }
    }

    // Step 3: MCP Tool Integration - Use tools if needed
    if (query.mcpEnabled) {
      try {
        realTimeResponseService.addResponse({
          source: "deepseek-reasoner",
          status: "processing",
          message: "Accessing MCP tools and resources"
        });

        // Example: Use search tool if query needs web information
        if (query.prompt.toLowerCase().includes('search') || query.prompt.toLowerCase().includes('find')) {
          const searchResult = await mcpService.callTool('search_web', {
            query: query.prompt
          });
          integrationData.mcpToolCalls = [{ tool: 'search_web', result: searchResult }];
        }

        realTimeResponseService.addResponse({
          source: "deepseek-reasoner",
          status: "success",
          message: "MCP tool integration completed"
        });
      } catch (error) {
        realTimeResponseService.addResponse({
          source: "deepseek-reasoner",
          status: "error",
          message: `MCP tool integration failed: ${error instanceof Error ? error.message : "Unknown error"}`
        });
      }
    }

    // Step 4: Build conversation history
    const messages: DeepSeekMessage[] = [];
    
    // Add conversation history (excluding reasoning_content)
    if (query.conversationHistory) {
      for (const hist of query.conversationHistory) {
        messages.push({ role: "user", content: hist.userMessage });
        messages.push({ role: "assistant", content: hist.assistantMessage });
      }
    }

    // Add system context if available
    if (query.context) {
      messages.push({
        role: "system",
        content: `Context: ${query.context}`
      });
    }

    // Add current user query
    messages.push({
      role: "user",
      content: query.prompt
    });

    // Step 5: Call DeepSeek Reasoner API
    let apiResponse;
    try {
      apiResponse = await DeepSeekReasonerClient.makeReasonerCall(messages, query.maxTokens);
    } catch (error) {
      if (error instanceof Error && error.message === "NO_API_KEY") {
        realTimeResponseService.addResponse({
          source: "deepseek-reasoner",
          status: "warning",
          message: "Using simulated response due to missing API key"
        });
        apiResponse = await DeepSeekReasonerClient.simulateReasonerCall(messages, query.maxTokens);
      } else {
        throw error;
      }
    }

    const choice = apiResponse.choices[0];
    const reasoning = choice.message.reasoning_content || "No reasoning content available";
    const answer = choice.message.content;

    // Store conversation history
    const historyEntry: ConversationHistory = {
      conversationId,
      timestamp: Date.now(),
      userMessage: query.prompt,
      assistantMessage: answer,
      reasoning,
      context: query.context
    };

    if (!this.conversations.has(conversationId)) {
      this.conversations.set(conversationId, []);
    }
    this.conversations.get(conversationId)!.push(historyEntry);

    const response: ReasonerResponse = {
      answer,
      reasoning,
      conversationId,
      usage: {
        promptTokens: apiResponse.usage.prompt_tokens,
        completionTokens: apiResponse.usage.completion_tokens,
        reasoningTokens: apiResponse.usage.reasoning_tokens || 0,
        totalTokens: apiResponse.usage.total_tokens
      },
      integrationData
    };

    realTimeResponseService.addResponse({
      source: "deepseek-reasoner",
      status: "success",
      message: "DeepSeek Reasoner processing completed with full integration",
      data: {
        conversationId,
        answerLength: answer.length,
        reasoningLength: reasoning.length,
        usage: response.usage,
        integrationsUsed: {
          rag: !!integrationData.ragResults,
          a2a: !!integrationData.a2aMessages,
          mcp: !!integrationData.mcpToolCalls
        }
      }
    });

    return response;
  }

  private generateConversationId(): string {
    return `conv-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  getConversationHistory(conversationId: string): ConversationHistory[] {
    return this.conversations.get(conversationId) || [];
  }

  getAllConversations(): Map<string, ConversationHistory[]> {
    return new Map(this.conversations);
  }

  clearConversation(conversationId: string): void {
    this.conversations.delete(conversationId);
    
    realTimeResponseService.addResponse({
      source: "deepseek-reasoner",
      status: "success",
      message: `Conversation ${conversationId} cleared`,
      data: { conversationId }
    });
  }

  async healthCheck(): Promise<boolean> {
    realTimeResponseService.addResponse({
      source: "deepseek-reasoner",
      status: "processing",
      message: "Performing DeepSeek Reasoner health check"
    });

    const isHealthy = this.isInitialized && 
                     ragService.isInitialized() && 
                     a2aService.isInitialized() && 
                     mcpService.isInitialized();

    realTimeResponseService.addResponse({
      source: "deepseek-reasoner",
      status: isHealthy ? "success" : "error",
      message: `DeepSeek Reasoner health check ${isHealthy ? "passed" : "failed"}`,
      data: { 
        healthy: isHealthy,
        integrations: {
          rag: ragService.isInitialized(),
          a2a: a2aService.isInitialized(),
          mcp: mcpService.isInitialized()
        }
      }
    });

    return isHealthy;
  }
}

export const deepseekReasonerService = DeepSeekReasonerService.getInstance();
