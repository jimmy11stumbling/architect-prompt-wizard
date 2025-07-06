
export interface ReasonerQuery {
  prompt: string;
  maxTokens?: number;
  conversationHistory?: ConversationHistory[];
  ragEnabled?: boolean;
  a2aEnabled?: boolean;
  mcpEnabled?: boolean;
  useAttachedAssets?: boolean;
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
    attachedAssets?: {
      count: number;
      used: string[];
    };
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
    attachedAssets?: {
      count: number;
      used: string[];
    };
  };
}
