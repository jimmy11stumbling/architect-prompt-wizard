
export class MockResponseGenerator {
  static generateEnhancedMockResponse(prompt: string): any {
    const isRAGQuery = prompt.toLowerCase().includes('rag') || prompt.toLowerCase().includes('retrieval');
    const isA2AQuery = prompt.toLowerCase().includes('a2a') || prompt.toLowerCase().includes('agent');
    const isMCPQuery = prompt.toLowerCase().includes('mcp') || prompt.toLowerCase().includes('tool');
    const isTechnical = prompt.toLowerCase().includes('implement') || prompt.toLowerCase().includes('code');

    let reasoning = "# Advanced Reasoning Process\n\n";
    reasoning += "## Query Analysis\n";
    reasoning += `Analyzing the query: "${prompt.substring(0, 100)}..."\n\n`;
    
    if (isRAGQuery) {
      reasoning += "## RAG System Analysis\n";
      reasoning += "- Identified requirement for Retrieval-Augmented Generation\n";
      reasoning += "- RAG 2.0 implementation would benefit from hybrid search\n";
      reasoning += "- Vector embeddings and semantic similarity crucial\n\n";
    }
    
    if (isA2AQuery) {
      reasoning += "## Agent Coordination Analysis\n";
      reasoning += "- Multi-agent system coordination required\n";
      reasoning += "- A2A protocol enables seamless communication\n";
      reasoning += "- Task delegation and result aggregation needed\n\n";
    }
    
    if (isMCPQuery) {
      reasoning += "## Tool Integration Analysis\n";
      reasoning += "- Model Context Protocol integration identified\n";
      reasoning += "- External tool access and execution required\n";
      reasoning += "- Standardized interface for tool interaction\n\n";
    }

    reasoning += "## Solution Synthesis\n";
    reasoning += "Combining available knowledge and reasoning capabilities to provide comprehensive response.\n";

    let answer = "";
    if (isRAGQuery) {
      answer = "For RAG 2.0 implementation, I recommend using a hybrid approach combining dense vector search with traditional keyword matching. The system should include semantic chunking, reranking, and context compression for optimal results. Key components include: vector database (Pinecone/Weaviate), embedding models (OpenAI/Cohere), and retrieval scoring mechanisms.";
    } else if (isA2AQuery) {
      answer = "Agent-to-Agent communication requires standardized protocols for discovery, message routing, and task coordination. Implement agent registries, message queues, and coordination patterns. Use JSON-RPC or similar protocols for reliable communication between specialized agents.";
    } else if (isMCPQuery) {
      answer = "Model Context Protocol enables standardized integration with external tools and data sources. Implement MCP servers for different tool categories, use JSON-RPC for communication, and ensure secure tool execution with proper authentication and sandboxing.";
    } else if (isTechnical) {
      answer = "For implementation, consider modular architecture with clear separation of concerns. Use TypeScript for type safety, implement proper error handling, and ensure scalable design patterns. Focus on maintainability and testability.";
    } else {
      answer = `Based on the query about "${prompt.substring(0, 50)}...", I recommend a comprehensive approach leveraging available AI capabilities and integrations. The solution should be scalable, maintainable, and aligned with modern best practices.`;
    }

    return {
      choices: [{
        message: {
          content: answer,
          reasoning: reasoning
        },
        finish_reason: "stop"
      }],
      usage: {
        prompt_tokens: Math.floor(prompt.length / 4),
        completion_tokens: Math.floor(answer.length / 4),
        reasoning_tokens: Math.floor(reasoning.length / 4),
        total_tokens: Math.floor((prompt.length + answer.length + reasoning.length) / 4)
      }
    };
  }
}
