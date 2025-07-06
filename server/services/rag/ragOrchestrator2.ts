import { HybridSearchEngine, SearchQuery, SearchResponse } from "./hybridSearchEngine";
import { DocumentProcessor, ProcessedDocument } from "./documentProcessor";
import { VectorStore } from "./vectorStore";
import { EmbeddingService } from "./embeddingService";
import { storage } from "../../storage";
import { attachedAssetsMCPService } from "../attachedAssetsMcpService";
import { mcpHub } from "../mcpHub";

export interface RAGQuery {
  query: string;
  context?: string;
  limit?: number;
  filters?: {
    category?: string;
    platform?: string;
    source?: string;
    documentType?: string;
  };
  options?: {
    hybridWeight?: { semantic: number; keyword: number };
    rerankingEnabled?: boolean;
    includeMetadata?: boolean;
    minSimilarity?: number;
  };
}

export interface RAGResult {
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
  document: {
    id: string;
    title: string;
    content: string;
    category: string;
    tags: string[];
    metadata: Record<string, any>;
    lastUpdated: number;
  };
}

export interface RAGResponse {
  query: string;
  results: RAGResult[];
  context: string;
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

export interface IndexingProgress {
  stage: 'processing' | 'embedding' | 'indexing' | 'complete';
  progress: number;
  message: string;
  documentsProcessed: number;
  totalDocuments: number;
  errors?: string[];
}

export class RAGOrchestrator2 {
  private static instance: RAGOrchestrator2;
  private hybridSearchEngine: HybridSearchEngine;
  private documentProcessor: DocumentProcessor;
  private vectorStore: VectorStore;
  private embeddingService: EmbeddingService;
  private isInitialized = false;
  private indexedDocuments: ProcessedDocument[] = [];

  private constructor() {
    const connectionString = process.env.DATABASE_URL;
    if (!connectionString) {
      throw new Error("DATABASE_URL environment variable is required");
    }
    
    this.hybridSearchEngine = new HybridSearchEngine(connectionString);
    this.documentProcessor = DocumentProcessor.getInstance();
    this.vectorStore = new VectorStore(connectionString);
    this.embeddingService = EmbeddingService.getInstance();
  }

  static getInstance(): RAGOrchestrator2 {
    if (!RAGOrchestrator2.instance) {
      RAGOrchestrator2.instance = new RAGOrchestrator2();
    }
    return RAGOrchestrator2.instance;
  }

  /**
   * Initialize the RAG 2.0 system with full vector database setup
   */
  async initialize(): Promise<void> {
    if (this.isInitialized) return;

    try {
      console.log('Initializing RAG 2.0 system...');
      
      // Initialize all components
      await this.vectorStore.initialize();
      await this.hybridSearchEngine.initialize();
      
      this.isInitialized = true;
      console.log('RAG 2.0 system initialized successfully');
    } catch (error) {
      console.error('Failed to initialize RAG 2.0 system:', error);
      throw error;
    }
  }

  /**
   * Index all data from attached assets and platform database
   */
  async indexAllData(progressCallback?: (progress: IndexingProgress) => void): Promise<void> {
    if (!this.isInitialized) {
      await this.initialize();
    }

    try {
      console.log('Starting comprehensive data indexing...');

      // Stage 1: Process attached assets
      progressCallback?.({
        stage: 'processing',
        progress: 10,
        message: 'Processing attached asset documents...',
        documentsProcessed: 0,
        totalDocuments: 0
      });

      const attachedAssetDocs = await this.processAttachedAssets();
      
      // Stage 2: Process platform data from database
      progressCallback?.({
        stage: 'processing',
        progress: 30,
        message: 'Processing platform database content...',
        documentsProcessed: attachedAssetDocs.length,
        totalDocuments: attachedAssetDocs.length
      });

      const platformDocs = await this.processPlatformData();
      
      // Stage 3: Process knowledge base content
      const knowledgeBaseDocs = await this.processKnowledgeBaseData();
      
      // Combine all documents
      const allDocuments = [...attachedAssetDocs, ...platformDocs, ...knowledgeBaseDocs];
      this.indexedDocuments = allDocuments;

      progressCallback?.({
        stage: 'embedding',
        progress: 50,
        message: 'Generating embeddings and building search index...',
        documentsProcessed: allDocuments.length,
        totalDocuments: allDocuments.length
      });

      // Stage 4: Index in hybrid search engine
      await this.hybridSearchEngine.indexDocuments(allDocuments);

      progressCallback?.({
        stage: 'complete',
        progress: 100,
        message: `Successfully indexed ${allDocuments.length} documents`,
        documentsProcessed: allDocuments.length,
        totalDocuments: allDocuments.length
      });

      console.log(`RAG indexing complete: ${allDocuments.length} documents indexed`);
    } catch (error) {
      console.error('Failed to index data:', error);
      progressCallback?.({
        stage: 'processing',
        progress: 0,
        message: 'Indexing failed',
        documentsProcessed: 0,
        totalDocuments: 0,
        errors: [error instanceof Error ? error.message : 'Unknown error']
      });
      throw error;
    }
  }

