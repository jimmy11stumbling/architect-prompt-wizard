
import { AgentName, ProjectSpec } from "@/types/ipa-types";

export class AgentValidator {
  static validateResponse(
    agent: AgentName,
    responseContent: string,
    responseLength: number,
    executionTime: number,
    testSpec: ProjectSpec
  ): { status: "pass" | "fail" | "warning"; message: string } {
    // Basic response validation
    if (responseLength < 500) {
      return { status: "fail", message: "Response too short - likely incomplete" };
    }
    
    if (responseLength < 1000) {
      return { status: "warning", message: "Response shorter than expected" };
    }
    
    if (!responseContent.includes("#")) {
      return { status: "warning", message: "Response lacks proper markdown formatting" };
    }
    
    if (executionTime > 5000) {
      return { status: "warning", message: `Response generated but took ${Math.round(executionTime)}ms` };
    }

    // Agent-specific validation
    const agentValidation = this.validateAgentSpecific(agent, responseContent, testSpec);
    if (agentValidation) {
      return agentValidation;
    }

    return { status: "pass", message: "Agent response generated successfully" };
  }

  private static validateAgentSpecific(
    agent: AgentName,
    responseContent: string,
    testSpec: ProjectSpec
  ): { status: "pass" | "fail" | "warning"; message: string } | null {
    switch (agent) {
      case "RequirementDecompositionAgent":
        if (!responseContent.includes("Requirements") || !responseContent.includes("Architecture")) {
          return { status: "fail", message: "Missing key requirements analysis sections" };
        }
        break;
      
      case "RAGContextIntegrationAgent":
        if (!responseContent.includes("Vector") || !responseContent.includes(testSpec.ragVectorDb)) {
          return { status: "fail", message: "Missing RAG/Vector database implementation details" };
        }
        break;
      
      case "A2AProtocolExpertAgent":
        if (!responseContent.includes("Agent") || !responseContent.includes("Communication")) {
          return { status: "fail", message: "Missing A2A communication specifications" };
        }
        break;
      
      case "TechStackImplementationAgent_Frontend":
        if (!testSpec.frontendTechStack.some(tech => responseContent.includes(tech))) {
          return { status: "fail", message: "Missing frontend tech stack implementation details" };
        }
        break;
      
      case "TechStackImplementationAgent_Backend":
        if (!testSpec.backendTechStack.some(tech => responseContent.includes(tech))) {
          return { status: "fail", message: "Missing backend tech stack implementation details" };
        }
        break;
      
      case "CursorOptimizationAgent":
        if (!responseContent.includes("Cursor") || !responseContent.includes("optimization")) {
          return { status: "fail", message: "Missing Cursor AI optimization guidance" };
        }
        break;
      
      case "QualityAssuranceAgent":
        if (!responseContent.includes("Quality") || !responseContent.includes("Security")) {
          return { status: "fail", message: "Missing quality assurance and security analysis" };
        }
        break;
    }

    return null;
  }
}
