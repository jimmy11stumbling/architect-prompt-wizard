// DeepSeek Service - Business Logic
import { DeepSeekApi } from './api';
import { useDeepSeekStore } from './store';
import { DeepSeekRequest, DeepSeekMessage } from './types';

export class DeepSeekService {
  static async processQuery(
    query: string,
    options: { ragEnabled?: boolean; temperature?: number } = {}
  ): Promise<void> {
    const store = useDeepSeekStore.getState();
    
    try {
      // Set loading state
      store.setLoading(true);
      store.setError(null);

      // Add user message to conversation
      const userMessage: DeepSeekMessage = {
        role: 'user',
        content: query
      };
      store.addMessage(userMessage);

      // Prepare request
      const request: DeepSeekRequest = {
        messages: [...store.conversation, userMessage],
        maxTokens: 4096,
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