  /**
   * Process all attached asset files
   */
  private async processAttachedAssets(): Promise<ProcessedDocument[]> {
    try {
      return await this.documentProcessor.processAllAttachedAssets();
    } catch (error) {
      console.error('Failed to process attached assets:', error);
      return [];
    }
  }

  /**
   * Process platform data from database
   */
  private async processPlatformData(): Promise<ProcessedDocument[]> {
    try {
      const platforms = await storage.getAllPlatforms();
      const platformDocs: ProcessedDocument[] = [];

      for (const platform of platforms) {
        // Get platform features, integrations, and pricing
        const [features, integrations, pricing] = await Promise.all([
          storage.getPlatformFeatures(platform.id),
          storage.getPlatformIntegrations(platform.id),
          storage.getPlatformPricing(platform.id)
        ]);

        // Create comprehensive platform document
        const content = this.buildPlatformContent(platform, features, integrations, pricing);
        
        const processedDoc = await this.documentProcessor.processDocument(content, {
          id: `platform_${platform.name.toLowerCase().replace(/\s+/g, '_')}`,
          title: `${platform.name} Platform Guide`,
          source: 'platform-database',
          type: 'platform-specification',
          platform: platform.name.toLowerCase(),
          category: platform.category || 'Development Platform'
        });

        platformDocs.push(processedDoc);
      }

      return platformDocs;
    } catch (error) {
      console.error('Failed to process platform data:', error);
      return [];
    }
  }

  /**
   * Process knowledge base data
   */
  private async processKnowledgeBaseData(): Promise<ProcessedDocument[]> {
    try {
      const knowledgeBase = await storage.getAllKnowledgeBase();
      const kbDocs: ProcessedDocument[] = [];

      for (const kb of knowledgeBase) {
        const processedDoc = await this.documentProcessor.processDocument(kb.content, {
          id: `kb_${kb.id}`,
          title: kb.title,
          source: kb.source,
          type: 'knowledge-base',
          category: kb.category
        });

        kbDocs.push(processedDoc);
      }

      return kbDocs;
    } catch (error) {
      console.error('Failed to process knowledge base data:', error);
      return [];
    }
  }

  /**
   * Build comprehensive platform content
   */
  private buildPlatformContent(platform: any, features: any[], integrations: any[], pricing: any[]): string {
    let content = `# ${platform.name}\n\n`;
    content += `${platform.description}\n\n`;

    if (platform.tagline) {
      content += `**Tagline:** ${platform.tagline}\n\n`;
    }

    // Features section
    if (features.length > 0) {
      content += `## Key Features\n\n`;
      for (const feature of features) {
        content += `### ${feature.name}\n`;
        content += `${feature.description}\n`;
        if (feature.category) {
          content += `**Category:** ${feature.category}\n`;
        }
        content += '\n';
      }
    }

    // Integrations section
    if (integrations.length > 0) {
      content += `## Integrations\n\n`;
      for (const integration of integrations) {
        content += `### ${integration.name}\n`;
        content += `${integration.description}\n`;
        content += `**Type:** ${integration.type}\n`;
        if (integration.category) {
          content += `**Category:** ${integration.category}\n`;
        }
        content += '\n';
      }
    }

    // Pricing section
    if (pricing.length > 0) {
      content += `## Pricing Plans\n\n`;
      for (const plan of pricing) {
        content += `### ${plan.planName}\n`;
        if (plan.description) {
          content += `${plan.description}\n`;
        }
        content += `**Price:** ${plan.price}\n`;
        if (plan.features) {
          content += `**Features:** ${plan.features}\n`;
        }
        content += '\n';
      }
    }

    return content;
  }

  /**
   * Perform RAG query with hybrid search
   */
  async query(ragQuery: RAGQuery): Promise<RAGResponse> {
    if (!this.isInitialized) {
      await this.initialize();
    }

    if (this.indexedDocuments.length === 0) {
      console.warn('No documents indexed yet, attempting to index data...');
      await this.indexAllData();
    }

    try {
      const searchQuery: SearchQuery = {
        query: ragQuery.query,
        filters: ragQuery.filters,
        options: {
          topK: ragQuery.limit || 10,
          minSimilarity: ragQuery.options?.minSimilarity || 0.1,
          hybridWeight: ragQuery.options?.hybridWeight || { semantic: 0.7, keyword: 0.3 },
          rerankingEnabled: ragQuery.options?.rerankingEnabled !== false,
          includeMetadata: ragQuery.options?.includeMetadata !== false
        }
      };

      const searchResponse = await this.hybridSearchEngine.search(searchQuery);
      
      // Convert search results to RAG results
      const ragResults = this.convertToRAGResults(searchResponse);
      
      // Build context from results
      const context = this.buildContext(ragResults, ragQuery.context);
      
      // Compress context if needed
      const compressedContext = this.compressContext(context);

      return {
        query: ragQuery.query,
        results: ragResults,
        context,
        compressedContext,
        totalResults: ragResults.length,
        searchTime: searchResponse.searchStats.searchTime,
        sources: this.extractSources(ragResults),
        searchStats: searchResponse.searchStats,
        suggestions: searchResponse.suggestions
      };
    } catch (error) {
      console.error('RAG query failed:', error);
      throw error;
    }
  }

