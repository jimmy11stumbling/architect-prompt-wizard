
import { AgentName, ProjectSpec, DeepSeekCompletionResponse } from "@/types/ipa-types";

export class ResponseSimulator {
  static async simulateResponse(agent: AgentName, spec: ProjectSpec): Promise<DeepSeekCompletionResponse> {
    // Reduced simulation delay for testing - was causing 20+ minute waits
    await new Promise(resolve => setTimeout(resolve, 200 + Math.random() * 300));
    
    const responses = {
      RequirementDecompositionAgent: `# Project Requirements Analysis & Decomposition

## Executive Summary
Based on the project description for "${spec.projectDescription}", I've conducted a comprehensive analysis to break down the requirements into implementable components.

## Functional Requirements Breakdown

### Core Features
1. **User Interface Layer**
   - ${spec.frontendTechStack.includes("React" as any) ? "React-based component architecture" : "Modern frontend framework implementation"}
   - Responsive design for multiple device types
   - Real-time user interactions and feedback
   - ${spec.ragVectorDb !== "None" ? "Advanced search interface with RAG integration" : "Standard search functionality"}

2. **Backend Services**
   - ${spec.backendTechStack.includes("Express" as any) ? "Express.js REST API architecture" : "Robust backend API implementation"}
   - ${spec.authenticationMethod || "JWT"} authentication system
   - ${spec.ragVectorDb !== "None" ? `Vector database integration with ${spec.ragVectorDb}` : "Standard database operations"}
   - ${spec.mcpType !== "None" ? `Model Context Protocol implementation (${spec.mcpType})` : "Standard data context management"}

## Technical Architecture
- Frontend: ${spec.frontendTechStack.join(", ")}
- Backend: ${spec.backendTechStack.join(", ")}
- Database: Optimized for selected tech stack
- Integration: A2A, MCP, RAG as specified

## Development Phases
1. Foundation setup and authentication
2. Core features development
3. Advanced features (RAG, MCP, A2A)
4. Testing and deployment

## Risk Assessment
- Integration complexity mitigation needed
- Performance optimization required
- Security auditing essential`,

      RAGContextIntegrationAgent: `# RAG 2.0 Implementation Strategy

## Vector Database Architecture (${spec.ragVectorDb})

### Implementation Plan
1. **Database Schema**: Document collections with vector embeddings
2. **Embedding Strategy**: OpenAI text-embedding-3-large primary model
3. **Search Implementation**: Hybrid vector + full-text search
4. **Performance**: Query optimization and caching

### Integration Code
\`\`\`typescript
interface SearchResult {
  id: string;
  content: string;
  score: number;
  metadata: Record<string, any>;
}

class RAGEngine {
  async search(query: string): Promise<SearchResult[]> {
    const vectorResults = await this.vectorSearch(query);
    const textResults = await this.fullTextSearch(query);
    return this.fuseResults(vectorResults, textResults);
  }
}
\`\`\`

### Performance Metrics
- Query latency: <100ms target
- Retrieval accuracy: >90% relevance
- Cache hit rate: >80%`,

      A2AProtocolExpertAgent: `# Agent-to-Agent Communication Architecture

## Protocol Implementation

### Message Format
\`\`\`typescript
interface A2AMessage {
  id: string;
  timestamp: number;
  source: AgentIdentifier;
  target: AgentIdentifier;
  type: MessageType;
  payload: any;
  signature?: string;
}
\`\`\`

### Communication Features
- Service discovery and registration
- Message routing and load balancing
- Authentication and security
- Error handling and fault tolerance

### Integration Points
- WebSocket for real-time communication
- Message queues for reliability
- Database logging for audit trails
- Monitoring and metrics collection`,

      TechStackImplementationAgent_Frontend: `# Frontend Implementation (${spec.frontendTechStack.join(", ")})

## Project Structure
\`\`\`
src/
├── components/     # Reusable UI components
├── hooks/         # Custom React hooks  
├── stores/        # State management
├── services/      # API services
├── utils/         # Utility functions
└── types/         # TypeScript definitions
\`\`\`

## Key Components
1. **Authentication**: ${spec.authenticationMethod || "JWT"} implementation
2. **State Management**: Zustand/Redux setup
3. **Real-time**: WebSocket integration
4. **Performance**: Code splitting and optimization

## Implementation Details
- Component architecture with TypeScript
- Responsive design patterns
- API integration layers
- Testing setup and configuration`,

      TechStackImplementationAgent_Backend: `# Backend Implementation (${spec.backendTechStack.join(", ")})

## API Architecture
\`\`\`
src/
├── controllers/    # Request handlers
├── services/      # Business logic
├── models/        # Data models
├── middleware/    # Custom middleware
├── routes/        # API routes
└── config/        # Configuration
\`\`\`

## Core Features
1. **Authentication**: ${spec.authenticationMethod || "JWT"} system
2. **Database**: Schema design and migrations
3. **API Endpoints**: RESTful service design
4. **Security**: Input validation and protection

## Performance & Scaling
- Connection pooling
- Caching strategies
- Error handling
- Logging and monitoring`,

      CursorOptimizationAgent: `# Cursor AI Optimization Guide

## Project Structure for Optimal AI Generation
\`\`\`
project-root/
├── src/components/    # Small, focused components
├── docs/             # Context documentation
└── .cursorrules      # AI guidance rules
\`\`\`

## Best Practices
1. **Component Size**: Keep under 100 lines
2. **Type Safety**: Comprehensive TypeScript
3. **Documentation**: Clear comments and docs
4. **Error Handling**: Proper user feedback
5. **Naming**: Consistent conventions

## Common Pitfalls
- Overly complex components
- Missing type definitions
- Poor error handling
- Inconsistent patterns`,

      QualityAssuranceAgent: `# Quality Assurance Review

## Assessment for "${spec.projectDescription}"

### ✅ Strengths
- Modular architecture design
- TypeScript implementation
- Modern tech stack selection
- Scalable component structure

### ⚠️ Areas for Improvement

#### Security
- Authentication: ${spec.authenticationMethod || "JWT"} hardening needed
- Input validation required
- API security measures
- Data protection protocols

#### Performance
- Bundle optimization
- Code splitting implementation
- Database query optimization
- Caching strategies

#### Testing
- Unit test coverage
- Integration testing
- End-to-end scenarios
- Performance benchmarks

## Recommendations
1. **High Priority**: Security implementation
2. **Medium Priority**: Performance optimization  
3. **Ongoing**: Test coverage expansion

**Risk Assessment**: Medium
**Production Readiness**: 75% (after security improvements)`
    };
    
    const response = responses[agent as keyof typeof responses] || 
      `# ${agent} Analysis\n\nDetailed analysis for ${spec.projectDescription} using ${spec.frontendTechStack.join(", ")} and ${spec.backendTechStack.join(", ")}.`;
    
    return {
      id: `test-${Date.now()}`,
      object: "chat.completion",
      created: Math.floor(Date.now() / 1000),
      model: "deepseek-chat",
      choices: [{
        index: 0,
        message: {
          role: "assistant",
          content: response
        },
        finish_reason: "stop"
      }],
      usage: {
        prompt_tokens: 100,
        completion_tokens: response.length / 4,
        total_tokens: 100 + response.length / 4
      }
    };
  }
}
