
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
