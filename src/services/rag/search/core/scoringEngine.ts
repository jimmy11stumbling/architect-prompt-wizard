
import { ProcessedChunk } from "../../processors/documentProcessor";

export interface SearchWeights {
  semantic: number;
  keyword: number;
  recency: number;
  structure: number;
}

export class ScoringEngine {
  constructor(private weights: SearchWeights) {}

  calculateStructureScore(chunk: ProcessedChunk, query: string): number {
    let score = 0;
    
    if (chunk.metadata.nearHeading) {
      score += 0.3;
    }
    
    if (chunk.metadata.tables && chunk.metadata.tables.length > 0 && this.isDataQuery(query)) {
      score += 0.2;
    }
    
    if (chunk.metadata.codeBlocks && chunk.metadata.codeBlocks.length > 0 && this.isTechnicalQuery(query)) {
      score += 0.2;
    }
    
    return Math.min(score, 1.0);
  }

  calculateRecencyScore(chunk: ProcessedChunk): number {
    const chunkAge = chunk.metadata.chunkIndex / Math.max(1, chunk.metadata.totalChunks);
    return 1 - chunkAge;
  }

  calculateHybridScore(
    semanticScore: number,
    keywordScore: number,
    recencyScore: number,
    structureScore: number
  ): number {
    return (
      (semanticScore * this.weights.semantic) +
      (keywordScore * this.weights.keyword) +
      (recencyScore * this.weights.recency) +
      (structureScore * this.weights.structure)
    );
  }

  generateExplanation(semantic: number, keyword: number, recency: number, structure: number): string {
    const components = [];
    
    if (semantic > 0.1) components.push(`Semantic: ${(semantic * 100).toFixed(1)}%`);
    if (keyword > 0.1) components.push(`Keywords: ${(keyword * 100).toFixed(1)}%`);
    if (recency > 0.1) components.push(`Recency: ${(recency * 100).toFixed(1)}%`);
    if (structure > 0.1) components.push(`Structure: ${(structure * 100).toFixed(1)}%`);
    
    return components.join(', ');
  }

  updateWeights(newWeights: Partial<SearchWeights>) {
    this.weights = { ...this.weights, ...newWeights };
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
}
