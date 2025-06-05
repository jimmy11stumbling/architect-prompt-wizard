
import { AgentName, ProjectSpec } from "@/types/ipa-types";

// Mock responses for each agent when no API key is available
const mockResponses: Record<AgentName, string> = {
  "reasoning-assistant": "Providing reasoning assistance for the given task...",
  "context-analyzer": "Analyzing context and providing insights...",
  "documentation-expert": "Creating comprehensive documentation...",
  "workflow-coordinator": "Coordinating workflow between components...",
  "reasoning-coordinator": "Managing reasoning processes...",
  "RequirementDecompositionAgent": `# Requirements Analysis

## Core Functional Requirements
- User authentication and authorization system
- Data management and storage capabilities
- API endpoints for client-server communication
- Real-time updates and notifications

## System Architecture
- Microservices-based backend architecture
- RESTful API design with GraphQL capabilities
- Database optimization and caching strategies
- Scalable frontend component architecture

## Development Phases
1. Foundation setup and core infrastructure
2. Authentication and user management
3. Core functionality implementation
4. Integration and testing
5. Deployment and monitoring`,

  "RAGContextIntegrationAgent": `# RAG 2.0 Implementation Strategy

## Vector Database Architecture
- Hybrid search implementation combining semantic and keyword search
- Advanced chunking strategies preserving context
- Multi-modal embedding support for diverse content types

## Retrieval Optimization
- Context-aware query transformation
- Relevance scoring and reranking
- Adaptive retrieval based on query complexity

## Integration Patterns
- Seamless integration with existing tech stack
- Real-time indexing and updates
- Performance monitoring and optimization`,

  "A2AProtocolExpertAgent": `# Agent-to-Agent Communication Design

## Protocol Implementation
- Message passing architecture with secure channels
- Service discovery and agent registration
- Load balancing and fault tolerance

## Communication Patterns
- Request-response messaging
- Publish-subscribe event handling
- Workflow orchestration between agents

## Security Framework
- Authentication and authorization
- Message encryption and validation
- Audit logging and monitoring`,

  "TechStackImplementationAgent_Frontend": `# Frontend Implementation Guide

## Component Architecture
- Modular component design with reusable patterns
- State management using modern patterns
- Responsive design with mobile-first approach

## Performance Optimization
- Code splitting and lazy loading
- Asset optimization and caching
- Bundle size optimization

## Development Workflow
- Component testing strategies
- Build and deployment pipeline
- Development environment setup`,

  "TechStackImplementationAgent_Backend": `# Backend Implementation Strategy

## API Design
- RESTful service architecture
- Database schema optimization
- Authentication and security implementation

## Scalability Considerations
- Horizontal scaling patterns
- Caching strategies
- Database optimization

## Integration Points
- External service integration
- Message queue implementation
- Monitoring and logging setup`,

  "CursorOptimizationAgent": `# Cursor AI Integration Optimization

## Code Organization
- Clear file structure and naming conventions
- Modular component architecture
- Comprehensive documentation

## AI-Friendly Patterns
- Descriptive variable and function names
- Inline comments and documentation
- Type definitions and interfaces

## Development Workflow
- Step-by-step implementation guide
- Testing and validation procedures
- Error handling and edge cases`,

  "QualityAssuranceAgent": `# Quality Assurance Report

## Code Quality Assessment
- ✅ Type safety and error handling
- ✅ Performance optimization
- ✅ Security best practices
- ✅ Accessibility compliance

## Testing Strategy
- Unit testing coverage
- Integration testing plans
- End-to-end testing scenarios

## Recommendations
- Code review checklist
- Deployment validation steps
- Monitoring and maintenance guidelines`
};

export class ResponseSimulator {
  static async simulateResponse(agent: AgentName, spec: ProjectSpec): Promise<any> {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1000 + Math.random() * 2000));
    
    const content = mockResponses[agent] || `Mock response for ${agent}`;
    
    return {
      id: "mock-response",
      object: "chat.completion",
      created: Date.now(),
      model: "deepseek-chat",
      choices: [{
        index: 0,
        message: {
          role: "assistant",
          content: content
        },
        finish_reason: "stop"
      }],
      usage: {
        prompt_tokens: 100,
        completion_tokens: 200,
        total_tokens: 300
      }
    };
  }
}
