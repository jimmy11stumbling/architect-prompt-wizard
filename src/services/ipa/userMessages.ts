
import { AgentName, ProjectSpec } from "@/types/ipa-types";

/**
 * Helper function to create a user message from project spec for each agent
 */
export const createUserMessageFromSpec = (agent: AgentName, spec: ProjectSpec): string => {
  const { projectDescription, frontendTechStack, backendTechStack, a2aIntegrationDetails, additionalFeatures, ragVectorDb, mcpType, advancedPromptDetails } = spec;
  
  const techStackInfo = `
Frontend Tech Stack: ${frontendTechStack.join(", ")}
Backend Tech Stack: ${backendTechStack.join(", ")}
  `.trim();
  
  const advancedTechInfo = `
RAG Vector Database: ${ragVectorDb}
Model Context Protocol: ${mcpType}
Advanced Prompt Details: ${advancedPromptDetails || "None provided"}
  `.trim();
  
  switch(agent) {
    case "RequirementDecompositionAgent":
      return `
Please analyze and decompose the following project requirements:

PROJECT DESCRIPTION:
${projectDescription}

TECH STACK:
${techStackInfo}

A2A INTEGRATION DETAILS:
${a2aIntegrationDetails}

ADDITIONAL FEATURES:
${additionalFeatures}

ADVANCED TECHNOLOGIES:
${advancedTechInfo}

Break down this project into clear development phases, user stories, and technical requirements. Identify core functionalities, data models, user flows, and integration points.
      `.trim();
    
    case "RAGContextIntegrationAgent":
      return `
Design a Retrieval-Augmented Generation (RAG) 2.0 system for the following project:

PROJECT DESCRIPTION:
${projectDescription}

TECH STACK:
${techStackInfo}

VECTOR DATABASE:
${ragVectorDb}

ADVANCED PROMPT DETAILS:
${advancedPromptDetails}

Provide detailed specifications for knowledge retrieval, vector embeddings, chunking strategies, and context integration. Include implementation guidance specific to the mentioned vector database and tech stack.
      `.trim();
    
    case "A2AProtocolExpertAgent":
      return `
Design a robust Agent-to-Agent (A2A) communication protocol for the following project:

PROJECT DESCRIPTION:
${projectDescription}

TECH STACK:
${techStackInfo}

A2A INTEGRATION DETAILS:
${a2aIntegrationDetails}

MODEL CONTEXT PROTOCOL:
${mcpType}

Provide detailed specifications for message formats, communication channels, error handling, and synchronization. Include implementation guidance specific to the mentioned tech stack and Model Context Protocol if applicable.
      `.trim();
    
    case "TechStackImplementationAgent_Frontend":
      return `
Provide detailed specifications for the frontend implementation of the following project:

PROJECT DESCRIPTION:
${projectDescription}

TECH STACK:
${techStackInfo}

A2A INTEGRATION DETAILS:
${a2aIntegrationDetails}

MODEL CONTEXT PROTOCOL:
${mcpType}

Provide detailed specifications for the frontend implementation, including component architecture, state management, UI/UX design, and integration points.
      `.trim();
    
    case "TechStackImplementationAgent_Backend":
      return `
Provide detailed specifications for the backend implementation of the following project:

PROJECT DESCRIPTION:
${projectDescription}

TECH STACK:
${techStackInfo}

A2A INTEGRATION DETAILS:
${a2aIntegrationDetails}

MODEL CONTEXT PROTOCOL:
${mcpType}

Provide detailed specifications for the backend implementation, including API design, database schema, authentication/authorization, business logic implementation, and system integration.
      `.trim();
    
    case "CursorOptimizationAgent":
      return `
Optimize the following project specification for use with the Cursor AI code editor:

PROJECT DESCRIPTION:
${projectDescription}

TECH STACK:
${techStackInfo}

A2A INTEGRATION DETAILS:
${a2aIntegrationDetails}

MODEL CONTEXT PROTOCOL:
${mcpType}

Refine the implementation guidance to leverage Cursor's capabilities effectively. Focus on structuring instructions in ways that Cursor can interpret most effectively, including appropriate level of detail, clear sequencing, and explicit technological references.
      `.trim();
    
    case "QualityAssuranceAgent":
      return `
Review the following project specification for quality assurance:

PROJECT DESCRIPTION:
${projectDescription}

TECH STACK:
${techStackInfo}

A2A INTEGRATION DETAILS:
${a2aIntegrationDetails}

MODEL CONTEXT PROTOCOL:
${mcpType}

Identify potential issues, inconsistencies, missing components, or areas needing clarification. Check for security considerations, scalability concerns, and maintenance challenges. Provide a comprehensive review with specific recommendations for improvement.
      `.trim();
    
    default:
      return `
Analyze the following project specification:

PROJECT DESCRIPTION:
${projectDescription}

TECH STACK:
${techStackInfo}

A2A INTEGRATION DETAILS:
${a2aIntegrationDetails}

ADDITIONAL FEATURES:
${additionalFeatures}

ADVANCED TECHNOLOGIES:
${advancedTechInfo}
      `.trim();
  }
};
