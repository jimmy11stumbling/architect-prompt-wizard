// DeepSeek Reasoner Types
export interface DeepSeekMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

export interface DeepSeekRequest {
  messages: DeepSeekMessage[];
  maxTokens?: number;
  temperature?: number;
  ragEnabled?: boolean;
  mcpEnabled?: boolean;
  a2aEnabled?: boolean;
}

export interface DeepSeekResponse {
  reasoning: string;
  response: string;
  usage: {
    promptTokens: number;
    completionTokens: number;
    reasoningTokens: number;
    totalTokens: number;
  };
  processingTime: number;
  contextEnhancements?: string[];
  conversationId: string;
}

export interface DeepSeekApiResponse {
  choices: [{
    message: {
      content: string;
      reasoning_content: string;
    };
    finish_reason: string;
  }];
  usage: {
    prompt_tokens: number;
    completion_tokens: number;
    reasoning_tokens: number;
    total_tokens: number;
  };
}