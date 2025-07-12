import natural from 'natural';
import { VectorStore, VectorDocument, VectorSearchResult } from './vectorStore';
import { EmbeddingService } from './embeddingService';
import { ProcessedDocument, DocumentChunk } from './documentProcessor';

export interface SearchQuery {
  query: string;
  filters?: {
    category?: string;
    source?: string;
    dateRange?: { start: Date; end: Date };
    documentType?: string;
    platform?: string;
  };
  options?: {
    topK?: number;
    minSimilarity?: number;
    hybridWeight?: { semantic: number; keyword: number };
    rerankingEnabled?: boolean;
    includeMetadata?: boolean;
  };
}

export interface SearchResult {
  document: ProcessedDocument;
  chunk: DocumentChunk;
  score: number;
  breakdown: {
    semanticScore: number;
    keywordScore: number;
    finalScore: number;
    matchType: 'semantic' | 'keyword' | 'hybrid';
    matchedTerms: string[];
  };
  metadata: Record<string, any>;
}

export interface SearchResponse {
  results: SearchResult[];
  query: string;
  totalResults: number;
  searchStats: {
    searchTime: number;
    semanticResults: number;
    keywordResults: number;
    rerankingApplied: boolean;
    documentsSearched: number;
    chunksSearched: number;
  };
  suggestions: string[];
}

export class HybridSearchEngine {
  private vectorStore: VectorStore;
  private embeddingService: EmbeddingService;
  private keywordIndex: Map<string, Set<string>> = new Map(); // term -> chunk IDs
  private documentIndex: Map<string, ProcessedDocument> = new Map(); // chunk ID -> document
  private chunkIndex: Map<string, DocumentChunk> = new Map(); // chunk ID -> chunk
  private initialized = false;

  constructor(connectionString: string) {
    this.vectorStore = new VectorStore(connectionString);
    this.embeddingService = EmbeddingService.getInstance();
  }

  async initialize(): Promise<void> {
    if (this.initialized) return;

    try {
      await this.vectorStore.initialize();
      console.log('Hybrid search engine initialized');
      this.initialized = true;
    } catch (error) {
      console.error('Failed to initialize hybrid search engine:', error);
      throw error;
    }
  }

  async indexDocuments(documents: ProcessedDocument[]): Promise<void> {
    if (!this.initialized) await this.initialize();

    try {
      console.log(`Starting indexing of ${documents.length} documents...`);

      // Extract all text content for embedding initialization
      const allTexts = documents.flatMap(doc => 
        doc.chunks.map(chunk => chunk.content)
      );

      // Initialize embedding service with all content
      await this.embeddingService.initialize(allTexts);

      // Process each document
      for (const document of documents) {
        await this.indexSingleDocument(document);
      }

      console.log(`Successfully indexed ${documents.length} documents with ${this.chunkIndex.size} chunks`);
    } catch (error) {
      console.error('Failed to index documents:', error);
      throw error;
    }
  }

  private async indexSingleDocument(document: ProcessedDocument): Promise<void> {
    try {
      const vectorDocuments: VectorDocument[] = [];

      // Process each chunk
      for (const chunk of document.chunks) {
        // Store in local indices
        this.documentIndex.set(chunk.id, document);
        this.chunkIndex.set(chunk.id, chunk);

        // Build keyword index
        await this.indexChunkKeywords(chunk);

        // Generate embedding for vector store
        const embeddingResult = await this.embeddingService.generateEmbedding(chunk.content);

        vectorDocuments.push({
          id: chunk.id,
          content: chunk.content,
          metadata: {
            ...chunk.metadata,
            documentId: document.id,
            documentTitle: document.title,
            documentSource: document.metadata.source,
            documentType: document.metadata.type || 'general'
          },
          embedding: embeddingResult.embedding
        });
      }

      // Add to vector store
      await this.vectorStore.addDocuments(vectorDocuments);

    } catch (error) {
      console.error(`Failed to index document ${document.id}:`, error);
      throw error;
    }
  }

