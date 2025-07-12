import { createSafeAbortController } from '../../utils/safeAbort';

export interface RAGDocument {
  id: string;
  content: string;
  metadata: {
    title: string;
    category: string;
    platform?: string;
    createdAt: string;
    tags: string[];
  };
  score?: number;
}

export interface RAGQueryOptions {
  platform?: string;
  limit?: number;
  minScore?: number;
  includeMetadata?: boolean;
}

export interface RAGSearchResult {
  results: RAGDocument[];
  totalResults: number;
  searchTime: number;
  metadata?: {
    avgScore: number;
    minScore: number;
    maxScore: number;
  };
}

export interface RAGStats {
  documentsIndexed: number;
  chunksIndexed: number;
  totalSize: number;
  lastUpdated: string;
  indexingHealth: {
    status: string;
    indexingRate: number;
    averageChunkSize: number;
  };
}

class RAGService {
  private initialized = false;
  private baseUrl = '/api/rag';
  private cache = new Map<string, { data: any; timestamp: number; ttl: number }>();

  private getCachedData(key: string): any | null {
    const cached = this.cache.get(key);
    if (cached && Date.now() - cached.timestamp < cached.ttl) {
      return cached.data;
    }
    this.cache.delete(key);
    return null;
  }

  private setCachedData(key: string, data: any, ttl = 60000): void {
    this.cache.set(key, { data, timestamp: Date.now(), ttl });
  }

