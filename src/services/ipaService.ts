import { GenerationStatus, ProjectSpec, AgentName, DeepSeekCompletionRequest, DeepSeekCompletionResponse, DeepSeekMessage } from "@/types/ipa-types";

// In a real app, this would be stored securely in environment variables
const DEEPSEEK_API_KEY = "YOUR_DEEPSEEK_API_KEY"; // Replace with your actual API key
const DEEPSEEK_API_URL = "https://api.deepseek.com/chat/completions";

// We'll store the current project spec in a variable that can be accessed by getGenerationStatus
let currentProjectSpec: ProjectSpec | null = null;

export const ipaService = {
  generatePrompt: async (spec: ProjectSpec): Promise<string> => {
    // Store the spec for use by getGenerationStatus
    currentProjectSpec = spec;
    // In a real app, this would call the backend API
    return Promise.resolve(mockTaskId);
  },
  
  getGenerationStatus: async (taskId: string): Promise<GenerationStatus> => {
    // In a real app, this would poll the backend API
    return new Promise((resolve) => {
      setTimeout(async () => {
        const currentStep = Math.min(mockStatus.progress + 1, 7);
        
        // If we're processing a new agent, invoke DeepSeek for that agent
        if (currentStep > 0 && currentStep <= agentList.length) {
          const currentAgent = agentList[currentStep - 1];
          
          try {
            // Only make the API call if we're not in development/mock mode
            if (process.env.NODE_ENV === "production" && DEEPSEEK_API_KEY !== "YOUR_DEEPSEEK_API_KEY" && currentProjectSpec) {
              const agentResponse = await invokeDeepSeekAgent(currentAgent, currentProjectSpec);
              
              // Update the agent status with the response
              mockStatus.agents[currentStep - 1] = {
                agent: currentAgent,
                status: "completed",
                output: agentResponse.content,
                reasoningContent: agentResponse.reasoningContent
              };
            } else {
              // In development/mock mode, just update the status
              mockStatus.agents[currentStep - 1] = {
                agent: currentAgent,
                status: "completed"
              };
            }
          } catch (error) {
            console.error(`Error invoking DeepSeek for agent ${currentAgent}:`, error);
            mockStatus.agents[currentStep - 1] = {
              agent: currentAgent,
              status: "failed",
              output: `Error: ${error instanceof Error ? error.message : String(error)}`
            };
          }
        }
        
        // Update mock status
        mockStatus = {
          ...mockStatus,
          progress: currentStep,
          status: currentStep < 7 ? "processing" : "completed",
          agents: agentList.map((agent, index) => ({
            ...mockStatus.agents[index],
            status:
              index < currentStep
                ? mockStatus.agents[index].status || "completed"
                : index === currentStep
                ? "processing"
                : "idle"
          }))
        };
        
        if (currentStep === 7) {
          mockStatus.result = enhancedExamplePrompt;
        }
        
        resolve(mockStatus);
      }, 2000); // Simulate network delay
    });
  }
};

