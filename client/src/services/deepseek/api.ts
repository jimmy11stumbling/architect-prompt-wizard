// DeepSeek API Client
import { DeepSeekRequest, DeepSeekResponse, DeepSeekApiResponse } from './types';

export class DeepSeekApi {
  private static readonly BASE_URL = '/api/deepseek';

  static async query(request: DeepSeekRequest): Promise<DeepSeekResponse> {
    const response = await fetch(`${this.BASE_URL}/query`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        messages: request.messages,
        maxTokens: request.maxTokens,
        temperature: request.temperature,
        ragContext: request.ragEnabled,
        mcpEnabled: request.mcpEnabled,
        a2aEnabled: request.a2aEnabled
      }),
    });

    if (!response.ok) {
      throw new Error(`API request failed: ${response.status}`);
    }

    const data: DeepSeekApiResponse = await response.json();

    return {
      reasoning: data.choices[0]?.message?.reasoning_content || '',
      response: data.choices[0]?.message?.content || '',
      usage: {
        promptTokens: data.usage?.prompt_tokens || 0,
        completionTokens: data.usage?.completion_tokens || 0,
        totalTokens: data.usage?.total_tokens || 0,
        reasoningTokens: data.usage?.reasoning_tokens || 0
      },
      processingTime: data.processingTime || 0,
      contextEnhancements: data.contextEnhancements || []
    };
  }

  static async streamQuery(
    request: DeepSeekRequest,
    onReasoningToken: (token: string) => void,
    onResponseToken: (token: string) => void,
    onComplete: (response: DeepSeekResponse) => void,
    onError: (error: Error) => void
  ): Promise<void> {
    try {
      console.log('Starting DeepSeek streaming request...');

      const response = await fetch('/api/deepseek/stream', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          messages: request.messages,
          ragContext: request.ragEnabled,
          stream: true,
          maxTokens: request.maxTokens || 32768
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        if (response.status === 400 && errorText.includes('API key not configured')) {
          throw new Error('DeepSeek API key is not configured. Please add your API key in the settings.');
        }
        throw new Error(`Stream request failed: ${response.status} - ${errorText}`);
      }

      const reader = response.body?.getReader();
      if (!reader) {
        throw new Error('No response body stream available');
      }

      const decoder = new TextDecoder('utf-8');
      let buffer = '';
      let fullReasoning = '';
      let fullResponse = '';
      let usage = {
        promptTokens: 0,
        completionTokens: 0,
        totalTokens: 0,
        reasoningTokens: 0
      };
      let processingTime = Date.now();
      let startTime = Date.now();

      try {
        while (true) {
          const { done, value } = await reader.read();

          if (done) {
            console.log('Stream complete');
            break;
          }

          buffer += decoder.decode(value, { stream: true });
          const parts = buffer.split('\n\n');

          for (let i = 0; i < parts.length - 1; i++) {
            const part = parts[i].trim();
            if (part.startsWith('data:')) {
              const jsonStr = part.slice(5).trim();
              if (jsonStr === '[DONE]') {
                console.log('Stream finished with [DONE]');
                onComplete({
                  reasoning: fullReasoning,
                  response: fullResponse,
                  usage,
                  processingTime: Date.now() - processingTime
                });
                return;
              }

              try {
                const parsed = JSON.parse(jsonStr);

              // Handle reasoning content (Chain of Thought) - display immediately
              if (parsed.type === 'reasoning' && parsed.content) {
                console.log('🧠 Received reasoning token:', parsed.content.substring(0, 30));
                fullReasoning += parsed.content;
                onReasoningToken(parsed.content);
              }

              // Handle final response content - display after reasoning
              else if (parsed.type === 'response' && parsed.content) {
                console.log('💬 Received response token:', parsed.content.substring(0, 30));
                fullResponse += parsed.content;
                onResponseToken(parsed.content);
              }

              // Handle completion with final stats
              else if (parsed.type === 'complete') {
                console.log('✅ Stream complete with usage:', parsed.usage);
                onComplete({
                  reasoning: fullReasoning,
                  response: fullResponse,
                  usage: {
                    promptTokens: parsed.usage?.prompt_tokens || 0,
                    completionTokens: parsed.usage?.completion_tokens || 0,
                    totalTokens: parsed.usage?.total_tokens || 0,
                    reasoningTokens: parsed.usage?.reasoning_tokens || 0
                  },
                  processingTime: Date.now() - startTime
                });
                return;
              }

            } catch (parseError) {
              console.warn('DeepSeek JSON parse error:', parseError);
            }
            }
          }

          buffer = parts[parts.length - 1];
        }
      } catch (streamError) {
        console.error('Stream reading error:', streamError);
        throw streamError;
      }
    } catch (error) {
      console.error('Streaming error:', error);
      onError(error instanceof Error ? error : new Error('Streaming failed'));
    }
  }
}