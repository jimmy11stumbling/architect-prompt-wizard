/**
 * RAG 2.0 Vector Search System Implementation
 * Comprehensive retrieval-augmented generation with hybrid search, 
 * document chunking, and advanced re-ranking capabilities
 */

import { TechStack, PlatformType } from "@/types/ipa-types";

// Core RAG Types
export interface RAGDocument {
  id: string;
  content: string;
  metadata: {
    title: string;
    category: string;
    platform?: PlatformType;
    techStack?: TechStack[];
    source: string;
    lastUpdated: Date;
    wordCount: number;
  };
  chunks: DocumentChunk[];
}

export interface DocumentChunk {
  id: string;
  documentId: string;
  content: string;
  embedding?: number[];
  startIndex: number;
  endIndex: number;
  metadata: {
    chunkIndex: number;
    overlapPrevious: boolean;
    overlapNext: boolean;
    keywords: string[];
    summary: string;
  };
}

export interface RAGQuery {
  query: string;
  context?: string;
  filters?: {
    platform?: PlatformType;
    techStack?: TechStack[];
    category?: string;
    dateRange?: {
      start: Date;
      end: Date;
    };
  };
  searchConfig?: {
    semanticWeight?: number; // 0-1, weight for semantic search
    keywordWeight?: number;  // 0-1, weight for keyword search
    maxResults?: number;
    rerankResults?: boolean;
  };
}

export interface RAGResult {
  id: string;
  content: string;
  score: number;
  relevanceScore: number;
  source: string;
  metadata: {
    documentId: string;
    chunkId: string;
    platform?: PlatformType;
    category: string;
    matchType: 'semantic' | 'keyword' | 'hybrid';
  };
}

export interface RAGResponse {
  query: string;
  results: RAGResult[];
  searchStats: {
    totalDocuments: number;
    searchTime: number;
    semanticResults: number;
    keywordResults: number;
    rerankingApplied: boolean;
  };
  suggestions?: string[];
}

// Text Processing Utilities
export class TextProcessor {
  /**
   * Smart document chunking with semantic awareness
   */
  static chunkDocument(document: RAGDocument, options: {
    chunkSize?: number;
    overlapSize?: number;
    respectSentences?: boolean;
  } = {}): DocumentChunk[] {
    const {
      chunkSize = 1000,
      overlapSize = 200,
      respectSentences = true
    } = options;

    const content = document.content;
    const chunks: DocumentChunk[] = [];
    
    if (respectSentences) {
      // Split by sentences first
      const sentences = content.split(/[.!?]+/).filter(s => s.trim().length > 0);
      let currentChunk = '';
      let currentIndex = 0;
      let chunkIndex = 0;

      for (const sentence of sentences) {
        const sentenceWithPunctuation = sentence.trim() + '.';
        
        if (currentChunk.length + sentenceWithPunctuation.length <= chunkSize) {
          currentChunk += (currentChunk ? ' ' : '') + sentenceWithPunctuation;
        } else {
          // Create chunk from current content
          if (currentChunk) {
            chunks.push(this.createChunk(
              document.id,
              currentChunk,
              currentIndex,
              currentIndex + currentChunk.length,
              chunkIndex++
            ));
          }
          
          // Start new chunk with overlap
          const overlapText = this.getOverlapText(currentChunk, overlapSize);
          currentChunk = overlapText + (overlapText ? ' ' : '') + sentenceWithPunctuation;
          currentIndex += currentChunk.length - overlapText.length;
        }
      }
      
      // Add final chunk
      if (currentChunk) {
        chunks.push(this.createChunk(
          document.id,
          currentChunk,
          currentIndex,
          currentIndex + currentChunk.length,
          chunkIndex
        ));
      }
    } else {
      // Simple fixed-size chunking with overlap
      for (let i = 0; i < content.length; i += chunkSize - overlapSize) {
        const chunkContent = content.slice(i, Math.min(i + chunkSize, content.length));
        chunks.push(this.createChunk(
          document.id,
          chunkContent,
          i,
          Math.min(i + chunkSize, content.length),
          Math.floor(i / (chunkSize - overlapSize))
        ));
      }
    }

    return chunks;
  }

