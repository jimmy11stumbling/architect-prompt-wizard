import { AgentName, ProjectSpec } from "@/types/ipa-types";

/**
 * Helper function to get the system prompt for each agent
 */
export const getAgentSystemPrompt = (agent: AgentName, spec: ProjectSpec): string => {
  // Add RAG and MCP-specific context to the system prompts
  const ragContext = spec.ragVectorDb !== "None" ? 
    `The project uses ${spec.ragVectorDb} as the vector database for RAG 2.0 implementation. Focus on optimizing vector search, hybrid retrieval strategies, and metadata filtering techniques.` : "";
  
  const mcpContext = spec.mcpType !== "None" ? 
    `The project implements the ${spec.mcpType} Model Context Protocol for connecting AI models to external tools and data sources. Focus on designing effective tool definitions, resource access patterns, and secure context integration.` : "";
  
  const advancedContext = `${ragContext} ${mcpContext}`.trim();
  
  switch(agent) {
    case "RequirementDecompositionAgent":
      return `You are a specialized AI agent focused on analyzing and decomposing software requirements. Your task is to break down a project description into well-structured development phases and user stories. Focus on identifying core functionalities, data models, user flows, and technical requirements. Output should be organized in clear sections with detailed bullet points. ${advancedContext}`;
    
    case "RAGContextIntegrationAgent":
      return `You are a specialized AI agent that integrates relevant context from technical documentation into development plans. Analyze the given project specifications and identify which technologies, patterns, and best practices are most relevant. Your output should connect specific project requirements with appropriate implementation approaches and cite relevant documentation. ${advancedContext ? `You should specifically focus on ${spec.ragVectorDb} integration for RAG 2.0 capabilities.` : ""}`;
    
    case "A2AProtocolExpertAgent":
      return `You are a specialized AI agent with expertise in Agent-to-Agent (A2A) communication protocols. Your task is to design robust communication systems between software agents for the specified project. Focus on message formats, communication channels, error handling, and synchronization mechanisms. Provide detailed implementation guidance specific to the mentioned technology stack. ${advancedContext}`;
    
    case "TechStackImplementationAgent_Frontend":
      return `You are a specialized AI agent focused on frontend implementation using the specified tech stack. Analyze project requirements and provide detailed guidance on component architecture, state management, UI/UX implementation, and frontend integration points. Include code patterns, library recommendations, and best practices specifically for the mentioned frontend technologies. ${advancedContext}`;
    
    case "TechStackImplementationAgent_Backend":
      return `You are a specialized AI agent focused on backend implementation using the specified tech stack. Analyze project requirements and provide detailed guidance on API design, database schema, authentication/authorization, business logic implementation, and system integration. Include code patterns, library recommendations, and best practices specifically for the mentioned backend technologies. ${spec.ragVectorDb !== "None" ? `Focus on integrating ${spec.ragVectorDb} for vector storage and retrieval operations.` : ""} ${advancedContext}`;
    
    case "CursorOptimizationAgent":
      return `You are a specialized AI agent that optimizes instructions for the Cursor AI code editor. Your task is to refine implementation guidance to leverage Cursor's capabilities effectively. Focus on structuring instructions in ways that Cursor can interpret most effectively, including appropriate level of detail, clear sequencing, and explicit technological references. Ensure instructions avoid common pitfalls that might confuse AI code generation. ${advancedContext}`;
    
    case "QualityAssuranceAgent":
      return `You are a specialized AI agent focused on quality assurance for software development instructions. Review the complete development plan and identify potential issues, inconsistencies, missing components, or areas needing clarification. Check for security considerations, scalability concerns, and maintenance challenges. Your output should be a comprehensive review with specific recommendations for improvement. ${advancedContext}`;
    
    default:
      return "You are a helpful AI assistant specializing in software development.";
  }
};

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
