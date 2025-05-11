
import { GenerationStatus, ProjectSpec, AgentName, DeepSeekCompletionRequest, DeepSeekCompletionResponse, DeepSeekMessage } from "@/types/ipa-types";

// In a real app, this would be stored securely in environment variables
const DEEPSEEK_API_KEY = "YOUR_DEEPSEEK_API_KEY"; // Replace with your actual API key
const DEEPSEEK_API_URL = "https://api.deepseek.com/chat/completions";

export const ipaService = {
  generatePrompt: async (spec: ProjectSpec): Promise<string> => {
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
            if (process.env.NODE_ENV === "production" && DEEPSEEK_API_KEY !== "YOUR_DEEPSEEK_API_KEY") {
              const agentResponse = await invokeDeepSeekAgent(currentAgent, spec);
              
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
          mockStatus.result = examplePrompt;
        }
        
        resolve(mockStatus);
      }, 2000); // Simulate network delay
    });
  }
};

// Helper function to invoke DeepSeek API for a specific agent
const invokeDeepSeekAgent = async (agent: AgentName, spec: ProjectSpec): Promise<{content: string, reasoningContent: string}> => {
  const systemPrompt = getAgentSystemPrompt(agent);
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
const getAgentSystemPrompt = (agent: AgentName): string => {
  switch(agent) {
    case "RequirementDecompositionAgent":
      return "You are a specialized AI agent focused on analyzing and decomposing software requirements. Your task is to break down a project description into well-structured development phases and user stories. Focus on identifying core functionalities, data models, user flows, and technical requirements. Output should be organized in clear sections with detailed bullet points.";
    
    case "RAGContextIntegrationAgent":
      return "You are a specialized AI agent that integrates relevant context from technical documentation into development plans. Analyze the given project specifications and identify which technologies, patterns, and best practices are most relevant. Your output should connect specific project requirements with appropriate implementation approaches and cite relevant documentation.";
    
    case "A2AProtocolExpertAgent":
      return "You are a specialized AI agent with expertise in Agent-to-Agent (A2A) communication protocols. Your task is to design robust communication systems between software agents for the specified project. Focus on message formats, communication channels, error handling, and synchronization mechanisms. Provide detailed implementation guidance specific to the mentioned technology stack.";
    
    case "TechStackImplementationAgent_Frontend":
      return "You are a specialized AI agent focused on frontend implementation using the specified tech stack. Analyze project requirements and provide detailed guidance on component architecture, state management, UI/UX implementation, and frontend integration points. Include code patterns, library recommendations, and best practices specifically for the mentioned frontend technologies.";
    
    case "TechStackImplementationAgent_Backend":
      return "You are a specialized AI agent focused on backend implementation using the specified tech stack. Analyze project requirements and provide detailed guidance on API design, database schema, authentication/authorization, business logic implementation, and system integration. Include code patterns, library recommendations, and best practices specifically for the mentioned backend technologies.";
    
    case "CursorOptimizationAgent":
      return "You are a specialized AI agent that optimizes instructions for the Cursor AI code editor. Your task is to refine implementation guidance to leverage Cursor's capabilities effectively. Focus on structuring instructions in ways that Cursor can interpret most effectively, including appropriate level of detail, clear sequencing, and explicit technological references. Ensure instructions avoid common pitfalls that might confuse AI code generation.";
    
    case "QualityAssuranceAgent":
      return "You are a specialized AI agent focused on quality assurance for software development instructions. Review the complete development plan and identify potential issues, inconsistencies, missing components, or areas needing clarification. Check for security considerations, scalability concerns, and maintenance challenges. Your output should be a comprehensive review with specific recommendations for improvement.";
    
    default:
      return "You are a helpful AI assistant specializing in software development.";
  }
};

// Helper function to create a user message from project spec for each agent
const createUserMessageFromSpec = (agent: AgentName, spec: ProjectSpec): string => {
  const { projectDescription, frontendTechStack, backendTechStack, a2aIntegrationDetails, additionalFeatures } = spec;
  
  const techStackInfo = `
Frontend Tech Stack: ${frontendTechStack.join(", ")}
Backend Tech Stack: ${backendTechStack.join(", ")}
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

Break down this project into clear development phases, user stories, and technical requirements. Identify core functionalities, data models, user flows, and integration points.
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

Provide detailed specifications for message formats, communication channels, error handling, and synchronization. Include implementation guidance specific to the mentioned tech stack.
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
      `.trim();
  }
};

// Mock data
const mockTaskId = "task-123456";

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

// Example prompt for demonstration
const examplePrompt = `# Master Prompt for Cursor AI: Collaborative Task Management Application

## Project Description
Create a collaborative task management application with real-time updates and Agent-to-Agent (A2A) communication. The application should support user authentication, role-based permissions, a kanban board view, activity timeline, and email notifications.

## Tech Stack
- Frontend: React, Next.js
- Backend: NestJS
- Database: PostgreSQL
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

### Database Schema (PostgreSQL)
1. Users table: id, email, name, password_hash, role, created_at, updated_at
2. Projects table: id, name, description, created_by, created_at, updated_at
3. Tasks table: id, title, description, status, priority, assignee_id, project_id, due_date, created_by, created_at, updated_at
4. Comments table: id, content, task_id, user_id, created_at, updated_at
5. Activities table: id, action, entity_type, entity_id, user_id, metadata, created_at

## A2A Communication Implementation
Implement Agent-to-Agent communication for task assignment and notification subsystems using the following approach:

1. Task Assignment Agent:
   - Listens for task creation/modification events
   - Analyzes task requirements and team member workloads
   - Communicates with Notification Agent when assignments are made
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
  "payload": {},
  "metadata": {}
}
\`\`\`

## Development Phases
1. Setup project structure and configurations
2. Implement authentication and user management
3. Develop core task management features
4. Implement real-time updates with WebSockets
5. Build A2A communication system
6. Implement notification system
7. Develop kanban board UI
8. Add activity timeline
9. Implement email notifications
10. Build admin dashboard
11. Add analytics features
12. Testing and optimization

## Security Considerations
1. Implement proper JWT handling with refresh tokens
2. Use bcrypt for password hashing
3. Apply rate limiting on API endpoints
4. Implement CORS policies
5. Use prepared statements for database queries
6. Validate all user inputs
7. Implement proper error handling to prevent information leakage

Start by setting up the project structure, then proceed with the authentication system before moving on to the core task management features. Focus on implementing the A2A communication system early as it's a central requirement.`;

