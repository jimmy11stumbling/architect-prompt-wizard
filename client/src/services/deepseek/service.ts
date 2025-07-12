// DeepSeek Service - Business Logic
import { DeepSeekApi } from './api';
import { useDeepSeekStore } from './store';
import { DeepSeekRequest, DeepSeekMessage } from './types';

export class DeepSeekService {
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

  static clearConversation(): void {
    const store = useDeepSeekStore.getState();
    store.clearConversation();
  }

  static reset(): void {
    const store = useDeepSeekStore.getState();
    store.reset();
  }
}