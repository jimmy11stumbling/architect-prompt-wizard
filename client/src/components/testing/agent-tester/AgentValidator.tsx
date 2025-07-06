import { AgentName } from "@/types/ipa-types";

export class AgentValidator {
  static validateResponse(agent: AgentName, response: string): { isValid: boolean; message: string } {
    if (!response || response.trim().length === 0) {
      return {
        isValid: false,
        message: "Agent returned empty response"
      };
    }

    if (response.length < 50) {
      return {
        isValid: false,
        message: "Response too short - may indicate error"
      };
    }

    // Check for common error patterns
    const errorPatterns = [
      /error/i,
      /failed/i,
      /exception/i,
      /undefined/i,
      /null/i
    ];

    for (const pattern of errorPatterns) {
      if (pattern.test(response)) {
        return {
          isValid: false,
          message: "Response contains error indicators"
        };
      }
    }

    // Agent-specific validation
    switch (agent) {
      case "RequirementDecompositionAgent":
        if (!response.includes("requirement") && !response.includes("feature")) {
          return {
            isValid: false,
            message: "Missing requirement analysis keywords"
          };
        }
        break;

      case "RAGContextIntegrationAgent":
        if (!response.includes("context") && !response.includes("RAG")) {
          return {
            isValid: false,
            message: "Missing RAG or context references"
          };
        }
        break;

      case "A2AProtocolExpertAgent":
        if (!response.includes("agent") && !response.includes("protocol")) {
          return {
            isValid: false,
            message: "Missing A2A protocol references"
          };
        }
        break;

      case "TechStackImplementationAgent_Frontend":
      case "TechStackImplementationAgent_Backend":
        if (!response.includes("implementation") && !response.includes("tech")) {
          return {
            isValid: false,
            message: "Missing technical implementation details"
          };
        }
        break;

      case "QualityAssuranceAgent":
        if (!response.includes("quality") && !response.includes("test")) {
          return {
            isValid: false,
            message: "Missing quality assurance keywords"
          };
        }
        break;
    }

    return {
      isValid: true,
      message: "Response validation passed"
    };
  }

  static measureResponseQuality(response: string): number {
    let score = 0;

    // Length scoring (0-30 points)
    if (response.length > 200) score += 10;
    if (response.length > 500) score += 10;
    if (response.length > 1000) score += 10;

    // Structure scoring (0-30 points)
    if (response.includes('\n')) score += 5; // Has line breaks
    if (response.includes('•') || response.includes('-')) score += 5; // Has bullet points
    if (response.includes('1.') || response.includes('2.')) score += 5; // Has numbered lists
    if (response.match(/\*\*(.*?)\*\*/)) score += 5; // Has bold text
    if (response.includes('```')) score += 10; // Has code blocks

    // Content scoring (0-40 points)
    const technicalTerms = [
      'component', 'service', 'API', 'database', 'authentication',
      'implementation', 'architecture', 'framework', 'integration'
    ];
    
    const foundTerms = technicalTerms.filter(term => 
      response.toLowerCase().includes(term.toLowerCase())
    );
    score += Math.min(foundTerms.length * 5, 40);

    return Math.min(score, 100);
  }
}