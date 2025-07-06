
import { AgentName, ProjectSpec, DeepSeekCompletionResponse } from "@/types/ipa-types";

export class ResponseSimulator {
  static async simulateResponse(agent: AgentName, spec: ProjectSpec): Promise<DeepSeekCompletionResponse> {
    // Simulate API delay (reduced for testing)
    await new Promise(resolve => setTimeout(resolve, 500 + Math.random() * 1000));

    const simulatedResponses: Record<AgentName, string> = {
      "reasoning-assistant": `# Reasoning Assistant Analysis

## Project Overview
For ${spec.projectDescription}, I recommend implementing a sophisticated multi-step reasoning pipeline that ensures logical consistency and robust decision-making throughout the application lifecycle.

## Core Reasoning Framework
### 1. Logical Flow Validation
- Implement constraint satisfaction algorithms to validate user inputs and system states
- Use formal verification techniques for critical business logic
- Establish clear preconditions and postconditions for each operation

### 2. Error Handling Strategy
- Implement comprehensive error recovery mechanisms
- Design graceful degradation patterns for system failures
- Create detailed logging and monitoring for reasoning paths

### 3. Decision Tree Optimization
- Build intelligent decision trees for complex workflow branching
- Implement machine learning models for dynamic decision optimization
- Use A/B testing frameworks to validate reasoning effectiveness

## Technical Implementation
The reasoning system should integrate with ${spec.frontendTechStack.join(", ")} for user interface reasoning and ${spec.backendTechStack.join(", ")} for backend logic processing.

## Quality Assurance
Implement unit tests for all reasoning components, integration tests for decision paths, and end-to-end tests for complete reasoning workflows.`,
      
      "context-analyzer": `# Context Analysis Report

## Project Context Overview
**Project:** ${spec.projectDescription}
**Frontend Stack:** ${spec.frontendTechStack.join(", ")}
**Backend Stack:** ${spec.backendTechStack.join(", ")}

## Technical Architecture Context
### Frontend Integration Patterns
The selected frontend technologies require specific integration patterns:
- Component-based architecture with ${spec.frontendTechStack[0]}
- State management strategies for complex data flows
- Responsive design patterns for multiple device types

### Backend Integration Patterns
Backend systems using ${spec.backendTechStack.join(", ")} need:
- Microservices architecture for scalability
- API gateway patterns for service orchestration
- Database optimization strategies for performance

## User Workflow Context
### Critical User Journeys
1. **User Authentication Flow**: Secure login/logout with session management
2. **Core Feature Usage**: Primary application functionality workflows
3. **Data Management**: CRUD operations with proper validation
4. **Error Recovery**: User-friendly error handling and recovery paths

## System Interaction Context
### Data Flow Patterns
- Frontend-to-backend communication protocols
- Real-time updates and synchronization
- Caching strategies for improved performance
- Security considerations for data transmission

## Integration Requirements
The system must support seamless integration between all components while maintaining security, performance, and user experience standards.`,
      
      "documentation-expert": `# Documentation Strategy

## Comprehensive Documentation Framework
**Project:** ${spec.projectDescription}

## Technical Documentation Structure
### 1. API Documentation
- OpenAPI/Swagger specifications for all endpoints
- Interactive API documentation with examples
- Authentication and authorization guides
- Rate limiting and usage policies

### 2. Component Library Documentation
- React component documentation with Storybook
- Props and state management guidelines
- Styling and theming documentation
- Accessibility compliance notes

### 3. Deployment Guides
- Environment setup instructions
- Docker containerization guides
- CI/CD pipeline documentation
- Monitoring and logging setup

### 4. User Manuals
- End-user feature guides
- Administrator documentation
- Troubleshooting and FAQ sections
- Video tutorials and walkthroughs

## Documentation Tools and Platforms
### Version Control Integration
- Git-based documentation with markdown
- Automated documentation generation
- Version synchronization with code releases
- Branch-specific documentation updates

### Interactive Documentation
- Live code examples and demos
- Interactive API explorers
- Embedded video content
- Searchable documentation portal

## Maintenance Strategy
- Regular documentation reviews and updates
- User feedback integration process
- Documentation quality metrics
- Automated broken link detection

## Implementation Plan
1. **Phase 1**: Core API and component documentation
2. **Phase 2**: User guides and tutorials
3. **Phase 3**: Advanced features and troubleshooting
4. **Phase 4**: Interactive elements and multimedia content`,
      
      "workflow-coordinator": `# Workflow Design and Coordination

## Orchestrated Workflow Architecture
**Project:** ${spec.projectDescription}

## Core Workflow Patterns
### 1. Sequential Workflows
- Step-by-step processing with clear dependencies
- Checkpoints and validation at each stage
- Progress tracking and user feedback
- Rollback mechanisms for failed steps

### 2. Parallel Workflows
- Concurrent processing for independent operations
- Load balancing and resource optimization
- Synchronization points for data consistency
- Error isolation and recovery strategies

### 3. Event-Driven Workflows
- Real-time event processing and routing
- Message queuing for reliable delivery
- Event sourcing for audit trails
- Subscription management for notifications

## Error Handling and Recovery
### Comprehensive Error Management
- Graceful degradation patterns for partial failures
- Automatic retry mechanisms with exponential backoff
- Circuit breaker patterns for external service failures
- Dead letter queues for failed message processing

### Monitoring and Observability
- Real-time workflow monitoring dashboards
- Performance metrics and SLA tracking
- Alert systems for critical workflow failures
- Distributed tracing for complex workflows

## Implementation Strategy
### Technology Integration
- ${spec.frontendTechStack.join(", ")} for user interface workflows
- ${spec.backendTechStack.join(", ")} for backend processing
- Message brokers for asynchronous communication
- Database transactions for data consistency

### Scalability Considerations
- Horizontal scaling for high-throughput workflows
- Caching strategies for frequently accessed data
- Resource pooling for optimal performance
- Auto-scaling based on workflow demand

## Quality Assurance
Implement comprehensive testing including unit tests for individual workflow steps, integration tests for end-to-end workflows, and load testing for scalability validation.`,
      
      "reasoning-coordinator": `# Reasoning Coordination Framework

## Intelligent Decision Orchestration
**Project:** ${spec.projectDescription}

## Decision Architecture
### 1. Hierarchical Decision Trees
- Multi-level decision processing with clear priority systems
- Context-aware decision making based on user state and system conditions
- Dynamic decision path optimization using machine learning algorithms
- Fallback decision strategies for edge cases and system failures

### 2. Validation Checkpoints
- Pre-decision validation of input parameters and system state
- Real-time constraint checking during decision processes
- Post-decision validation to ensure outcome consistency
- Audit logging for all decision points and outcomes

### 3. Logical Flow Controls
- Conditional branching based on business rules and user preferences
- Loop detection and prevention mechanisms
- Timeout handling for long-running decision processes
- Resource allocation and deallocation for decision computations

## Coordination Mechanisms
### Inter-Component Communication
- Message passing protocols for decision coordination
- Event-driven decision triggers and responses
- State synchronization across distributed decision components
- Conflict resolution strategies for concurrent decisions

### Performance Optimization
- Decision caching for frequently requested outcomes
- Parallel decision processing for independent choices
- Resource pooling for decision computation engines
- Load balancing for high-volume decision scenarios

## Implementation Details
### Technology Stack Integration
- ${spec.frontendTechStack.join(", ")} for user interface decision flows
- ${spec.backendTechStack.join(", ")} for server-side decision processing
- Database systems for decision history and pattern storage
- Analytics engines for decision effectiveness measurement

### Quality Assurance Strategy
- Unit testing for individual decision components
- Integration testing for multi-step decision workflows
- A/B testing for decision effectiveness validation
- Performance testing for decision latency and throughput`,
      
      "RequirementDecompositionAgent": `# Requirements Analysis and Decomposition

## Project Requirements Overview
**Project:** ${spec.projectDescription}

## Core System Requirements
### 1. User Authentication System
- Multi-factor authentication with industry-standard protocols
- Role-based access control (RBAC) with granular permissions
- Session management with secure token handling
- Password policy enforcement and account lockout mechanisms
- OAuth integration for third-party authentication providers

### 2. Data Management Architecture
- Robust data modeling with proper entity relationships
- CRUD operations with comprehensive validation
- Data migration strategies for schema evolution
- Backup and recovery mechanisms for data protection
- Data privacy compliance (GDPR, CCPA) implementation

### 3. API Integration Framework
- RESTful API design with proper HTTP semantics
- GraphQL implementation for flexible data querying
- API versioning strategies for backward compatibility
- Rate limiting and throttling for API protection
- Comprehensive API documentation and testing tools

### 4. UI/UX Implementation
- Responsive design for multi-device compatibility
- Accessibility compliance (WCAG 2.1) for inclusive design
- Interactive user interfaces with smooth animations
- Component library with consistent design patterns
- User feedback mechanisms and error handling

## Technical Architecture Requirements
### Frontend Requirements
- ${spec.frontendTechStack.join(", ")} implementation with modern practices
- State management with predictable data flow
- Component testing with comprehensive coverage
- Performance optimization for fast loading times
- Progressive Web App (PWA) capabilities

### Backend Requirements
- ${spec.backendTechStack.join(", ")} with scalable architecture
- Microservices design for independent deployability
- Database optimization for query performance
- Caching strategies for improved response times
- Security implementations for data protection

## Quality Assurance Standards
Each component must be independently testable and deployable with comprehensive test coverage, automated testing pipelines, and continuous integration practices.`,
      
      "RAGContextIntegrationAgent": `# RAG 2.0 Integration Strategy

## Vector Database Implementation
**Selected Database:** ${spec.ragVectorDb}
**Project:** ${spec.projectDescription}

## Advanced RAG Architecture
### 1. Semantic Chunking Strategy
- Intelligent document segmentation based on semantic boundaries
- Context-aware chunking that preserves meaning and relationships
- Sliding window approaches for overlapping context preservation
- Metadata extraction and enrichment for enhanced retrieval

### 2. Hybrid Search Capabilities
- Dense vector search using state-of-the-art embedding models
- Sparse keyword search for precise term matching
- Hybrid scoring algorithms that combine semantic and lexical relevance
- Query expansion techniques for improved recall

### 3. Reranking and Context Compression
- Multi-stage retrieval pipeline with intelligent reranking
- Context compression algorithms to fit within token limits
- Relevance scoring with machine learning models
- Dynamic context selection based on query complexity

## Implementation with ${spec.ragVectorDb}
### Vector Storage Optimization
- Efficient indexing strategies for fast retrieval
- Sharding and partitioning for scalable storage
- Backup and recovery mechanisms for vector data
- Performance monitoring and optimization tools

### Query Processing Pipeline
- Query preprocessing and normalization
- Embedding generation with consistent models
- Similarity search with optimized algorithms
- Result postprocessing and ranking

## Integration Architecture
### Frontend Integration
- ${spec.frontendTechStack.join(", ")} components for search interfaces
- Real-time search with progressive result loading
- User feedback collection for relevance improvement
- Search analytics and usage tracking

### Backend Integration
- ${spec.backendTechStack.join(", ")} APIs for RAG functionality
- Asynchronous processing for large document collections
- Caching strategies for frequently accessed content
- Rate limiting and resource management

## Quality Assurance
Comprehensive testing including retrieval accuracy metrics, performance benchmarks, and user experience validation.`,
      
      "A2AProtocolExpertAgent": `# Agent-to-Agent Communication Protocol

## A2A Architecture Framework
**Project:** ${spec.projectDescription}

## Protocol Design Principles
### 1. Agent Discovery and Registration
- Service discovery mechanisms for dynamic agent registration
- Agent capability advertisement and metadata sharing
- Health check protocols for agent availability monitoring
- Load balancing strategies for distributed agent systems

### 2. Message Routing and Delivery
- Intelligent message routing based on agent capabilities
- Priority-based message queuing for critical communications
- Reliable delivery mechanisms with acknowledgment protocols
- Message serialization and deserialization strategies

### 3. Coordination Protocols
- Consensus algorithms for distributed decision making
- Workflow coordination with task delegation patterns
- Resource sharing and allocation mechanisms
- Conflict resolution strategies for competing requests

## Communication Patterns
### Synchronous Communication
- Request-response patterns for immediate feedback
- RPC-style communication for remote procedure calls
- Connection pooling for efficient resource usage
- Timeout handling and retry mechanisms

### Asynchronous Communication
- Event-driven communication for decoupled systems
- Message queuing for reliable async processing
- Publish-subscribe patterns for broadcast communication
- Event sourcing for audit trails and replay capability

## Implementation Strategy
### Technology Integration
- ${spec.frontendTechStack.join(", ")} for agent interface components
- ${spec.backendTechStack.join(", ")} for agent runtime environments
- Message brokers for inter-agent communication
- Monitoring systems for agent performance tracking

### Security and Reliability
- Authentication and authorization for agent communications
- Encryption for sensitive agent data transmission
- Circuit breaker patterns for fault tolerance
- Distributed tracing for communication debugging

## Quality Assurance
Standardized communication patterns ensure reliable multi-agent interaction with comprehensive testing including unit tests for individual agents, integration tests for multi-agent workflows, and load testing for scalability validation.`,
      
      "TechStackImplementationAgent_Frontend": `# Frontend Architecture Implementation

## Technology Stack: ${spec.frontendTechStack.join(", ")}
**Project:** ${spec.projectDescription}

## Component-Based Architecture
### 1. Component Design Patterns
- Atomic design methodology with atoms, molecules, and organisms
- Reusable component library with consistent interfaces
- Props validation and TypeScript integration
- Component composition patterns for flexible layouts

### 2. State Management Strategy
- Centralized state management with Redux/Zustand
- Local component state for UI-specific data
- State normalization for complex data structures
- State persistence and hydration mechanisms

### 3. Responsive Design Implementation
- Mobile-first design approach with breakpoint strategies
- Flexible grid systems and responsive typography
- Touch-friendly interactions and gesture support
- Performance optimization for mobile devices

## Advanced Frontend Features
### Performance Optimization
- Code splitting and lazy loading for reduced bundle size
- Image optimization and progressive loading
- Caching strategies for static assets and API responses
- Service worker implementation for offline capabilities

### User Experience Enhancement
- Smooth animations and transitions using Framer Motion
- Loading states and skeleton screens for better perceived performance
- Error boundaries and graceful error handling
- Accessibility features including keyboard navigation and screen reader support

## Development Workflow
### Build and Deployment
- Webpack/Vite configuration for optimal builds
- Hot module replacement for efficient development
- Environment-specific configurations
- Continuous integration and deployment pipelines

### Testing Strategy
- Unit testing with Jest and React Testing Library
- Component testing with Storybook
- End-to-end testing with Cypress/Playwright
- Visual regression testing for UI consistency

## Integration Points
### Backend Communication
- RESTful API integration with proper error handling
- GraphQL implementation for flexible data fetching
- WebSocket connections for real-time features
- Authentication token management and refresh mechanisms

### Third-Party Services
- Analytics integration for user behavior tracking
- Payment processing integration
- Social media authentication
- Content delivery network (CDN) integration

## Quality Standards
Implementation follows modern ${spec.frontendTechStack.join(", ")} best practices with comprehensive testing coverage and performance optimization.`,
      
      "TechStackImplementationAgent_Backend": `# Backend Architecture Implementation

## Technology Stack: ${spec.backendTechStack.join(", ")}
**Project:** ${spec.projectDescription}

## Microservices Architecture
### 1. Service Decomposition Strategy
- Domain-driven design for service boundaries
- Independent deployability with containerization
- Service communication patterns (REST, gRPC, message queues)
- Data consistency strategies across services

### 2. API Gateway Implementation
- Centralized API management and routing
- Authentication and authorization handling
- Rate limiting and traffic management
- API versioning and backward compatibility

### 3. Data Persistence Strategies
- Database per service pattern for data isolation
- Event sourcing for audit trails and replay capability
- CQRS (Command Query Responsibility Segregation) for scalability
- Database migration strategies and version control

## Scalability and Performance
### Horizontal Scaling
- Load balancing strategies for distributed services
- Auto-scaling based on metrics and demand
- Resource optimization and capacity planning
- Caching layers for improved performance

### Monitoring and Observability
- Distributed tracing for request flow visibility
- Metrics collection and alerting systems
- Log aggregation and analysis tools
- Health check endpoints for service monitoring

## Implementation Details
### ${spec.backendTechStack.join(", ")} Integration
- Framework-specific best practices and patterns
- Database ORM/ODM integration and optimization
- Middleware implementation for cross-cutting concerns
- Security implementations including input validation and sanitization

### DevOps and Deployment
- Docker containerization for consistent environments
- Kubernetes orchestration for production deployments
- CI/CD pipelines for automated testing and deployment
- Infrastructure as code for reproducible environments

## Security Implementation
### Authentication and Authorization
- JWT token-based authentication with refresh mechanisms
- Role-based access control (RBAC) with granular permissions
- OAuth 2.0 and OpenID Connect integration
- Multi-factor authentication support

### Data Protection
- Encryption at rest and in transit
- Input validation and sanitization
- SQL injection and XSS prevention
- GDPR and privacy compliance measures

## Quality Assurance
Comprehensive testing strategy including unit tests, integration tests, and performance testing to ensure reliability and scalability of the ${spec.backendTechStack.join(", ")} implementation.`,
      
      "CursorOptimizationAgent": `# Cursor IDE Optimization Guide

## Intelligent Development Environment Setup
**Project:** ${spec.projectDescription}

## Code Completion and AI Integration
### 1. Advanced Code Completion
- Context-aware suggestions based on project patterns
- Multi-language support with syntax highlighting
- Intelligent import suggestions and auto-imports
- Code snippet management and custom templates

### 2. AI-Powered Development
- Natural language to code generation
- Code explanation and documentation generation
- Refactoring suggestions and automated improvements
- Bug detection and fix recommendations

### 3. Custom Rules and Linting
- Project-specific ESLint and Prettier configurations
- Custom code style rules and formatting preferences
- TypeScript strict mode configuration
- Performance optimization suggestions

## Workflow Automation
### Development Shortcuts
- Custom keyboard shortcuts for frequently used commands
- Code generation templates for common patterns
- Automated file creation and boilerplate generation
- Git integration with intelligent commit suggestions

### Project-Specific Templates
- Component templates for ${spec.frontendTechStack.join(", ")}
- API endpoint templates for ${spec.backendTechStack.join(", ")}
- Test file templates with proper structure
- Documentation templates for consistent formatting

## Integration Features
### Version Control Integration
- Intelligent Git workflows with conflict resolution
- Branch management and merge strategies
- Code review tools and collaboration features
- Commit history analysis and insights

### Debugging and Testing
- Integrated debugging with breakpoint management
- Test runner integration with real-time feedback
- Performance profiling and optimization tools
- Error tracking and resolution suggestions

## Productivity Enhancements
### Code Navigation
- Intelligent file search and navigation
- Symbol search across the entire codebase
- Dependency graph visualization
- Code relationship mapping

### Collaboration Tools
- Real-time code sharing and pair programming
- Comment and review systems
- Team settings synchronization
- Project documentation integration

## Configuration Management
### Environment Setup
- Development environment configuration
- Package manager integration and optimization
- Build tool configuration and optimization
- Deployment pipeline integration

### Performance Optimization
- Editor performance tuning for large codebases
- Memory usage optimization
- Startup time improvement
- Extension management for optimal performance

## Quality Assurance Integration
Configure comprehensive testing, linting, and formatting tools to maintain code quality and consistency throughout the development process.`,
      
      "QualityAssuranceAgent": `# Comprehensive Quality Assurance Strategy

## Testing Framework Architecture
**Project:** ${spec.projectDescription}

## Multi-Layer Testing Strategy
### 1. Unit Testing
- Component-level testing with high coverage requirements (>90%)
- Function isolation and mocking strategies
- Test-driven development (TDD) practices
- Snapshot testing for UI consistency

### 2. Integration Testing
- API endpoint testing with comprehensive scenarios
- Database integration testing with test data management
- Service integration testing with mock external dependencies
- Frontend-backend integration validation

### 3. End-to-End Testing
- User journey testing with realistic scenarios
- Cross-browser compatibility testing
- Mobile responsiveness validation
- Performance testing under various load conditions

## Automated Testing Pipeline
### Continuous Integration
- Automated test execution on every commit
- Parallel test execution for faster feedback
- Test result reporting and failure analysis
- Code coverage tracking and enforcement

### Quality Gates
- Mandatory code review processes
- Automated code quality checks (SonarQube, CodeClimate)
- Security vulnerability scanning
- Performance regression detection

## Code Quality Metrics
### Static Analysis
- ESLint/TSLint configuration for ${spec.frontendTechStack.join(", ")}
- Backend linting for ${spec.backendTechStack.join(", ")}
- Code complexity analysis and refactoring suggestions
- Dependency vulnerability scanning

### Performance Monitoring
- Application performance monitoring (APM) tools
- Real user monitoring (RUM) implementation
- Database query performance analysis
- Memory usage and leak detection

## Testing Tools and Frameworks
### Frontend Testing
- Jest and React Testing Library for component testing
- Cypress or Playwright for end-to-end testing
- Storybook for component development and testing
- Visual regression testing with Percy or Chromatic

### Backend Testing
- Framework-specific testing tools for ${spec.backendTechStack.join(", ")}
- Database testing with test containers
- API testing with Postman/Newman or similar tools
- Load testing with k6 or Artillery

## Deployment and Release Quality
### Staging Environment
- Production-like staging environment setup
- Smoke testing in staging before production release
- User acceptance testing (UAT) processes
- Rollback procedures and disaster recovery testing

### Production Monitoring
- Real-time error tracking and alerting
- Performance monitoring and optimization
- User feedback collection and analysis
- A/B testing for feature validation

## Documentation and Reporting
### Test Documentation
- Test plan creation and maintenance
- Test case documentation with clear steps
- Bug report templates and tracking
- Quality metrics dashboards and reporting

## Compliance and Security
- Security testing including penetration testing
- GDPR and privacy compliance validation
- Accessibility testing for WCAG compliance
- Regulatory compliance testing where applicable

Use automated CI/CD pipelines and comprehensive quality metrics to ensure consistent, high-quality deliverables throughout the development lifecycle.`
    };

    const content = simulatedResponses[agent] || `Simulated response for ${agent} regarding ${spec.projectDescription}`;

    return {
      id: `sim-${Date.now()}`,
      object: "chat.completion",
      created: Math.floor(Date.now() / 1000),
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
