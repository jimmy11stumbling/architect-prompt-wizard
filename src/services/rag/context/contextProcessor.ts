import { SearchResult } from "../search/hybridSearchEngine";
import { RAGQuery } from "@/types/rag-types";
import { RelevanceScorer } from "./core/relevanceScorer";
import { CompressionEngine, ContextCompressionOptions } from "./core/compressionEngine";

export interface CompressedContext {
  originalChunks: SearchResult[];
  compressedText: string;
  compressionRatio: number;
  keyPoints: string[];
  relevanceScore: number;
  sources: Array<{
    chunkId: string;
    title?: string;
    relevance: number;
  }>;
}

export type { ContextCompressionOptions };

export class ContextProcessor {
  private static readonly DEFAULT_OPTIONS: ContextCompressionOptions = {
    maxTokens: 2000,
    preserveStructure: true,
    extractKeyPoints: true,
    includeSourceReferences: true,
    compressionStrategy: 'hybrid'
  };

  static async compressContext(
    searchResults: SearchResult[],
    query: RAGQuery,
    options: Partial<ContextCompressionOptions> = {}
  ): Promise<CompressedContext> {
    const opts = { ...this.DEFAULT_OPTIONS, ...options };
    
    const rankedResults = await RelevanceScorer.scoreRelevance(searchResults, query);
    
    let compressedText: string;
    let keyPoints: string[] = [];
    
    switch (opts.compressionStrategy) {
      case 'extractive':
        compressedText = await CompressionEngine.extractiveCompression(rankedResults, opts);
        break;
      case 'abstractive':
        compressedText = await CompressionEngine.abstractiveCompression(rankedResults, opts);
        keyPoints = await CompressionEngine.extractKeyPoints(compressedText);
        break;
      case 'hybrid':
      default:
        compressedText = await CompressionEngine.hybridCompression(rankedResults, opts);
        keyPoints = await CompressionEngine.extractKeyPoints(compressedText);
        break;
    }

    const originalLength = rankedResults.reduce((sum, result) => sum + result.chunk.text.length, 0);
    const compressionRatio = originalLength > 0 ? compressedText.length / originalLength : 1;
    const relevanceScore = this.calculateOverallRelevance(rankedResults);

    const sources = rankedResults.map(result => ({
      chunkId: result.chunk.id,
      title: result.chunk.metadata.title || `Chunk ${result.chunk.metadata.chunkIndex + 1}`,
      relevance: result.score
    }));

    return {
      originalChunks: rankedResults,
      compressedText,
      compressionRatio,
      keyPoints: opts.extractKeyPoints ? keyPoints : [],
      relevanceScore,
      sources: opts.includeSourceReferences ? sources : []
    };
  }

  private static calculateOverallRelevance(results: SearchResult[]): number {
    if (results.length === 0) return 0;
    
    let totalScore = 0;
    let totalWeight = 0;
    
    results.forEach((result, index) => {
      const weight = 1 / (index + 1);
      totalScore += result.score * weight;
      totalWeight += weight;
    });
    
    return totalWeight > 0 ? totalScore / totalWeight : 0;
  }
}