// Helper function to invoke DeepSeek API for a specific agent
const invokeDeepSeekAgent = async (agent: AgentName, spec: ProjectSpec): Promise<{content: string, reasoningContent: string}> => {
  const systemPrompt = getAgentSystemPrompt(agent, spec);
  const userMessage = createUserMessageFromSpec(agent, spec);
  
  const messages: DeepSeekMessage[] = [
    { role: "system", content: systemPrompt },
    { role: "user", content: userMessage }
  ];
  
  const requestBody: DeepSeekCompletionRequest = {
    model: "deepseek-reasoner",
    messages: messages,
    max_tokens: 4096
  };
  
  try {
    const response = await fetch(DEEPSEEK_API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${DEEPSEEK_API_KEY}`
      },
      body: JSON.stringify(requestBody)
    });
    
    if (!response.ok) {
      const errorData = await response.text();
      throw new Error(`DeepSeek API error (${response.status}): ${errorData}`);
    }
    
    const data: DeepSeekCompletionResponse = await response.json();
    const completionMessage = data.choices[0].message;
    
    return {
      content: completionMessage.content,
      reasoningContent: completionMessage.reasoning_content
    };
  } catch (error) {
    console.error("Error calling DeepSeek API:", error);
    throw error;
  }
};

// Helper function to get the system prompt for each agent
const getAgentSystemPrompt = (agent: AgentName, spec: ProjectSpec): string => {
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

// Helper function to create a user message from project spec for each agent
const createUserMessageFromSpec = (agent: AgentName, spec: ProjectSpec): string => {
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
    
    // Add cases for other agents similarly
    
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

// Mock data
const mockTaskId = "task-123456";

// Add the enhanced list that includes all requested agents
const agentList: AgentName[] = [
  "RequirementDecompositionAgent",
  "RAGContextIntegrationAgent",
  "A2AProtocolExpertAgent",
  "TechStackImplementationAgent_Backend",
  "TechStackImplementationAgent_Frontend",
  "CursorOptimizationAgent",
  "QualityAssuranceAgent"
];

let mockStatus: GenerationStatus = {
  taskId: mockTaskId,
  status: "pending",
  progress: 0,
  agents: agentList.map(agent => ({
    agent,
    status: "idle"
  }))
};

// Enhanced example prompt for demonstration
const enhancedExamplePrompt = `# Master Prompt for Cursor AI: Collaborative Task Management Application with RAG 2.0 and ReAct Protocol

## Project Description
Create a collaborative task management application with real-time updates, Agent-to-Agent (A2A) communication, PGVector for semantic search, and ReAct protocol for agent reasoning. The application should support user authentication, role-based permissions, a kanban board view, activity timeline, and email notifications.

## Tech Stack
- Frontend: React, Next.js
- Backend: NestJS
- Database: PostgreSQL with PGVector extension
- Authentication: JWT
- Deployment: Docker

## Architecture

### Frontend (React + Next.js)
1. Server-side rendering for initial page loads with Next.js
2. Client-side state management with React Context API and SWR for data fetching
3. Real-time updates using WebSockets (socket.io-client)
4. Component structure: Atomic design pattern
5. Styling with Tailwind CSS
6. Form handling with react-hook-form and zod validation

### Backend (NestJS)
1. RESTful API endpoints for CRUD operations
2. WebSocket gateway for real-time updates
3. Authentication middleware with JWT
4. Role-based authorization guards
5. Database integration with TypeORM
6. Email service with Nodemailer
7. Job scheduling with NestJS Bull Queue
8. Vector embeddings generation with OpenAI embeddings API

### RAG 2.0 Implementation (PGVector)
1. Document processing pipeline:
   - Text extraction and cleaning
   - Chunking with sliding window and overlap
   - Metadata extraction for filtering
2. Vector storage in PostgreSQL using pgvector extension
3. Hybrid search implementation:
   - BM25 keyword search for precision
   - Vector similarity search for semantic matching
   - Rank fusion for combined results
4. Context augmentation with metadata filtering
5. Response synthesis with citations

## ReAct Protocol Integration
1. Agent architecture follows Reasoning + Acting pattern:
   - Reasoning: Generate hypotheses about task requirements
   - Acting: Execute semantic searches and information retrieval
   - Observation: Evaluate search results
   - Reflection: Refine reasoning based on observations
2. Task decomposition with reasoning trace
3. Dynamic context window management
4. Self-correction mechanisms

## A2A Communication Implementation
Implement Agent-to-Agent communication for task assignment and notification subsystems using the following approach:

1. Task Assignment Agent:
   - Listens for task creation/modification events
   - Analyzes task requirements and team member workloads
   - Communicates with Notification Agent when assignments are made
   - Uses ReAct protocol for decision making
   - Protocol: JSON messages over a dedicated Redis channel

2. Notification Agent:
   - Receives notifications from Task Assignment Agent
   - Determines appropriate notification channels (in-app, email)
   - Aggregates notifications to prevent spam
   - Schedules delivery based on user preferences
   - Protocol: Standardized event schema with priority levels

3. A2A Message Format:
\`\`\`json
{
  "messageId": "uuid",
  "timestamp": "ISO-8601",
  "sender": "agent-name",
  "recipient": "agent-name",
  "messageType": "ACTION|NOTIFICATION|QUERY",
  "priority": 1-5,
  "reasoning": {
    "thoughts": "Step-by-step reasoning process",
    "plan": "Action plan based on reasoning"
  },
  "payload": {},
  "metadata": {}
}
\`\`\`

## Database Schema (PostgreSQL)
1. Users table: id, email, name, password_hash, role, created_at, updated_at
2. Projects table: id, name, description, created_by, created_at, updated_at
3. Tasks table: id, title, description, status, priority, assignee_id, project_id, due_date, created_by, created_at, updated_at
4. Comments table: id, content, task_id, user_id, created_at, updated_at
5. Activities table: id, action, entity_type, entity_id, user_id, metadata, created_at
6. Vectors table: id, content_id, content_type, embedding, metadata, created_at

## Development Phases
1. Setup project structure and configurations
2. Implement authentication and user management
3. Develop core task management features
4. Implement real-time updates with WebSockets
5. Setup PGVector and embedding pipeline
6. Build A2A communication system with ReAct protocol
7. Implement notification system
8. Develop kanban board UI
9. Add activity timeline
10. Implement email notifications
11. Build admin dashboard
12. Add analytics features
13. Testing and optimization

## Security Considerations
1. Implement proper JWT handling with refresh tokens
2. Use bcrypt for password hashing
3. Apply rate limiting on API endpoints
4. Implement CORS policies
5. Use prepared statements for database queries
6. Validate all user inputs
7. Implement proper error handling to prevent information leakage
8. Secure vector database access with proper authentication

Start by setting up the project structure, then proceed with the authentication system before moving on to the core task management features. Focus on implementing the PGVector integration and ReAct protocol early as they're central requirements.`;