  private async indexChunkKeywords(chunk: DocumentChunk): Promise<void> {
    // Tokenize and process keywords
    const tokenizer = new natural.WordTokenizer();
    const stemmer = natural.PorterStemmer;

    const tokens = tokenizer.tokenize(chunk.content.toLowerCase()) || [];

    // Process tokens
    const processedTokens = tokens
      .filter(token => 
        !natural.stopwords.includes(token) && 
        token.length > 2 && 
        /^[a-zA-Z]+$/.test(token)
      )
      .map(token => stemmer.stem(token));

    // Add to keyword index
    for (const token of processedTokens) {
      if (!this.keywordIndex.has(token)) {
        this.keywordIndex.set(token, new Set());
      }
      this.keywordIndex.get(token)!.add(chunk.id);
    }

    // Index bigrams for better phrase matching
    for (let i = 0; i < processedTokens.length - 1; i++) {
      const bigram = `${processedTokens[i]}_${processedTokens[i + 1]}`;
      if (!this.keywordIndex.has(bigram)) {
        this.keywordIndex.set(bigram, new Set());
      }
      this.keywordIndex.get(bigram)!.add(chunk.id);
    }
  }

  async search(searchQuery: SearchQuery): Promise<SearchResponse> {
    if (!this.initialized) await this.initialize();

    const startTime = Date.now();
    const { query, options = {} } = searchQuery;
    const {
      topK = 10,
      minSimilarity = 0.1,
      hybridWeight = { semantic: 0.7, keyword: 0.3 },
      rerankingEnabled = true
    } = options;

    try {
      // Perform semantic search
      const semanticResults = await this.performSemanticSearch(query, { topK: topK * 2, minSimilarity });

      // Perform keyword search
      const keywordResults = await this.performKeywordSearch(query, { topK: topK * 2 });

      // Combine and score results
      const combinedResults = await this.combineResults(
        semanticResults,
        keywordResults,
        hybridWeight,
        searchQuery.filters
      );

      // Apply reranking if enabled
      let finalResults = combinedResults;
      if (rerankingEnabled && combinedResults.length > 0) {
        finalResults = await this.rerankResults(query, combinedResults);
      }

      // Take top K results
      finalResults = finalResults.slice(0, topK);

      const searchTime = Date.now() - startTime;

      // Generate search suggestions
      const suggestions = await this.generateSuggestions(query);

      return {
        results: finalResults,
        query,
        totalResults: finalResults.length,
        searchStats: {
          searchTime,
          semanticResults: semanticResults.length,
          keywordResults: keywordResults.length,
          rerankingApplied: rerankingEnabled,
          documentsSearched: this.documentIndex.size,
          chunksSearched: this.chunkIndex.size
        },
        suggestions
      };
    } catch (error) {
      console.error('Search failed:', error);
      throw error;
    }
  }

  private async performSemanticSearch(query: string, options: { topK: number; minSimilarity: number }): Promise<VectorSearchResult[]> {
    try {
      // Generate embedding for query
      const queryEmbedding = await this.embeddingService.generateEmbedding(query);

      // Validate embedding
      if (!queryEmbedding || (!Array.isArray(queryEmbedding) && (!queryEmbedding.embedding || !Array.isArray(queryEmbedding.embedding)))) {
        console.warn('[HybridSearchEngine] Invalid embedding generated, skipping semantic search');
        return [];
      }

      // Use the embedding array directly or from the wrapper object
      const embeddingArray = Array.isArray(queryEmbedding) ? queryEmbedding : queryEmbedding.embedding;

      // Search vector store
      return await this.vectorStore.search(embeddingArray, {
        topK: options.topK,
        minSimilarity: options.minSimilarity
      });
    } catch (error) {
      console.error('Semantic search failed:', error);
      return [];
    }
  }

