
import { RAGQuery, RAGResponse, RAGDocument, RAGResult } from "@/types/rag-types";
import { DocumentProcessor, ProcessedChunk } from "./processors/documentProcessor";
import { HybridSearchEngine, SearchResult } from "./search/hybridSearchEngine";
import { ContextProcessor, CompressedContext } from "./context/contextProcessor";
import { realTimeResponseService } from "../integration/realTimeResponseService";

export interface AdvancedRAGResponse extends RAGResponse {
  compressedContext?: CompressedContext;
  searchExplanation: string;
  processingStats: {
    chunksProcessed: number;
    searchTime: number;
    compressionTime: number;
    totalProcessingTime: number;
  };
}

export class AdvancedRAGService {
  private searchEngine: HybridSearchEngine;
  private processedChunks: Map<string, ProcessedChunk[]> = new Map();
  private documentIndex: Map<string, RAGDocument> = new Map();

  constructor() {
    this.searchEngine = new HybridSearchEngine();
    this.initializeWithSampleData();
  }

  private async initializeWithSampleData() {
    // Use the sample documents from the original service
    const sampleDocuments: RAGDocument[] = [
      {
        id: "rag-doc-1",
        title: "RAG 2.0 Architecture Guide",
        content: "RAG 2.0 represents a significant evolution in retrieval-augmented generation systems. Key improvements include hybrid search combining dense and sparse retrieval, semantic chunking for better context preservation, and end-to-end optimization of retriever and generator components. The architecture typically includes a vector database (like Pinecone or Weaviate), embedding models for semantic understanding, and sophisticated reranking mechanisms to ensure the most relevant context is provided to the language model. Advanced RAG 2.0 systems implement multi-step reasoning, where the retrieval process can involve multiple rounds of query refinement and context gathering. This approach significantly improves accuracy for complex queries that require information synthesis from multiple sources.",
        category: "AI Architecture",
        tags: ["RAG", "AI", "Architecture", "Vector Database"],
        metadata: { source: "internal", difficulty: "advanced", lastReviewed: Date.now() },
        lastUpdated: Date.now()
      },
      {
        id: "rag-doc-2",
        title: "Vector Database Selection Guide",
        content: "Choosing the right vector database is crucial for RAG system performance. Pinecone offers managed service with excellent performance but higher costs. Weaviate provides open-source flexibility with strong GraphQL integration. Qdrant excels in on-premise deployments with high performance. Chroma is ideal for development and smaller deployments. Consider factors like scale, cost, deployment model, and integration requirements when selecting. Performance benchmarks show that hybrid search approaches combining dense embeddings with sparse keyword matching achieve 15-20% better accuracy than pure vector search. Memory requirements vary significantly: Pinecone handles up to 10M vectors efficiently, while Qdrant can scale to 100M+ vectors with proper configuration.",
        category: "Database",
        tags: ["Vector Database", "Pinecone", "Weaviate", "Qdrant"],
        metadata: { source: "research", difficulty: "intermediate", lastReviewed: Date.now() },
        lastUpdated: Date.now()
      },
      {
        id: "a2a-doc-1",
        title: "Agent-to-Agent Communication Protocols",
        content: "A2A protocols enable seamless communication between autonomous AI agents. The protocol defines standard message formats, discovery mechanisms, and coordination patterns. Key components include agent registries for discovery, message routing systems, task delegation frameworks, and result aggregation mechanisms. JSON-RPC is commonly used for reliable communication, while WebSocket connections enable real-time coordination. Modern A2A implementations support sophisticated workflow orchestration where multiple agents collaborate on complex tasks. Security considerations include authentication, authorization, and message encryption. Performance optimization involves connection pooling, message batching, and intelligent routing to minimize latency.",
        category: "Agent Systems",
        tags: ["A2A", "Agents", "Communication", "Protocol"],
        metadata: { source: "specification", difficulty: "advanced", lastReviewed: Date.now() },
        lastUpdated: Date.now()
      },
      {
        id: "mcp-doc-1",
        title: "Model Context Protocol Implementation",
        content: "MCP standardizes how AI applications connect to external data sources and tools. The protocol defines resource discovery, context sharing, and tool execution interfaces. MCP servers provide standardized access to databases, APIs, and tools, while MCP clients (like AI applications) can discover and use these resources seamlessly. Security is paramount, with authentication, authorization, and sandboxing mechanisms built into the protocol. Implementation best practices include proper error handling, timeout management, and resource cleanup. Performance considerations involve caching strategies, connection pooling, and efficient serialization formats.",
        category: "Integration",
        tags: ["MCP", "Protocol", "Integration", "Tools"],
        metadata: { source: "documentation", difficulty: "intermediate", lastReviewed: Date.now() },
        lastUpdated: Date.now()
      }
    ];

    // Process each document
    for (const doc of sampleDocuments) {
      await this.indexDocument(doc);
    }
  }

  async indexDocument(document: RAGDocument): Promise<void> {
    realTimeResponseService.addResponse({
      source: "advanced-rag-service",
      status: "processing",
      message: `Processing document: ${document.title}`,
      data: { documentId: document.id }
    });

    try {
      // Process document into chunks
      const chunks = await DocumentProcessor.processDocument(document, {
        chunkSize: 800,
        chunkOverlap: 150,
        preserveStructure: true,
        extractMetadata: true
      });

      // Store processed chunks
      this.processedChunks.set(document.id, chunks);
      this.documentIndex.set(document.id, document);

      // Add chunks to search engine
      this.searchEngine.addChunks(chunks);

      realTimeResponseService.addResponse({
        source: "advanced-rag-service",
        status: "success",
        message: `Document indexed: ${document.title} (${chunks.length} chunks)`,
        data: { 
          documentId: document.id,
          chunksGenerated: chunks.length,
          avgChunkSize: Math.round(chunks.reduce((sum, c) => sum + c.text.length, 0) / chunks.length)
        }
      });

    } catch (error) {
      realTimeResponseService.addResponse({
        source: "advanced-rag-service",
        status: "error",
        message: `Failed to index document: ${document.title}`,
        data: { error: error instanceof Error ? error.message : String(error) }
      });
      throw error;
    }
  }

