import { promises as fs } from 'fs';
import path from 'path';
import compromise from 'compromise';
import sentences from 'compromise-sentences';

// Load the sentences plugin
compromise.plugin(sentences);

export interface DocumentChunk {
  id: string;
  content: string;
  metadata: {
    chunkIndex: number;
    totalChunks: number;
    startOffset: number;
    endOffset: number;
    wordCount: number;
    sentenceCount: number;
    overlap?: number;
    chunkType: 'semantic' | 'sliding_window' | 'sentence' | 'paragraph';
    [key: string]: any;
  };
}

export interface ProcessedDocument {
  id: string;
  title: string;
  content: string;
  chunks: DocumentChunk[];
  metadata: {
    wordCount: number;
    sentenceCount: number;
    paragraphCount: number;
    source: string;
    processedAt: Date;
    chunkingStrategy: string;
    language?: string;
    [key: string]: any;
  };
}

export interface ChunkingOptions {
  strategy: 'semantic' | 'sliding_window' | 'sentence' | 'paragraph' | 'hybrid';
  maxChunkSize: number;
  overlapSize: number;
  preserveStructure: boolean;
  minChunkSize: number;
  sentenceBoundary: boolean;
}

export class DocumentProcessor {
  private static instance: DocumentProcessor;
  private attachedAssetsPath: string;

  static getInstance(): DocumentProcessor {
    if (!DocumentProcessor.instance) {
      DocumentProcessor.instance = new DocumentProcessor();
    }
    return DocumentProcessor.instance;
  }

  constructor() {
    this.attachedAssetsPath = path.join(process.cwd(), 'attached_assets');
  }

  async processAllAttachedAssets(): Promise<ProcessedDocument[]> {
    try {
      const files = await fs.readdir(this.attachedAssetsPath);
      const processedDocs: ProcessedDocument[] = [];

      for (const file of files) {
        if (file.endsWith('.txt')) {
          try {
            const doc = await this.processFile(file);
            if (doc) {
              processedDocs.push(doc);
            }
          } catch (error) {
            console.error(`Failed to process file ${file}:`, error);
          }
        }
      }

      console.log(`Processed ${processedDocs.length} documents from attached assets`);
      return processedDocs;
    } catch (error) {
      console.error('Failed to process attached assets:', error);
      throw error;
    }
  }

  async processFile(filename: string): Promise<ProcessedDocument | null> {
    try {
      const filePath = path.join(this.attachedAssetsPath, filename);
      const content = await fs.readFile(filePath, 'utf-8');
      
      if (!content.trim()) {
        console.warn(`File ${filename} is empty, skipping`);
        return null;
      }

      return this.processDocument(content, {
        title: this.extractTitleFromFilename(filename),
        source: filename,
        type: this.detectDocumentType(filename)
      });
    } catch (error) {
      console.error(`Failed to process file ${filename}:`, error);
      return null;
    }
  }

  async processDocument(
    content: string, 
    metadata: Record<string, any> = {},
    options: Partial<ChunkingOptions> = {}
  ): Promise<ProcessedDocument> {
    const defaultOptions: ChunkingOptions = {
      strategy: 'hybrid',
      maxChunkSize: 1000,
      overlapSize: 100,
      preserveStructure: true,
      minChunkSize: 50,
      sentenceBoundary: true
    };

    const chunkingOptions = { ...defaultOptions, ...options };

    // Preprocess the content
    const cleanedContent = this.preprocessContent(content);
    
    // Analyze document structure
    const analysis = this.analyzeDocument(cleanedContent);
    
    // Generate chunks based on strategy
    const chunks = await this.generateChunks(cleanedContent, chunkingOptions, analysis);

    const processedDoc: ProcessedDocument = {
      id: metadata.id || this.generateDocumentId(metadata.title || 'untitled'),
      title: metadata.title || 'Untitled Document',
      content: cleanedContent,
      chunks,
      metadata: {
        ...metadata,
        wordCount: analysis.wordCount,
        sentenceCount: analysis.sentenceCount,
        paragraphCount: analysis.paragraphCount,
        processedAt: new Date(),
        chunkingStrategy: chunkingOptions.strategy,
        language: analysis.language || 'en'
      }
    };

    return processedDoc;
  }

  private preprocessContent(content: string): string {
    // Clean and normalize the content
    let cleaned = content
      .replace(/\r\n/g, '\n') // Normalize line endings
      .replace(/\n{3,}/g, '\n\n') // Reduce multiple newlines
      .replace(/\t/g, ' ') // Replace tabs with spaces
      .replace(/ {2,}/g, ' ') // Reduce multiple spaces
      .trim();

    // Remove BOM if present
    if (cleaned.charCodeAt(0) === 0xFEFF) {
      cleaned = cleaned.slice(1);
    }

    return cleaned;
  }

