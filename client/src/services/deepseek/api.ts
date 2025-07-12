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
        const errorText = await response.text();
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
                console.log('Received streaming data:', parsed);

                if (parsed.error) {
                  throw new Error(parsed.error);
                }

                if (parsed.choices && parsed.choices[0]) {
                  const choice = parsed.choices[0];
                  const delta = choice.delta;

                  if (delta) {
                    // Handle reasoning content for deepseek-reasoner
                    if (delta.reasoning_content) {
                      const reasoningToken = delta.reasoning_content;
                      fullReasoning += reasoningToken;
                      onReasoningToken(reasoningToken);
                    }
                    
                    // Handle response content for deepseek-chat
                    if (delta.content) {
                      const responseToken = delta.content;
                      fullResponse += responseToken;
                      onResponseToken(responseToken);
                    }
                  }
                }
                
                // Update usage statistics if available
                if (parsed.usage) {
                  usage = parsed.usage;
                }
              } catch (parseError) {
                console.warn('JSON parse error:', parseError);
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