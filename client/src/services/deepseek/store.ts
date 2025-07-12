// DeepSeek Store - State Management
import { create } from 'zustand';
import { DeepSeekResponse, DeepSeekMessage } from './types';

interface DeepSeekStore {
  conversation: DeepSeekMessage[];
  currentResponse: DeepSeekResponse | null;
  streamingReasoning: string;
  streamingResponse: string;
  isLoading: boolean;
  isStreaming: boolean;
  streamingPhase: 'reasoning' | 'response' | null;
  error: string | null;

  // Actions
  setResponse: (response: DeepSeekResponse) => void;
  addMessage: (message: DeepSeekMessage) => void;
  clearConversation: () => void;
  setLoading: (loading: boolean) => void;
  setStreaming: (streaming: boolean) => void;
  setStreamingPhase: (phase: 'reasoning' | 'response' | null) => void;
  appendStreamingReasoning: (token: string) => void;
  appendStreamingResponse: (token: string) => void;
  clearStreaming: () => void;
  setError: (error: string | null) => void;
  reset: () => void;
}

export const useDeepSeekStore = create<DeepSeekStore>((set, get) => ({
  conversation: [],
  currentResponse: null,
  streamingReasoning: '',
  streamingResponse: '',
  isLoading: false,
  isStreaming: false,
  streamingPhase: null,
  error: null,

  setResponse: (response) => set({ 
    currentResponse: response, 
    isLoading: false,
    isStreaming: false,
    streamingPhase: null
  }),

  addMessage: (message) => set((state) => ({
    conversation: [...state.conversation, message]
  })),

  clearConversation: () => set({ 
    conversation: [], 
    currentResponse: null, 
    streamingReasoning: '',
    streamingResponse: '',
    streamingPhase: null,
    error: null 
  }),

  setLoading: (loading) => set({ isLoading: loading }),

  setStreaming: (streaming) => set({ isStreaming: streaming }),

  setStreamingPhase: (phase) => set({ streamingPhase: phase }),

  appendStreamingReasoning: (token) => set((state) => ({
    streamingReasoning: state.streamingReasoning + token
  })),

  appendStreamingResponse: (token) => set((state) => ({
    streamingResponse: state.streamingResponse + token
  })),

  clearStreaming: () => set({
    streamingReasoning: '',
    streamingResponse: '',
    streamingPhase: null
  }),

  setError: (error) => set({ error, isLoading: false, isStreaming: false }),

  reset: () => set({
    conversation: [],
    currentResponse: null,
    streamingReasoning: '',
    streamingResponse: '',
    isLoading: false,
    isStreaming: false,
    streamingPhase: null,
    error: null
  })
}));