  private static createChunk(
    documentId: string,
    content: string,
    startIndex: number,
    endIndex: number,
    chunkIndex: number
  ): DocumentChunk {
    return {
      id: `${documentId}-chunk-${chunkIndex}`,
      documentId,
      content: content.trim(),
      startIndex,
      endIndex,
      metadata: {
        chunkIndex,
        overlapPrevious: chunkIndex > 0,
        overlapNext: endIndex < content.length,
        keywords: this.extractKeywords(content),
        summary: this.generateSummary(content)
      }
    };
  }

  private static getOverlapText(text: string, overlapSize: number): string {
    if (text.length <= overlapSize) return text;
    return text.slice(-overlapSize);
  }

  /**
   * Extract key terms using TF-IDF-like approach
   */
  static extractKeywords(text: string, maxKeywords: number = 10): string[] {
    const words = text.toLowerCase()
      .replace(/[^\w\s]/g, '')
      .split(/\s+/)
      .filter(word => word.length > 3 && !this.STOP_WORDS.has(word));

    const wordFreq = new Map<string, number>();
    words.forEach(word => {
      wordFreq.set(word, (wordFreq.get(word) || 0) + 1);
    });

    return Array.from(wordFreq.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, maxKeywords)
      .map(([word]) => word);
  }

  /**
   * Generate a brief summary of the chunk
   */
  static generateSummary(text: string, maxLength: number = 150): string {
    const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 0);
    
    if (sentences.length === 0) return '';
    
    // Take first sentence if it's comprehensive enough
    const firstSentence = sentences[0].trim();
    if (firstSentence.length >= maxLength * 0.7) {
      return firstSentence.slice(0, maxLength) + (firstSentence.length > maxLength ? '...' : '');
    }
    
    // Combine sentences until we reach max length
    let summary = '';
    for (const sentence of sentences) {
      const nextSummary = summary + (summary ? '. ' : '') + sentence.trim();
      if (nextSummary.length > maxLength) break;
      summary = nextSummary;
    }
    
    return summary || firstSentence.slice(0, maxLength);
  }

  /**
   * Generate simple embeddings using TF-IDF (fallback for when no embedding model available)
   */
  static generateTFIDFEmbedding(text: string, vocabulary: Set<string>): number[] {
    const words = text.toLowerCase()
      .replace(/[^\w\s]/g, '')
      .split(/\s+/)
      .filter(word => vocabulary.has(word));

    const wordCount = new Map<string, number>();
    words.forEach(word => {
      wordCount.set(word, (wordCount.get(word) || 0) + 1);
    });

    const totalWords = words.length;
    const embedding: number[] = [];

    for (const word of vocabulary) {
      const tf = (wordCount.get(word) || 0) / totalWords;
      embedding.push(tf);
    }

    return embedding;
  }

  private static readonly STOP_WORDS = new Set([
    'the', 'be', 'to', 'of', 'and', 'a', 'in', 'that', 'have',
    'i', 'it', 'for', 'not', 'on', 'with', 'he', 'as', 'you',
    'do', 'at', 'this', 'but', 'his', 'by', 'from', 'they',
    'we', 'say', 'her', 'she', 'or', 'an', 'will', 'my',
    'one', 'all', 'would', 'there', 'their', 'what', 'so',
    'up', 'out', 'if', 'about', 'who', 'get', 'which', 'go', 'me'
  ]);
}

// Hybrid Search Engine
export class HybridSearchEngine {
  private documents: Map<string, RAGDocument> = new Map();
  private chunks: Map<string, DocumentChunk> = new Map();
  private vocabulary: Set<string> = new Set();
  private isIndexed = false;

  /**
   * Add documents to the search index
   */
  async indexDocuments(documents: RAGDocument[]): Promise<void> {
    console.log(`Indexing ${documents.length} documents...`);
    
    for (const doc of documents) {
      // Chunk the document
      doc.chunks = TextProcessor.chunkDocument(doc);
      
      // Generate embeddings for chunks
      for (const chunk of doc.chunks) {
        // Build vocabulary
        const words = chunk.content.toLowerCase()
          .replace(/[^\w\s]/g, '')
          .split(/\s+/)
          .filter(word => word.length > 3);
        
        words.forEach(word => this.vocabulary.add(word));
        this.chunks.set(chunk.id, chunk);
      }
      
      this.documents.set(doc.id, doc);
    }

    // Generate embeddings after vocabulary is built
    for (const chunk of this.chunks.values()) {
      chunk.embedding = TextProcessor.generateTFIDFEmbedding(chunk.content, this.vocabulary);
    }

    this.isIndexed = true;
    console.log(`Indexing complete. ${this.chunks.size} chunks indexed with vocabulary size: ${this.vocabulary.size}`);
  }

