// DeepSeek Service - Business Logic
import { DeepSeekApi } from './api';
import { useDeepSeekStore } from './store';
import { DeepSeekRequest, DeepSeekMessage } from './types';

class DeepSeekService {
  private static instance: DeepSeekService;
  private apiKey: string | null = null;
  private thinkingTimer: NodeJS.Timeout | null = null;

  private constructor() {}

  static getInstance(): DeepSeekService {
    if (!DeepSeekService.instance) {
      DeepSeekService.instance = new DeepSeekService();
    }
    return DeepSeekService.instance;
  }

  static startThinkingAnimation() {
    console.log('🧠 Starting immediate thinking animation...');

    // Start with immediate "connecting" feedback
    const { addReasoningToken } = useDeepSeekStore.getState();
    addReasoningToken('🔄 Connecting to DeepSeek AI...\n');

    // Add progressive thinking dots
    let dots = '';
    const thinkingInterval = setInterval(() => {
      dots += '.';
      if (dots.length > 3) dots = '';

      // Only show thinking if no real tokens have arrived
      const state = useDeepSeekStore.getState();
      if (state.streamingReasoning.length < 50) {
        addReasoningToken(`\n🧠 AI is thinking${dots}`);
      } else {
        clearInterval(thinkingInterval);
      }
    }, 500);

    // Clear after 15 seconds regardless
    setTimeout(() => clearInterval(thinkingInterval), 15000);
  }

  static async processQueryStreaming(
    query: string,
    options: { ragEnabled?: boolean; temperature?: number; mcpEnabled?: boolean; model?: 'deepseek-chat' | 'deepseek-reasoner' } = {}
  ): Promise<void> {
    const store = useDeepSeekStore.getState();

    try {
      // Set loading state
      store.setLoading(true);
      store.setStreaming(true);
      store.setError(null);
      store.clearStreamingContent();

      // Start immediate thinking animation
      DeepSeekService.startThinkingAnimation();

      // Enhanced query with RAG context if enabled
      let enhancedQuery = query;

      if (options.ragEnabled) {
        try {
          // Import ragService dynamically to avoid circular dependencies
          const { ragService } = await import('@/services/rag/ragService');
          const ragResults = await ragService.searchRAG2(query, {
            limit: 10,
            rerankingEnabled: true,
            hybridWeight: { semantic: 0.7, keyword: 0.3 }
          });

          if (ragResults.results.length > 0) {
            const contextChunks = ragResults.results.slice(0, 5).map(result => 
              `[${result.category}] ${result.title}: ${result.content.substring(0, 500)}...`
            ).join('\n\n');

            enhancedQuery = `Context from RAG 2.0 Database (${ragResults.totalResults} documents found):\n\n${contextChunks}\n\n---\n\nUser Question: ${query}`;
          }
        } catch (ragError) {
          console.warn('RAG context retrieval failed:', ragError);
          // Continue with original query if RAG fails
        }
      }

      // Add MCP context if enabled
      if (options.mcpEnabled) {
        try {
          const { mcpHubService } = await import('@/services/mcp/mcpHubService');
          const mcpContext = await mcpHubService.getContextForPrompt(query, 3);

          if (mcpContext && !mcpContext.includes('No relevant')) {
            enhancedQuery = `${mcpContext}\n\n---\n\n${enhancedQuery}`;
          }
        } catch (mcpError) {
          console.warn('MCP context retrieval failed:', mcpError);
          // Continue without MCP context if it fails
        }
      }

      // Add user message to conversation
      const userMessage: DeepSeekMessage = {
        role: 'user',
        content: enhancedQuery
      };
      store.addMessage(userMessage);

      // Prepare request
      const request: DeepSeekRequest = {
        messages: [...store.conversation, userMessage],
        maxTokens: 8192,
        temperature: options.temperature || 0.1,
        ragEnabled: options.ragEnabled || false
      };

      // Use different streaming methods based on model
      if (options.model === 'deepseek-chat') {
        // For deepseek-chat, use direct token streaming
        await DeepSeekApi.streamChatResponse(
          [...store.conversation, userMessage],
          (token: string) => {
            store.appendStreamingResponse(token);
          },
          options.model
        );

        // Complete the response
        const finalResponse = {
          reasoning: '',
          response: store.streamingResponse,
          usage: {
            promptTokens: enhancedQuery.length,
            completionTokens: store.streamingResponse.length,
            totalTokens: enhancedQuery.length + store.streamingResponse.length,
            reasoningTokens: 0
          },
          processingTime: Date.now() - Date.now()
        };

        const assistantMessage: DeepSeekMessage = {
          role: 'assistant',
          content: finalResponse.response
        };
        store.addMessage(assistantMessage);
        store.setResponse(finalResponse);
        store.setStreaming(false);
      } else {
        // For deepseek-reasoner, use the existing streaming method
        await DeepSeekApi.streamQuery(
          request,
          (reasoningToken: string) => {
            store.appendStreamingReasoning(reasoningToken);
          },
          (responseToken: string) => {
            store.appendStreamingResponse(responseToken);
          },
          (finalResponse) => {
            // Add assistant message to conversation
            const assistantMessage: DeepSeekMessage = {
              role: 'assistant',
              content: finalResponse.response
            };
            store.addMessage(assistantMessage);
            store.setResponse(finalResponse);
            store.setStreaming(false);
          },
          (error) => {
            store.setError(error.message);
            store.setStreaming(false);
          }
        );
      }

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      store.setError(errorMessage);
      store.setStreaming(false);
      console.error('DeepSeek streaming query failed:', error);
    }
  }

  static stopStreaming(): void {
    const store = useDeepSeekStore.getState();
    store.setStreaming(false);
    store.setError(null);
    console.log('DeepSeek streaming stopped by user');
  }