  async query(query: RAGQuery, useCompression: boolean = true): Promise<AdvancedRAGResponse> {
    const startTime = Date.now();

    realTimeResponseService.addResponse({
      source: "advanced-rag-service",
      status: "processing",
      message: "Executing advanced RAG query with hybrid search",
      data: { 
        query: query.query, 
        limit: query.limit || 5,
        useCompression,
        threshold: query.threshold || 0.1
      }
    });

    const searchStartTime = Date.now();
    
    try {
      // Perform hybrid search
      const searchResults = await this.searchEngine.search(query);
      const searchTime = Date.now() - searchStartTime;

      // Compress context if requested
      let compressedContext: CompressedContext | undefined;
      let compressionTime = 0;

      if (useCompression && searchResults.length > 0) {
        const compressionStartTime = Date.now();
        compressedContext = await ContextProcessor.compressContext(
          searchResults,
          query,
          {
            maxTokens: 1500,
            compressionStrategy: 'hybrid',
            extractKeyPoints: true,
            includeSourceReferences: true
          }
        );
        compressionTime = Date.now() - compressionStartTime;
      }

      // Convert search results to RAG results
      const ragResults: RAGResult[] = searchResults.map(result => ({
        id: result.chunk.id,
        title: this.getDocumentTitle(result.chunk.metadata.documentId),
        content: result.chunk.text,
        category: this.getDocumentCategory(result.chunk.metadata.documentId),
        relevanceScore: result.score,
        metadata: {
          ...result.chunk.metadata,
          searchType: result.searchType,
          explanation: result.explanation
        }
      }));

      const totalProcessingTime = Date.now() - startTime;

      // Generate search explanation
      const searchExplanation = this.generateSearchExplanation(searchResults, query);

      const response: AdvancedRAGResponse = {
        results: ragResults,
        query: query.query,
        totalResults: ragResults.length,
        processingTime: totalProcessingTime,
        scores: ragResults.map(r => r.relevanceScore),
        searchTime,
        compressedContext,
        searchExplanation,
        processingStats: {
          chunksProcessed: this.getTotalChunks(),
          searchTime,
          compressionTime,
          totalProcessingTime
        }
      };

      realTimeResponseService.addResponse({
        source: "advanced-rag-service",
        status: "success",
        message: `Advanced RAG query completed - found ${ragResults.length} relevant chunks`,
        data: { 
          resultsCount: ragResults.length,
          processingTime: totalProcessingTime,
          topScore: ragResults[0]?.relevanceScore || 0,
          compressionRatio: compressedContext?.compressionRatio || 1,
          keyPointsExtracted: compressedContext?.keyPoints.length || 0
        }
      });

      return response;

    } catch (error) {
      realTimeResponseService.addResponse({
        source: "advanced-rag-service",
        status: "error",
        message: `Advanced RAG query failed: ${error instanceof Error ? error.message : "Unknown error"}`,
        data: { query: query.query, error: error instanceof Error ? error.message : "Unknown error" }
      });
      throw error;
    }
  }

  private getDocumentTitle(documentId: string): string {
    const doc = this.documentIndex.get(documentId);
    return doc?.title || `Document ${documentId}`;
  }

  private getDocumentCategory(documentId: string): string {
    const doc = this.documentIndex.get(documentId);
    return doc?.category || "Unknown";
  }

  private getTotalChunks(): number {
    return Array.from(this.processedChunks.values())
      .reduce((sum, chunks) => sum + chunks.length, 0);
  }

  private generateSearchExplanation(results: SearchResult[], query: RAGQuery): string {
    if (results.length === 0) {
      return "No relevant content found for your query.";
    }

    const searchTypes = new Set(results.map(r => r.searchType));
    const avgScore = results.reduce((sum, r) => sum + r.score, 0) / results.length;
    
    let explanation = `Found ${results.length} relevant chunks using `;
    
    if (searchTypes.has('hybrid')) {
      explanation += "hybrid search (combining semantic similarity and keyword matching)";
    } else if (searchTypes.has('semantic')) {
      explanation += "semantic similarity search";
    } else {
      explanation += "keyword matching";
    }
    
    explanation += `. Average relevance score: ${(avgScore * 100).toFixed(1)}%.`;
    
    if (results[0].explanation) {
      explanation += ` Top result matched due to: ${results[0].explanation}.`;
    }
    
    return explanation;
  }

  async getStats() {
    const searchStats = this.searchEngine.getStats();
    
    return {
      totalDocuments: this.documentIndex.size,
      totalChunks: this.getTotalChunks(),
      searchEngineStats: searchStats,
      avgChunksPerDocument: this.getTotalChunks() / Math.max(1, this.documentIndex.size),
      categories: [...new Set(Array.from(this.documentIndex.values()).map(doc => doc.category))]
    };
  }

  async updateSearchWeights(weights: { semantic?: number; keyword?: number; recency?: number; structure?: number }) {
    this.searchEngine.updateWeights(weights);
    
    realTimeResponseService.addResponse({
      source: "advanced-rag-service",
      status: "success",
      message: "Search weights updated",
      data: { newWeights: weights }
    });
  }
}

export const advancedRagService = new AdvancedRAGService();
