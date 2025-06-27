
export class ResponseGenerator {
  static generateEnhancedResponse(query: any, sources: any, processingLog: string[]): string {
    let response = `## Enhanced AI Analysis\n\n`;
    
    response += `**Query**: ${query.query}\n\n`;

    const sections: string[] = [];

    if (sources.ragDocuments && sources.ragDocuments.length > 0) {
      sections.push(`**Knowledge Base**: Retrieved ${sources.ragDocuments.length} relevant documents with comprehensive context about your query.`);
    }

    if (sources.a2aAgents && sources.a2aAgents.length > 0) {
      sections.push(`**Agent Network**: Coordinated with ${sources.a2aAgents.length} specialized AI agents for multi-perspective analysis.`);
    }

    if (sources.mcpTools && sources.mcpTools.length > 0) {
      sections.push(`**Tool Integration**: Executed ${sources.mcpTools.length} MCP tools to gather additional context and perform specialized operations.`);
    }

    if (sections.length > 0) {
      response += sections.join('\n\n') + '\n\n';
    }

    response += `## Analysis Summary\n\n`;
    response += `Your query has been processed through our integrated AI system, combining knowledge retrieval, agent coordination, and tool execution. `;
    
    if (processingLog.length > 0) {
      response += `The system completed ${processingLog.length} processing steps to ensure comprehensive analysis.\n\n`;
      response += `**Processing Steps:**\n${processingLog.slice(-5).map(log => `- ${log}`).join('\n')}`;
    }

    return response;
  }

  static generateReasoning(query: any, sources: any): string {
    let reasoning = `## Reasoning Process\n\n`;
    
    reasoning += `1. **Query Analysis**: Parsed the input query "${query.query.substring(0, 100)}..." to understand intent and requirements.\n\n`;
    
    if (sources.ragDocuments?.length > 0) {
      reasoning += `2. **Knowledge Retrieval**: Searched knowledge base and found ${sources.ragDocuments.length} relevant documents with average relevance score of ${(sources.ragDocuments.reduce((acc: number, doc: any) => acc + doc.relevanceScore, 0) / sources.ragDocuments.length).toFixed(2)}.\n\n`;
    }
    
    if (sources.a2aAgents?.length > 0) {
      reasoning += `3. **Agent Coordination**: Engaged ${sources.a2aAgents.length} specialized agents with combined expertise in ${sources.a2aAgents.map((agent: any) => agent.specialization).join(', ')}.\n\n`;
    }
    
    if (sources.mcpTools?.length > 0) {
      reasoning += `4. **Tool Execution**: Utilized ${sources.mcpTools.length} MCP tools for enhanced data processing and analysis capabilities.\n\n`;
    }
    
    reasoning += `5. **Synthesis**: Combined all available information sources to generate a comprehensive, accurate response that addresses your specific query requirements.`;
    
    return reasoning;
  }
}

export class IntegrationResponseGenerator {
  static synthesizeFinalResponse(query: string, results: any): string {
    let response = `## Integrated Analysis Results\n\n`;
    
    response += `**Query**: ${query}\n\n`;

    const sections: string[] = [];

    if (results.ragResults && results.ragResults.results.length > 0) {
      sections.push(`**Knowledge Base Insights**: Found ${results.ragResults.results.length} relevant documents with key information about ${query.toLowerCase()}.`);
    }

    if (results.a2aCoordination) {
      sections.push(`**Agent Analysis**: ${results.a2aCoordination.assignedAgent.name} provided specialized insights with ${(results.a2aCoordination.assignedAgent.performance.successRate * 100).toFixed(1)}% reliability.`);
    }

    if (results.mcpResults && results.mcpResults.success) {
      sections.push(`**Tool Execution**: Successfully executed ${results.mcpResults.toolName} to gather additional context and data.`);
    }

    if (results.reasoning) {
      sections.push(`**AI Reasoning**: Applied advanced reasoning with ${(results.reasoning.confidence * 100).toFixed(1)}% confidence to synthesize the comprehensive response.`);
    }

    response += sections.join('\n\n') + '\n\n';

    if (results.reasoning && results.reasoning.response) {
      response += `## Detailed Analysis\n\n${results.reasoning.response}`;
    } else {
      response += `## Summary\n\nBased on the integrated system analysis, your query has been processed through multiple specialized services to provide comprehensive insights. The combination of knowledge retrieval, agent coordination, tool execution, and advanced reasoning ensures a thorough and accurate response.`;
    }

    return response;
  }
}
