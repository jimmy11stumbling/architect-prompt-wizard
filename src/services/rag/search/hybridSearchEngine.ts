
import { ProcessedChunk } from "../processors/documentProcessor";
import { RAGQuery } from "@/types/rag-types";
import { KeywordMatcher } from "./core/keywordMatcher";
import { SemanticMatcher } from "./core/semanticMatcher";
import { ScoringEngine, SearchWeights } from "./core/scoringEngine";

export interface SearchResult {
  chunk: ProcessedChunk;
  score: number;
  searchType: 'semantic' | 'keyword' | 'hybrid';
  explanation?: string;
}

export class HybridSearchEngine {
  private chunks: ProcessedChunk[] = [];
  private keywordMatcher: KeywordMatcher;
  private scoringEngine: ScoringEngine;

  constructor(chunks: ProcessedChunk[] = [], weights?: Partial<SearchWeights>) {
    this.chunks = chunks;
    this.keywordMatcher = new KeywordMatcher();
    this.scoringEngine = new ScoringEngine({
      semantic: 0.6,
      keyword: 0.3,
      recency: 0.05,
      structure: 0.05,
      ...weights
    });
    this.buildKeywordIndex();
  }

  addChunks(chunks: ProcessedChunk[]): void {
    this.chunks.push(...chunks);
    this.buildKeywordIndex();
  }

  private buildKeywordIndex(): void {
    this.keywordMatcher.buildIndex(this.chunks.map(chunk => ({
      id: chunk.id,
      text: chunk.text
    })));
  }

  async search(query: RAGQuery): Promise<SearchResult[]> {
    const queryEmbedding = await SemanticMatcher.generateQueryEmbedding(query.query);
    const queryKeywords = this.extractKeywords(query.query);
    
    const results: SearchResult[] = [];

    for (const chunk of this.chunks) {
      const semanticScore = chunk.embedding 
        ? SemanticMatcher.cosineSimilarity(queryEmbedding, chunk.embedding)
        : 0;

      const keywordScore = this.keywordMatcher.calculateScore(queryKeywords, chunk.text);
      const recencyScore = this.scoringEngine.calculateRecencyScore(chunk);
      const structureScore = this.scoringEngine.calculateStructureScore(chunk, query.query);

      const hybridScore = this.scoringEngine.calculateHybridScore(
        semanticScore, keywordScore, recencyScore, structureScore
      );

      if (hybridScore > (query.threshold || 0.1)) {
        results.push({
          chunk,
          score: hybridScore,
          searchType: 'hybrid',
          explanation: this.scoringEngine.generateExplanation(semanticScore, keywordScore, recencyScore, structureScore)
        });
      }
    }

    results.sort((a, b) => b.score - a.score);
    return results.slice(0, query.limit || 10);
  }

  async searchSemantic(query: string, limit: number = 10): Promise<SearchResult[]> {
    const queryEmbedding = await SemanticMatcher.generateQueryEmbedding(query);
    const results: SearchResult[] = [];

    for (const chunk of this.chunks) {
      if (!chunk.embedding) continue;
      
      const score = SemanticMatcher.cosineSimilarity(queryEmbedding, chunk.embedding);
      
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
      const score = this.keywordMatcher.calculateScore(queryKeywords, chunk.text);
      
      if (score > 0) {
        results.push({
          chunk,
          score,
          searchType: 'keyword',
          explanation: `Keyword matches: ${this.keywordMatcher.getMatchingKeywords(queryKeywords, chunk.text).join(', ')}`
        });
      }
    }

    return results
      .sort((a, b) => b.score - a.score)
      .slice(0, limit);
  }

  updateWeights(newWeights: Partial<SearchWeights>): void {
    this.scoringEngine.updateWeights(newWeights);
  }

  getStats() {
    return {
      totalChunks: this.chunks.length,
      averageChunkLength: this.chunks.reduce((sum, chunk) => sum + chunk.text.length, 0) / this.chunks.length
    };
  }

  private extractKeywords(text: string): string[] {
    const stopWords = new Set([
      'the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of', 'with', 'by'
    ]);

    return text
      .toLowerCase()
      .replace(/[^\w\s]/g, ' ')
      .split(/\s+/)
      .filter(word => word.length > 2 && !stopWords.has(word));
  }
}
