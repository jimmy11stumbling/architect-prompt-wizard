import { EmbeddingService, EmbeddingDocument } from "./embeddingService";
import { VectorStore, SearchResult, SearchOptions } from "./vectorStore";
import { storage } from "../../storage";

export interface RAGQuery {
  query: string;
  context?: string;
  filters?: {
    platform?: string;
    category?: string;
    maxResults?: number;
  };
}

export interface RAGResponse {
  query: string;
  results: SearchResult[];
  context: string;
  totalResults: number;
  searchTime: number;
  sources: string[];
}

export interface RAGIndexingProgress {
  phase: "chunking" | "embedding" | "storing" | "complete";
  processed: number;
  total: number;
  currentItem?: string;
}

// Singleton vector store instance
let vectorStoreInstance: VectorStore | null = null;

export class RAGOrchestrator {
  private embeddingService: EmbeddingService;
  private vectorStore: VectorStore;
  private isInitialized = false;
  private isIndexing = false;

  constructor(apiKey?: string) {
    // Use singleton instance to prevent multiple database connections
    if (!vectorStoreInstance) {
      vectorStoreInstance = new VectorStore();
    }
    this.embeddingService = new EmbeddingService(apiKey);
    this.vectorStore = vectorStoreInstance;
  }

  /**
   * Initialize the RAG system
   */
  async initialize(): Promise<void> {
    try {
      await this.vectorStore.initialize();
      this.isInitialized = true;
      console.log("RAG Orchestrator initialized successfully");
    } catch (error) {
      console.error("Error initializing RAG orchestrator:", error);
      throw new Error(`Failed to initialize RAG: ${error instanceof Error ? error.message : "Unknown error"}`);
    }
  }

  /**
   * Index all platform data and knowledge base
   */
  async indexAllData(
    progressCallback?: (progress: RAGIndexingProgress) => void
  ): Promise<void> {
    if (!this.isInitialized) {
      await this.initialize();
    }

    try {
      this.isIndexing = true;
      // Get all platforms and knowledge base entries
      const platforms = await storage.getAllPlatforms();
      const knowledgeBase = await storage.getAllKnowledgeBase();

      const totalItems = platforms.length + knowledgeBase.length;
      let processedItems = 0;

      console.log(`Starting indexing of ${totalItems} items...`);

      // Process platforms
      progressCallback?.({
        phase: "chunking",
        processed: 0,
        total: totalItems,
        currentItem: "platforms"
      });

      const platformDocuments = await this.embeddingService.processPlatformData(platforms);
      processedItems += platforms.length;

      progressCallback?.({
        phase: "chunking",
        processed: processedItems,
        total: totalItems,
        currentItem: "knowledge base"
      });

      // Process knowledge base
      const kbDocuments = await this.embeddingService.processKnowledgeBase(knowledgeBase);
      processedItems = totalItems;

      const allDocuments = [...platformDocuments, ...kbDocuments];

      progressCallback?.({
        phase: "embedding",
        processed: 0,
        total: allDocuments.length,
        currentItem: `${allDocuments.length} chunks`
      });

      // Generate embeddings
      const embeddedDocuments = await this.embeddingService.generateEmbeddings(allDocuments);

      progressCallback?.({
        phase: "storing",
        processed: 0,
        total: embeddedDocuments.length,
        currentItem: "vector database"
      });

      // Store in vector database
      await this.vectorStore.storeEmbeddings(embeddedDocuments);

      progressCallback?.({
        phase: "complete",
        processed: embeddedDocuments.length,
        total: embeddedDocuments.length,
        currentItem: "indexing complete"
      });

      console.log(`Successfully indexed ${embeddedDocuments.length} document chunks`);
    } catch (error) {
      console.error("Error indexing data:", error);
      throw new Error(`Failed to index data: ${error instanceof Error ? error.message : "Unknown error"}`);
    } finally {
      this.isIndexing = false;
    }
  }

