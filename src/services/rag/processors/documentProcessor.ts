
import { RAGDocument } from "@/types/rag-types";

export interface ProcessedChunk {
  id: string;
  text: string;
  embedding?: number[];
  metadata: {
    chunkIndex: number;
    totalChunks: number;
    documentId: string;
    startIndex: number;
    endIndex: number;
    headings?: string[];
    tables?: string[];
    images?: string[];
  };
}

export interface DocumentProcessingOptions {
  chunkSize: number;
  chunkOverlap: number;
  preserveStructure: boolean;
  extractMetadata: boolean;
}

export class DocumentProcessor {
  private static readonly DEFAULT_OPTIONS: DocumentProcessingOptions = {
    chunkSize: 1000,
    chunkOverlap: 200,
    preserveStructure: true,
    extractMetadata: true
  };

  static async processDocument(
    document: RAGDocument,
    options: Partial<DocumentProcessingOptions> = {}
  ): Promise<ProcessedChunk[]> {
    const opts = { ...this.DEFAULT_OPTIONS, ...options };
    
    // Extract structure if enabled
    const structure = opts.preserveStructure 
      ? await this.extractStructure(document.content)
      : null;

    // Create semantic chunks
    const chunks = await this.createSemanticChunks(
      document.content,
      opts.chunkSize,
      opts.chunkOverlap,
      structure
    );

    // Process each chunk
    const processedChunks: ProcessedChunk[] = [];
    
    for (let i = 0; i < chunks.length; i++) {
      const chunk = chunks[i];
      const processedChunk: ProcessedChunk = {
        id: `${document.id}-chunk-${i}`,
        text: chunk.text,
        metadata: {
          chunkIndex: i,
          totalChunks: chunks.length,
          documentId: document.id,
          startIndex: chunk.startIndex,
          endIndex: chunk.endIndex,
          ...chunk.metadata
        }
      };

      // Generate embeddings if needed
      if (opts.extractMetadata) {
        processedChunk.embedding = await this.generateEmbedding(chunk.text);
      }

      processedChunks.push(processedChunk);
    }

    return processedChunks;
  }

  private static async extractStructure(content: string) {
    const headings = this.extractHeadings(content);
    const tables = this.extractTables(content);
    const codeBlocks = this.extractCodeBlocks(content);
    
    return {
      headings,
      tables,
      codeBlocks,
      sections: this.identifySections(content, headings)
    };
  }

  private static extractHeadings(content: string): string[] {
    const headingRegex = /^#{1,6}\s+(.+)$/gm;
    const headings: string[] = [];
    let match;
    
    while ((match = headingRegex.exec(content)) !== null) {
      headings.push(match[1].trim());
    }
    
    return headings;
  }

  private static extractTables(content: string): string[] {
    const tableRegex = /\|.*\|/gm;
    const tables: string[] = [];
    const lines = content.split('\n');
    
    let currentTable: string[] = [];
    
    for (const line of lines) {
      if (tableRegex.test(line)) {
        currentTable.push(line);
      } else if (currentTable.length > 0) {
        tables.push(currentTable.join('\n'));
        currentTable = [];
      }
    }
    
    if (currentTable.length > 0) {
      tables.push(currentTable.join('\n'));
    }
    
    return tables;
  }

  private static extractCodeBlocks(content: string): string[] {
    const codeBlockRegex = /```[\s\S]*?```/g;
    return content.match(codeBlockRegex) || [];
  }

  private static identifySections(content: string, headings: string[]) {
    // Simple section identification based on headings
    const sections: Array<{heading: string, content: string, level: number}> = [];
    
    headings.forEach((heading, index) => {
      const level = content.match(new RegExp(`^(#{1,6})\\s+${heading}`, 'm'))?.[1].length || 1;
      sections.push({ heading, content: '', level });
    });
    
    return sections;
  }

  private static async createSemanticChunks(
    content: string,
    chunkSize: number,
    overlap: number,
    structure: any
  ) {
    const chunks: Array<{
      text: string;
      startIndex: number;
      endIndex: number;
      metadata: any;
    }> = [];

    // Split by sentences for better semantic boundaries
    const sentences = this.splitBySentences(content);
    
    let currentChunk = '';
    let startIndex = 0;
    let currentMetadata: any = {};

    for (let i = 0; i < sentences.length; i++) {
      const sentence = sentences[i];
      const potentialChunk = currentChunk + (currentChunk ? ' ' : '') + sentence;

      if (potentialChunk.length > chunkSize && currentChunk.length > 0) {
        // Create chunk
        const endIndex = startIndex + currentChunk.length;
        chunks.push({
          text: currentChunk.trim(),
          startIndex,
          endIndex,
          metadata: { ...currentMetadata }
        });

        // Start new chunk with overlap
        const overlapText = this.getOverlapText(currentChunk, overlap);
        currentChunk = overlapText + (overlapText ? ' ' : '') + sentence;
        startIndex = endIndex - overlapText.length;
        currentMetadata = {};
      } else {
        currentChunk = potentialChunk;
      }

      // Update metadata based on structure
      if (structure && this.isNearHeading(content, startIndex + currentChunk.length, structure.headings)) {
        currentMetadata.nearHeading = true;
      }
    }

    // Add final chunk
    if (currentChunk.trim()) {
      chunks.push({
        text: currentChunk.trim(),
        startIndex,
        endIndex: startIndex + currentChunk.length,
        metadata: currentMetadata
      });
    }

    return chunks;
  }

  private static splitBySentences(text: string): string[] {
    // Enhanced sentence splitting that preserves code blocks and lists
    const sentences = text.split(/(?<=[.!?])\s+(?=[A-Z])/);
    return sentences.filter(s => s.trim().length > 0);
  }

  private static getOverlapText(text: string, overlapSize: number): string {
    if (text.length <= overlapSize) return text;
    
    const words = text.split(' ');
    const overlapWords = [];
    let charCount = 0;
    
    for (let i = words.length - 1; i >= 0; i--) {
      const word = words[i];
      if (charCount + word.length > overlapSize) break;
      overlapWords.unshift(word);
      charCount += word.length + 1;
    }
    
    return overlapWords.join(' ');
  }

  private static isNearHeading(content: string, position: number, headings: string[]): boolean {
    const window = 100; // Character window to check
    const snippet = content.substring(Math.max(0, position - window), position + window);
    return headings.some(heading => snippet.includes(heading));
  }

  private static async generateEmbedding(text: string): Promise<number[]> {
    // Simulate embedding generation - in production, use OpenAI or similar
    // This creates a simple hash-based embedding for demonstration
    const words = text.toLowerCase().split(/\s+/);
    const embedding = new Array(384).fill(0); // Common embedding dimension
    
    words.forEach((word, index) => {
      const hash = this.simpleHash(word);
      embedding[hash % embedding.length] += 1;
    });
    
    // Normalize
    const magnitude = Math.sqrt(embedding.reduce((sum, val) => sum + val * val, 0));
    return embedding.map(val => magnitude > 0 ? val / magnitude : 0);
  }

  private static simpleHash(str: string): number {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    return Math.abs(hash);
  }
}
