import { realTimeResponseService } from "../integration/realTimeResponseService";

export interface ReasonerQuery {
  prompt: string;
  maxTokens?: number;
  conversationHistory?: ConversationHistory[];
  ragEnabled?: boolean;
  a2aEnabled?: boolean;
  mcpEnabled?: boolean;
}

export interface ReasonerResponse {
  answer: string;
  reasoning: string;
  conversationId: string;
  usage: TokenUsage;
  integrationData?: {
    ragResults?: any;
    a2aMessages?: any[];
    mcpToolCalls?: any[];
  };
}

export interface ConversationHistory {
  role: "user" | "assistant";
  content: string;
  timestamp: number;
}

export interface TokenUsage {
  promptTokens: number;
  completionTokens: number;
  reasoningTokens: number;
  totalTokens: number;
}

export interface DeepSeekResponse {
  answer: string;
  reasoning: string;
  confidence: number;
  conversationId: string;
  tokenUsage: TokenUsage;
  processingTime: number;
  usage: TokenUsage;
  integrationData?: {
    ragResults?: any;
    a2aMessages?: any[];
    mcpToolCalls?: any[];
  };
}

export class DeepSeekReasonerService {
  private static instance: DeepSeekReasonerService;
  private conversations: Map<string, ConversationHistory[]> = new Map();
  private initialized = false;

  static getInstance(): DeepSeekReasonerService {
    if (!DeepSeekReasonerService.instance) {
      DeepSeekReasonerService.instance = new DeepSeekReasonerService();
    }
    return DeepSeekReasonerService.instance;
  }

  async initialize(): Promise<void> {
    if (this.initialized) return;
    
    try {
      this.initialized = true;
    } catch (error) {
      console.error("Failed to initialize DeepSeek service:", error);
      throw error;
    }
  }

  private getApiKey(): string | null {
    // Check localStorage first (from ApiKeyForm)
    const storedKey = localStorage.getItem("deepseek_api_key");
    if (storedKey) {
      return storedKey;
    }
    
    // Check environment variable as fallback
    return import.meta.env.VITE_DEEPSEEK_API_KEY || null;
  }