  private async performKeywordSearch(query: string, options: { topK: number }): Promise<Array<{ chunkId: string; score: number; matchedTerms: string[] }>> {
    try {
      // Tokenize query
      const tokenizer = new natural.WordTokenizer();
      const stemmer = natural.PorterStemmer;

      const queryTokens = (tokenizer.tokenize(query.toLowerCase()) || [])
        .filter(token => 
          !natural.stopwords.includes(token) && 
          token.length > 2 && 
          /^[a-zA-Z]+$/.test(token)
        )
        .map(token => stemmer.stem(token));

      // Score chunks based on keyword matches
      const chunkScores = new Map<string, { score: number; matchedTerms: string[] }>();

      for (const token of queryTokens) {
        const matchingChunks = this.keywordIndex.get(token);
        if (matchingChunks) {
          for (const chunkId of matchingChunks) {
            const current = chunkScores.get(chunkId) || { score: 0, matchedTerms: [] };
            current.score += 1; // TF score (could be improved with TF-IDF)
            current.matchedTerms.push(token);
            chunkScores.set(chunkId, current);
          }
        }
      }

      // Check for phrase matches (bigrams)
      for (let i = 0; i < queryTokens.length - 1; i++) {
        const bigram = `${queryTokens[i]}_${queryTokens[i + 1]}`;
        const matchingChunks = this.keywordIndex.get(bigram);
        if (matchingChunks) {
          for (const chunkId of matchingChunks) {
            const current = chunkScores.get(chunkId) || { score: 0, matchedTerms: [] };
            current.score += 2; // Boost for phrase matches
            current.matchedTerms.push(bigram);
            chunkScores.set(chunkId, current);
          }
        }
      }

      // Convert to sorted results
      const results = Array.from(chunkScores.entries())
        .map(([chunkId, data]) => ({
          chunkId,
          score: data.score / queryTokens.length, // Normalize by query length
          matchedTerms: [...new Set(data.matchedTerms)] // Remove duplicates
        }))
        .sort((a, b) => b.score - a.score)
        .slice(0, options.topK);

      return results;
    } catch (error) {
      console.error('Keyword search failed:', error);
      return [];
    }
  }

  private async combineResults(
    semanticResults: VectorSearchResult[],
    keywordResults: Array<{ chunkId: string; score: number; matchedTerms: string[] }>,
    weights: { semantic: number; keyword: number },
    filters?: SearchQuery['filters']
  ): Promise<SearchResult[]> {
    const combinedScores = new Map<string, {
      semanticScore: number;
      keywordScore: number;
      matchedTerms: string[];
      matchType: 'semantic' | 'keyword' | 'hybrid';
    }>();

    // Process semantic results
    for (const result of semanticResults) {
      combinedScores.set(result.document.id, {
        semanticScore: result.similarity,
        keywordScore: 0,
        matchedTerms: [],
        matchType: 'semantic'
      });
    }

    // Process keyword results
    for (const result of keywordResults) {
      const existing = combinedScores.get(result.chunkId);
      if (existing) {
        existing.keywordScore = result.score;
        existing.matchedTerms = result.matchedTerms;
        existing.matchType = 'hybrid';
      } else {
        combinedScores.set(result.chunkId, {
          semanticScore: 0,
          keywordScore: result.score,
          matchedTerms: result.matchedTerms,
          matchType: 'keyword'
        });
      }
    }

    // Group results by document and select best chunk per document
    const documentResults = new Map<string, {
      bestChunk: DocumentChunk;
      bestDocument: ProcessedDocument;
      bestScore: number;
      bestScores: any;
    }>();

    for (const [chunkId, scores] of combinedScores.entries()) {
      const chunk = this.chunkIndex.get(chunkId);
      const document = this.documentIndex.get(chunkId);

      if (!chunk || !document) continue;

      // Apply filters
      if (filters && !this.passesFilters(document, chunk, filters)) {
        continue;
      }

      const finalScore = (scores.semanticScore * weights.semantic) + (scores.keywordScore * weights.keyword);

      // Check if this is the best chunk for this document
      const existing = documentResults.get(document.id);
      if (!existing || finalScore > existing.bestScore) {
        documentResults.set(document.id, {
          bestChunk: chunk,
          bestDocument: document,
          bestScore: finalScore,
          bestScores: scores
        });
      }
    }

    // Convert to SearchResult objects
    const searchResults: SearchResult[] = [];
    for (const result of documentResults.values()) {
      searchResults.push({
        document: result.bestDocument,
        chunk: result.bestChunk,
        score: result.bestScore,
        breakdown: {
          semanticScore: result.bestScores.semanticScore,
          keywordScore: result.bestScores.keywordScore,
          finalScore: result.bestScore,
          matchType: result.bestScores.matchType,
          matchedTerms: result.bestScores.matchedTerms
        },
        metadata: {
          ...result.bestChunk.metadata,
          documentMetadata: result.bestDocument.metadata
        }
      });
    }

    // Sort by final score
    return searchResults.sort((a, b) => b.score - a.score);
  }

