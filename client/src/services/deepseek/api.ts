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
        ragContext: request.ragEnabled
      }),
    });

    if (!response.ok) {
      throw new Error(`API request failed: ${response.status}`);
    }

    const data: DeepSeekApiResponse = await response.json();

    return {
      reasoning: data.choices[0]?.message?.reasoning_content || '',
      response: data.choices[0]?.message?.content || '',
      usage: data.usage || {
        promptTokens: 0,
        completionTokens: 0,
        totalTokens: 0,
        reasoningTokens: 0
      },
      processingTime: data.processingTime || 0
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

      const response = await fetch(`${this.BASE_URL}/stream`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          messages: request.messages,
          maxTokens: request.maxTokens,
          temperature: request.temperature,
          ragContext: request.ragEnabled
        }),
      });

      if (!response.ok) {
        throw new Error(`Stream request failed: ${response.status}`);
      }

      const reader = response.body?.getReader();
      if (!reader) {
        throw new Error('No response body stream available');
      }

      const decoder = new TextDecoder();
      let buffer = '';
      let fullReasoning = '';
      let fullResponse = '';
      let usage = {
        promptTokens: 0,
        completionTokens: 0,
        totalTokens: 0,
        reasoningTokens: 0
      };
      let processingTime = 0;

      try {
        while (true) {
          const { done, value } = await reader.read();

          if (done) {
            console.log('Stream complete');
            break;
          }

          buffer += decoder.decode(value, { stream: true });
          const lines = buffer.split('\n');
          buffer = lines.pop() || '';

          for (const line of lines) {
            const trimmed = line.trim();
            if (!trimmed || !trimmed.startsWith('data: ')) continue;

            const dataStr = trimmed.slice(6);
            if (dataStr === '[DONE]') {
              console.log('Stream finished with [DONE]');
              onComplete({
                reasoning: fullReasoning,
                response: fullResponse,
                usage,
                processingTime
              });
              return;
            }

            try {
              const data = JSON.parse(dataStr);
              console.log('Received streaming data:', data);

              if (data.error) {
                throw new Error(data.error);
              }

              if (data.choices && data.choices[0]) {
                const choice = data.choices[0];
                const delta = choice.delta;

                if (delta) {
                  // Handle reasoning content streaming
                  if (delta.reasoning_content) {
                    console.log('Reasoning token:', delta.reasoning_content);
                    fullReasoning += delta.reasoning_content;
                    onReasoningToken(delta.reasoning_content);
                  }

                  // Handle response content streaming
                  if (delta.content) {
                    console.log('Response token:', delta.content);
                    fullResponse += delta.content;
                    onResponseToken(delta.content);
                  }
                }
              }

              // Update usage stats if available
              if (data.usage) {
                usage = data.usage;
              }

              // Update processing time if available
              if (data.processingTime) {
                processingTime = data.processingTime;
              }

            } catch (parseError) {
              console.warn('Failed to parse streaming data:', parseError, 'Raw data:', dataStr);
            }
          }
        }

        // If we reach here without [DONE], complete anyway
        onComplete({
          reasoning: fullReasoning,
          response: fullResponse,
          usage,
          processingTime
        });

      } finally {
        reader.releaseLock();
      }
    } catch (error) {
      console.error('Streaming error:', error);
      onError(error instanceof Error ? error : new Error('Unknown streaming error'));
    }
  }
}