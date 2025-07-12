// DeepSeek Store - State Management
import { create } from 'zustand';
import { DeepSeekResponse, DeepSeekMessage } from './types';

interface DeepSeekStore {
  // State
  isLoading: boolean;
  currentResponse: DeepSeekResponse | null;
  conversation: DeepSeekMessage[];
  error: string | null;
  
  // Actions
  setLoading: (loading: boolean) => void;
  setResponse: (response: DeepSeekResponse) => void;
  setError: (error: string | null) => void;
  addMessage: (message: DeepSeekMessage) => void;
  clearConversation: () => void;
  reset: () => void;
}

export const useDeepSeekStore = create<DeepSeekStore>((set) => ({
  // Initial state
  isLoading: false,
  currentResponse: null,
  conversation: [],
  error: null,

  // Actions
  setLoading: (loading) => set({ isLoading: loading }),
  
  setResponse: (response) => set({ 
    currentResponse: response,
    error: null,
    isLoading: false
  }),
  
  setError: (error) => set({ 
    error,
    isLoading: false,
    currentResponse: null
  }),
  
  addMessage: (message) => set((state) => ({
    conversation: [...state.conversation, message]
  })),
  
  clearConversation: () => set({ 
    conversation: [],
    currentResponse: null,
    error: null
  }),
  
  reset: () => set({
    isLoading: false,
    currentResponse: null,
    conversation: [],
    error: null
  })
}));