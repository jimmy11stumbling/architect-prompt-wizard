
import { ProcessedChunk } from "../processors/documentProcessor";
import { RAGQuery, RAGResult } from "@/types/rag-types";

export interface SearchResult {
  chunk: ProcessedChunk;
  score: number;
  searchType: 'semantic' | 'keyword' | 'hybrid';
  explanation?: string;
}

export interface SearchWeights {
  semantic: number;
  keyword: number;
  recency: number;
  structure: number;
}

export class HybridSearchEngine {
  private chunks: ProcessedChunk[] = [];
  private keywordIndex: Map<string, Set<string>> = new Map();
  private weights: SearchWeights = {
    semantic: 0.6,
    keyword: 0.3,
    recency: 0.05,
    structure: 0.05
  };

  constructor(chunks: ProcessedChunk[] = [], weights?: Partial<SearchWeights>) {
    this.chunks = chunks;
    if (weights) {
      this.weights = { ...this.weights, ...weights };
    }
    this.buildKeywordIndex();
  }

  addChunks(chunks: ProcessedChunk[]): void {
    this.chunks.push(...chunks);
    this.rebuildKeywordIndex();
  }

  private buildKeywordIndex(): void {
    this.keywordIndex.clear();
    
    this.chunks.forEach(chunk => {
      const words = this.extractKeywords(chunk.text);
      words.forEach(word => {
        if (!this.keywordIndex.has(word)) {
          this.keywordIndex.set(word, new Set());
        }
        this.keywordIndex.get(word)!.add(chunk.id);
      });
    });
  }

  private rebuildKeywordIndex(): void {
    this.buildKeywordIndex();
  }

  async search(query: RAGQuery): Promise<SearchResult[]> {
    const queryEmbedding = await this.generateQueryEmbedding(query.query);
    const queryKeywords = this.extractKeywords(query.query);
    
    const results: SearchResult[] = [];

    for (const chunk of this.chunks) {
      // Semantic similarity score
      const semanticScore = chunk.embedding 
        ? this.cosineSimilarity(queryEmbedding, chunk.embedding)
        : 0;

      // Keyword matching score
      const keywordScore = this.calculateKeywordScore(queryKeywords, chunk.text);

      // Recency score (newer chunks get slight boost)
      const recencyScore = this.calculateRecencyScore(chunk);

      // Structure score (headings, tables get boost)
      const structureScore = this.calculateStructureScore(chunk, query.query);

      // Combined hybrid score
      const hybridScore = 
        (semanticScore * this.weights.semantic) +
        (keywordScore * this.weights.keyword) +
        (recencyScore * this.weights.recency) +
        (structureScore * this.weights.structure);

      if (hybridScore > (query.threshold || 0.1)) {
        results.push({
          chunk,
          score: hybridScore,
          searchType: 'hybrid',
          explanation: this.generateExplanation(semanticScore, keywordScore, recencyScore, structureScore)
        });
      }
    }

    // Sort by score and limit results
    results.sort((a, b) => b.score - a.score);
    return results.slice(0, query.limit || 10);
  }

  async searchSemantic(query: string, limit: number = 10): Promise<SearchResult[]> {
    const queryEmbedding = await this.generateQueryEmbedding(query);
    const results: SearchResult[] = [];

    for (const chunk of this.chunks) {
      if (!chunk.embedding) continue;
      
      const score = this.cosineSimilarity(queryEmbedding, chunk.embedding);
      
      results.push({
        chunk,
        score,
        searchType: 'semantic',
        explanation: `Semantic similarity: ${(score * 100).toFixed(1)}%`
      });
    }

    return results
      .sort((a, b) => b.score - a.score)
      .slice(0, limit);
  }

  searchKeyword(query: string, limit: number = 10): SearchResult[] {
    const queryKeywords = this.extractKeywords(query);
    const results: SearchResult[] = [];

    for (const chunk of this.chunks) {
      const score = this.calculateKeywordScore(queryKeywords, chunk.text);
      
      if (score > 0) {
        results.push({
          chunk,
          score,
          searchType: 'keyword',
          explanation: `Keyword matches: ${this.getMatchingKeywords(queryKeywords, chunk.text).join(', ')}`
        });
      }
    }

    return results
      .sort((a, b) => b.score - a.score)
      .slice(0, limit);
  }

  private async generateQueryEmbedding(query: string): Promise<number[]> {
    // Use the same embedding generation as in DocumentProcessor
    const words = query.toLowerCase().split(/\s+/);
    const embedding = new Array(384).fill(0);
    
    words.forEach((word, index) => {
      const hash = this.simpleHash(word);
      embedding[hash % embedding.length] += 1;
    });
    
    // Normalize
    const magnitude = Math.sqrt(embedding.reduce((sum, val) => sum + val * val, 0));
    return embedding.map(val => magnitude > 0 ? val / magnitude : 0);
  }

