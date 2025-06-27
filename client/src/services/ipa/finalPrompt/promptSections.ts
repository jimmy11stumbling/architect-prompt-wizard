
export class PromptSections {
  static createExecutiveSummary(agentCount: number, totalAgents: number): string {
    return `## 📊 EXECUTIVE SUMMARY & PROJECT VISION

This comprehensive master blueprint represents the collective expertise of ${agentCount} specialized AI agents, each contributing deep domain knowledge to ensure your project's success. This document serves as your complete roadmap for building a production-ready, scalable application with cutting-edge AI integrations.

**Implementation Confidence Level:** ${Math.round((agentCount / totalAgents) * 100)}%
**Total Specialized Agent Contributions:** ${agentCount}/${totalAgents}
**Estimated Development Timeline:** 6-8 weeks for full implementation
**Target Architecture:** Modern, scalable, AI-enhanced full-stack application`;
  }

  static createProjectSpecification(requirementsOutput?: string): string {
    if (!requirementsOutput) return '';
    
    return `## 🎯 WHAT YOU'RE BUILDING: COMPLETE PROJECT SPECIFICATION

### 📋 Detailed Requirements Analysis & System Architecture
${requirementsOutput}

### 🏗️ System Architecture Overview
Based on the requirements analysis, your application will feature:

- **Frontend Architecture:** Modern, responsive web application with component-based design
- **Backend Architecture:** Scalable API-first architecture with microservices capabilities
- **Data Layer:** Optimized database design with caching strategies
- **AI Integration Layer:** Advanced RAG 2.0 and Agent-to-Agent communication systems
- **Security Layer:** Enterprise-grade authentication and authorization
- **Deployment Layer:** Cloud-native deployment with CI/CD automation

### 🎪 Core Features & Functionality Matrix
1. **User Management System**
   - Registration, authentication, and profile management
   - Role-based access control and permissions
   - User activity tracking and analytics

2. **Data Processing Engine**
   - Real-time data ingestion and processing
   - Advanced search and filtering capabilities
   - Data visualization and reporting tools

3. **AI-Powered Features**
   - Intelligent content recommendations
   - Automated data analysis and insights
   - Natural language processing capabilities

4. **Communication Systems**
   - Real-time messaging and notifications
   - Agent-to-Agent coordination protocols
   - Event-driven architecture for scalability`;
  }

  static createRoadmap(): string {
    return `## 🚀 DETAILED IMPLEMENTATION ROADMAP

### 📅 8-Week Development Timeline

#### **WEEK 1-2: PROJECT FOUNDATION**
**Backend Setup:**
- [ ] Initialize project with selected tech stack
- [ ] Configure development environment and tooling
- [ ] Set up database schema and migrations
- [ ] Implement authentication and authorization
- [ ] Create basic API endpoints and middleware
- [ ] Set up error handling and logging systems

**Frontend Setup:**
- [ ] Initialize React/Next.js project with TypeScript
- [ ] Configure styling system (Tailwind CSS + Shadcn UI)
- [ ] Set up routing and navigation structure
- [ ] Implement authentication UI components
- [ ] Create base component library
- [ ] Configure state management solution

#### **WEEK 3-4: CORE FEATURE DEVELOPMENT**
**Backend Development:**
- [ ] Implement core business logic and services
- [ ] Create advanced API endpoints with validation
- [ ] Set up data processing pipelines
- [ ] Implement caching strategies
- [ ] Add rate limiting and security measures
- [ ] Create comprehensive API documentation

**Frontend Development:**
- [ ] Build main application pages and workflows
- [ ] Implement user management interfaces
- [ ] Create data visualization components
- [ ] Add real-time communication features
- [ ] Implement search and filtering capabilities
- [ ] Add responsive design and mobile optimization

#### **WEEK 5-6: ADVANCED AI INTEGRATION**
**RAG 2.0 Implementation:**
- [ ] Set up vector database and embedding pipeline
- [ ] Implement document processing and chunking
- [ ] Create semantic search capabilities
- [ ] Add hybrid search (semantic + keyword)
- [ ] Implement retrieval ranking and optimization
- [ ] Add context compression and relevance scoring

#### **WEEK 7-8: TESTING, OPTIMIZATION & DEPLOYMENT**
**Comprehensive Testing:**
- [ ] Unit tests for all critical functions
- [ ] Integration tests for API endpoints
- [ ] End-to-end tests for user workflows
- [ ] Performance and load testing
- [ ] Security vulnerability testing
- [ ] Accessibility compliance testing`;
  }

  static createQualityFramework(): string {
    return `## ✅ QUALITY ASSURANCE & SECURITY FRAMEWORK

### 🔍 Quality Metrics & Standards
**Code Quality Targets:**
- Test Coverage: > 90%
- Code Complexity: Low to moderate
- Documentation Coverage: 100% for public APIs
- Security Vulnerabilities: Zero critical, minimal low-risk

**Performance Benchmarks:**
- Page Load Time: < 2 seconds
- API Response Time: < 500ms (95th percentile)
- Database Query Performance: < 100ms average
- Memory Usage: Optimized for production loads

### 🛡️ Security Implementation Checklist
- [ ] Input validation and sanitization for all user inputs
- [ ] SQL injection prevention with parameterized queries
- [ ] XSS protection with content security policies
- [ ] CSRF protection with token validation
- [ ] Authentication with secure session management
- [ ] Authorization with role-based access control
- [ ] Data encryption at rest and in transit
- [ ] Regular security audits and vulnerability assessments`;
  }

  static createConclusion(agentCount: number, totalAgents: number): string {
    return `## 🎉 CONCLUSION & NEXT STEPS

This master blueprint provides a comprehensive roadmap for building your AI-powered application with cutting-edge features and enterprise-grade quality. The guidance represents the collective expertise of ${agentCount} specialized AI agents, ensuring every aspect of your project is thoroughly planned and optimized.

### 🚀 Immediate Action Items
1. **Environment Setup:** Begin with development environment configuration
2. **Team Assembly:** Gather your development team and assign responsibilities
3. **Timeline Planning:** Adapt the 8-week timeline to your specific needs
4. **Technology Validation:** Ensure all selected technologies meet your requirements
5. **Stakeholder Alignment:** Review the blueprint with all project stakeholders

**Total Implementation Confidence:** ${Math.round((agentCount / totalAgents) * 100)}%
**Blueprint Completeness:** ${agentCount}/${totalAgents} expert domains covered

*Generated by Intelligent Prompt Architect (IPA) v2.0 - Your AI-Powered Development Partner*`;
  }
}
