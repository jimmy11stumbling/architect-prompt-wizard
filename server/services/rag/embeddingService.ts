import { OpenAIEmbeddings } from "@langchain/openai";
import { RecursiveCharacterTextSplitter } from "langchain/text_splitter";
import { Document as LangChainDocument } from "@langchain/core/documents";

export interface EmbeddingDocument {
  id: string;
  content: string;
  metadata: {
    source: string;
    platform?: string;
    category?: string;
    timestamp?: number;
    chunkIndex?: number;
    totalChunks?: number;
  };
  embedding?: number[];
}

export interface ChunkingStrategy {
  chunkSize: number;
  chunkOverlap: number;
  separators?: string[];
}

export class EmbeddingService {
  private embeddings: OpenAIEmbeddings;
  private textSplitter: RecursiveCharacterTextSplitter;

  constructor(
    apiKey?: string,
    chunkingStrategy: ChunkingStrategy = {
      chunkSize: 1000,
      chunkOverlap: 200,
      separators: ["\n\n", "\n", " ", ""]
    }
  ) {
    // Configure for DeepSeek using OpenAI SDK
    this.embeddings = new OpenAIEmbeddings({
      openAIApiKey: apiKey || process.env.DEEPSEEK_API_KEY || "dummy-key-for-local",
      modelName: "text-embedding-3-small",
      configuration: {
        baseURL: "https://api.deepseek.com/v1"
      }
    });

    this.textSplitter = new RecursiveCharacterTextSplitter({
      chunkSize: chunkingStrategy.chunkSize,
      chunkOverlap: chunkingStrategy.chunkOverlap,
      separators: chunkingStrategy.separators
    });
  }

  /**
   * Process and chunk text documents for embedding
   */
  async chunkDocument(
    content: string,
    metadata: Omit<EmbeddingDocument["metadata"], "chunkIndex" | "totalChunks">
  ): Promise<EmbeddingDocument[]> {
    try {
      const docs = await this.textSplitter.createDocuments([content]);
      
      return docs.map((doc, index) => ({
        id: `${metadata.source}_chunk_${index}`,
        content: doc.pageContent,
        metadata: {
          ...metadata,
          chunkIndex: index,
          totalChunks: docs.length,
          timestamp: Date.now()
        }
      }));
    } catch (error) {
      console.error("Error chunking document:", error);
      throw new Error(`Failed to chunk document: ${error instanceof Error ? error.message : "Unknown error"}`);
    }
  }

  /**
   * Generate simple text-based embeddings using TF-IDF approach
   * This eliminates the need for external API calls for basic RAG functionality
   */
  async generateEmbeddings(documents: EmbeddingDocument[]): Promise<EmbeddingDocument[]> {
    try {
      // Simple TF-IDF based embedding for local processing
      const vocabulary = this.buildVocabulary(documents.map(d => d.content));
      
      return documents.map(doc => ({
        ...doc,
        embedding: this.textToVector(doc.content, vocabulary)
      }));
    } catch (error) {
      console.error("Error generating embeddings:", error);
      throw new Error(`Failed to generate embeddings: ${error instanceof Error ? error.message : "Unknown error"}`);
    }
  }

  /**
   * Generate embedding for a single query using local text processing
   */
  async generateQueryEmbedding(query: string): Promise<number[]> {
    try {
      // For query embedding, use a simple word frequency approach
      const words = this.tokenize(query);
      const queryVector = new Array(1536).fill(0); // OpenAI standard embedding size
      
      words.forEach((word, index) => {
        // Simple hash-based positioning
        const position = this.simpleHash(word) % 1536;
        queryVector[position] += 1;
      });
      
      return queryVector;
    } catch (error) {
      console.error("Error generating query embedding:", error);
      throw new Error(`Failed to generate query embedding: ${error instanceof Error ? error.message : "Unknown error"}`);
    }
  }

