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
  private documentIndex: Map<string, ProcessedDocument> = new Map();
  private chunkIndex: Map<string, DocumentChunk> = new Map();
  private keywordIndex: Map<string, Set<string>> = new Map();
  private initialized = false;

  constructor(vectorStore: VectorStore, embeddingService: EmbeddingService) {
    this.vectorStore = vectorStore;
    this.embeddingService = embeddingService;
  }

  async initialize(): Promise<void> {
    if (this.initialized) return;
    this.initialized = true;
  }

  async indexDocument(document: ProcessedDocument): Promise<void> {
    this.documentIndex.set(document.id, document);
    
    for (const chunk of document.chunks) {
      this.chunkIndex.set(chunk.id, chunk);
      await this.indexChunkKeywords(chunk);
    }
  }

  private async indexChunkKeywords(chunk: DocumentChunk): Promise<void> {
    const stemmer = natural.PorterStemmer;
    const tokens = new natural.WordTokenizer().tokenize(chunk.content.toLowerCase());
    
    if (!tokens) return;
    
    const processedTokens = tokens
      .filter(token => 
        !natural.stopwords.includes(token) && 
        token.length > 2 && 
        /^[a-zA-Z]+$/.test(token)
      )
      .map(token => stemmer.stem(token));

    for (const token of processedTokens) {
      if (!this.keywordIndex.has(token)) {
        this.keywordIndex.set(token, new Set());
      }
      this.keywordIndex.get(token)!.add(chunk.id);
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
      // Perform keyword search
      const keywordResults = await this.performKeywordSearch(query, { topK, minSimilarity });
      
      // Since we don't have vector search working yet, use keyword results as primary
      const hybridResults = keywordResults.map(result => ({
        document: this.documentIndex.get(result.documentId)!,
        chunk: this.chunkIndex.get(result.chunkId)!,
        score: result.score,
        breakdown: {
          semanticScore: 0,
          keywordScore: result.score,
          finalScore: result.score,
          matchType: 'keyword' as const,
          matchedTerms: result.matchedTerms || []
        },
        metadata: result.metadata || {}
      })).filter(result => result.document && result.chunk);

      const searchTime = Date.now() - startTime;
      
      return {
        results: hybridResults.slice(0, topK),
        query,
        totalResults: hybridResults.length,
        searchStats: {
          searchTime,
          semanticResults: 0,
          keywordResults: keywordResults.length,
          rerankingApplied: false,
          documentsSearched: this.documentIndex.size,
          chunksSearched: this.chunkIndex.size
        },
        suggestions: []
      };
    } catch (error) {
      console.error('Hybrid search error:', error);
      return {
        results: [],
        query,
        totalResults: 0,
        searchStats: {
          searchTime: Date.now() - startTime,
          semanticResults: 0,
          keywordResults: 0,
          rerankingApplied: false,
          documentsSearched: this.documentIndex.size,
          chunksSearched: this.chunkIndex.size
        },
        suggestions: []
      };
    }
  }

  async indexDocuments(documents: ProcessedDocument[]): Promise<void> {
    for (const document of documents) {
      await this.indexDocument(document);
    }
  }

  private async performKeywordSearch(query: string, options: { topK: number; minSimilarity: number }): Promise<any[]> {
    const stemmer = natural.PorterStemmer;
    const tokens = new natural.WordTokenizer().tokenize(query.toLowerCase());
    
    if (!tokens) return [];
    
    const processedTokens = tokens
      .filter(token => 
        !natural.stopwords.includes(token) && 
        token.length > 2 && 
        /^[a-zA-Z]+$/.test(token)
      )
      .map(token => stemmer.stem(token));

    console.log(`Keyword search debug: query="${query}", processedTokens=${JSON.stringify(processedTokens)}`);

    const chunkScores = new Map<string, { score: number; matchedTerms: string[] }>();
    
    for (const token of processedTokens) {
      const matchingChunks = this.keywordIndex.get(token);
      console.log(`Token "${token}" found ${matchingChunks ? matchingChunks.size : 0} chunks`);
      if (matchingChunks) {
        for (const chunkId of matchingChunks) {
          const current = chunkScores.get(chunkId) || { score: 0, matchedTerms: [] };
          current.score += 1;
          current.matchedTerms.push(token);
          chunkScores.set(chunkId, current);
        }
      }
    }

    console.log(`Found ${chunkScores.size} chunks with matches`);

    // Convert to results array and sort by score
    const results = Array.from(chunkScores.entries())
      .map(([chunkId, { score, matchedTerms }]) => {
        const chunk = this.chunkIndex.get(chunkId);
        return {
          chunkId,
          documentId: chunk?.documentId || '',
          score: score / processedTokens.length, // Normalize by query length
          matchedTerms,
          metadata: {}
        };
      })
      .filter(result => result.score >= options.minSimilarity)
      .sort((a, b) => b.score - a.score)
      .slice(0, options.topK);

    console.log(`Returning ${results.length} results after filtering by minSimilarity=${options.minSimilarity}`);
    return results;
  }

  async getStats(): Promise<any> {
    const sampleKeywords = Array.from(this.keywordIndex.keys()).slice(0, 10);
    const sampleDocuments = Array.from(this.documentIndex.keys()).slice(0, 5);
    
    console.log("HybridSearchEngine Stats:", {
      documentsIndexed: this.documentIndex.size,
      chunksIndexed: this.chunkIndex.size,
      keywordTerms: this.keywordIndex.size,
      sampleKeywords,
      sampleDocuments
    });
    
    // Check if "agent" term exists in keyword index
    const agentChunks = this.keywordIndex.get("agent");
    console.log(`Keyword "agent" found in ${agentChunks ? agentChunks.size : 0} chunks`);
    
    return {
      documentsIndexed: this.documentIndex.size,
      chunksIndexed: this.chunkIndex.size,
      keywordTerms: this.keywordIndex.size,
      vectorStoreStats: this.vectorStore.getStats ? await this.vectorStore.getStats() : {}
    };
  }

  clear(): void {
    this.documentIndex.clear();
    this.chunkIndex.clear();
    this.keywordIndex.clear();
  }
}