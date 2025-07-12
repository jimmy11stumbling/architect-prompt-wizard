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
      console.log('🚀 Starting DeepSeek streaming request...');

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
        console.warn(`⚠️ DeepSeek API failed: ${response.status} - ${errorText}`);
        
        // If authentication fails, automatically fall back to demo streaming
        if (response.status === 401 || errorText.includes('Authentication Fails') || errorText.includes('governor')) {
          console.log('🎬 Authentication failed, automatically switching to demo streaming...');
          
          // Import and call demo streaming directly with proper callbacks
          const { DeepSeekService } = await import('./service');
          
          // Start demo streaming with the same callbacks
          await this.startDemoStreaming(
            request.messages[request.messages.length - 1]?.content || 'Demo query',
            onReasoningToken,
            onResponseToken,
            onComplete,
            onError
          );
          return;
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

  // Demo streaming method with proper token-by-token simulation
  static async startDemoStreaming(
    query: string,
    onReasoningToken: (token: string) => void,
    onResponseToken: (token: string) => void,
    onComplete: (response: DeepSeekResponse) => void,
    onError: (error: Error) => void
  ): Promise<void> {
    try {
      console.log('🎬 Starting demo token-by-token streaming...');
      
      // Simulate reasoning phase
      const reasoningText = `Let me think about "${query}"...\n\nFirst, I need to understand what the user is asking for. This appears to be a question about streaming functionality.\n\nThe key components involved are:\n1. Real-time token streaming\n2. Visual feedback systems\n3. Authentication handling\n4. Demo mode capabilities\n\nBased on this analysis, I should provide a comprehensive response that addresses the streaming visualization features.`;
      
      const reasoningTokens = reasoningText.split('');
      
      // Stream reasoning tokens
      for (let i = 0; i < reasoningTokens.length; i++) {
        onReasoningToken(reasoningTokens[i]);
        await new Promise(resolve => setTimeout(resolve, 20)); // 50 tokens/second
      }
      
      // Small pause between reasoning and response
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Simulate response phase  
      const responseText = `The StreamingInterface component is specifically designed for **real-time token-by-token streaming visualization** of DeepSeek Reasoner responses.

**Key Features:**
🔥 **Live Token Streaming** - Shows each token as it arrives
📊 **Real-time Metrics** - Tokens per second, elapsed time, progress bars
🧠 **Reasoning Visualization** - Displays the AI's thinking process in real-time
✨ **Visual Feedback** - Animated indicators, blinking cursors, status updates
⚡ **Streaming Controls** - Pause, resume, stop functionality

**Current Issue:** The authentication is failing ("governor" error), so the component automatically falls back to this demo mode to showcase the visual capabilities.

**What You're Seeing Now:** This is the demo streaming in action - each character appearing with realistic timing to simulate the actual DeepSeek API streaming behavior.

Once the API authentication is fixed, you'll get the same visual experience but with real DeepSeek reasoning and responses!`;

      const responseTokens = responseText.split('');
      
      // Stream response tokens
      for (let i = 0; i < responseTokens.length; i++) {
        onResponseToken(responseTokens[i]);
        await new Promise(resolve => setTimeout(resolve, 25)); // 40 tokens/second
      }
      
      // Complete the streaming
      onComplete({
        reasoning: reasoningText,
        response: responseText,
        usage: {
          promptTokens: query.length,
          completionTokens: responseText.length,
          totalTokens: query.length + responseText.length,
          reasoningTokens: reasoningText.length
        },
        processingTime: 8000
      });
      
      console.log('✅ Demo streaming completed successfully!');
      
    } catch (error) {
      console.error('❌ Demo streaming error:', error);
      onError(error instanceof Error ? error : new Error('Demo streaming failed'));
    }
  }
}