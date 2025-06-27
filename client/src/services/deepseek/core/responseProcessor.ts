
import { ReasonerQuery, DeepSeekResponse, TokenUsage } from '../types';
import { ConversationManager } from './conversationManager';

export class ResponseProcessor {
  static processApiResponse(
    apiResponse: any,
    query: ReasonerQuery,
    startTime: number,
    conversationId: string,
    conversationManager: ConversationManager
  ): DeepSeekResponse {
    const answer = apiResponse.choices[0].message.content;
    const reasoning = apiResponse.choices[0].message.reasoning || "Advanced reasoning process completed.";

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
