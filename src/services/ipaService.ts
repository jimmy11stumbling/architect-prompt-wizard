
import { GenerationStatus, ProjectSpec, AgentName } from "@/types/ipa-types";

// Mock service to simulate API calls
export const ipaService = {
  generatePrompt: async (spec: ProjectSpec): Promise<string> => {
    // In a real app, this would call the backend API
    return Promise.resolve(mockTaskId);
  },
  
  getGenerationStatus: async (taskId: string): Promise<GenerationStatus> => {
    // In a real app, this would poll the backend API
    return new Promise((resolve) => {
      setTimeout(() => {
        const currentStep = Math.min(mockStatus.progress + 1, 7);
        
        // Update mock status
        mockStatus = {
          ...mockStatus,
          progress: currentStep,
          status: currentStep < 7 ? "processing" : "completed",
          agents: agentList.map((agent, index) => ({
            agent,
            status:
              index < currentStep
                ? "completed"
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