  private extractKeywords(text: string): string[] {
    // Enhanced keyword extraction with stop words removal and stemming
    const stopWords = new Set([
      'the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of', 'with', 'by',
      'is', 'are', 'was', 'were', 'be', 'been', 'being', 'have', 'has', 'had', 'do', 'does', 'did',
      'will', 'would', 'could', 'should', 'may', 'might', 'can', 'this', 'that', 'these', 'those'
    ]);

    return text
      .toLowerCase()
      .replace(/[^\w\s]/g, ' ')
      .split(/\s+/)
      .filter(word => word.length > 2 && !stopWords.has(word))
      .map(word => this.stemWord(word));
  }

  private stemWord(word: string): string {
    // Simple stemming - remove common suffixes
    const suffixes = ['ing', 'ed', 'er', 'est', 'ly', 'tion', 'sion', 'ness', 'ment'];
    
    for (const suffix of suffixes) {
      if (word.endsWith(suffix) && word.length > suffix.length + 2) {
        return word.substring(0, word.length - suffix.length);
      }
    }
    
    return word;
  }

  private calculateKeywordScore(queryKeywords: string[], text: string): number {
    const textKeywords = this.extractKeywords(text);
    const matches = queryKeywords.filter(qw => textKeywords.includes(qw));
    
    if (queryKeywords.length === 0) return 0;
    
    // TF-IDF style scoring
    const termFrequency = matches.length / queryKeywords.length;
    const uniqueMatches = new Set(matches).size;
    
    return (termFrequency * 0.7) + (uniqueMatches / queryKeywords.length * 0.3);
  }

  private getMatchingKeywords(queryKeywords: string[], text: string): string[] {
    const textKeywords = new Set(this.extractKeywords(text));
    return queryKeywords.filter(qw => textKeywords.has(qw));
  }

  private calculateRecencyScore(chunk: ProcessedChunk): number {
    // Simple recency boost - in production, you'd use actual timestamps
    const chunkAge = chunk.metadata.chunkIndex / Math.max(1, chunk.metadata.totalChunks);
    return 1 - chunkAge; // Newer chunks (lower index) get higher score
  }

  private calculateStructureScore(chunk: ProcessedChunk, query: string): number {
    let score = 0;
    
    // Boost for chunks near headings
    if (chunk.metadata.nearHeading) {
      score += 0.3;
    }
    
    // Boost for chunks with tables if query suggests data lookup
    if (chunk.metadata.tables && chunk.metadata.tables.length > 0 && this.isDataQuery(query)) {
      score += 0.2;
    }
    
    // Boost for chunks with code if query is technical
    if (chunk.metadata.codeBlocks && chunk.metadata.codeBlocks.length > 0 && this.isTechnicalQuery(query)) {
      score += 0.2;
    }
    
    return Math.min(score, 1.0);
  }

  private isDataQuery(query: string): boolean {
    const dataKeywords = ['table', 'data', 'statistics', 'numbers', 'comparison', 'chart'];
    const queryLower = query.toLowerCase();
    return dataKeywords.some(keyword => queryLower.includes(keyword));
  }

  private isTechnicalQuery(query: string): boolean {
    const techKeywords = ['code', 'function', 'implementation', 'algorithm', 'api', 'programming'];
    const queryLower = query.toLowerCase();
    return techKeywords.some(keyword => queryLower.includes(keyword));
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
    
    const magnitude = Math.sqrt(normA) * Math.sqrt(normB);
    return magnitude > 0 ? dotProduct / magnitude : 0;
  }

  private generateExplanation(semantic: number, keyword: number, recency: number, structure: number): string {
    const components = [];
    
    if (semantic > 0.1) components.push(`Semantic: ${(semantic * 100).toFixed(1)}%`);
    if (keyword > 0.1) components.push(`Keywords: ${(keyword * 100).toFixed(1)}%`);
    if (recency > 0.1) components.push(`Recency: ${(recency * 100).toFixed(1)}%`);
    if (structure > 0.1) components.push(`Structure: ${(structure * 100).toFixed(1)}%`);
    
    return components.join(', ');
  }

  private simpleHash(str: string): number {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash;
    }
    return Math.abs(hash);
  }

  updateWeights(newWeights: Partial<SearchWeights>): void {
    this.weights = { ...this.weights, ...newWeights };
  }

  getStats() {
    return {
      totalChunks: this.chunks.length,
      keywordIndexSize: this.keywordIndex.size,
      averageChunkLength: this.chunks.reduce((sum, chunk) => sum + chunk.text.length, 0) / this.chunks.length,
      weights: this.weights
    };
  }
}
