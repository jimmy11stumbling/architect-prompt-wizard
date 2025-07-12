// DeepSeek API Service
import { DeepSeekRequest, DeepSeekResponse, DeepSeekApiResponse } from './types';

export class DeepSeekApi {
  private static readonly API_ENDPOINT = '/api/deepseek/query';
  private static readonly TIMEOUT = 60000; // 60 seconds for DeepSeek reasoning

  static async query(request: DeepSeekRequest): Promise<DeepSeekResponse> {
    const startTime = Date.now();
    const conversationId = this.generateConversationId();

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), this.TIMEOUT);

      const response = await fetch(this.API_ENDPOINT, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          messages: request.messages,
          ragContext: request.ragEnabled || false
        }),
        signal: controller.signal
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`DeepSeek API error: ${response.status} - ${errorText}`);
      }

      const apiResponse: DeepSeekApiResponse = await response.json();
      return this.processResponse(apiResponse, conversationId, Date.now() - startTime);

    } catch (error) {
      if (error.name === 'AbortError') {
        throw new Error('DeepSeek API request timed out after 60 seconds');
      }
      if (error.message?.includes('signal is aborted')) {
        throw new Error('DeepSeek API request was cancelled');
      }
      throw new Error(`DeepSeek API error: ${error.message || 'Unknown error'}`);
    }
  }

  private static processResponse(
    apiResponse: DeepSeekApiResponse,
    conversationId: string,
    processingTime: number
  ): DeepSeekResponse {
    const message = apiResponse.choices[0].message;
    
    // Extract reasoning and response from API response
    let reasoning = message.reasoning_content || '';
    let response = message.content || '';
    
    // Handle cases where response might be in reasoning field
    if (!response && reasoning) {
      response = reasoning;
      reasoning = 'DeepSeek reasoning process completed.';
    }
    
    // Ensure we have meaningful content
    if (!response) {
      response = 'No response received from DeepSeek API';
    }
    if (!reasoning) {
      reasoning = 'No reasoning provided by DeepSeek API';
    }

    return {
      reasoning: reasoning.trim(),
      response: response.trim(),
      usage: {
        promptTokens: apiResponse.usage.prompt_tokens,
        completionTokens: apiResponse.usage.completion_tokens,
        reasoningTokens: apiResponse.usage.reasoning_tokens,
        totalTokens: apiResponse.usage.total_tokens
      },
      processingTime,
      conversationId
    };
  }

  private static generateConversationId(): string {
    return `deepseek-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }
}