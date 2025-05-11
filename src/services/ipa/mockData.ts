
import { GenerationStatus, AgentName } from "@/types/ipa-types";

// Mock data
export const mockTaskId = "task-123456";

// List of agents in the workflow
export const agentList: AgentName[] = [
  "RequirementDecompositionAgent",
  "RAGContextIntegrationAgent",
  "A2AProtocolExpertAgent",
  "TechStackImplementationAgent_Backend",
  "TechStackImplementationAgent_Frontend",
  "CursorOptimizationAgent",
  "QualityAssuranceAgent"
];

// Initial mock status
export const initialMockStatus: GenerationStatus = {
  taskId: mockTaskId,
  status: "pending",
  progress: 0,
  agents: agentList.map(agent => ({
    agent,
    status: "idle"
  }))
};

// Enhanced example prompt for demonstration
export const enhancedExamplePrompt = `# Master Prompt for Cursor AI: Collaborative Task Management Application with RAG 2.0 and ReAct Protocol

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
