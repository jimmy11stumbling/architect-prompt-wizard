
// RAG-specific types separated from main IPA types for better organization
export interface RAGDocument {
  id: string;
  title: string;
  content: string;
  category: string;
  tags: string[];
  metadata: Record<string, any>;
  embedding?: number[];
  lastUpdated: number;
}

export interface RAGQuery {
  query: string;
  limit?: number;
  threshold?: number;
  category?: string;
}

export interface RAGResult {
  id: string;
  title: string;
  content: string;
  category: string;
  relevanceScore: number;
  metadata: Record<string, any>;
}

export interface RAGResponse {
  results: RAGResult[];
  query: string;
  totalResults: number;
  processingTime: number;
  scores: number[];
  searchTime: number;
}
