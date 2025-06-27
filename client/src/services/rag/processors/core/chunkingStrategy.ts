
export interface ChunkingOptions {
  chunkSize: number;
  chunkOverlap: number;
  preserveStructure: boolean;
}

export interface DocumentChunk {
  text: string;
  startIndex: number;
  endIndex: number;
  metadata: Record<string, any>;
}

export class ChunkingStrategy {
  static async createSemanticChunks(
    content: string,
    options: ChunkingOptions,
    structure: any
  ): Promise<DocumentChunk[]> {
    const chunks: DocumentChunk[] = [];
    const sentences = this.splitBySentences(content);
    
    let currentChunk = '';
    let startIndex = 0;
    let currentMetadata: any = {};

    for (let i = 0; i < sentences.length; i++) {
      const sentence = sentences[i];
      const potentialChunk = currentChunk + (currentChunk ? ' ' : '') + sentence;

      if (potentialChunk.length > options.chunkSize && currentChunk.length > 0) {
        const endIndex = startIndex + currentChunk.length;
        chunks.push({
          text: currentChunk.trim(),
          startIndex,
          endIndex,
          metadata: { 
            ...currentMetadata,
            nearHeading: structure && this.isNearHeading(content, startIndex + currentChunk.length, structure.headings),
            codeBlocks: structure?.codeBlocks || []
          }
        });

        const overlapText = this.getOverlapText(currentChunk, options.chunkOverlap);
        currentChunk = overlapText + (overlapText ? ' ' : '') + sentence;
        startIndex = endIndex - overlapText.length;
        currentMetadata = {};
      } else {
        currentChunk = potentialChunk;
      }
    }

    if (currentChunk.trim()) {
      chunks.push({
        text: currentChunk.trim(),
        startIndex,
        endIndex: startIndex + currentChunk.length,
        metadata: {
          ...currentMetadata,
          nearHeading: structure && this.isNearHeading(content, startIndex + currentChunk.length, structure.headings),
          codeBlocks: structure?.codeBlocks || []
        }
      });
    }

    return chunks;
  }

  private static splitBySentences(text: string): string[] {
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
    const window = 100;
    const snippet = content.substring(Math.max(0, position - window), position + window);
    return headings.some(heading => snippet.includes(heading));
  }
}