  /**
   * Perform hybrid search combining semantic and keyword approaches
   */
  async search(query: RAGQuery): Promise<RAGResponse> {
    if (!this.isIndexed) {
      throw new Error('Search index not built. Call indexDocuments() first.');
    }

    const startTime = Date.now();
    const config = query.searchConfig || {};
    const semanticWeight = config.semanticWeight ?? 0.7;
    const keywordWeight = config.keywordWeight ?? 0.3;
    const maxResults = config.maxResults ?? 10;

    // Generate query embedding
    const queryEmbedding = TextProcessor.generateTFIDFEmbedding(query.query, this.vocabulary);

    // Perform semantic search
    const semanticResults = this.performSemanticSearch(query.query, queryEmbedding, query.filters);
    
    // Perform keyword search
    const keywordResults = this.performKeywordSearch(query.query, query.filters);

    // Combine and rank results
    const combinedResults = this.combineResults(semanticResults, keywordResults, semanticWeight, keywordWeight);

    // Apply re-ranking if requested
    let finalResults = combinedResults;
    if (config.rerankResults !== false) {
      finalResults = this.rerankResults(query.query, combinedResults);
    }

    // Apply filters and limit results
    finalResults = this.applyFiltersAndLimit(finalResults, query.filters, maxResults);

    const searchTime = Date.now() - startTime;

    return {
      query: query.query,
      results: finalResults,
      searchStats: {
        totalDocuments: this.documents.size,
        searchTime,
        semanticResults: semanticResults.length,
        keywordResults: keywordResults.length,
        rerankingApplied: config.rerankResults !== false
      },
      suggestions: this.generateQuerySuggestions(query.query)
    };
  }

  private performSemanticSearch(query: string, queryEmbedding: number[], filters?: RAGQuery['filters']): RAGResult[] {
    const results: RAGResult[] = [];

    for (const chunk of this.chunks.values()) {
      if (!chunk.embedding) continue;

      const document = this.documents.get(chunk.documentId);
      if (!document) continue;

      // Apply filters
      if (filters && !this.passesFilters(document, filters)) continue;

      // Calculate cosine similarity
      const similarity = this.cosineSimilarity(queryEmbedding, chunk.embedding);
      
      if (similarity > 0.1) { // Minimum threshold
        results.push({
          id: chunk.id,
          content: chunk.content,
          score: similarity,
          relevanceScore: similarity,
          source: document.metadata.source,
          metadata: {
            documentId: document.id,
            chunkId: chunk.id,
            platform: document.metadata.platform,
            category: document.metadata.category,
            matchType: 'semantic'
          }
        });
      }
    }

    return results.sort((a, b) => b.score - a.score);
  }

  private performKeywordSearch(query: string, filters?: RAGQuery['filters']): RAGResult[] {
    const queryWords = query.toLowerCase()
      .replace(/[^\w\s]/g, '')
      .split(/\s+/)
      .filter(word => word.length > 2);

    const results: RAGResult[] = [];

    for (const chunk of this.chunks.values()) {
      const document = this.documents.get(chunk.documentId);
      if (!document) continue;

      // Apply filters
      if (filters && !this.passesFilters(document, filters)) continue;

      const chunkWords = chunk.content.toLowerCase()
        .replace(/[^\w\s]/g, '')
        .split(/\s+/);

      // Calculate keyword match score
      let matchCount = 0;
      let exactPhraseBonus = 0;

      for (const queryWord of queryWords) {
        const wordCount = chunkWords.filter(word => word.includes(queryWord)).length;
        matchCount += wordCount;
        
        // Bonus for exact matches
        if (chunkWords.includes(queryWord)) {
          exactPhraseBonus += 0.5;
        }
      }

      // Check for phrase matches
      if (query.length > 5 && chunk.content.toLowerCase().includes(query.toLowerCase())) {
        exactPhraseBonus += 2;
      }

      const score = (matchCount / chunkWords.length) + (exactPhraseBonus / queryWords.length);

      if (score > 0.05) { // Minimum threshold
        results.push({
          id: chunk.id,
          content: chunk.content,
          score: score,
          relevanceScore: score,
          source: document.metadata.source,
          metadata: {
            documentId: document.id,
            chunkId: chunk.id,
            platform: document.metadata.platform,
            category: document.metadata.category,
            matchType: 'keyword'
          }
        });
      }
    }

    return results.sort((a, b) => b.score - a.score);
  }

