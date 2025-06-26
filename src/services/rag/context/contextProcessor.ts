import { SearchResult } from "../search/hybridSearchEngine";
import { RAGQuery } from "@/types/rag-types";

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

export interface ContextCompressionOptions {
  maxTokens: number;
  preserveStructure: boolean;
  extractKeyPoints: boolean;
  includeSourceReferences: boolean;
  compressionStrategy: 'extractive' | 'abstractive' | 'hybrid';
}

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
    
    // Score and rank results by relevance
    const rankedResults = await this.scoreRelevance(searchResults, query);
    
    // Compress based on strategy
    let compressedText: string;
    let keyPoints: string[] = [];
    
    switch (opts.compressionStrategy) {
      case 'extractive':
        compressedText = await this.extractiveCompression(rankedResults, opts);
        break;
      case 'abstractive':
        compressedText = await this.abstractiveCompression(rankedResults, opts);
        keyPoints = await this.extractKeyPoints(compressedText);
        break;
      case 'hybrid':
      default:
        compressedText = await this.hybridCompression(rankedResults, opts);
        keyPoints = await this.extractKeyPoints(compressedText);
        break;
    }

    // Calculate compression ratio
    const originalLength = rankedResults.reduce((sum, result) => sum + result.chunk.text.length, 0);
    const compressionRatio = originalLength > 0 ? compressedText.length / originalLength : 1;

    // Calculate overall relevance score
    const relevanceScore = this.calculateOverallRelevance(rankedResults);

    // Create source references - fix the title reference
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

  private static async scoreRelevance(
    results: SearchResult[],
    query: RAGQuery
  ): Promise<SearchResult[]> {
    // Enhanced relevance scoring considering query intent and context
    const queryIntent = this.analyzeQueryIntent(query.query);
    
    return results.map(result => {
      let adjustedScore = result.score;
      
      // Boost based on query intent
      if (queryIntent.isQuestion && this.containsAnswer(result.chunk.text)) {
        adjustedScore *= 1.2;
      }
      
      if (queryIntent.isComparison && this.containsComparison(result.chunk.text)) {
        adjustedScore *= 1.15;
      }
      
      if (queryIntent.isDefinition && this.containsDefinition(result.chunk.text, query.query)) {
        adjustedScore *= 1.3;
      }
      
      // Penalize redundant content
      const redundancyPenalty = this.calculateRedundancy(result, results);
      adjustedScore *= (1 - redundancyPenalty * 0.2);
      
      return {
        ...result,
        score: adjustedScore
      };
    }).sort((a, b) => b.score - a.score);
  }

  private static analyzeQueryIntent(query: string) {
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
    // Simple heuristics to detect if text contains answer-like content
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
    // Extract the main term from the query
    const term = query.replace(/\b(what is|define|definition of)\b/gi, '').trim();
    const definitionPatterns = [
      new RegExp(`\\b${term}\\b.*\\b(is|are|refers to|means|defined as)\\b`, 'i'),
      new RegExp(`\\b(is|are)\\b.*\\b${term}\\b`, 'i')
    ];
    
    return definitionPatterns.some(pattern => pattern.test(text));
  }

  private static calculateRedundancy(target: SearchResult, allResults: SearchResult[]): number {
    // Calculate how similar the target chunk is to other chunks
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

  private static async extractiveCompression(
    results: SearchResult[],
    options: ContextCompressionOptions
  ): Promise<string> {
    // Extract the most important sentences from each chunk
    let compressed = '';
    let tokenCount = 0;
    
    for (const result of results) {
      const sentences = this.extractImportantSentences(result.chunk.text, result.score);
      
      for (const sentence of sentences) {
        const sentenceTokens = this.estimateTokens(sentence);
        if (tokenCount + sentenceTokens > options.maxTokens) break;
        
        compressed += sentence + ' ';
        tokenCount += sentenceTokens;
      }
      
      if (tokenCount >= options.maxTokens) break;
    }
    
    return compressed.trim();
  }

  private static async abstractiveCompression(
    results: SearchResult[],
    options: ContextCompressionOptions
  ): Promise<string> {
    // Simulate abstractive compression by creating a summary
    const allText = results.map(r => r.chunk.text).join('\n\n');
    
    // For demonstration, we'll create a structured summary
    const keyInfo = this.extractKeyInformation(allText);
    
    let summary = '';
    if (keyInfo.definitions.length > 0) {
      summary += 'Key Definitions:\n' + keyInfo.definitions.join('\n') + '\n\n';
    }
    
    if (keyInfo.processes.length > 0) {
      summary += 'Important Processes:\n' + keyInfo.processes.join('\n') + '\n\n';
    }
    
    if (keyInfo.facts.length > 0) {
      summary += 'Key Facts:\n' + keyInfo.facts.join('\n') + '\n\n';
    }
    
    // Trim to token limit
    return this.trimToTokenLimit(summary, options.maxTokens);
  }

  private static async hybridCompression(
    results: SearchResult[],
    options: ContextCompressionOptions
  ): Promise<string> {
    // Combine extractive and abstractive approaches
    const extractive = await this.extractiveCompression(results, {
      ...options,
      maxTokens: Math.floor(options.maxTokens * 0.7)
    });
    
    const abstractive = await this.abstractiveCompression(results, {
      ...options,
      maxTokens: Math.floor(options.maxTokens * 0.3)
    });
    
    return `${abstractive}\n\nDetailed Information:\n${extractive}`;
  }

  private static extractImportantSentences(text: string, relevanceScore: number): string[] {
    const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 10);
    
    // Score sentences based on various factors
    const scoredSentences = sentences.map(sentence => {
      let score = relevanceScore;
      
      // Boost sentences with numbers or data
      if (/\d+/.test(sentence)) score *= 1.1;
      
      // Boost sentences with definitions
      if (/\b(is|are|means|refers to|defined as)\b/i.test(sentence)) score *= 1.2;
      
      // Boost sentences with action words
      if (/\b(should|must|can|will|provides|enables|allows)\b/i.test(sentence)) score *= 1.1;
      
      // Penalize very short or very long sentences
      if (sentence.length < 50 || sentence.length > 200) score *= 0.9;
      
      return { sentence: sentence.trim() + '.', score };
    });
    
    // Return top sentences
    return scoredSentences
      .sort((a, b) => b.score - a.score)
      .slice(0, Math.min(5, sentences.length))
      .map(s => s.sentence);
  }

  private static extractKeyInformation(text: string) {
    const definitions: string[] = [];
    const processes: string[] = [];
    const facts: string[] = [];
    
    const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 10);
    
    for (const sentence of sentences) {
      const trimmed = sentence.trim();
      
      if (/\b(is|are|means|refers to|defined as)\b/i.test(trimmed)) {
        definitions.push(trimmed + '.');
      } else if (/\b(first|then|next|finally|step|process)\b/i.test(trimmed)) {
        processes.push(trimmed + '.');
      } else if (/\d+/.test(trimmed) || /\b(important|key|critical|essential)\b/i.test(trimmed)) {
        facts.push(trimmed + '.');
      }
    }
    
    return {
      definitions: definitions.slice(0, 3),
      processes: processes.slice(0, 3),
      facts: facts.slice(0, 5)
    };
  }

  private static async extractKeyPoints(text: string): Promise<string[]> {
    // Extract bullet points or key insights from the compressed text
    const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 20);
    
    const keyPoints = sentences
      .map(sentence => sentence.trim())
      .filter(sentence => {
        // Filter for sentences that seem like key points
        return /\b(important|key|critical|essential|main|primary|significant)\b/i.test(sentence) ||
               /\d+/.test(sentence) ||
               /\b(should|must|can|will)\b/i.test(sentence);
      })
      .slice(0, 5)
      .map(point => point.charAt(0).toUpperCase() + point.slice(1));
    
    return keyPoints;
  }

  private static calculateOverallRelevance(results: SearchResult[]): number {
    if (results.length === 0) return 0;
    
    // Weighted average with higher weight for top results
    let totalScore = 0;
    let totalWeight = 0;
    
    results.forEach((result, index) => {
      const weight = 1 / (index + 1); // Decreasing weight
      totalScore += result.score * weight;
      totalWeight += weight;
    });
    
    return totalWeight > 0 ? totalScore / totalWeight : 0;
  }

  private static estimateTokens(text: string): number {
    // Rough token estimation (1 token ≈ 4 characters for English)
    return Math.ceil(text.length / 4);
  }

  private static trimToTokenLimit(text: string, maxTokens: number): string {
    const estimatedTokens = this.estimateTokens(text);
    if (estimatedTokens <= maxTokens) return text;
    
    const ratio = maxTokens / estimatedTokens;
    const targetLength = Math.floor(text.length * ratio);
    
    // Trim at sentence boundary
    const trimmed = text.substring(0, targetLength);
    const lastSentenceEnd = Math.max(
      trimmed.lastIndexOf('.'),
      trimmed.lastIndexOf('!'),
      trimmed.lastIndexOf('?')
    );
    
    return lastSentenceEnd > targetLength * 0.8 
      ? trimmed.substring(0, lastSentenceEnd + 1)
      : trimmed + '...';
  }
}
