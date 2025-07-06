import { RAGResult, RAGQuery, RAGResponse, RAGDocument } from "@/types/rag-types";
import { realTimeResponseService } from "../integration/realTimeResponseService";
import { createSafeAbortController } from "@/utils/safeAbort";

// Re-export types for components to use
export type { RAGQuery, RAGResponse, RAGDocument, RAGResult } from "@/types/rag-types";

export interface RAG2SearchResponse {
  results: RAG2Result[];
  query: string;
  totalResults: number;
  searchTime: number;
  sources: string[];
  searchStats?: {
    semanticResults: number;
    keywordResults: number;
    rerankingApplied: boolean;
    documentsSearched: number;
    chunksSearched: number;
  };
  compressedContext?: string;
  suggestions?: string[];
}

export interface RAG2Result {
  id: string;
  title: string;
  content: string;
  category: string;
  relevanceScore: number;
  metadata: {
    source: string;
    lastUpdated: Date;
    matchType: 'hybrid' | 'semantic' | 'keyword';
    chunkIndex?: number;
    documentType?: string;
    platform?: string;
    wordCount?: number;
    matchedTerms?: string[];
  };
}

export interface RAGStats {
  documentsIndexed: number;
  chunksIndexed: number;
  vectorStoreStats: any;
  searchEngineStats: any;
  embeddingStats: any;
  lastIndexed?: Date;
}

export class RAGService {
  private documents: RAGDocument[] = [];
  private initialized = false;
  private ragSystemInitialized = false;

  constructor() {
    this.initializeWithSampleData();
  }

  private initializeWithSampleData() {
    // Initialize with enhanced sample documents for demonstration
    this.documents = [
      {
        id: "rag-doc-1",
        title: "RAG 2.0 Architecture Guide",
        content: "RAG 2.0 represents a significant evolution in retrieval-augmented generation systems. Key improvements include hybrid search combining dense and sparse retrieval, semantic chunking for better context preservation, and end-to-end optimization of retriever and generator components. The architecture typically includes a vector database (like Pinecone or Weaviate), embedding models for semantic understanding, and sophisticated reranking mechanisms to ensure the most relevant context is provided to the language model.",
        category: "AI Architecture",
        tags: ["RAG", "AI", "Architecture", "Vector Database"],
        metadata: { source: "internal", difficulty: "advanced", lastReviewed: Date.now() },
        lastUpdated: Date.now()
      },
      {
        id: "rag-doc-2",
        title: "Vector Database Selection Guide",
        content: "Choosing the right vector database is crucial for RAG system performance. Pinecone offers managed service with excellent performance but higher costs. Weaviate provides open-source flexibility with strong GraphQL integration. Qdrant excels in on-premise deployments with high performance. Chroma is ideal for development and smaller deployments. Consider factors like scale, cost, deployment model, and integration requirements when selecting.",
        category: "Database",
        tags: ["Vector Database", "Pinecone", "Weaviate", "Qdrant"],
        metadata: { source: "research", difficulty: "intermediate", lastReviewed: Date.now() },
        lastUpdated: Date.now()
      },
      {
        id: "a2a-doc-1",
        title: "Agent-to-Agent Communication Protocols",
        content: "A2A protocols enable seamless communication between autonomous AI agents. The protocol defines standard message formats, discovery mechanisms, and coordination patterns. Key components include agent registries for discovery, message routing systems, task delegation frameworks, and result aggregation mechanisms. JSON-RPC is commonly used for reliable communication, while WebSocket connections enable real-time coordination.",
        category: "Agent Systems",
        tags: ["A2A", "Agents", "Communication", "Protocol"],
        metadata: { source: "specification", difficulty: "advanced", lastReviewed: Date.now() },
        lastUpdated: Date.now()
      },
      {
        id: "mcp-doc-1",
        title: "Model Context Protocol Implementation",
        content: "MCP standardizes how AI applications connect to external data sources and tools. The protocol defines resource discovery, context sharing, and tool execution interfaces. MCP servers provide standardized access to databases, APIs, and tools, while MCP clients (like AI applications) can discover and use these resources seamlessly. Security is paramount, with authentication, authorization, and sandboxing mechanisms built into the protocol.",
        category: "Integration",
        tags: ["MCP", "Protocol", "Integration", "Tools"],
        metadata: { source: "documentation", difficulty: "intermediate", lastReviewed: Date.now() },
        lastUpdated: Date.now()
      },
      {
        id: "tech-doc-1",
        title: "Modern AI System Architecture",
        content: "Contemporary AI systems require modular, scalable architectures. Key principles include microservices for different AI capabilities, event-driven architectures for real-time processing, containerization for deployment flexibility, and observability for monitoring and debugging. Consider using Docker for containerization, Kubernetes for orchestration, and comprehensive logging and metrics collection for production deployments.",
        category: "Architecture",
        tags: ["Architecture", "Microservices", "Scalability", "DevOps"],
        metadata: { source: "best-practices", difficulty: "intermediate", lastReviewed: Date.now() },
        lastUpdated: Date.now()
      }
    ];
    this.initialized = true;
  }

