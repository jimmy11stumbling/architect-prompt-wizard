
import { RAGDocument } from "@/types/rag-types";
import { StructureExtractor } from "./core/structureExtractor";
import { ChunkingStrategy } from "./core/chunkingStrategy";
import { EmbeddingGenerator } from "./core/embeddingGenerator";

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
    codeBlocks?: string[];
    nearHeading?: boolean;
    title?: string;
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
    
    const structure = opts.preserveStructure 
      ? await StructureExtractor.extractStructure(document.content)
      : null;

    const chunks = await ChunkingStrategy.createSemanticChunks(
      document.content,
      {
        chunkSize: opts.chunkSize,
        chunkOverlap: opts.chunkOverlap,
        preserveStructure: opts.preserveStructure
      },
      structure
    );

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
          title: document.title,
          ...chunk.metadata
        }
      };

      if (opts.extractMetadata) {
        processedChunk.embedding = await EmbeddingGenerator.generateEmbedding(chunk.text);
      }

      processedChunks.push(processedChunk);
    }

    return processedChunks;
  }
}