  private analyzeDocument(content: string): {
    wordCount: number;
    sentenceCount: number;
    paragraphCount: number;
    language?: string;
    sections?: string[];
  } {
    const words = content.split(/\s+/).filter(word => word.length > 0);
    const paragraphs = content.split(/\n\s*\n/).filter(p => p.trim().length > 0);
    
    // Use compromise for sentence detection
    const doc = compromise(content);
    const sentences = doc.sentences().out('array');

    // Detect sections (basic heuristic)
    const sections = this.detectSections(content);

    return {
      wordCount: words.length,
      sentenceCount: sentences.length,
      paragraphCount: paragraphs.length,
      language: 'en', // Could implement language detection here
      sections
    };
  }

  private detectSections(content: string): string[] {
    const sections: string[] = [];
    const lines = content.split('\n');
    
    for (const line of lines) {
      const trimmed = line.trim();
      // Detect headers (simple heuristics)
      if (
        trimmed.length > 0 && trimmed.length < 100 && 
        (trimmed.match(/^\d+\./) || // Numbered sections
         trimmed.match(/^[A-Z][A-Z\s]+$/) || // ALL CAPS
         trimmed.match(/^#{1,6}\s/)) // Markdown headers
      ) {
        sections.push(trimmed);
      }
    }
    
    return sections;
  }

  private async generateChunks(
    content: string, 
    options: ChunkingOptions,
    analysis: any
  ): Promise<DocumentChunk[]> {
    switch (options.strategy) {
      case 'semantic':
        return this.generateSemanticChunks(content, options);
      case 'sliding_window':
        return this.generateSlidingWindowChunks(content, options);
      case 'sentence':
        return this.generateSentenceChunks(content, options);
      case 'paragraph':
        return this.generateParagraphChunks(content, options);
      case 'hybrid':
        return this.generateHybridChunks(content, options, analysis);
      default:
        throw new Error(`Unknown chunking strategy: ${options.strategy}`);
    }
  }

  private generateSemanticChunks(content: string, options: ChunkingOptions): DocumentChunk[] {
    const chunks: DocumentChunk[] = [];
    const doc = compromise(content);
    const sentences = doc.sentences().out('array');
    
    let currentChunk = '';
    let currentWordCount = 0;
    let chunkIndex = 0;
    let startOffset = 0;

    for (let i = 0; i < sentences.length; i++) {
      const sentence = sentences[i];
      const sentenceWords = sentence.split(/\s+/).length;
      
      // Check if adding this sentence would exceed chunk size
      if (currentWordCount + sentenceWords > options.maxChunkSize && currentChunk.length > 0) {
        // Create chunk
        chunks.push(this.createChunk(
          currentChunk.trim(),
          chunkIndex++,
          startOffset,
          'semantic',
          options
        ));
        
        // Start new chunk with overlap
        const overlapSentences = this.getOverlapSentences(sentences, i, options.overlapSize);
        currentChunk = overlapSentences.join(' ') + ' ' + sentence;
        currentWordCount = currentChunk.split(/\s+/).length;
        startOffset = content.indexOf(currentChunk);
      } else {
        currentChunk += (currentChunk ? ' ' : '') + sentence;
        currentWordCount += sentenceWords;
      }
    }

    // Add final chunk
    if (currentChunk.trim().length >= options.minChunkSize) {
      chunks.push(this.createChunk(
        currentChunk.trim(),
        chunkIndex,
        startOffset,
        'semantic',
        options
      ));
    }

    return this.finalizeCh

nks(chunks);
  }

  private generateSlidingWindowChunks(content: string, options: ChunkingOptions): DocumentChunk[] {
    const chunks: DocumentChunk[] = [];
    const words = content.split(/\s+/);
    let chunkIndex = 0;

    for (let i = 0; i < words.length; i += (options.maxChunkSize - options.overlapSize)) {
      const chunkWords = words.slice(i, i + options.maxChunkSize);
      const chunkContent = chunkWords.join(' ');
      
      if (chunkContent.length >= options.minChunkSize) {
        chunks.push(this.createChunk(
          chunkContent,
          chunkIndex++,
          content.indexOf(chunkContent),
          'sliding_window',
          options
        ));
      }
    }

    return this.finalizeChunks(chunks);
  }

  private generateSentenceChunks(content: string, options: ChunkingOptions): DocumentChunk[] {
    const chunks: DocumentChunk[] = [];
    const doc = compromise(content);
    const sentences = doc.sentences().out('array');
    
    let currentChunk = '';
    let chunkIndex = 0;
    let sentenceCount = 0;
    const maxSentences = Math.floor(options.maxChunkSize / 20); // Rough estimate

    for (const sentence of sentences) {
      if (sentenceCount >= maxSentences && currentChunk.length > 0) {
        chunks.push(this.createChunk(
          currentChunk.trim(),
          chunkIndex++,
          content.indexOf(currentChunk.trim()),
          'sentence',
          options
        ));
        
        currentChunk = sentence;
        sentenceCount = 1;
      } else {
        currentChunk += (currentChunk ? ' ' : '') + sentence;
        sentenceCount++;
      }
    }

    // Add final chunk
    if (currentChunk.trim().length >= options.minChunkSize) {
      chunks.push(this.createChunk(
        currentChunk.trim(),
        chunkIndex,
        content.indexOf(currentChunk.trim()),
        'sentence',
        options
      ));
    }

    return this.finalizeChu ks(chunks);
  }

  private generateParagraphChunks(content: string, options: ChunkingOptions): DocumentChunk[] {
    const chunks: DocumentChunk[] = [];
    const paragraphs = content.split(/\n\s*\n/).filter(p => p.trim().length > 0);
    
    let currentChunk = '';
    let chunkIndex = 0;

    for (const paragraph of paragraphs) {
      const paragraphWords = paragraph.split(/\s+/).length;
      
      if (currentChunk.split(/\s+/).length + paragraphWords > options.maxChunkSize && currentChunk.length > 0) {
        chunks.push(this.createChunk(
          currentChunk.trim(),
          chunkIndex++,
          content.indexOf(currentChunk.trim()),
          'paragraph',
          options
        ));
        
        currentChunk = paragraph;
      } else {
        currentChunk += (currentChunk ? '\n\n' : '') + paragraph;
      }
    }

    // Add final chunk
    if (currentChunk.trim().length >= options.minChunkSize) {
      chunks.push(this.createChunk(
        currentChunk.trim(),
        chunkIndex,
        content.indexOf(currentChunk.trim()),
        'paragraph',
        options
      ));
    }

    return this.finalizeChu ks(chunks);
  }

  private generateHybridChunks(content: string, options: ChunkingOptions, analysis: any): DocumentChunk[] {
    // Combine semantic and sliding window approaches
    const semanticChunks = this.generateSemanticChunks(content, options);
    
    // If semantic chunking produces too few or too many chunks, fallback to sliding window
    const idealChunkCount = Math.ceil(analysis.wordCount / (options.maxChunkSize * 0.7));
    
    if (semanticChunks.length < idealChunkCount * 0.5 || semanticChunks.length > idealChunkCount * 2) {
      return this.generateSlidingWindowChunks(content, options);
    }
    
    return semanticChunks;
  }

  private createChunk(
    content: string,
    index: number,
    startOffset: number,
    type: DocumentChunk['metadata']['chunkType'],
    options: ChunkingOptions
  ): DocumentChunk {
    const words = content.split(/\s+/);
    const doc = compromise(content);
    const sentences = doc.sentences().out('array');

    return {
      id: `chunk_${index}_${Date.now()}`,
      content,
      metadata: {
        chunkIndex: index,
        totalChunks: 0, // Will be set in finalizeChu ks
        startOffset,
        endOffset: startOffset + content.length,
        wordCount: words.length,
        sentenceCount: sentences.length,
        overlap: index > 0 ? options.overlapSize : 0,
        chunkType: type
      }
    };
  }

  private finalizeChunks(chunks: DocumentChunk[]): DocumentChunk[] {
    // Update total chunks count for all chunks
    return chunks.map(chunk => ({
      ...chunk,
      metadata: {
        ...chunk.metadata,
        totalChunks: chunks.length
      }
    }));
  }

  private getOverlapSentences(sentences: string[], currentIndex: number, overlapSize: number): string[] {
    const overlapSentenceCount = Math.min(3, Math.floor(overlapSize / 20)); // Rough estimate
    const startIndex = Math.max(0, currentIndex - overlapSentenceCount);
    return sentences.slice(startIndex, currentIndex);
  }

  private extractTitleFromFilename(filename: string): string {
    // Extract meaningful title from filename
    return filename
      .replace(/\.[^/.]+$/, '') // Remove extension
      .replace(/_+/g, ' ') // Replace underscores with spaces
      .replace(/[-_]+/g, ' ') // Replace hyphens and underscores
      .replace(/\d{10,}/g, '') // Remove long numbers (timestamps)
      .split(' ')
      .filter(word => word.length > 0)
      .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join(' ')
      .trim();
  }

  private detectDocumentType(filename: string): string {
    const name = filename.toLowerCase();
    
    if (name.includes('rag')) return 'rag-specification';
    if (name.includes('mcp')) return 'mcp-specification';
    if (name.includes('a2a') || name.includes('agent')) return 'a2a-specification';
    if (name.includes('cursor')) return 'platform-cursor';
    if (name.includes('bolt')) return 'platform-bolt';
    if (name.includes('replit')) return 'platform-replit';
    if (name.includes('windsurf')) return 'platform-windsurf';
    if (name.includes('lovable')) return 'platform-lovable';
    
    return 'general-documentation';
  }

  private generateDocumentId(title: string): string {
    return title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '')
      .substring(0, 50) + '_' + Date.now();
  }
}