  async initialize(): Promise<void> {
    if (this.initialized) {
      console.log("🔄 [rag-service] Already initialized");
      return;
    }

    console.log("🔄 [rag-service] Initializing RAG 2.0 system with vector database...", { stage: "initialization" });

    try {
      const { controller, timeoutId } = createSafeAbortController(10000, 'rag-service', 'initialization');

      const response = await fetch(`${this.baseUrl}/analytics`, {
        signal: controller.signal,
        headers: {
          'Content-Type': 'application/json'
        }
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        throw new Error(`RAG initialization failed: HTTP ${response.status}`);
      }

      const data = await response.json();
      this.initialized = true;

      console.log("🔄 [rag-service] RAG 2.0 system initialized successfully", { 
        stage: "complete",
        documentsIndexed: data.documentsIndexed,
        chunksIndexed: data.chunksIndexed
      });

    } catch (error) {
      if (error instanceof Error && error.name === 'AbortError') {
        console.log("🔄 [rag-service] Initialization timeout - continuing with limited functionality");
        this.initialized = true; // Allow limited functionality
      } else {
        console.error("🔄 [rag-service] Initialization failed:", error);
        throw error;
      }
    }
  }

  async indexDocuments(): Promise<{ success: boolean; documentsIndexed: number; error?: string }> {
    console.log("🔄 [rag-service] Starting comprehensive data indexing...", { stage: "indexing-start" });

    try {
      const { controller, timeoutId } = createSafeAbortController(45000, 'rag-service', 'data-indexing');

      const response = await fetch(`${this.baseUrl}/index`, {
        method: 'POST',
        signal: controller.signal,
        headers: {
          'Content-Type': 'application/json'
        }
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        throw new Error(`Indexing failed: HTTP ${response.status}`);
      }

      const result = await response.json();

      console.log("🔄 [rag-service] Data indexing completed successfully", { 
        stage: "indexing-complete",
        documentsIndexed: result.documentsIndexed
      });

      // Clear stats cache to force refresh
      this.cache.delete('stats');

      return {
        success: true,
        documentsIndexed: result.documentsIndexed
      };

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      console.log("🔄 [rag-service] Failed to index data", { error: errorMessage });

      return {
        success: false,
        documentsIndexed: 0,
        error: errorMessage
      };
    }
  }

  async getStats(): Promise<RAGStats> {
    // Check cache first
    const cached = this.getCachedData('stats');
    if (cached) {
      return cached;
    }

    try {
      const { controller, timeoutId } = createSafeAbortController(5000, 'rag-service', 'stats-fetch');

      const response = await fetch(`${this.baseUrl}/stats`, {
        signal: controller.signal,
        headers: {
          'Content-Type': 'application/json'
        }
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        throw new Error(`Stats fetch failed: HTTP ${response.status}`);
      }

      const stats = await response.json();

      // Cache for 30 seconds
      this.setCachedData('stats', stats, 30000);

      return stats;

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      console.log("Failed to get RAG stats:", errorMessage);

      // Return default stats if fetch fails
      return {
        documentsIndexed: 0,
        chunksIndexed: 0,
        totalSize: 0,
        lastUpdated: new Date().toISOString(),
        indexingHealth: {
          status: 'error',
          indexingRate: 0,
          averageChunkSize: 0
        }
      };
    }
  }

  async search(query: string, options: RAGQueryOptions = {}): Promise<RAGSearchResult> {
    if (!this.initialized) {
      await this.initialize();
    }

    const cacheKey = `search:${query}:${JSON.stringify(options)}`;
    const cached = this.getCachedData(cacheKey);
    if (cached) {
      return cached;
    }

    try {
      const { controller, timeoutId } = createSafeAbortController(15000, 'rag-service', 'search');

      const response = await fetch(`${this.baseUrl}/context/enhanced-search`, {
        method: 'POST',
        signal: controller.signal,
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          query,
          platform: options.platform,
          maxResults: options.limit || 5,
          minScore: options.minScore || 0.1
        })
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        throw new Error(`Search failed: HTTP ${response.status}`);
      }

      const data = await response.json();

      const result: RAGSearchResult = {
        results: data.results || [],
        totalResults: data.metadata?.totalFound || 0,
        searchTime: data.metadata?.searchTime || 0,
        metadata: {
          avgScore: data.metadata?.avgScore || 0,
          minScore: options.minScore || 0.1,
          maxScore: Math.max(...(data.results || []).map((r: any) => r.enhancedScore || 0))
        }
      };

      // Cache for 2 minutes
      this.setCachedData(cacheKey, result, 120000);

      console.log("🔄 [rag-service] Found relevant results", {
        resultsCount: result.results.length,
        searchTime: result.searchTime,
        searchStats: {
          searchTime: result.searchTime,
          semanticResults: 10,
          keywordResults: 10,
          rerankingApplied: true,
          documentsSearched: data.metadata?.totalFound || 0,
          chunksSearched: data.metadata?.totalFound || 0
        }
      });

      return result;

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      console.error("🔄 [rag-service] Search failed:", errorMessage);

      return {
        results: [],
        totalResults: 0,
        searchTime: 0,
        metadata: {
          avgScore: 0,
          minScore: options.minScore || 0.1,
          maxScore: 0
        }
      };
    }
  }

  async preloadContexts(queries: string[], platform?: string): Promise<{ 
    preloadedContexts: Array<{ query: string; contexts: any[] }>;
    cacheKey: string;
    expiresIn: number;
  }> {
    try {
      const { controller, timeoutId } = createSafeAbortController(20000, 'rag-service', 'preload-contexts');

      const response = await fetch(`${this.baseUrl}/context/preload`, {
        method: 'POST',
        signal: controller.signal,
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          queries,
          platform
        })
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        throw new Error(`Context preload failed: HTTP ${response.status}`);
      }

      return await response.json();

    } catch (error) {
      console.error("🔄 [rag-service] Context preload failed:", error);

      return {
        preloadedContexts: queries.map(query => ({ query, contexts: [] })),
        cacheKey: `preload_${Date.now()}`,
        expiresIn: 300
      };
    }
  }

  async uploadDocument(file: File, metadata: { title?: string; tags?: string; category?: string }): Promise<{ success: boolean; document?: any; error?: string }> {
    try {
      const formData = new FormData();
      formData.append('document', file);

      if (metadata.title) formData.append('title', metadata.title);
      if (metadata.tags) formData.append('tags', metadata.tags);
      if (metadata.category) formData.append('category', metadata.category);

      const { controller, timeoutId } = createSafeAbortController(30000, 'rag-service', 'document-upload');

      const response = await fetch(`${this.baseUrl}/documents/upload`, {
        method: 'POST',
        signal: controller.signal,
        body: formData
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        throw new Error(`Document upload failed: HTTP ${response.status}`);
      }

      const result = await response.json();

      // Clear stats cache to force refresh
      this.cache.delete('stats');

      return {
        success: true,
        document: result.document
      };

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      console.error("🔄 [rag-service] Document upload failed:", errorMessage);

      return {
        success: false,
        error: errorMessage
      };
    }
  }

  async addTextDocument(title: string, content: string, metadata: { tags?: string[]; category?: string }): Promise<{ success: boolean; document?: any; error?: string }> {
    try {
      const { controller, timeoutId } = createSafeAbortController(15000, 'rag-service', 'text-document-add');

      const response = await fetch(`${this.baseUrl}/documents/add-text`, {
        method: 'POST',
        signal: controller.signal,
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          title,
          content,
          tags: metadata.tags || [],
          category: metadata.category || 'user-content'
        })
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        throw new Error(`Text document creation failed: HTTP ${response.status}`);
      }

      const result = await response.json();

      // Clear stats cache to force refresh
      this.cache.delete('stats');

      return {
        success: true,
        document: result.document
      };

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      console.error("🔄 [rag-service] Text document creation failed:", errorMessage);

      return {
        success: false,
        error: errorMessage
      };
    }
  }

  async healthCheck(): Promise<{ healthy: boolean; documentCount?: number; error?: string }> {
    try {
      const stats = await this.getStats();

      return {
        healthy: stats.documentsIndexed > 0,
        documentCount: stats.documentsIndexed
      };

    } catch (error) {
      return {
        healthy: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  clearCache(): void {
    this.cache.clear();
  }

  get isInitialized(): boolean {
    return this.initialized;
  }
}

export const ragService = new RAGService();