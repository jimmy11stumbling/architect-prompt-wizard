// DeepSeek Store - State Management
import { create } from 'zustand';
import { DeepSeekResponse, DeepSeekMessage } from './types';

interface DeepSeekStore {
  // State
  isLoading: boolean;
  isStreaming: boolean;
  currentResponse: DeepSeekResponse | null;
  streamingReasoning: string;
  streamingResponse: string;
  conversation: DeepSeekMessage[];
  error: string | null;

  // Actions
  setLoading: (loading: boolean) => void;
  setStreaming: (streaming: boolean) => void;
  setResponse: (response: DeepSeekResponse) => void;
  setError: (error: string | null) => void;
  addMessage: (message: DeepSeekMessage) => void;
  appendStreamingReasoning: (token: string) => void;
  appendStreamingResponse: (token: string) => void;
  clearStreamingContent: () => void;
  clearConversation: () => void;
  reset: () => void;
}

export const useDeepSeekStore = create<DeepSeekStore>((set) => ({
  // Initial state
  isLoading: false,
  isStreaming: false,
  currentResponse: null,
  streamingReasoning: '',
  streamingResponse: '',
  conversation: [],
  error: null,

  // Actions
  setLoading: (loading) => set({ isLoading: loading }),

  setStreaming: (streaming) => set({ isStreaming: streaming }),

  setResponse: (response) => set({ 
    currentResponse: response,
    error: null,
    isLoading: false
  }),

  setError: (error) => set({ 
    error,
    isLoading: false,
    isStreaming: false,
    currentResponse: null
  }),

  addMessage: (message) => set((state) => ({
    conversation: [...state.conversation, message]
  })),

  appendStreamingReasoning: (token) => set((state) => ({
    streamingReasoning: state.streamingReasoning + token
  })),

  appendStreamingResponse: (token) => set((state) => ({
    streamingResponse: state.streamingResponse + token
  })),

  clearStreamingContent: () => {
    set({ streamingReasoning: '', streamingResponse: '' });
  },

  appendStreamingReasoning: (token: string) => {
    set((state) => ({ 
      streamingReasoning: state.streamingReasoning + token 
    }));
  },

  appendStreamingResponse: (token: string) => {
    set((state) => ({ 
      streamingResponse: state.streamingResponse + token 
    }));
  },

  clearConversation: () => set({ 
    conversation: [],
    currentResponse: null,
    streamingReasoning: '',
    streamingResponse: '',
    error: null
  }),

  reset: () => set({
    isLoading: false,
    isStreaming: false,
    currentResponse: null,
    streamingReasoning: '',
    streamingResponse: '',
    conversation: [],
    error: null
  })
}));