  /**
   * Build vocabulary from document collection
   */
  private buildVocabulary(texts: string[]): Map<string, number> {
    const wordCounts = new Map<string, number>();
    
    texts.forEach(text => {
      const words = this.tokenize(text);
      words.forEach(word => {
        wordCounts.set(word, (wordCounts.get(word) || 0) + 1);
      });
    });

    // Keep only words that appear in multiple documents (reduces noise)
    const vocabulary = new Map<string, number>();
    let index = 0;
    
    const wordCountEntries = Array.from(wordCounts.entries());
    for (const [word, count] of wordCountEntries) {
      if (count > 1 && word.length > 2) {
        vocabulary.set(word, index++);
      }
    }

    return vocabulary;
  }

  /**
   * Convert text to vector using TF-IDF
   */
  private textToVector(text: string, vocabulary: Map<string, number>): number[] {
    const vector = new Array(1536).fill(0);
    const words = this.tokenize(text);
    const wordCounts = new Map<string, number>();

    // Count word frequencies
    words.forEach(word => {
      wordCounts.set(word, (wordCounts.get(word) || 0) + 1);
    });

    // Calculate TF scores
    const wordCountEntries = Array.from(wordCounts.entries());
    for (const [word, count] of wordCountEntries) {
      const vocabIndex = vocabulary.get(word);
      if (vocabIndex !== undefined && vocabIndex < 1536) {
        const tf = count / words.length;
        vector[vocabIndex] = tf;
      }
    }

    return vector;
  }

  /**
   * Simple tokenization
   */
  private tokenize(text: string): string[] {
    return text
      .toLowerCase()
      .replace(/[^\w\s]/g, ' ')
      .split(/\s+/)
      .filter(word => word.length > 2);
  }

  /**
   * Simple hash function for word positioning
   */
  private simpleHash(str: string): number {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    return Math.abs(hash);
  }

  /**
   * Process platform data for vector storage
   */
  async processPlatformData(platforms: any[]): Promise<EmbeddingDocument[]> {
    const documents: EmbeddingDocument[] = [];

    for (const platform of platforms) {
      // Create comprehensive text representation of platform
      const platformText = this.createPlatformText(platform);
      
      const chunks = await this.chunkDocument(platformText, {
        source: `platform_${platform.id}`,
        platform: platform.name,
        category: "platform_overview"
      });
      
      documents.push(...chunks);
    }

    return documents;
  }

  /**
   * Process knowledge base entries for vector storage
   */
  async processKnowledgeBase(entries: any[]): Promise<EmbeddingDocument[]> {
    const documents: EmbeddingDocument[] = [];

    for (const entry of entries) {
      const chunks = await this.chunkDocument(entry.content, {
        source: `kb_${entry.id}`,
        category: entry.category,
        platform: entry.platform
      });
      
      documents.push(...chunks);
    }

    return documents;
  }

  private createPlatformText(platform: any): string {
    return `
Platform: ${platform.name}
Description: ${platform.description}
Category: ${platform.category}
Homepage: ${platform.homepage}
Pricing Model: ${platform.pricingModel}
User Base: ${platform.userBase}
Founded: ${platform.founded}
Key Features: ${platform.keyFeatures}
Primary Use Cases: ${platform.primaryUseCases}
Integration Capabilities: ${platform.integrationCapabilities}
AI Capabilities: ${platform.aiCapabilities}
Development Tools: ${platform.developmentTools}
Supported Languages: ${platform.supportedLanguages}
Deployment Options: ${platform.deploymentOptions}
Documentation Quality: ${platform.documentationQuality}
Community Size: ${platform.communitySize}
Learning Curve: ${platform.learningCurve}
Performance Rating: ${platform.performanceRating}
`.trim();
  }

  /**
   * Calculate cosine similarity between two vectors
   */
  static cosineSimilarity(a: number[], b: number[]): number {
    if (a.length !== b.length) {
      throw new Error("Vectors must have the same length");
    }

    let dotProduct = 0;
    let normA = 0;
    let normB = 0;

    for (let i = 0; i < a.length; i++) {
      dotProduct += a[i] * b[i];
      normA += a[i] * a[i];
      normB += b[i] * b[i];
    }

    if (normA === 0 || normB === 0) {
      return 0;
    }

    return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
  }
}