
import { ProjectSpec, AgentName, DeepSeekCompletionRequest, DeepSeekCompletionResponse, DeepSeekMessage } from "@/types/ipa-types";
import { getAgentSystemPrompt, createUserMessageFromSpec } from "./agentPrompts";
import { toast } from "@/hooks/use-toast";

// API URL for DeepSeek
const DEEPSEEK_API_URL = "https://api.deepseek.com/chat/completions";

/**
 * Helper function to invoke DeepSeek API for a specific agent
 */
export const invokeDeepSeekAgent = async (agent: AgentName, spec: ProjectSpec): Promise<{content: string, reasoningContent?: string}> => {
  if (!spec) {
    throw new Error("Project specification is required");
  }
  
  // Get system prompt and user message for this agent
  const systemPrompt = getAgentSystemPrompt(agent, spec);
  const userMessage = createUserMessageFromSpec(agent, spec);
  
  // Create the messages array for DeepSeek Chat
  const messages: DeepSeekMessage[] = [
    { role: "system", content: systemPrompt },
    { role: "user", content: userMessage }
  ];
  
  const requestBody: DeepSeekCompletionRequest = {
    model: "deepseek-chat", // Using deepseek-chat instead of deepseek-reasoner
    messages: messages,
    max_tokens: 4096
  };
  
  try {
    console.log(`Making API call to DeepSeek for agent ${agent}`);
    
    // Get API key from localStorage
    const apiKey = localStorage.getItem("deepseek_api_key");
    let response;
    let data: DeepSeekCompletionResponse;
    
    if (!apiKey || apiKey === "") {
      // If no API key is provided, use simulated responses
      console.log("No API key found. Using simulated API response for development");
      
      // Simulate network delay (1-3 seconds)
      await new Promise(resolve => setTimeout(resolve, 1000 + Math.random() * 2000));
      
      // Create a simulated response based on the agent type
      data = createSimulatedResponse(agent, spec);
    } else {
      // Make the actual API call with the provided API key
      console.log("Using saved API key for DeepSeek API call");
      response = await fetch(DEEPSEEK_API_URL, {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${apiKey}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify(requestBody)
      });
      
      if (!response.ok) {
        const errorData = await response.text();
        throw new Error(`DeepSeek API error (${response.status}): ${errorData}`);
      }
      
      data = await response.json();
    }
    
    const completionMessage = data.choices[0].message;
    
    console.log(`Received response for agent ${agent}`, {
      contentLength: completionMessage.content.length,
      // No reasoning_content in deepseek-chat model
    });
    
    return {
      content: completionMessage.content,
      // deepseek-chat doesn't have reasoning_content
    };
  } catch (error) {
    console.error("Error calling DeepSeek API:", error);
    toast({
      title: "API Error",
      description: `Failed to connect to DeepSeek API: ${error instanceof Error ? error.message : String(error)}`,
      variant: "destructive"
    });
    throw error;
  }
};

/**
 * Helper function to create simulated responses for development/demo purposes
 */