  static pauseStreaming(): void {
    // TODO: Implement actual pause logic
    console.log('DeepSeek streaming paused (not yet implemented)');
  }

  static resumeStreaming(): void {
    // TODO: Implement actual resume logic
    console.log('DeepSeek streaming resumed (not yet implemented)');
  }

  static async processQuery(
    query: string,
    options: { ragEnabled?: boolean; temperature?: number; mcpEnabled?: boolean } = {}
  ): Promise<void> {
    const store = useDeepSeekStore.getState();

    try {
      // Set loading state
      store.setLoading(true);
      store.setError(null);

      // Enhanced query with RAG context if enabled
      let enhancedQuery = query;

      if (options.ragEnabled) {
        try {
          // Import ragService dynamically to avoid circular dependencies
          const { ragService } = await import('@/services/rag/ragService');
          const ragResults = await ragService.searchRAG2(query, {
            limit: 10,
            rerankingEnabled: true,
            hybridWeight: { semantic: 0.7, keyword: 0.3 }
          });

          if (ragResults.results.length > 0) {
            const contextChunks = ragResults.results.slice(0, 5).map(result => 
              `[${result.category}] ${result.title}: ${result.content.substring(0, 500)}...`
            ).join('\n\n');

            enhancedQuery = `Context from RAG 2.0 Database (${ragResults.totalResults} documents found):\n\n${contextChunks}\n\n---\n\nUser Question: ${query}`;
          }
        } catch (ragError) {
          console.warn('RAG context retrieval failed:', ragError);
          // Continue with original query if RAG fails
        }
      }

      // Add MCP context if enabled
      if (options.mcpEnabled) {
        try {
          const { mcpHubService } = await import('@/services/mcp/mcpHubService');
          const mcpContext = await mcpHubService.getContextForPrompt(query, 3);

          if (mcpContext && !mcpContext.includes('No relevant')) {
            enhancedQuery = `${mcpContext}\n\n---\n\n${enhancedQuery}`;
          }
        } catch (mcpError) {
          console.warn('MCP context retrieval failed:', mcpError);
          // Continue without MCP context if it fails
        }
      }

      // Add user message to conversation
      const userMessage: DeepSeekMessage = {
        role: 'user',
        content: enhancedQuery
      };
      store.addMessage(userMessage);

      // Prepare request
      const request: DeepSeekRequest = {
        messages: [...store.conversation, userMessage],
        maxTokens: 8192, // Increased for larger context
        temperature: options.temperature || 0.1,
        ragEnabled: options.ragEnabled || false
      };

      // Make API call
      const response = await DeepSeekApi.query(request);

      // Add assistant message to conversation
      const assistantMessage: DeepSeekMessage = {
        role: 'assistant',
        content: response.response
      };
      store.addMessage(assistantMessage);

      // Update store with response
      store.setResponse(response);

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      store.setError(errorMessage);
      console.error('DeepSeek query failed:', error);

      // Don't re-throw - let the store handle the error state
    }
  }

  static async checkHealth(): Promise<boolean> {
    try {
      const response = await fetch('/api/deepseek/check-api-key');
      const data = await response.json();
      return data.hasApiKey;
    } catch (error) {
      console.error('Health check failed:', error);
      return false;
    }
  }

  static async processDemoStreaming(query: string): Promise<void> {
    const store = useDeepSeekStore.getState();

    store.setLoading(true);
    store.setStreaming(true);
    store.setError(null);
    store.clearStreamingContent();

    const messages = [
      { role: 'user', content: query }
    ];

    try {
      console.log('Starting demo streaming...');

      const response = await fetch('/api/deepseek/demo-stream', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ messages }),
      });

      if (!response.ok) {
        throw new Error(`Demo stream failed: ${response.status}`);
      }

      const reader = response.body?.getReader();
      if (!reader) {
        throw new Error('No demo stream available');
      }

      const decoder = new TextDecoder('utf-8');
      let buffer = '';
      let fullResponse = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const parts = buffer.split('\n\n');

        for (let i = 0; i < parts.length - 1; i++) {
          const part = parts[i].trim();
          if (part.startsWith('data:')) {
            const jsonStr = part.slice(5).trim();
            if (jsonStr === '[DONE]') {
              const finalResponse = {
                reasoning: '',
                response: fullResponse,
                usage: {
                  promptTokens: 45,
                  completionTokens: fullResponse.split(' ').length,
                  totalTokens: 45 + fullResponse.split(' ').length,
                  reasoningTokens: 0
                },
                processingTime: 3000
              };

              // Add messages to conversation
              const userMessage = { role: 'user', content: query };
              const assistantMessage = { role: 'assistant', content: fullResponse };
              store.addMessage(userMessage);
              store.addMessage(assistantMessage);

              store.setResponse(finalResponse);
              store.setStreaming(false);
              store.setLoading(false);
              return;
            }

            try {
              const parsed = JSON.parse(jsonStr);
              if (parsed.choices?.[0]?.delta?.content) {
                const token = parsed.choices[0].delta.content;
                fullResponse += token;
                store.appendStreamingResponse(token);
              }
            } catch (parseError) {
              console.warn('Demo JSON parse error:', parseError);
            }
          }
        }

        buffer = parts[parts.length - 1];
      }
    } catch (error) {
      console.error('Demo streaming error:', error);
      store.setError(error instanceof Error ? error.message : 'Demo failed');
      store.setStreaming(false);
      store.setLoading(false);
    }
  }

  static clearConversation(): void {
    const store = useDeepSeekStore.getState();
    store.clearConversation();
  }

  static reset(): void {
    const store = useDeepSeekStore.getState();
    store.reset();
  }
}

export { DeepSeekService };