  /**
   * Convert search results to RAG format
   */
  private convertToRAGResults(searchResponse: SearchResponse): RAGResult[] {
    return searchResponse.results.map(result => ({
      id: result.chunk.id,
      title: result.document.title,
      content: result.chunk.content,
      category: result.document.metadata.category || 'General',
      relevanceScore: result.score,
      metadata: {
        source: result.document.metadata.source,
        lastUpdated: new Date(result.document.metadata.processedAt),
        matchType: result.breakdown.matchType,
        chunkIndex: result.chunk.metadata.chunkIndex,
        documentType: result.document.metadata.type,
        platform: result.document.metadata.platform,
        wordCount: result.chunk.metadata.wordCount,
        matchedTerms: result.breakdown.matchedTerms
      },
      document: {
        id: result.document.id,
        title: result.document.title,
        content: result.document.content,
        category: result.document.metadata.category || 'General',
        tags: result.document.metadata.tags || [],
        metadata: result.document.metadata,
        lastUpdated: Date.now()
      }
    }));
  }

  /**
   * Build context from RAG results
   */
  private buildContext(results: RAGResult[], additionalContext?: string): string {
    let context = '';
    
    if (additionalContext) {
      context += `${additionalContext}\n\n`;
    }
    
    context += '## Relevant Information\n\n';
    
    for (const result of results.slice(0, 5)) {
      context += `### ${result.title}\n`;
      context += `${result.content}\n`;
      context += `*Source: ${result.metadata.source}*\n\n`;
    }
    
    return context;
  }

  /**
   * Compress context to fit token limits
   */
  private compressContext(context: string, maxTokens = 2000): string {
    // Simple compression - could be enhanced with more sophisticated methods
    const words = context.split(/\s+/);
    if (words.length <= maxTokens) {
      return context;
    }
    
    // Take first part and most relevant sentences
    const compressed = words.slice(0, maxTokens).join(' ');
    return compressed + '...\n\n[Context truncated for length]';
  }

  /**
   * Extract unique sources from results
   */
  private extractSources(results: RAGResult[]): string[] {
    const sources = new Set(results.map(r => r.metadata.source));
    return Array.from(sources);
  }

  /**
   * Get suggestions for query completion/expansion
   */
  async getSuggestions(partialQuery: string, limit = 5): Promise<string[]> {
    if (!this.isInitialized) {
      await this.initialize();
    }

    try {
      const embeddingStats = this.embeddingService.getVocabularyStats();
      const suggestions: string[] = [];
      
      const queryWords = partialQuery.toLowerCase().split(/\s+/);
      
      // Find related terms from vocabulary
      for (const term of embeddingStats.topTerms) {
        if (term.length > 3 && !queryWords.includes(term)) {
          for (const qWord of queryWords) {
            if (qWord.length > 2 && (term.includes(qWord) || qWord.includes(term))) {
              suggestions.push(`${partialQuery} ${term}`);
              break;
            }
          }
        }
        
        if (suggestions.length >= limit) break;
      }
      
      return suggestions;
    } catch (error) {
      console.error('Failed to get suggestions:', error);
      return [];
    }
  }

  /**
   * Get comprehensive system statistics
   */
  async getStats(): Promise<{
    documentsIndexed: number;
    chunksIndexed: number;
    vectorStoreStats: any;
    searchEngineStats: any;
    embeddingStats: any;
    lastIndexed?: Date;
  }> {
    try {
      const [vectorStats, searchStats, embeddingStats] = await Promise.all([
        this.vectorStore.getStats(),
        this.hybridSearchEngine.getStats(),
        Promise.resolve(this.embeddingService.getVocabularyStats())
      ]);

      return {
        documentsIndexed: this.indexedDocuments.length,
        chunksIndexed: searchStats.totalChunks,
        vectorStoreStats: vectorStats,
        searchEngineStats: searchStats,
        embeddingStats,
        lastIndexed: this.indexedDocuments.length > 0 ? new Date() : undefined
      };
    } catch (error) {
      console.error('Failed to get RAG stats:', error);
      return {
        documentsIndexed: 0,
        chunksIndexed: 0,
        vectorStoreStats: {},
        searchEngineStats: {},
        embeddingStats: { size: 0, topTerms: [] }
      };
    }
  }

  /**
   * Extract key phrases for auto-completion and suggestions
   */
  extractKeyPhrases(content: string): string[] {
    // Use compromise to extract key phrases
    const doc = require('compromise')(content);
    
    // Extract nouns and noun phrases
    const nouns = doc.nouns().out('array');
    const topics = doc.topics().out('array');
    
    // Combine and filter
    const phrases = [...nouns, ...topics]
      .filter(phrase => phrase.length > 3 && phrase.length < 50)
      .slice(0, 10);
    
    return phrases;
  }

  /**
   * Cleanup resources
   */
  async close(): Promise<void> {
    await this.hybridSearchEngine.close();
    await this.vectorStore.close();
  }
}