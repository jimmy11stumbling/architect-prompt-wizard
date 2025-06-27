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
    // Use DeepSeek or OpenAI-compatible embedding endpoint
    this.embeddings = new OpenAIEmbeddings({
      openAIApiKey: apiKey || process.env.DEEPSEEK_API_KEY || process.env.OPENAI_API_KEY,
      modelName: "text-embedding-ada-002",
      // Use DeepSeek base URL if available
      configuration: {
        baseURL: process.env.DEEPSEEK_BASE_URL || "https://api.openai.com/v1"
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
   * Generate embeddings for text chunks
   */
  async generateEmbeddings(documents: EmbeddingDocument[]): Promise<EmbeddingDocument[]> {
    try {
      const texts = documents.map(doc => doc.content);
      const embeddings = await this.embeddings.embedDocuments(texts);
      
      return documents.map((doc, index) => ({
        ...doc,
        embedding: embeddings[index]
      }));
    } catch (error) {
      console.error("Error generating embeddings:", error);
      throw new Error(`Failed to generate embeddings: ${error instanceof Error ? error.message : "Unknown error"}`);
    }
  }

  /**
   * Generate embedding for a single query
   */
  async generateQueryEmbedding(query: string): Promise<number[]> {
    try {
      return await this.embeddings.embedQuery(query);
    } catch (error) {
      console.error("Error generating query embedding:", error);
      throw new Error(`Failed to generate query embedding: ${error instanceof Error ? error.message : "Unknown error"}`);
    }
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