
import { EnhancedQuery, EnhancedResponse } from "../enhancedSystemService";

export class ResponseGenerator {
  static generateEnhancedResponse(query: EnhancedQuery, sources: EnhancedResponse["sources"], log: string[]): string {
    let response = `# Enhanced Response to: "${query.query}"\n\n`;

    if (sources.ragDocuments && sources.ragDocuments.length > 0) {
      response += `## Knowledge Base Insights\nBased on ${sources.ragDocuments.length} relevant documents:\n\n`;
      sources.ragDocuments.slice(0, 2).forEach((doc) => {
        response += `**${doc.title}**: ${doc.content.substring(0, 200)}...\n\n`;
      });
    }

    if (sources.a2aAgents && sources.a2aAgents.length > 0) {
      response += `## Agent Collaboration\n${sources.a2aAgents.length} specialized agents are available for coordination:\n\n`;
      sources.a2aAgents.forEach(agent => {
        response += `- **${agent.name}**: ${agent.capabilities.join(", ")}\n`;
      });
      response += '\n';
    }

    if (sources.mcpTools && sources.mcpTools.length > 0) {
      response += `## Available Tools\n${sources.mcpTools.length} tools ready for execution:\n\n`;
      sources.mcpTools.forEach(tool => {
        response += `- **${tool.name}**: ${tool.description}\n`;
      });
      response += '\n';
    }

    response += `## Integrated Analysis\nThis response leverages `;
    const integrations = [];
    if (query.useRag) integrations.push("RAG 2.0 knowledge retrieval");
    if (query.useA2A) integrations.push("A2A agent coordination");
    if (query.useMCP) integrations.push("MCP tool integration");
    response += integrations.join(", ") + " for comprehensive assistance.\n\n";

    response += `Based on your query about "${query.query}", I recommend proceeding with a multi-faceted approach that combines the available resources and capabilities for optimal results.`;

    return response;
  }

  static generateReasoning(query: EnhancedQuery, sources: EnhancedResponse["sources"]): string {
    let reasoning = "# Chain of Thought Process\n\n";
    
    reasoning += "## 1. Query Analysis\n";
    reasoning += `The user asked: "${query.query}"\n`;
    reasoning += `This requires integration of: ${[query.useRag && "RAG", query.useA2A && "A2A", query.useMCP && "MCP"].filter(Boolean).join(", ")}\n\n`;
    
    reasoning += "## 2. Resource Assessment\n";
    if (sources.ragDocuments) {
      reasoning += `- RAG: ${sources.ragDocuments.length} relevant documents retrieved\n`;
    }
    if (sources.a2aAgents) {
      reasoning += `- A2A: ${sources.a2aAgents.length} agents available for coordination\n`;
    }
    if (sources.mcpTools) {
      reasoning += `- MCP: ${sources.mcpTools.length} tools accessible\n`;
    }
    
    reasoning += "\n## 3. Integration Strategy\n";
    reasoning += "Combined multiple information sources to provide comprehensive response\n";
    reasoning += "Prioritized accuracy and relevance based on available resources\n";
    reasoning += "Structured response to maximize user understanding and actionability\n";
    
    return reasoning;
  }
}