  /**
   * Perform RAG query with context retrieval
   */
  async query(ragQuery: RAGQuery): Promise<RAGResponse> {
    if (!this.isInitialized) {
      await this.initialize();
    }

    const startTime = Date.now();

    try {
      const searchOptions: SearchOptions = {
        topK: ragQuery.filters?.maxResults || 10,
        filters: {
          platform: ragQuery.filters?.platform,
          category: ragQuery.filters?.category
        }
      };

      // Perform hybrid search for better results
      const results = await this.vectorStore.hybridSearch(ragQuery.query, searchOptions);

      const searchTime = Date.now() - startTime;

      // Build context from search results
      const context = this.buildContext(results, ragQuery.context);

      // Extract unique sources
      const sourceSet = new Set(results.map(r => r.document.metadata.source));
      const sources = Array.from(sourceSet);

      return {
        query: ragQuery.query,
        results,
        context,
        totalResults: results.length,
        searchTime,
        sources
      };
    } catch (error) {
      console.error("Error performing RAG query:", error);
      throw new Error(`Failed to perform RAG query: ${error instanceof Error ? error.message : "Unknown error"}`);
    }
  }

  /**
   * Get suggestions based on partial query
   */
  async getSuggestions(partialQuery: string, limit = 5): Promise<string[]> {
    if (!this.isInitialized) {
      await this.initialize();
    }

    try {
      const results = await this.vectorStore.search(partialQuery, { 
        topK: limit * 2,
        minSimilarity: 0.5 
      });

      // Extract relevant keywords and phrases from results
      const suggestions = results
        .map(r => this.extractKeyPhrases(r.document.content))
        .flat()
        .filter(phrase => phrase.toLowerCase().includes(partialQuery.toLowerCase()))
        .slice(0, limit);

      // Remove duplicates manually for TypeScript compatibility
      const uniqueSuggestions: string[] = [];
      suggestions.forEach(suggestion => {
        if (!uniqueSuggestions.includes(suggestion)) {
          uniqueSuggestions.push(suggestion);
        }
      });
      return uniqueSuggestions;
    } catch (error) {
      console.error("Error getting suggestions:", error);
      return [];
    }
  }

  /**
   * Get RAG system statistics
   */
  async getStats() {
    if (!this.isInitialized) {
      await this.initialize();
    }

    try {
      return await this.vectorStore.getStats();
    } catch (error) {
      console.error("Error getting RAG stats:", error);
      throw new Error(`Failed to get stats: ${error instanceof Error ? error.message : "Unknown error"}`);
    }
  }

  /**
   * Re-index all data (clear and rebuild)
   */
  async reIndex(progressCallback?: (progress: RAGIndexingProgress) => void): Promise<void> {
    if (!this.isInitialized) {
      await this.initialize();
    }

    try {
      console.log("Clearing existing embeddings...");
      await this.vectorStore.clearAll();

      console.log("Starting re-indexing...");
      await this.indexAllData(progressCallback);
    } catch (error) {
      console.error("Error re-indexing:", error);
      throw new Error(`Failed to re-index: ${error instanceof Error ? error.message : "Unknown error"}`);
    }
  }

  /**
   * Build context string from search results
   */
  private buildContext(results: SearchResult[], additionalContext?: string): string {
    let context = "";

    if (additionalContext) {
      context += `Additional Context: ${additionalContext}\n\n`;
    }

    context += "Retrieved Information:\n";

    results.forEach((result, index) => {
      const metadata = result.document.metadata;
      context += `\n[Source ${index + 1}] ${metadata.platform || metadata.category || "Unknown"}:\n`;
      context += `${result.document.content}\n`;
      context += `(Relevance: ${(result.similarity * 100).toFixed(1)}%)\n`;
    });

    return context;
  }

  /**
   * Extract key phrases from content for suggestions
   */
  private extractKeyPhrases(content: string): string[] {
    // Simple extraction of phrases - could be enhanced with NLP
    const phrases: string[] = [];

    // Extract sentences
    const sentences = content.split(/[.!?]+/).map(s => s.trim());

    // Extract noun phrases (simplified)
    sentences.forEach(sentence => {
      const words = sentence.split(/\s+/);
      for (let i = 0; i < words.length - 1; i++) {
        const phrase = words.slice(i, i + 3).join(" ");
        if (phrase.length > 10 && phrase.length < 50) {
          phrases.push(phrase);
        }
      }
    });

    return phrases;
  }

  /**
   * Check if the system is ready for queries
   */
  isReady(): boolean {
    return this.isInitialized;
  }
}