
import { SearchResult } from "../../search/hybridSearchEngine";

export interface ContextCompressionOptions {
  maxTokens: number;
  preserveStructure: boolean;
  extractKeyPoints: boolean;
  includeSourceReferences: boolean;
  compressionStrategy: 'extractive' | 'abstractive' | 'hybrid';
}

export class CompressionEngine {
  static async extractiveCompression(
    results: SearchResult[],
    options: ContextCompressionOptions
  ): Promise<string> {
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

  static async abstractiveCompression(
    results: SearchResult[],
    options: ContextCompressionOptions
  ): Promise<string> {
    const allText = results.map(r => r.chunk.text).join('\n\n');
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
    
    return this.trimToTokenLimit(summary, options.maxTokens);
  }

  static async hybridCompression(
    results: SearchResult[],
    options: ContextCompressionOptions
  ): Promise<string> {
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

  static async extractKeyPoints(text: string): Promise<string[]> {
    const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 20);
    
    const keyPoints = sentences
      .map(sentence => sentence.trim())
      .filter(sentence => {
        return /\b(important|key|critical|essential|main|primary|significant)\b/i.test(sentence) ||
               /\d+/.test(sentence) ||
               /\b(should|must|can|will)\b/i.test(sentence);
      })
      .slice(0, 5)
      .map(point => point.charAt(0).toUpperCase() + point.slice(1));
    
    return keyPoints;
  }

  private static extractImportantSentences(text: string, relevanceScore: number): string[] {
    const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 10);
    
    const scoredSentences = sentences.map(sentence => {
      let score = relevanceScore;
      
      if (/\d+/.test(sentence)) score *= 1.1;
      if (/\b(is|are|means|refers to|defined as)\b/i.test(sentence)) score *= 1.2;
      if (/\b(should|must|can|will|provides|enables|allows)\b/i.test(sentence)) score *= 1.1;
      if (sentence.length < 50 || sentence.length > 200) score *= 0.9;
      
      return { sentence: sentence.trim() + '.', score };
    });
    
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

  private static estimateTokens(text: string): number {
    return Math.ceil(text.length / 4);
  }

  private static trimToTokenLimit(text: string, maxTokens: number): string {
    const estimatedTokens = this.estimateTokens(text);
    if (estimatedTokens <= maxTokens) return text;
    
    const ratio = maxTokens / estimatedTokens;
    const targetLength = Math.floor(text.length * ratio);
    
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
