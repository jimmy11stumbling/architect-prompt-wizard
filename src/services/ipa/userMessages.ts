
import { AgentName, ProjectSpec } from "@/types/ipa-types";

/**
 * Helper function to create a user message from project spec for each agent
 */
export const createUserMessageFromSpec = (agent: AgentName, spec: ProjectSpec): string => {
  const { projectDescription, frontendTechStack, backendTechStack, a2aIntegrationDetails, additionalFeatures, ragVectorDb, mcpType, advancedPromptDetails } = spec;
  
  const techStackInfo = `
Frontend Technologies: ${frontendTechStack.join(", ")}
Backend Technologies: ${backendTechStack.join(", ")}
Custom Frontend: ${spec.customFrontendTech?.join(", ") || "None"}
Custom Backend: ${spec.customBackendTech?.join(", ") || "None"}
  `.trim();
  
  const advancedTechInfo = `
RAG Vector Database: ${ragVectorDb}
Model Context Protocol: ${mcpType}
Deployment Platform: ${spec.deploymentPreference || "Not specified"}
Authentication Method: ${spec.authenticationMethod || "Not specified"}
Advanced Prompt Details: ${advancedPromptDetails || "None provided"}
  `.trim();
  
  switch(agent) {
    case "RequirementDecompositionAgent":
      return `
Please conduct a comprehensive analysis and decomposition of the following project:

# PROJECT OVERVIEW
${projectDescription}

# TECHNOLOGY STACK
${techStackInfo}

# A2A INTEGRATION REQUIREMENTS
${a2aIntegrationDetails || "No specific A2A requirements provided"}

# ADDITIONAL FEATURES & REQUIREMENTS
${additionalFeatures || "No additional features specified"}

# ADVANCED TECHNOLOGY SPECIFICATIONS
${advancedTechInfo}

# DELIVERABLES REQUIRED:
1. Detailed functional requirements breakdown with user stories
2. System architecture overview with component diagrams
3. Data models and database schema requirements
4. Integration points and external dependencies
5. Development phases with clear milestones
6. Risk assessment and mitigation strategies
7. Performance and scalability requirements
8. Security and compliance considerations

Please provide a comprehensive analysis that serves as the foundation for the entire development project.
      `.trim();
    
    case "RAGContextIntegrationAgent":
      return `
Design and specify a state-of-the-art RAG 2.0 system for the following project:

# PROJECT CONTEXT
${projectDescription}

# TECHNOLOGY ENVIRONMENT
${techStackInfo}

# RAG SPECIFICATIONS
Vector Database: ${ragVectorDb}
Integration Requirements: ${advancedPromptDetails || "Standard RAG implementation"}

# DELIVERABLES REQUIRED:
1. Vector database architecture and schema design
2. Embedding strategy and model recommendations
3. Document processing and chunking pipeline
4. Hybrid search implementation (semantic + keyword)
5. Retrieval optimization and reranking strategies
6. Context window management and relevance scoring
7. Caching and performance optimization
8. Integration patterns with the specified tech stack
9. Monitoring and evaluation metrics
10. Scalability and maintenance considerations

Focus on implementing cutting-edge RAG 2.0 techniques including:
- Advanced chunking strategies (semantic, hierarchical)
- Multi-modal embedding support
- Query expansion and rewriting
- Retrieval confidence scoring
- Dynamic context adaptation

Ensure seamless integration with: ${spec.frontendTechStack.join(", ")} (frontend) and ${spec.backendTechStack.join(", ")} (backend).
      `.trim();
    
    case "A2AProtocolExpertAgent":
      return `
Design a robust and scalable Agent-to-Agent communication system for:

# PROJECT CONTEXT
${projectDescription}

# TECHNOLOGY ENVIRONMENT
${techStackInfo}

# A2A COMMUNICATION REQUIREMENTS
${a2aIntegrationDetails || "Design a comprehensive A2A communication system"}

# MODEL CONTEXT PROTOCOL
Implementation Type: ${mcpType}
Advanced Requirements: ${advancedPromptDetails || "Standard implementation"}

# DELIVERABLES REQUIRED:
1. A2A protocol specification and message formats
2. Communication architecture (synchronous/asynchronous)
3. Service discovery and agent registry design
4. Message routing and load balancing strategies
5. Error handling, retry logic, and fault tolerance
6. Security implementation (authentication, encryption)
7. Monitoring, logging, and observability
8. Performance optimization and scalability patterns
9. Integration with MCP (${mcpType})
10. Testing and validation strategies

Design considerations:
- Multi-agent coordination patterns
- Event-driven architectures
- Microservices communication
- Real-time data synchronization
- Conflict resolution mechanisms
- Health checks and circuit breakers

Ensure compatibility with the specified tech stack and provide implementation examples.
      `.trim();
    
    case "TechStackImplementationAgent_Frontend":
      return `
Provide comprehensive frontend implementation specifications for:

# PROJECT CONTEXT
${projectDescription}

# FRONTEND TECHNOLOGY STACK
Technologies: ${spec.frontendTechStack.join(", ")}
Custom Technologies: ${spec.customFrontendTech?.join(", ") || "None"}
Authentication: ${spec.authenticationMethod || "JWT"}

# INTEGRATION REQUIREMENTS
A2A Communication: ${a2aIntegrationDetails || "Standard integration"}
MCP Integration: ${mcpType}
RAG Integration: ${ragVectorDb !== "None" ? `Vector search UI for ${ragVectorDb}` : "No RAG integration"}

# DELIVERABLES REQUIRED:
1. Application architecture and folder structure
2. Component design patterns and reusable components
3. State management implementation and patterns
4. Routing and navigation strategy
5. API integration patterns and data fetching
6. Real-time communication setup (WebSockets/SSE)
7. Authentication and authorization UI flows
8. Performance optimization strategies
9. Testing setup (unit, integration, e2e)
10. Build and deployment configuration
11. Accessibility and SEO considerations
12. Error handling and user feedback systems

Special focus areas:
- Integration with A2A communication protocols
- RAG search interface (if applicable)
- MCP tool integration UI
- Real-time agent status monitoring
- Responsive design and mobile optimization

Provide specific implementation details for each selected frontend technology.
      `.trim();
    
    case "TechStackImplementationAgent_Backend":
      return `
Provide comprehensive backend implementation specifications for:

# PROJECT CONTEXT
${projectDescription}

# BACKEND TECHNOLOGY STACK
Technologies: ${spec.backendTechStack.join(", ")}
Custom Technologies: ${spec.customBackendTech?.join(", ") || "None"}
Database Systems: Integrated with selected tech stack
Authentication: ${spec.authenticationMethod || "JWT"}

# INTEGRATION REQUIREMENTS
A2A Communication: ${a2aIntegrationDetails || "Standard integration"}
MCP Implementation: ${mcpType}
RAG Vector Database: ${ragVectorDb}
Deployment Platform: ${spec.deploymentPreference || "Vercel"}

# DELIVERABLES REQUIRED:
1. API architecture and endpoint design (REST/GraphQL)
2. Database schema and optimization strategies
3. Authentication and authorization implementation
4. A2A communication service implementation
5. MCP server setup and tool definitions
6. RAG pipeline integration (if applicable)
7. Caching strategies and performance optimization
8. Error handling and logging systems
9. Security implementations and best practices
10. Testing strategies and test setup
11. CI/CD pipeline configuration
12. Monitoring and observability setup
13. Scalability and load handling strategies

Special implementation requirements:
- Vector database integration and optimization
- Multi-agent communication patterns
- Real-time data synchronization
- Background job processing
- Rate limiting and security measures
- Health checks and service monitoring

${ragVectorDb !== "None" ? `
# RAG-SPECIFIC REQUIREMENTS:
- Implement robust ${ragVectorDb} integration
- Vector embedding and retrieval optimization
- Hybrid search capabilities
- Batch processing for large document sets
- Real-time indexing and updates
` : ""}

Provide specific implementation guidance for each selected backend technology with production-ready code patterns.
      `.trim();
    
    case "CursorOptimizationAgent":
      return `
Optimize the comprehensive development plan for maximum Cursor AI effectiveness:

# PROJECT CONTEXT
${projectDescription}

# COMPLETE TECHNOLOGY STACK
${techStackInfo}

# ADVANCED FEATURES
A2A Integration: ${a2aIntegrationDetails || "Standard implementation"}
MCP Type: ${mcpType}
RAG Database: ${ragVectorDb}
Advanced Requirements: ${advancedPromptDetails || "Standard implementation"}

# OPTIMIZATION OBJECTIVES:
1. Structure all instructions for optimal AI code generation
2. Provide clear, sequential implementation steps
3. Include specific code examples and patterns
4. Optimize for Cursor's autocomplete and suggestion features
5. Ensure proper file organization and naming conventions
6. Include comprehensive error handling patterns
7. Provide clear testing and validation instructions
8. Optimize for maintainable, production-ready code

# CURSOR-SPECIFIC OPTIMIZATIONS:
- Break complex tasks into smaller, focused functions
- Provide clear type definitions and interfaces
- Include detailed comments for AI context understanding
- Structure imports and exports clearly
- Use consistent naming conventions
- Provide specific file paths and organization
- Include configuration templates
- Add validation and error handling patterns

# DELIVERABLES:
1. Cursor-optimized project structure
2. Step-by-step implementation guide
3. Code templates and boilerplate
4. Configuration files and setup scripts
5. Testing and validation procedures
6. Documentation requirements
7. Common pitfall avoidance strategies
8. Performance optimization guidelines

Ensure all guidance is structured to maximize Cursor AI's code generation accuracy and efficiency.
      `.trim();
    
    case "QualityAssuranceAgent":
      return `
Conduct a comprehensive quality assurance review of the complete development plan:

# PROJECT UNDER REVIEW
${projectDescription}

# TECHNOLOGY STACK ASSESSMENT
${techStackInfo}

# ADVANCED FEATURES TO VALIDATE
A2A Integration: ${a2aIntegrationDetails || "Standard implementation"}
MCP Implementation: ${mcpType}
RAG System: ${ragVectorDb}
Advanced Requirements: ${advancedPromptDetails || "Standard implementation"}

# COMPREHENSIVE QA ASSESSMENT REQUIRED:
1. **Code Quality & Standards**
   - Architecture patterns and best practices
   - Code maintainability and readability
   - Documentation completeness
   - Naming conventions and organization

2. **Security Analysis**
   - Authentication and authorization security
   - Data encryption and protection
   - Input validation and sanitization
   - API security and rate limiting
   - Vulnerability assessment

3. **Performance & Scalability**
   - Database query optimization
   - Caching strategies effectiveness
   - Load handling capabilities
   - Resource utilization efficiency
   - Bottleneck identification

4. **Integration & Compatibility**
   - Technology stack compatibility
   - Third-party service integration
   - Cross-platform compatibility
   - Version compatibility issues

5. **Testing Coverage**
   - Unit testing completeness
   - Integration testing strategies
   - End-to-end testing coverage
   - Performance testing plans

6. **Deployment & Operations**
   - Deployment strategy robustness
   - Monitoring and logging adequacy
   - Error handling completeness
   - Backup and recovery procedures

7. **Compliance & Standards**
   - Industry best practices adherence
   - Accessibility compliance
   - Data privacy regulations (GDPR, etc.)
   - Security standards compliance

# DELIVERABLES:
1. Detailed quality assessment report
2. Risk analysis and mitigation strategies
3. Security recommendations and fixes
4. Performance optimization suggestions
5. Testing strategy enhancements
6. Compliance gap analysis
7. Implementation priority recommendations
8. Long-term maintenance considerations

Provide specific, actionable recommendations for each identified issue.
      `.trim();
    
    default:
      return `
Provide expert analysis and implementation guidance for:

# PROJECT CONTEXT
${projectDescription}

# TECHNOLOGY ENVIRONMENT
${techStackInfo}

# INTEGRATION REQUIREMENTS
A2A Communication: ${a2aIntegrationDetails || "Standard implementation"}
Additional Features: ${additionalFeatures || "None specified"}

# ADVANCED SPECIFICATIONS
${advancedTechInfo}

Please provide comprehensive, production-ready implementation guidance with specific focus on best practices, security, performance, and maintainability.
      `.trim();
  }
};