  private passesFilters(document: ProcessedDocument, chunk: DocumentChunk, filters: SearchQuery['filters']): boolean {
    if (filters.category && document.metadata.category !== filters.category) {
      return false;
    }

    if (filters.source && document.metadata.source !== filters.source) {
      return false;
    }

    if (filters.documentType && document.metadata.type !== filters.documentType) {
      return false;
    }

    if (filters.platform && !document.metadata.source?.toLowerCase().includes(filters.platform.toLowerCase())) {
      return false;
    }

    if (filters.dateRange) {
      const docDate = new Date(document.metadata.processedAt);
      if (docDate < filters.dateRange.start || docDate > filters.dateRange.end) {
        return false;
      }
    }

    return true;
  }

  private async rerankResults(query: string, results: SearchResult[]): Promise<SearchResult[]> {
    // Simple reranking based on query term density and position
    const queryTerms = query.toLowerCase().split(/\s+/).filter(term => term.length > 2);

    return results.map(result => {
      let rerankingBoost = 0;
      const content = result.chunk.content.toLowerCase();

      // Boost for query terms in the beginning of chunk
      const firstThird = content.substring(0, content.length / 3);
      for (const term of queryTerms) {
        if (firstThird.includes(term)) {
          rerankingBoost += 0.1;
        }
      }

      // Boost for exact phrase matches
      if (content.includes(query.toLowerCase())) {
        rerankingBoost += 0.2;
      }

      // Boost for document title matches
      const title = result.document.title.toLowerCase();
      for (const term of queryTerms) {
        if (title.includes(term)) {
          rerankingBoost += 0.15;
        }
      }

      return {
        ...result,
        score: result.score + rerankingBoost
      };
    }).sort((a, b) => b.score - a.score);
  }

  private async generateSuggestions(query: string, limit = 5): Promise<string[]> {
    const suggestions: string[] = [];

    // Extract key terms from indexed vocabulary
    const embeddingStats = this.embeddingService.getVocabularyStats();
    const queryWords = query.toLowerCase().split(/\s+/);

    // Find related terms from vocabulary
    for (const term of embeddingStats.topTerms) {
      if (term.length > 3 && !queryWords.includes(term)) {
        // Simple similarity check (could be improved)
        for (const qWord of queryWords) {
          if (qWord.length > 2 && (term.includes(qWord) || qWord.includes(term))) {
            suggestions.push(`${query} ${term}`);
            break;
          }
        }
      }

      if (suggestions.length >= limit) break;
    }

    return suggestions;
  }

  async getStats(): Promise<{
    totalDocuments: number;
    totalChunks: number;
    keywordTerms: number;
    vectorStoreStats: any;
    embeddingStats: any;
  }> {
    const vectorStats = await this.vectorStore.getStats();
    const embeddingStats = this.embeddingService.getVocabularyStats();

    return {
      totalDocuments: this.documentIndex.size,
      totalChunks: this.chunkIndex.size,
      keywordTerms: this.keywordIndex.size,
      vectorStoreStats: vectorStats,
      embeddingStats
    };
  }

  async close(): Promise<void> {
    await this.vectorStore.close();
  }
}