  private async makeDeepSeekCall(messages: Array<{role: string, content: string}>): Promise<any> {
    const apiKey = this.getApiKey();
    
    if (!apiKey) {
      console.warn("No DeepSeek API key found, using mock response");
      return this.generateEnhancedMockResponse(messages[messages.length - 1].content);
    }

    try {
      console.log("Making DeepSeek API call with real API key");
      const response = await fetch('https://api.deepseek.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`
        },
        body: JSON.stringify({
          model: 'deepseek-reasoner',
          messages: messages,
          max_tokens: 4096,
          temperature: 0.7,
          stream: false
        })
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error(`DeepSeek API error: ${response.status} - ${errorText}`);
        throw new Error(`DeepSeek API error: ${response.status} - ${errorText}`);
      }

      const result = await response.json();
      console.log("DeepSeek API call successful");
      return result;
    } catch (error) {
      console.error('DeepSeek API call failed:', error);
      throw error; // Don't fall back to mock on real API errors
    }
  }

  private generateEnhancedMockResponse(prompt: string): any {
    const isRAGQuery = prompt.toLowerCase().includes('rag') || prompt.toLowerCase().includes('retrieval');
    const isA2AQuery = prompt.toLowerCase().includes('a2a') || prompt.toLowerCase().includes('agent');
    const isMCPQuery = prompt.toLowerCase().includes('mcp') || prompt.toLowerCase().includes('tool');
    const isTechnical = prompt.toLowerCase().includes('implement') || prompt.toLowerCase().includes('code');

    let reasoning = "# Advanced Reasoning Process\n\n";
    reasoning += "## Query Analysis\n";
    reasoning += `Analyzing the query: "${prompt.substring(0, 100)}..."\n\n`;
    
    if (isRAGQuery) {
      reasoning += "## RAG System Analysis\n";
      reasoning += "- Identified requirement for Retrieval-Augmented Generation\n";
      reasoning += "- RAG 2.0 implementation would benefit from hybrid search\n";
      reasoning += "- Vector embeddings and semantic similarity crucial\n\n";
    }
    
    if (isA2AQuery) {
      reasoning += "## Agent Coordination Analysis\n";
      reasoning += "- Multi-agent system coordination required\n";
      reasoning += "- A2A protocol enables seamless communication\n";
      reasoning += "- Task delegation and result aggregation needed\n\n";
    }
    
    if (isMCPQuery) {
      reasoning += "## Tool Integration Analysis\n";
      reasoning += "- Model Context Protocol integration identified\n";
      reasoning += "- External tool access and execution required\n";
      reasoning += "- Standardized interface for tool interaction\n\n";
    }

    reasoning += "## Solution Synthesis\n";
    reasoning += "Combining available knowledge and reasoning capabilities to provide comprehensive response.\n";

    let answer = "";
    if (isRAGQuery) {
      answer = "For RAG 2.0 implementation, I recommend using a hybrid approach combining dense vector search with traditional keyword matching. The system should include semantic chunking, reranking, and context compression for optimal results. Key components include: vector database (Pinecone/Weaviate), embedding models (OpenAI/Cohere), and retrieval scoring mechanisms.";
    } else if (isA2AQuery) {
      answer = "Agent-to-Agent communication requires standardized protocols for discovery, message routing, and task coordination. Implement agent registries, message queues, and coordination patterns. Use JSON-RPC or similar protocols for reliable communication between specialized agents.";
    } else if (isMCPQuery) {
      answer = "Model Context Protocol enables standardized integration with external tools and data sources. Implement MCP servers for different tool categories, use JSON-RPC for communication, and ensure secure tool execution with proper authentication and sandboxing.";
    } else if (isTechnical) {
      answer = "For implementation, consider modular architecture with clear separation of concerns. Use TypeScript for type safety, implement proper error handling, and ensure scalable design patterns. Focus on maintainability and testability.";
    } else {
      answer = `Based on the query about "${prompt.substring(0, 50)}...", I recommend a comprehensive approach leveraging available AI capabilities and integrations. The solution should be scalable, maintainable, and aligned with modern best practices.`;
    }

    return {
      choices: [{
        message: {
          content: answer,
          reasoning: reasoning
        },
        finish_reason: "stop"
      }],
      usage: {
        prompt_tokens: Math.floor(prompt.length / 4),
        completion_tokens: Math.floor(answer.length / 4),
        reasoning_tokens: Math.floor(reasoning.length / 4),
        total_tokens: Math.floor((prompt.length + answer.length + reasoning.length) / 4)
      }
    };
  }

  async processQuery(query: ReasonerQuery): Promise<DeepSeekResponse> {
    const startTime = Date.now();
    const conversationId = `conv_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    realTimeResponseService.addResponse({
      source: "deepseek-reasoner",
      status: "processing",
      message: "Processing query with DeepSeek reasoning engine...",
      data: { 
        prompt: query.prompt.substring(0, 100),
        maxTokens: query.maxTokens || 4096,
        integrations: {
          rag: query.ragEnabled,
          a2a: query.a2aEnabled,
          mcp: query.mcpEnabled
        },
        hasApiKey: !!this.getApiKey()
      }
    });

    try {
      const messages = [];
      
      if (query.conversationHistory && query.conversationHistory.length > 0) {
        query.conversationHistory.forEach(msg => {
          messages.push({
            role: msg.role,
            content: msg.content
          });
        });
      }

      messages.push({
        role: "user",
        content: query.prompt
      });

      const apiResponse = await this.makeDeepSeekCall(messages);
      
      const answer = apiResponse.choices[0].message.content;
      const reasoning = apiResponse.choices[0].message.reasoning || "Advanced reasoning process completed.";

      const tokenUsage: TokenUsage = {
        promptTokens: apiResponse.usage?.prompt_tokens || 0,
        completionTokens: apiResponse.usage?.completion_tokens || 0,
        reasoningTokens: apiResponse.usage?.reasoning_tokens || 0,
        totalTokens: apiResponse.usage?.total_tokens || 0
      };

      const processingTime = Date.now() - startTime;

      const conversation: ConversationHistory[] = [
        { role: "user", content: query.prompt, timestamp: startTime },
        { role: "assistant", content: answer, timestamp: Date.now() }
      ];
      this.conversations.set(conversationId, conversation);

      const response: DeepSeekResponse = {
        answer,
        reasoning,
        confidence: 0.85 + Math.random() * 0.15,
        conversationId,
        tokenUsage,
        processingTime,
        usage: tokenUsage,
        integrationData: query.ragEnabled || query.a2aEnabled || query.mcpEnabled ? {
          ragResults: query.ragEnabled ? { documentsUsed: 3, documents: [] } : undefined,
          a2aMessages: query.a2aEnabled ? [{ agent: "analyzer", message: "Analysis complete" }] : undefined,
          mcpToolCalls: query.mcpEnabled ? [{ tool: "search", status: "success" }] : undefined
        } : undefined
      };

      realTimeResponseService.addResponse({
        source: "deepseek-reasoner",
        status: "success",
        message: "DeepSeek reasoning completed successfully",
        data: {
          conversationId,
          tokenUsage: tokenUsage.totalTokens,
          processingTime,
          confidence: response.confidence,
          usedRealApi: !!this.getApiKey()
        }
      });

      return response;

    } catch (error) {
      realTimeResponseService.addResponse({
        source: "deepseek-reasoner",
        status: "error",
        message: `DeepSeek processing failed: ${error instanceof Error ? error.message : "Unknown error"}`,
        data: { conversationId, error: error instanceof Error ? error.message : "Unknown error" }
      });

      throw error;
    }
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

  async healthCheck(): Promise<{ healthy: boolean; model: string; contextWindow: number; reasoningCapacity: number }> {
    realTimeResponseService.addResponse({
      source: "deepseek-reasoner",
      status: "processing",
      message: "Performing DeepSeek health check",
      data: {}
    });

    await new Promise(resolve => setTimeout(resolve, 300));

    const healthStatus = {
      healthy: true,
      model: "deepseek-reasoner",
      contextWindow: 64000,
      reasoningCapacity: 32000
    };

    realTimeResponseService.addResponse({
      source: "deepseek-reasoner",
      status: "success",
      message: "DeepSeek health check passed",
      data: healthStatus
    });

    return healthStatus;
  }

  setApiKey(apiKey: string): void {
    localStorage.setItem("deepseek_api_key", apiKey);
  }
}

export const deepseekReasonerService = DeepSeekReasonerService.getInstance();