const createSimulatedResponse = (agent: AgentName, spec: ProjectSpec): DeepSeekCompletionResponse => {
  const agentResponses: Record<AgentName, {content: string, reasoning_content: string}> = {
    "RequirementDecompositionAgent": {
      content: `# Project Requirements Analysis\n\n## Core Requirements\n- Build a ${spec.ragVectorDb !== "None" ? "RAG-enabled" : ""} application using ${spec.frontendTechStack.join(", ")} for frontend and ${spec.backendTechStack.join(", ")} for backend\n- Implement ${spec.mcpType !== "None" ? spec.mcpType + " for model-tool integration" : "core functionality"}\n- Create Agent-to-Agent communication system\n\n## User Stories\n1. As a user, I want to interact with the system through an intuitive interface\n2. As a user, I want to see real-time updates from other agents\n3. As an administrator, I want to monitor agent activities and communication\n\n## Technical Requirements\n- Integration with ${spec.ragVectorDb !== "None" ? spec.ragVectorDb + " for vector storage" : "specified databases"}\n- Secure authentication and authorization\n- Scalable architecture for future expansion`,
      reasoning_content: "First, I need to analyze the project description to identify the key requirements. The user wants to build an application with specific tech stack requirements for both frontend and backend. There's emphasis on RAG integration and A2A communication. Breaking this down into core requirements, user stories, and technical specifications will help organize the development plan effectively."
    },
    "RAGContextIntegrationAgent": {
      content: `# RAG Integration Plan\n\n${spec.ragVectorDb !== "None" ? `## ${spec.ragVectorDb} Integration\n- Set up vector embeddings using best practices\n- Implement hybrid search combining dense vectors with keyword search\n- Configure metadata filtering for enhanced relevance\n\n## Chunking Strategy\n- Use semantic chunking to preserve context\n- Implement document structure awareness\n- Store metadata with chunks for better filtering\n\n## Retrieval Optimization\n- Implement reranking using cross-encoders\n- Add contextual compression to fit more in LLM context window\n- Cache frequent queries for performance` : "RAG was not selected for this project."}`,
      reasoning_content: "The project requires RAG 2.0 implementation, which is more advanced than basic vector search. I'll focus on providing guidance for sophisticated vector database integration, especially with the specified database. Key considerations include embedding generation, chunking strategies, and retrieval methods that would work best with this tech stack."
    },
    "A2AProtocolExpertAgent": {
      content: `# Agent-to-Agent Communication Protocol\n\n## Message Format\n\`\`\`typescript\ninterface AgentMessage {\n  id: string;\n  sender: AgentIdentifier;\n  receiver: AgentIdentifier;\n  messageType: "REQUEST" | "RESPONSE" | "NOTIFICATION";\n  content: any;\n  timestamp: number;\n  correlationId?: string;\n}\n\`\`\`\n\n## Communication Patterns\n- Request-Reply: For direct information exchange\n- Publish-Subscribe: For event broadcasting\n- Delegation: For task handoff between agents\n\n## Error Handling\n- Timeout mechanisms\n- Retry strategies with backoff\n- Error status and codes standardization\n\n## Security\n- Message authentication\n- Authorization checks\n- Payload validation`,
      reasoning_content: "Designing an A2A protocol requires careful consideration of message formats, communication patterns, and error handling. Since the project specifies particular needs for A2A integration, I'm focusing on creating a robust protocol with standardized message formats and flexible communication patterns that would work well with the specified tech stack."
    },
    "TechStackImplementationAgent_Frontend": {
      content: `# Frontend Implementation Guide\n\n## Component Architecture\n- Implement a feature-based folder structure\n- Create reusable UI components with Storybook\n- Use atomic design principles\n\n## State Management\n- ${spec.frontendTechStack.includes("React") ? "Use React Context for simple state\n- Implement Redux Toolkit for complex state" : "Implement appropriate state management"}\n- Create custom hooks for common operations\n\n## UI/UX Implementation\n- Responsive design using Tailwind CSS\n- Accessible components following WCAG 2.1\n- Implement dark/light theme toggle\n\n## A2A Integration Points\n- WebSocket connection for real-time agent updates\n- Message composition and display components\n- Agent status visualization`,
      reasoning_content: "Based on the specified frontend tech stack, I'm providing guidance on component architecture, state management approaches, and UI/UX implementation. I've included specific considerations for A2A integration points in the frontend, ensuring that the interface can effectively display agent communications and status updates."
    },
    "TechStackImplementationAgent_Backend": {
      content: `# Backend Implementation Guide\n\n## API Design\n- RESTful endpoints for resource operations\n- WebSocket server for real-time updates\n- GraphQL interface for complex data queries\n\n## Database Schema\n\`\`\`typescript\n// Core schemas\ninterface User {\n  id: string;\n  username: string;\n  // Other fields...\n}\n\ninterface Agent {\n  id: string;\n  type: string;\n  capabilities: string[];\n  status: "active" | "inactive";\n}\n\ninterface Message {\n  id: string;\n  senderId: string;\n  receiverId: string;\n  content: string;\n  timestamp: number;\n}\n\`\`\`\n\n## Authentication/Authorization\n- JWT-based authentication\n- Role-based access control\n- API rate limiting\n\n${spec.ragVectorDb !== "None" ? `## ${spec.ragVectorDb} Integration\n- Document preprocessing pipeline\n- Vector embedding generation\n- Hybrid search API endpoints` : ""}`,
      reasoning_content: "I'm designing a backend implementation that aligns with the specified tech stack. The focus is on creating a robust API design, appropriate database schema for the application's needs, and proper authentication/authorization mechanisms. If RAG is specified, I include database-specific integration recommendations. For A2A communication, the backend needs to support the specified communication patterns."
    },
    "CursorOptimizationAgent": {
      content: `# Cursor AI Optimization Guidelines\n\n## Code Structure Guidelines\n- Use clear section headers with descriptive comments\n- Include small, focused code examples\n- Specify exact file paths for all code snippets\n\n## Implementation Sequence\n1. Setup project scaffolding and dependencies\n2. Implement core data models and interfaces\n3. Create base communication protocols\n4. Build UI components and wire them to state\n5. Integrate RAG functionality\n6. Connect agent communication system\n7. Add authentication and security features\n\n## Instruction Format\n- Break implementation into manageable chunks\n- Provide context before each implementation step\n- Include clear success criteria for each module`,
      reasoning_content: "To optimize for Cursor AI, I need to ensure the instructions are clear, detailed, and follow a logical sequence. Cursor works best with well-structured prompts that specify exact file paths, provide clear component hierarchies, and break down complex tasks into manageable steps. I'm creating guidelines that will help the user get the most effective code generation from Cursor."
    },
    "QualityAssuranceAgent": {
      content: `# Quality Assurance Review\n\n## Potential Issues\n- Ensure proper error handling for API failures\n- Implement robust connection retry logic for A2A communication\n- Consider rate limiting for high-frequency agent messages\n- Add validation for all user and agent inputs\n\n## Security Considerations\n- Sanitize all user inputs to prevent XSS\n- Implement proper authentication for agent communication\n- Secure storage of sensitive agent credentials\n- Regular security audits of communication protocols\n\n## Performance Optimization\n- Implement connection pooling for database access\n- Add caching layer for frequent queries\n- Optimize vector search for large datasets\n- Use debouncing for UI event handlers`,
      reasoning_content: "After reviewing the project requirements and implementation plans, I'm identifying potential issues, security considerations, and performance optimizations that should be addressed. My focus is on ensuring the application will be robust, secure, and performant, particularly in areas related to A2A communication and RAG implementation if specified."
    }
  };
  
  const response = agentResponses[agent] || {
    content: `Default response for ${agent}`,
    reasoning_content: "This is a placeholder reasoning content."
  };
  
  // Simulate a DeepSeek API response structure (modified for deepseek-chat which doesn't use reasoning_content)
  return {
    id: `sim-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
    object: "chat.completion",
    created: Math.floor(Date.now() / 1000),
    model: "deepseek-chat",
    choices: [
      {
        index: 0,
        message: {
          role: "assistant",
          content: response.content,
          // No reasoning_content in deepseek-chat
        },
        finish_reason: "stop"
      }
    ],
    usage: {
      prompt_tokens: Math.floor(Math.random() * 500) + 500,
      completion_tokens: Math.floor(Math.random() * 1000) + 500,
      total_tokens: Math.floor(Math.random() * 1500) + 1000
    }
  };
};

/**
 * Helper function to build a conversation history with multiple agents
 * This implements the multi-round conversation approach
 */
export const buildConversationHistory = (prevAgents: AgentName[], spec: ProjectSpec): DeepSeekMessage[] => {
  const messages: DeepSeekMessage[] = [];
  
  // Add a high-level system prompt to start the conversation
  messages.push({
    role: "system", 
    content: "You are a collaborative AI system helping to create a comprehensive project specification."
  });
  
  // Add the initial user request with project details
  messages.push({
    role: "user",
    content: `I need assistance with this project: ${spec.projectDescription}`
  });
  
  // For each previous agent that has completed, add their contribution to the conversation
  prevAgents.forEach(agentName => {
    // Get the system prompt for this agent
    const agentSystemPrompt = getAgentSystemPrompt(agentName, spec);
    
    // Add the agent's system prompt as a user message (to provide context)
    messages.push({
      role: "user",
      content: `Now I need you to act as a ${agentName}. ${agentSystemPrompt}`
    });
    
    // In a real multi-round conversation, we would add the agent's response here
    // For now, we'll use placeholder content (this will be replaced by real implementation)
    messages.push({
      role: "assistant",
      content: `[${agentName}'s analysis and recommendations would appear here]`
    });
  });
  
  return messages;
}
