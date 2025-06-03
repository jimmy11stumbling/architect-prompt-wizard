
import { AgentName, ProjectSpec, DeepSeekMessage } from "@/types/ipa-types";
import { getAgentSystemPrompt } from "../systemPrompts";

export class ConversationBuilder {
  static buildConversationHistory(prevAgents: AgentName[], spec: ProjectSpec): DeepSeekMessage[] {
    const messages: DeepSeekMessage[] = [];
    
    // Add a comprehensive system prompt to start the conversation
    messages.push({
      role: "system", 
      content: `You are part of an advanced AI system called Intelligent Prompt Architect (IPA) that creates comprehensive project implementation prompts. Your role is to collaborate with specialized agents to create the best possible implementation guidance.

Project Context:
- Description: ${spec.projectDescription}
- Frontend: ${spec.frontendTechStack.join(", ")}
- Backend: ${spec.backendTechStack.join(", ")}
- Vector DB: ${spec.ragVectorDb}
- MCP Type: ${spec.mcpType}
- Authentication: ${spec.authenticationMethod || "JWT"}
- Deployment: ${spec.deploymentPreference || "Vercel"}

Your responses must be:
1. Comprehensive and detailed
2. Production-ready and implementable
3. Following best practices and modern patterns
4. Optimized for the specified tech stack
5. Include specific code examples where helpful
6. Address security, performance, and scalability concerns`
    });
    
    // Add the initial user request with enhanced project details
    messages.push({
      role: "user",
      content: `I need assistance creating a comprehensive implementation prompt for this project:

PROJECT: ${spec.projectDescription}

TECHNICAL SPECIFICATIONS:
- Frontend Technologies: ${spec.frontendTechStack.join(", ")}
- Backend Technologies: ${spec.backendTechStack.join(", ")}
- Vector Database: ${spec.ragVectorDb}
- Model Context Protocol: ${spec.mcpType}
- A2A Integration: ${spec.a2aIntegrationDetails || "Standard implementation"}
- Authentication Method: ${spec.authenticationMethod || "JWT"}
- Deployment Platform: ${spec.deploymentPreference || "Vercel"}
- Additional Features: ${spec.additionalFeatures || "None specified"}
- Advanced Requirements: ${spec.advancedPromptDetails || "Standard implementation"}

Please provide expert-level implementation guidance that covers all aspects of building this application with modern best practices.`
    });
    
    // For each previous agent that has completed, add their contribution to the conversation
    prevAgents.forEach((agentName, index) => {
      // Get the system prompt for this agent to provide context
      const agentSystemPrompt = getAgentSystemPrompt(agentName, spec);
      
      // Add the agent's role definition as a system message
      messages.push({
        role: "system",
        content: `Now you will act as a ${agentName}. ${agentSystemPrompt}`
      });
      
      // Add a user message requesting this agent's specific analysis
      const agentSpecificRequest = ConversationBuilder.getAgentSpecificRequest(agentName, spec);
      messages.push({
        role: "user",
        content: agentSpecificRequest
      });
      
      // In a real multi-round conversation, we would add the agent's actual response here
      // For now, we use a placeholder that will be replaced by the actual response
      messages.push({
        role: "assistant",
        content: `[This will be replaced with ${agentName}'s detailed analysis and recommendations]`
      });
    });
    
    return messages;
  }

  private static getAgentSpecificRequest(agentName: AgentName, spec: ProjectSpec): string {
    const commonContext = `
Project: ${spec.projectDescription}
Tech Stack: Frontend (${spec.frontendTechStack.join(", ")}), Backend (${spec.backendTechStack.join(", ")})
Advanced Features: RAG (${spec.ragVectorDb}), MCP (${spec.mcpType})
`;

    switch (agentName) {
      case "RequirementDecompositionAgent":
        return `${commonContext}
Please provide a comprehensive requirements analysis and breakdown for this project. Include:
- Detailed functional requirements
- System architecture overview
- Data models and relationships
- Integration requirements
- Development phases and milestones
- Risk assessment`;

      case "RAGContextIntegrationAgent":
        return `${commonContext}
Please design a comprehensive RAG 2.0 system implementation. Include:
- Vector database architecture (${spec.ragVectorDb})
- Embedding and retrieval strategies
- Hybrid search implementation
- Performance optimization techniques
- Integration with the specified tech stack`;

      case "A2AProtocolExpertAgent":
        return `${commonContext}
A2A Requirements: ${spec.a2aIntegrationDetails || "Design a robust agent communication system"}
Please design a comprehensive Agent-to-Agent communication system. Include:
- Protocol specifications and message formats
- Service discovery and routing
- Error handling and fault tolerance
- Security and authentication
- Integration with MCP (${spec.mcpType})`;

      case "TechStackImplementationAgent_Frontend":
        return `${commonContext}
Please provide detailed frontend implementation guidance. Include:
- Component architecture and patterns
- State management strategy
- API integration approaches
- Performance optimization
- Testing strategies
- Build and deployment configuration`;

      case "TechStackImplementationAgent_Backend":
        return `${commonContext}
Please provide detailed backend implementation guidance. Include:
- API design and architecture
- Database schema and optimization
- Authentication and security
- Integration with vector database (${spec.ragVectorDb})
- Scalability and performance considerations
- Testing and deployment strategies`;

      case "CursorOptimizationAgent":
        return `${commonContext}
Please optimize all implementation guidance for Cursor AI. Include:
- Structured, actionable instructions
- Clear file organization
- Specific code examples and patterns
- Error handling and edge cases
- Testing and validation steps
- Best practices for AI-assisted development`;

      case "QualityAssuranceAgent":
        return `${commonContext}
Please conduct a comprehensive quality review. Include:
- Security vulnerability assessment
- Performance and scalability analysis
- Code quality and maintainability review
- Testing strategy evaluation
- Compliance and best practices check
- Risk mitigation recommendations`;

      default:
        return `${commonContext}
Please provide expert analysis and recommendations for implementing this project with the specified technologies.`;
    }
  }

  static addAgentResponse(messages: DeepSeekMessage[], agentName: AgentName, response: string): DeepSeekMessage[] {
    // Replace the placeholder response with the actual agent response
    const updatedMessages = [...messages];
    
    // Find the last placeholder for this agent using a loop instead of findLastIndex
    let placeholderIndex = -1;
    for (let i = updatedMessages.length - 1; i >= 0; i--) {
      if (updatedMessages[i].role === "assistant" && 
          updatedMessages[i].content.includes(`[This will be replaced with ${agentName}'s`)) {
        placeholderIndex = i;
        break;
      }
    }
    
    if (placeholderIndex !== -1) {
      updatedMessages[placeholderIndex] = {
        role: "assistant",
        content: response
      };
    } else {
      // If no placeholder found, just add the response
      updatedMessages.push({
        role: "assistant",
        content: response
      });
    }
    
    return updatedMessages;
  }
}