  private combineResults(semantic: RAGResult[], keyword: RAGResult[], semanticWeight: number, keywordWeight: number): RAGResult[] {
    const resultMap = new Map<string, RAGResult>();

    // Add semantic results
    semantic.forEach(result => {
      result.score = result.score * semanticWeight;
      resultMap.set(result.id, result);
    });

    // Add or merge keyword results
    keyword.forEach(result => {
      const existing = resultMap.get(result.id);
      if (existing) {
        // Combine scores
        existing.score = existing.score + (result.score * keywordWeight);
        existing.metadata.matchType = 'hybrid';
      } else {
        result.score = result.score * keywordWeight;
        resultMap.set(result.id, result);
      }
    });

    return Array.from(resultMap.values()).sort((a, b) => b.score - a.score);
  }

  private rerankResults(query: string, results: RAGResult[]): RAGResult[] {
    // Simple re-ranking based on content quality and relevance
    return results.map(result => {
      let rerankScore = result.score;

      // Boost results with good content structure
      const sentences = result.content.split(/[.!?]+/).length;
      if (sentences >= 2 && sentences <= 6) {
        rerankScore *= 1.1;
      }

      // Boost results with query terms in different positions
      const lowerContent = result.content.toLowerCase();
      const lowerQuery = query.toLowerCase();
      
      if (lowerContent.startsWith(lowerQuery)) {
        rerankScore *= 1.2;
      } else if (lowerContent.includes(lowerQuery)) {
        rerankScore *= 1.1;
      }

      return { ...result, score: rerankScore };
    }).sort((a, b) => b.score - a.score);
  }

  private applyFiltersAndLimit(results: RAGResult[], filters?: RAGQuery['filters'], maxResults: number = 10): RAGResult[] {
    let filtered = results;

    if (filters) {
      filtered = results.filter(result => {
        const doc = this.documents.get(result.metadata.documentId);
        return doc ? this.passesFilters(doc, filters) : false;
      });
    }

    return filtered.slice(0, maxResults);
  }

  private passesFilters(document: RAGDocument, filters: RAGQuery['filters']): boolean {
    if (filters.platform && document.metadata.platform !== filters.platform) {
      return false;
    }

    if (filters.category && document.metadata.category !== filters.category) {
      return false;
    }

    if (filters.techStack && filters.techStack.length > 0) {
      const docTechStack = document.metadata.techStack || [];
      const hasCommonTech = filters.techStack.some(tech => docTechStack.includes(tech));
      if (!hasCommonTech) return false;
    }

    if (filters.dateRange) {
      const docDate = document.metadata.lastUpdated;
      if (docDate < filters.dateRange.start || docDate > filters.dateRange.end) {
        return false;
      }
    }

    return true;
  }

  private cosineSimilarity(a: number[], b: number[]): number {
    if (a.length !== b.length) return 0;

    let dotProduct = 0;
    let normA = 0;
    let normB = 0;

    for (let i = 0; i < a.length; i++) {
      dotProduct += a[i] * b[i];
      normA += a[i] * a[i];
      normB += b[i] * b[i];
    }

    if (normA === 0 || normB === 0) return 0;

    return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
  }

  private generateQuerySuggestions(query: string): string[] {
    // Simple query suggestions based on document content
    const suggestions: string[] = [];
    const queryWords = query.toLowerCase().split(/\s+/);

    // Find related terms from indexed vocabulary
    const relatedTerms = Array.from(this.vocabulary)
      .filter(word => queryWords.some(qw => word.includes(qw) || qw.includes(word)))
      .slice(0, 5);

    relatedTerms.forEach(term => {
      suggestions.push(`${query} ${term}`);
    });

    return suggestions;
  }