  async initialize(): Promise<void> {
    if (this.initialized) return;
    
    try {
      // Initialize the basic service
      await this.initializeWithSampleData();
      this.initialized = true;
      
      // Initialize RAG 2.0 system
      await this.initializeRAG2System();
    } catch (error) {
      console.error("Failed to initialize RAG service:", error);
      throw error;
    }
  }

  /**
   * Initialize the RAG 2.0 system with vector database and hybrid search
   */
  async initializeRAG2System(): Promise<void> {
    if (this.ragSystemInitialized) return;

    try {
      realTimeResponseService.addResponse({
        source: "rag-service",
        status: "processing",
        message: "Initializing RAG 2.0 system with vector database...",
        data: { stage: "initialization" }
      });

      const response = await fetch('/api/rag/initialize', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      });

      if (!response.ok) {
        throw new Error(`Failed to initialize RAG 2.0: ${response.statusText}`);
      }

      this.ragSystemInitialized = true;

      realTimeResponseService.addResponse({
        source: "rag-service",
        status: "success",
        message: "RAG 2.0 system initialized successfully",
        data: { stage: "complete" }
      });

    } catch (error) {
      console.error("Failed to initialize RAG 2.0 system:", error);
      realTimeResponseService.addResponse({
        source: "rag-service",
        status: "error",
        message: "Failed to initialize RAG 2.0 system",
        data: { error: error instanceof Error ? error.message : "Unknown error" }
      });
    }
  }

  /**
   * Index all data sources including attached assets and platform data
   */
  async indexAllData(): Promise<{ success: boolean; documentsProcessed: number; message: string }> {
    try {
      realTimeResponseService.addResponse({
        source: "rag-service",
        status: "processing",
        message: "Starting comprehensive data indexing...",
        data: { stage: "indexing-start" }
      });

      // Add timeout protection for indexing operations
      const { controller, safeAbort } = createSafeAbortController({
        agentId: 'rag-service',
        operation: 'data-indexing',
        timeout: 30000,
        reason: 'indexing timeout'
      });
      
      const timeoutId = setTimeout(() => {
        safeAbort();
      }, 30000); // 30 second timeout for indexing

      const response = await fetch('/api/rag/index', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        signal: controller.signal
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        throw new Error(`Failed to index data: ${response.statusText}`);
      }

      const result = await response.json();

      realTimeResponseService.addResponse({
        source: "rag-service",
        status: "success",
        message: result.message,
        data: { 
          documentsProcessed: result.documentsProcessed,
          stage: "indexing-complete"
        }
      });

      return {
        success: true,
        documentsProcessed: result.documentsProcessed || 0,
        message: result.message
      };

    } catch (error) {
      // Check if this is a timeout/abort error and handle gracefully
      const isTimeout = error instanceof DOMException && error.name === 'AbortError';
      const errorMessage = isTimeout ? "Indexing timeout after 30 seconds" : (error instanceof Error ? error.message : "Unknown error");
      
      console.warn("[SafeAbort] Data indexing failed:", errorMessage);
      realTimeResponseService.addResponse({
        source: "rag-service",
        status: "error",
        message: isTimeout ? "Indexing timeout - data may be partially indexed" : "Failed to index data",
        data: { error: errorMessage }
      });

      return {
        success: false,
        documentsProcessed: 0,
        message: "Indexing failed"
      };
    }
  }

  /**
   * Perform advanced RAG 2.0 search with hybrid vector and keyword search
   */
  async searchRAG2(query: string, options: {
    limit?: number;
    filters?: {
      category?: string;
      platform?: string;
      source?: string;
      documentType?: string;
    };
    hybridWeight?: { semantic: number; keyword: number };
    rerankingEnabled?: boolean;
  } = {}): Promise<RAG2SearchResponse> {
    try {
      realTimeResponseService.addResponse({
        source: "rag-service",
        status: "processing",
        message: "Executing RAG 2.0 hybrid search...",
        data: { query, options }
      });

      // Add timeout protection with safe abort
      const { controller, safeAbort } = createSafeAbortController({
        agentId: 'rag-service',
        operation: 'hybrid-search',
        timeout: 5000,
        reason: 'timeout'
      });
      
      const timeoutId = setTimeout(() => {
        safeAbort();
      }, 5000); // 5 second timeout

      try {
        const response = await fetch('/api/rag/search', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            query,
            limit: options.limit || 10,
            filters: options.filters,
            options: {
              hybridWeight: options.hybridWeight || { semantic: 0.7, keyword: 0.3 },
              rerankingEnabled: options.rerankingEnabled !== false,
              includeMetadata: true,
              minSimilarity: 0.1
            }
          }),
          signal: controller.signal
        });

        clearTimeout(timeoutId);

        if (!response.ok) {
          throw new Error(`Search failed: ${response.statusText}`);
        }

        const searchResponse: RAG2SearchResponse = await response.json();

        realTimeResponseService.addResponse({
          source: "rag-service",
          status: "success",
          message: `Found ${searchResponse.totalResults} relevant results`,
          data: { 
            resultsCount: searchResponse.totalResults,
            searchTime: searchResponse.searchTime,
            searchStats: searchResponse.searchStats
          }
        });

        return searchResponse;

      } catch (error) {
        clearTimeout(timeoutId);
        
        // Check if this is a timeout/abort error
        const isTimeout = error instanceof DOMException && error.name === 'AbortError';
        const errorMessage = isTimeout ? "Search timeout after 5 seconds" : (error instanceof Error ? error.message : "Unknown error");
        
        console.warn("[SafeAbort] Vector search failed, using platform fallback:", errorMessage);
        
        realTimeResponseService.addResponse({
          source: "rag-service",
          status: "error",
          message: isTimeout ? "Search timeout, using fallback" : "RAG 2.0 search failed",
          data: { error: errorMessage }
        });

        // Fallback to basic search
        return this.fallbackToBasicSearch(query, options);
      }
    } catch (error) {
      console.error("Outer search error:", error);
      // Fallback to basic search on any outer error
      return this.fallbackToBasicSearch(query, options);
    }
  }

  /**
   * Get search suggestions for query completion
   */
  async getSuggestions(partialQuery: string, limit = 5): Promise<string[]> {
    try {
      const response = await fetch(`/api/rag/suggestions?q=${encodeURIComponent(partialQuery)}&limit=${limit}`);
      
      if (!response.ok) {
        return [];
      }

      const result = await response.json();
      return result.suggestions || [];
    } catch (error) {
      console.error("Failed to get suggestions:", error);
      return [];
    }
  }

  /**
   * Get comprehensive RAG system statistics
   */
  async getRAGStats(): Promise<RAGStats | null> {
    try {
      // Add timeout protection for stats requests
      const { controller, safeAbort } = createSafeAbortController({
        agentId: 'rag-service',
        operation: 'stats-fetch',
        timeout: 3000,
        reason: 'stats timeout'
      });
      
      const timeoutId = setTimeout(() => {
        safeAbort();
      }, 3000); // 3 second timeout for stats

      const response = await fetch('/api/rag/stats', {
        signal: controller.signal
      });
      
      clearTimeout(timeoutId);
      
      if (!response.ok) {
        return null;
      }

      return await response.json();
    } catch (error) {
      // Check if this is a timeout/abort error and handle gracefully
      const isTimeout = error instanceof DOMException && error.name === 'AbortError';
      const isFetchError = error instanceof TypeError && error.message === 'Failed to fetch';
      
      if (isTimeout || isFetchError) {
        console.warn("[SafeAbort] RAG stats fetch failed gracefully:", error instanceof Error ? error.message : "Unknown error");
      } else {
        console.error("Failed to get RAG stats:", error);
      }
      return null;
    }
  }

  /**
   * Get RAG system performance metrics
   */
  async getPerformanceMetrics(): Promise<any> {
    try {
      const response = await fetch('/api/rag/analytics/metrics');
      
      if (!response.ok) {
        return null;
      }

      return await response.json();
    } catch (error) {
      console.error("Failed to get performance metrics:", error);
      return null;
    }
  }

  /**
   * Fallback to basic search when RAG 2.0 is not available
   */
  private async fallbackToBasicSearch(query: string, options: any): Promise<RAG2SearchResponse> {
    console.log("Falling back to basic RAG search");
    
    const basicResponse = await this.query({
      query,
      limit: options.limit || 10
    });

    // Convert basic response to RAG 2.0 format
    return {
      results: basicResponse.results.map(result => ({
        id: result.id,
        title: result.title,
        content: result.content,
        category: result.category,
        relevanceScore: result.relevanceScore,
        metadata: {
          source: result.metadata.source,
          lastUpdated: new Date(result.metadata.lastUpdated),
          matchType: 'keyword' as const,
          documentType: 'legacy'
        }
      })),
      query,
      totalResults: basicResponse.totalResults,
      searchTime: basicResponse.searchTime,
      sources: [],
      searchStats: {
        semanticResults: 0,
        keywordResults: basicResponse.totalResults,
        rerankingApplied: false,
        documentsSearched: this.documents.length,
        chunksSearched: basicResponse.totalResults
      }
    };
  }

  async query(ragQuery: RAGQuery): Promise<RAGResponse> {
    const startTime = Date.now();
    
    realTimeResponseService.addResponse({
      source: "rag-service",
      status: "processing",
      message: "Executing RAG query with semantic search",
      data: { query: ragQuery.query, limit: ragQuery.limit || 5 }
    });

    try {
      // Simulate semantic search with enhanced scoring
      const searchResults = await this.performSemanticSearch(ragQuery);
      const processingTime = Date.now() - startTime;

      realTimeResponseService.addResponse({
        source: "rag-service",
        status: "success",
        message: `RAG query completed - found ${searchResults.length} relevant documents`,
        data: { 
          resultsCount: searchResults.length, 
          processingTime,
          topScore: searchResults[0]?.relevanceScore || 0
        }
      });

      return {
        results: searchResults,
        query: ragQuery.query,
        totalResults: searchResults.length,
        processingTime,
        scores: searchResults.map(r => r.relevanceScore),
        searchTime: processingTime
      };

    } catch (error) {
      realTimeResponseService.addResponse({
        source: "rag-service",
        status: "error",
        message: `RAG query failed: ${error instanceof Error ? error.message : "Unknown error"}`,
        data: { query: ragQuery.query, error: error instanceof Error ? error.message : "Unknown error" }
      });
      throw error;
    }
  }

  private async performSemanticSearch(ragQuery: RAGQuery): Promise<RAGResult[]> {
    const query = ragQuery.query.toLowerCase();
    const limit = ragQuery.limit || 5;
    
    // Enhanced semantic matching simulation
    const results: RAGResult[] = this.documents
      .map(doc => {
        let relevanceScore = 0;
        
        // Title matching (high weight)
        if (doc.title.toLowerCase().includes(query)) {
          relevanceScore += 0.8;
        }
        
        // Content matching (medium weight)
        const queryWords = query.split(' ');
        const contentWords = doc.content.toLowerCase().split(' ');
        const matchingWords = queryWords.filter(word => 
          contentWords.some(contentWord => contentWord.includes(word))
        );
        relevanceScore += (matchingWords.length / queryWords.length) * 0.6;
        
        // Tag matching (medium weight)
        const matchingTags = doc.tags.filter(tag => 
          tag.toLowerCase().includes(query) || query.includes(tag.toLowerCase())
        );
        relevanceScore += (matchingTags.length / doc.tags.length) * 0.5;
        
        // Category matching (low weight)
        if (doc.category.toLowerCase().includes(query.split(' ')[0])) {
          relevanceScore += 0.3;
        }

        // Boost recent documents slightly
        const daysSinceUpdate = (Date.now() - doc.lastUpdated) / (1000 * 60 * 60 * 24);
        if (daysSinceUpdate < 30) {
          relevanceScore += 0.1;
        }

        return {
          id: doc.id,
          title: doc.title,
          content: doc.content,
          category: doc.category,
          relevanceScore: Math.min(relevanceScore, 1.0), // Cap at 1.0
          metadata: doc.metadata
        };
      })
      .filter(result => result.relevanceScore > (ragQuery.threshold || 0.1))
      .sort((a, b) => b.relevanceScore - a.relevanceScore)
      .slice(0, limit);

    // Simulate processing delay for realism
    await new Promise(resolve => setTimeout(resolve, 300 + Math.random() * 700));

    return results;
  }

  async addDocument(document: Omit<RAGDocument, 'id' | 'lastUpdated'>): Promise<string> {
    const id = `rag-doc-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    const newDocument: RAGDocument = {
      ...document,
      id,
      lastUpdated: Date.now()
    };

    this.documents.push(newDocument);

    realTimeResponseService.addResponse({
      source: "rag-service",
      status: "success",
      message: `Document added to RAG database: ${document.title}`,
      data: { documentId: id, title: document.title }
    });

    return id;
  }

  async getDocuments(): Promise<RAGDocument[]> {
    return [...this.documents];
  }

  async getDocument(id: string): Promise<RAGDocument | null> {
    return this.documents.find(doc => doc.id === id) || null;
  }

  async updateDocument(id: string, updates: Partial<RAGDocument>): Promise<boolean> {
    const index = this.documents.findIndex(doc => doc.id === id);
    if (index === -1) return false;

    this.documents[index] = {
      ...this.documents[index],
      ...updates,
      lastUpdated: Date.now()
    };

    realTimeResponseService.addResponse({
      source: "rag-service",
      status: "success",
      message: `Document updated: ${this.documents[index].title}`,
      data: { documentId: id }
    });

    return true;
  }

  async deleteDocument(id: string): Promise<boolean> {
    const index = this.documents.findIndex(doc => doc.id === id);
    if (index === -1) return false;

    const deletedDoc = this.documents.splice(index, 1)[0];

    realTimeResponseService.addResponse({
      source: "rag-service",
      status: "success",
      message: `Document deleted: ${deletedDoc.title}`,
      data: { documentId: id }
    });

    return true;
  }

  async healthCheck(): Promise<{ healthy: boolean; documentCount: number; vectorDb: string; categories: string[] }> {
    const categories = [...new Set(this.documents.map(doc => doc.category))];
    
    return {
      healthy: this.initialized,
      documentCount: this.documents.length,
      vectorDb: "In-Memory (Demo)",
      categories
    };
  }

  getStats() {
    const categories = [...new Set(this.documents.map(doc => doc.category))];
    const totalWords = this.documents.reduce((sum, doc) => sum + doc.content.split(' ').length, 0);
    
    return {
      totalDocuments: this.documents.length,
      categories: categories.length,
      totalWords,
      avgWordsPerDoc: Math.round(totalWords / this.documents.length)
    };
  }
}

export const ragService = new RAGService();
