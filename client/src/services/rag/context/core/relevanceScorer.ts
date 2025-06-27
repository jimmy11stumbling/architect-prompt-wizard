
import { SearchResult } from "../../search/hybridSearchEngine";
import { RAGQuery } from "@/types/rag-types";

export interface QueryIntent {
  isQuestion: boolean;
  isComparison: boolean;
  isDefinition: boolean;
  isInstructional: boolean;
  isFactual: boolean;
}

export class RelevanceScorer {
  static async scoreRelevance(results: SearchResult[], query: RAGQuery): Promise<SearchResult[]> {
    const queryIntent = this.analyzeQueryIntent(query.query);
    
    return results.map(result => {
      let adjustedScore = result.score;
      
      if (queryIntent.isQuestion && this.containsAnswer(result.chunk.text)) {
        adjustedScore *= 1.2;
      }
      
      if (queryIntent.isComparison && this.containsComparison(result.chunk.text)) {
        adjustedScore *= 1.15;
      }
      
      if (queryIntent.isDefinition && this.containsDefinition(result.chunk.text, query.query)) {
        adjustedScore *= 1.3;
      }
      
      const redundancyPenalty = this.calculateRedundancy(result, results);
      adjustedScore *= (1 - redundancyPenalty * 0.2);
      
      return { ...result, score: adjustedScore };
    }).sort((a, b) => b.score - a.score);
  }

  private static analyzeQueryIntent(query: string): QueryIntent {
    const queryLower = query.toLowerCase();
    
    return {
      isQuestion: /^(what|how|why|when|where|who|which|can|is|are|do|does)\b/.test(queryLower) || query.includes('?'),
      isComparison: /\b(vs|versus|compare|difference|better|worse|between)\b/.test(queryLower),
      isDefinition: /\b(what is|define|definition|meaning|explain)\b/.test(queryLower),
      isInstructional: /\b(how to|steps|guide|tutorial|instructions)\b/.test(queryLower),
      isFactual: /\b(when|where|who|statistics|data|numbers)\b/.test(queryLower)
    };
  }

  private static containsAnswer(text: string): boolean {
    const answerPatterns = [
      /\b(because|since|due to|as a result|therefore)\b/i,
      /\b(the answer is|the solution is|this means)\b/i,
      /\b(in conclusion|to summarize|in summary)\b/i
    ];
    
    return answerPatterns.some(pattern => pattern.test(text));
  }

  private static containsComparison(text: string): boolean {
    const comparisonPatterns = [
      /\b(while|whereas|however|in contrast|on the other hand)\b/i,
      /\b(better than|worse than|more than|less than)\b/i,
      /\b(advantage|disadvantage|pros and cons)\b/i
    ];
    
    return comparisonPatterns.some(pattern => pattern.test(text));
  }

  private static containsDefinition(text: string, query: string): boolean {
    const term = query.replace(/\b(what is|define|definition of)\b/gi, '').trim();
    const definitionPatterns = [
      new RegExp(`\\b${term}\\b.*\\b(is|are|refers to|means|defined as)\\b`, 'i'),
      new RegExp(`\\b(is|are)\\b.*\\b${term}\\b`, 'i')
    ];
    
    return definitionPatterns.some(pattern => pattern.test(text));
  }

  private static calculateRedundancy(target: SearchResult, allResults: SearchResult[]): number {
    const targetWords = new Set(target.chunk.text.toLowerCase().split(/\s+/));
    let maxSimilarity = 0;
    
    for (const other of allResults) {
      if (other.chunk.id === target.chunk.id) continue;
      
      const otherWords = new Set(other.chunk.text.toLowerCase().split(/\s+/));
      const intersection = new Set([...targetWords].filter(word => otherWords.has(word)));
      const union = new Set([...targetWords, ...otherWords]);
      
      const similarity = intersection.size / union.size;
      maxSimilarity = Math.max(maxSimilarity, similarity);
    }
    
    return maxSimilarity;
  }
}
