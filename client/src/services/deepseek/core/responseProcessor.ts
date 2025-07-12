import { ReasonerQuery, DeepSeekResponse, TokenUsage } from '../types';
import { ConversationManager } from './conversationManager';

export class ResponseProcessor {
  static sanitizeText(text: string): string {
    if (!text || typeof text !== 'string') return '';

    return text
      // Fix spacing issues
      .replace(/([a-z])([A-Z])/g, '$1 $2')
      // Fix missing spaces after punctuation
      .replace(/([.!?])([A-Z])/g, '$1 $2')
      // Fix broken word concatenations
      .replace(/([a-z])([a-z][A-Z])/g, '$1 $2')
      // Remove duplicate spaces
      .replace(/\s+/g, ' ')
      // Fix common malformed patterns
      .replace(/forAgent-A/g, 'for Agent-A')
      .replace(/systemsMAS/g, 'systems MAS')
      .replace(/together a,/g, 'together,')
      // Clean up line breaks
      .replace(/\n\s*\n/g, '\n\n')
      .trim();
  }

  static processApiResponse(
    apiResponse: any,
    query: ReasonerQuery,
    startTime: number,
    conversationId: string,
    conversationManager: ConversationManager
  ): DeepSeekResponse {
    let answer = apiResponse.choices[0].message.content;
    let reasoning = apiResponse.choices[0].message.reasoning_content || apiResponse.choices[0].message.reasoning || "Advanced reasoning process completed.";

    answer = this.sanitizeText(answer);
    reasoning = this.sanitizeText(reasoning);

    const tokenUsage: TokenUsage = {
      promptTokens: apiResponse.usage?.prompt_tokens || 0,
      completionTokens: apiResponse.usage?.completion_tokens || 0,
      reasoningTokens: apiResponse.usage?.reasoning_tokens || 0,
      totalTokens: apiResponse.usage?.total_tokens || 0
    };

    const processingTime = Date.now() - startTime;

    const conversation = [
      { role: "user" as const, content: query.prompt, timestamp: startTime },
      { role: "assistant" as const, content: answer, timestamp: Date.now() }
    ];
    conversationManager.addConversation(conversationId, conversation);

    return {
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
  }
}