
import { RAGDocument, RAGQuery, RAGResult, VectorDatabaseType } from "@/types/ipa-types";

export class RAGService {
  private static instance: RAGService;
  private documents: RAGDocument[] = [];
  private vectorDbType: VectorDatabaseType = "None";

  static getInstance(): RAGService {
    if (!RAGService.instance) {
      RAGService.instance = new RAGService();
    }
    return RAGService.instance;
  }

  async initialize(vectorDbType: VectorDatabaseType): Promise<void> {
    this.vectorDbType = vectorDbType;
    await this.loadDocuments();
    console.log(`RAG Service initialized with ${vectorDbType}`);
  }

  private async loadDocuments(): Promise<void> {
    // Load comprehensive documentation for showcased platforms
    const platformDocs: RAGDocument[] = [
      {
        id: "cursor-docs",
        title: "Cursor AI Editor Documentation",
        content: "Comprehensive guide for Cursor AI with MCP integration, agent communication, and advanced prompt engineering techniques...",
        metadata: { platform: "cursor", type: "documentation" },
        source: "cursor.com/docs"
      },
      {
        id: "mcp-protocol",
        title: "Model Context Protocol Specification",
        content: "Complete MCP protocol specification including tools, resources, prompts, and sampling mechanisms for AI agent communication...",
        metadata: { platform: "mcp", type: "specification" },
        source: "modelcontextprotocol.io"
      },
      {
        id: "a2a-protocol",
        title: "Agent-to-Agent Communication Protocol",
        content: "Detailed A2A protocol documentation covering agent discovery, message passing, task delegation, and coordination patterns...",
        metadata: { platform: "a2a", type: "protocol" },
        source: "a2a-protocol.org"
      },
      {
        id: "deepseek-api",
        title: "DeepSeek API Integration Guide",
        content: "Complete guide for DeepSeek API integration including chat completions, reasoning models, and multi-turn conversations...",
        metadata: { platform: "deepseek", type: "api-guide" },
        source: "api.deepseek.com/docs"
      },
      {
        id: "rag-implementation",
        title: "RAG 2.0 Implementation Best Practices",
        content: "Advanced RAG 2.0 implementation strategies including vector databases, semantic search, and hybrid retrieval methods...",
        metadata: { platform: "rag", type: "best-practices" },
        source: "rag-research.org"
      }
    ];

    this.documents = platformDocs;
  }

  async query(ragQuery: RAGQuery): Promise<RAGResult> {
    console.log(`Performing RAG query: ${ragQuery.query}`);
    
    // Simulate semantic search with score calculation
    const results = this.documents
      .map(doc => ({
        document: doc,
        score: this.calculateRelevanceScore(doc, ragQuery.query)
      }))
      .filter(result => result.score > (ragQuery.threshold || 0.3))
      .sort((a, b) => b.score - a.score)
      .slice(0, ragQuery.limit || 5);

    return {
      documents: results.map(r => r.document),
      scores: results.map(r => r.score),
      query: ragQuery.query,
      totalResults: results.length
    };
  }

  private calculateRelevanceScore(document: RAGDocument, query: string): number {
    const queryLower = query.toLowerCase();
    const contentLower = document.content.toLowerCase();
    const titleLower = document.title.toLowerCase();
    
    let score = 0;
    
    // Title relevance (higher weight)
    if (titleLower.includes(queryLower)) score += 0.8;
    
    // Content keyword matching
    const queryWords = queryLower.split(' ');
    queryWords.forEach(word => {
      if (contentLower.includes(word)) score += 0.1;
      if (titleLower.includes(word)) score += 0.2;
    });
    
    // Platform-specific boost
    if (document.metadata.platform && queryLower.includes(document.metadata.platform)) {
      score += 0.3;
    }
    
    return Math.min(score, 1.0);
  }

  async addDocument(document: RAGDocument): Promise<void> {
    this.documents.push(document);
    console.log(`Added document: ${document.title}`);
  }

  async getDocumentsByPlatform(platform: string): Promise<RAGDocument[]> {
    return this.documents.filter(doc => doc.metadata.platform === platform);
  }

  getVectorDbType(): VectorDatabaseType {
    return this.vectorDbType;
  }

  getDocumentCount(): number {
    return this.documents.length;
  }
}

export const ragService = RAGService.getInstance();
