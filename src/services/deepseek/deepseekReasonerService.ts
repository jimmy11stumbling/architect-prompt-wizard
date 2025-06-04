
import { DeepSeekClient } from "../ipa/api/deepseekClient";
import { DeepSeekMessage } from "@/types/ipa-types";

export interface ReasonerQuery {
  prompt: string;
  context?: string;
  maxTokens?: number;
  conversationHistory?: DeepSeekMessage[];
}

export interface ReasonerResponse {
  reasoning: string;
  answer: string;
  usage: {
    promptTokens: number;
    completionTokens: number;
    reasoningTokens?: number;
    totalTokens: number;
  };
  conversationId: string;
}

export class DeepSeekReasonerService {
  private static instance: DeepSeekReasonerService;
  private conversationHistory: Map<string, DeepSeekMessage[]> = new Map();

  static getInstance(): DeepSeekReasonerService {
    if (!DeepSeekReasonerService.instance) {
      DeepSeekReasonerService.instance = new DeepSeekReasonerService();
    }
    return DeepSeekReasonerService.instance;
  }

  async processQuery(query: ReasonerQuery): Promise<ReasonerResponse> {
    const conversationId = query.conversationHistory ? 
      this.getConversationId(query.conversationHistory) : 
      this.generateConversationId();

    // Build messages array for deepseek-reasoner
    let messages: DeepSeekMessage[] = [];
    
    if (query.conversationHistory && query.conversationHistory.length > 0) {
      // Clean previous messages (remove reasoning_content to avoid 400 error)
      messages = DeepSeekClient.cleanMessagesForNextRound(query.conversationHistory);
    }

    // Add current query
    if (query.context) {
      messages.push({
        role: "system",
        content: `Context: ${query.context}`
      });
    }

    messages.push({
      role: "user",
      content: query.prompt
    });

    const requestBody = {
      model: "deepseek-reasoner",
      messages: messages,
      max_tokens: query.maxTokens || 4096
    };

    const response = await DeepSeekClient.makeReasonerCall(requestBody);

    // Store conversation history
    const newMessage: DeepSeekMessage = {
      role: "assistant",
      content: response.content,
      reasoning_content: response.reasoning_content
    };

    const updatedHistory = [...messages, newMessage];
    this.conversationHistory.set(conversationId, updatedHistory);

    return {
      reasoning: response.reasoning_content || "",
      answer: response.content,
      usage: response.usage || {
        promptTokens: 0,
        completionTokens: 0,
        totalTokens: 0
      },
      conversationId
    };
  }

  getConversationHistory(conversationId: string): DeepSeekMessage[] {
    return this.conversationHistory.get(conversationId) || [];
  }

  clearConversation(conversationId: string): void {
    this.conversationHistory.delete(conversationId);
  }

  private generateConversationId(): string {
    return `conv-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  private getConversationId(history: DeepSeekMessage[]): string {
    return `conv-${history.length}-${Date.now()}`;
  }
}

export const deepseekReasonerService = DeepSeekReasonerService.getInstance();
