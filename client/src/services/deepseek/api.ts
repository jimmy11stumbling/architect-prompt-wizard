// DeepSeek API Service
import { DeepSeekRequest, DeepSeekResponse, DeepSeekApiResponse } from './types';

export class DeepSeekApi {
  private static readonly API_ENDPOINT = '/api/deepseek/query';
  private static readonly STREAM_ENDPOINT = '/api/deepseek/stream';
  private static readonly TIMEOUT = 60000; // 60 seconds for DeepSeek reasoning

  static async streamQuery(
    request: DeepSeekRequest,
    onReasoningToken: (token: string) => void,
    onResponseToken: (token: string) => void,
    onComplete: (response: DeepSeekResponse) => void,
    onError: (error: Error) => void
  ): Promise<void> {
    const startTime = Date.now();
    const conversationId = this.generateConversationId();

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), this.TIMEOUT);

      const response = await fetch(this.STREAM_ENDPOINT, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          messages: request.messages,
          ragContext: request.ragEnabled || false,
          temperature: request.temperature || 0.1
        }),
        signal: controller.signal
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`DeepSeek API error: ${response.status} - ${errorText}`);
      }

      if (!response.body) {
        throw new Error('No response stream available');
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder('utf-8');
      let buffer = '';
      let reasoning = '';
      let responseText = '';
      let usage = { promptTokens: 0, completionTokens: 0, reasoningTokens: 0, totalTokens: 0 };
      let isInReasoning = true;

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        
        // Keep the last incomplete line in the buffer
        buffer = lines.pop() || '';

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const data = line.slice(6).trim();
            
            if (data === '[DONE]') {
              const finalResponse: DeepSeekResponse = {
                reasoning: reasoning.trim(),
                response: responseText.trim(),
                usage,
                processingTime: Date.now() - startTime,
                conversationId
              };
              onComplete(finalResponse);
              return;
            }

            try {
              const parsed = JSON.parse(data);
              
              // Handle reasoning tokens
              if (parsed.choices?.[0]?.delta?.reasoning_content) {
                const token = parsed.choices[0].delta.reasoning_content;
                reasoning += token;
                onReasoningToken(token);
              }
              
              // Handle response tokens
              if (parsed.choices?.[0]?.delta?.content) {
                const token = parsed.choices[0].delta.content;
                responseText += token;
                onResponseToken(token);
                isInReasoning = false;
              }

              // Update usage if available
              if (parsed.usage) {
                usage = {
                  promptTokens: parsed.usage.prompt_tokens || 0,
                  completionTokens: parsed.usage.completion_tokens || 0,
                  reasoningTokens: parsed.usage.reasoning_tokens || 0,
                  totalTokens: parsed.usage.total_tokens || 0
                };
              }

            } catch (parseError) {
              console.warn('Failed to parse streaming data:', parseError);
            }
          }
        }
      }

    } catch (error) {
      if (error.name === 'AbortError') {
        onError(new Error('DeepSeek API request timed out after 60 seconds'));
      } else if (error.message?.includes('signal is aborted')) {
        onError(new Error('DeepSeek API request was cancelled'));
      } else {
        onError(new Error(`DeepSeek API error: ${error.message || 'Unknown error'}`));
      }
    }
  }

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