  /**
   * Get index statistics
   */
  getIndexStats() {
    return {
      totalDocuments: this.documents.size,
      totalChunks: this.chunks.size,
      vocabularySize: this.vocabulary.size,
      isIndexed: this.isIndexed
    };
  }
}

// Main RAG System
export class RAGSystem {
  private searchEngine: HybridSearchEngine;
  private documents: RAGDocument[] = [];

  constructor() {
    this.searchEngine = new HybridSearchEngine();
  }

  /**
   * Initialize the RAG system with platform data
   */
  async initialize(platformData: any[]): Promise<void> {
    console.log('Initializing RAG system...');
    
    // Convert platform data to RAG documents
    const documents: RAGDocument[] = platformData.map((platform, index) => ({
      id: `platform-${platform.name || index}`,
      content: this.extractPlatformContent(platform),
      metadata: {
        title: platform.name || `Platform ${index}`,
        category: platform.category || 'Platform',
        platform: this.mapPlatformName(platform.name),
        techStack: this.extractTechStack(platform),
        source: 'Platform Database',
        lastUpdated: new Date(),
        wordCount: this.extractPlatformContent(platform).split(/\s+/).length
      },
      chunks: [] // Will be populated during indexing
    }));

    this.documents = documents;
    await this.searchEngine.indexDocuments(documents);
    
    console.log(`RAG system initialized with ${documents.length} documents`);
  }

  /**
   * Search for relevant information
   */
  async search(query: string, options?: Partial<RAGQuery>): Promise<RAGResponse> {
    const ragQuery: RAGQuery = {
      query,
      ...options
    };

    return await this.searchEngine.search(ragQuery);
  }

  /**
   * Add new documents to the index
   */
  async addDocuments(documents: RAGDocument[]): Promise<void> {
    this.documents.push(...documents);
    await this.searchEngine.indexDocuments(this.documents);
  }

  /**
   * Get system statistics
   */
  getStats() {
    return this.searchEngine.getIndexStats();
  }

  private extractPlatformContent(platform: any): string {
    const parts: string[] = [];
    
    if (platform.name) parts.push(`Platform: ${platform.name}`);
    if (platform.description) parts.push(`Description: ${platform.description}`);
    if (platform.category) parts.push(`Category: ${platform.category}`);
    
    // Add features
    if (platform.features && Array.isArray(platform.features)) {
      const featureTexts = platform.features.map((f: any) => f.featureName || f.name || f);
      parts.push(`Features: ${featureTexts.join(', ')}`);
    }
    
    // Add integrations
    if (platform.integrations && Array.isArray(platform.integrations)) {
      const integrationTexts = platform.integrations.map((i: any) => i.serviceName || i.name || i);
      parts.push(`Integrations: ${integrationTexts.join(', ')}`);
    }
    
    // Add pricing info
    if (platform.pricing && Array.isArray(platform.pricing)) {
      const pricingTexts = platform.pricing.map((p: any) => `${p.planName}: ${p.price}`);
      parts.push(`Pricing: ${pricingTexts.join(', ')}`);
    }

    return parts.join('\n\n');
  }

  private mapPlatformName(name: string): PlatformType | undefined {
    if (!name) return undefined;
    
    const nameMap: Record<string, PlatformType> = {
      'bolt': 'bolt',
      'bolt.new': 'bolt',
      'cursor': 'cursor',
      'lovable': 'lovable',
      'replit': 'replit',
      'windsurf': 'windsurf'
    };

    return nameMap[name.toLowerCase()];
  }

  private extractTechStack(platform: any): TechStack[] {
    const techStack: TechStack[] = [];
    
    // Extract from features or other platform data
    if (platform.features) {
      platform.features.forEach((feature: any) => {
        const featureName = feature.featureName || feature.name || feature;
        if (typeof featureName === 'string') {
          // Simple mapping - in real implementation, this would be more sophisticated
          if (featureName.toLowerCase().includes('react')) techStack.push('React');
          if (featureName.toLowerCase().includes('node')) techStack.push('Node.js');
          if (featureName.toLowerCase().includes('typescript')) techStack.push('TypeScript');
        }
      });
    }

    return techStack;
  }
}

// Export singleton instance
export const ragSystem = new RAGSystem();