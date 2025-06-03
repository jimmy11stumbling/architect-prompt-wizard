
import { AgentName, ProjectSpec, DeepSeekCompletionResponse } from "@/types/ipa-types";

export class ResponseSimulator {
  static async simulateResponse(agent: AgentName, spec: ProjectSpec): Promise<DeepSeekCompletionResponse> {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1000 + Math.random() * 2000));
    
    const responses: Record<AgentName, string> = {
      RequirementDecompositionAgent: `# 📋 Comprehensive Requirements Analysis & System Architecture

## 🎯 Project Overview & Vision
**Project Name:** ${spec.projectDescription}
**Architecture Pattern:** Modern full-stack application with microservices capabilities
**Target Scale:** Enterprise-ready with horizontal scaling support

## 🏗️ System Architecture Blueprint

### Frontend Architecture
- **Framework:** ${spec.frontendTechStack.join(", ")} with TypeScript
- **State Management:** Context API with React Query for server state
- **Styling:** Tailwind CSS with component-based design system
- **Build Tool:** Vite for fast development and optimized builds
- **Testing:** Jest + React Testing Library for unit tests

### Backend Architecture  
- **Framework:** ${spec.backendTechStack.join(", ")} with TypeScript
- **Database:** Primary: ${spec.backendTechStack.find(tech => tech.includes('SQL') || tech.includes('Mongo')) || 'PostgreSQL'}, Cache: Redis
- **Authentication:** JWT-based with refresh token rotation
- **API Design:** RESTful with GraphQL endpoints for complex queries
- **Documentation:** OpenAPI/Swagger specifications

### Infrastructure & DevOps
- **Containerization:** Docker with multi-stage builds
- **Orchestration:** Kubernetes for production deployments
- **CI/CD:** GitHub Actions with automated testing and deployment
- **Monitoring:** Application performance monitoring with structured logging
- **Security:** OWASP compliance with regular security audits

## 📊 Core Feature Requirements

### User Management System
1. **Authentication & Authorization**
   - Email/password registration with email verification
   - Social login integration (Google, GitHub)
   - Role-based access control (RBAC)
   - Multi-factor authentication (MFA)
   - Password reset with secure token validation

2. **User Profile Management**
   - Comprehensive user profiles with customizable fields
   - Avatar upload with image optimization
   - Privacy settings and data export functionality
   - Activity tracking and audit logs

### Data Processing Engine
1. **Real-time Data Handling**
   - WebSocket connections for live updates
   - Event-driven architecture with message queues
   - Data validation and sanitization pipelines
   - Bulk data import/export capabilities

2. **Search & Analytics**
   - Full-text search with autocomplete
   - Advanced filtering and sorting options
   - Real-time analytics dashboard
   - Data visualization with interactive charts

### AI-Powered Features Integration
1. **Intelligent Recommendations**
   - Machine learning-based content suggestions
   - User behavior analysis and personalization
   - A/B testing framework for optimization

2. **Natural Language Processing**
   - Content analysis and categorization
   - Sentiment analysis for user feedback
   - Automated content moderation

## 🔧 Technical Requirements

### Performance Requirements
- **Page Load Time:** < 2 seconds for 95th percentile
- **API Response Time:** < 500ms for standard operations
- **Database Query Performance:** < 100ms for indexed queries
- **Concurrent Users:** Support for 10,000+ simultaneous users
- **Uptime:** 99.9% availability with automated failover

### Security Requirements
- **Data Encryption:** AES-256 at rest, TLS 1.3 in transit
- **Input Validation:** Comprehensive sanitization for all user inputs
- **Rate Limiting:** API throttling to prevent abuse
- **Audit Logging:** Complete audit trail for sensitive operations
- **Compliance:** GDPR, CCPA, and SOC 2 Type II compliance

### Scalability Requirements
- **Horizontal Scaling:** Auto-scaling based on load metrics
- **Database Sharding:** Prepared for data partitioning
- **CDN Integration:** Global content delivery for static assets
- **Caching Strategy:** Multi-level caching (browser, CDN, application, database)

## 📋 Development Methodology

### Agile Development Process
- **Sprint Planning:** 2-week sprints with clear deliverables
- **Code Reviews:** Mandatory peer reviews for all changes
- **Testing Strategy:** TDD with 90%+ code coverage requirement
- **Documentation:** Living documentation with automated updates

### Quality Assurance
- **Automated Testing:** Unit, integration, and end-to-end tests
- **Performance Testing:** Load testing with realistic user scenarios
- **Security Testing:** Regular penetration testing and vulnerability scans
- **User Acceptance Testing:** Staged rollouts with user feedback loops

This comprehensive requirements analysis provides the foundation for building a robust, scalable, and secure application that meets enterprise standards while maintaining excellent user experience.`,

      RAGContextIntegrationAgent: `# 🔍 Advanced RAG 2.0 Integration Strategy

## 🎯 RAG System Architecture Overview
**Vector Database:** ${spec.ragVectorDb || 'Pinecone'} with hybrid search capabilities
**Embedding Model:** OpenAI text-embedding-3-large with 3072 dimensions
**Chunk Strategy:** Semantic chunking with 512-token optimal size
**Retrieval Method:** Hybrid dense + sparse retrieval with reranking

## 🏗️ RAG 2.0 Implementation Blueprint

### Vector Database Configuration
\`\`\`typescript
// Vector store configuration for ${spec.ragVectorDb || 'Pinecone'}
interface VectorConfig {
  dimensions: 3072,
  metric: 'cosine',
  pods: 1,
  replicas: 1,
  podType: 'p1.x1',
  metadataConfig: {
    indexed: ['source', 'timestamp', 'category', 'author']
  }
}
\`\`\`

### Document Processing Pipeline
1. **Ingestion Layer**
   - Multi-format document support (PDF, DOCX, TXT, MD, HTML)
   - OCR integration for image-based documents
   - Real-time document monitoring and auto-indexing
   - Batch processing for large document collections

2. **Preprocessing Pipeline**
   - Document structure analysis and metadata extraction
   - Content cleaning and normalization
   - Language detection and handling
   - Duplicate detection and deduplication

3. **Chunking Strategy**
   - Semantic chunking based on document structure
   - Overlapping windows for context preservation
   - Dynamic chunk sizing based on content type
   - Metadata preservation across chunks

### Advanced Retrieval Mechanisms

#### Hybrid Search Implementation
\`\`\`typescript
class HybridRetriever {
  async retrieve(query: string, topK: number = 10) {
    // Dense vector search
    const denseResults = await this.vectorSearch(query, topK * 2);
    
    // Sparse keyword search (BM25)
    const sparseResults = await this.keywordSearch(query, topK * 2);
    
    // Fusion and reranking
    const fusedResults = this.reciprocalRankFusion(denseResults, sparseResults);
    
    // Cross-encoder reranking
    const rerankedResults = await this.rerank(query, fusedResults);
    
    return rerankedResults.slice(0, topK);
  }
}
\`\`\`

#### Query Enhancement Techniques
1. **Query Expansion**
   - Synonym expansion using WordNet and custom dictionaries
   - Related term injection based on domain knowledge
   - User intent classification and query rewriting

2. **Multi-Query Generation**
   - Automatic generation of query variations
   - Parallel retrieval and result fusion
   - Confidence scoring for result ranking

3. **Hypothetical Document Embedding (HyDE)**
   - LLM-generated hypothetical answers for better matching
   - Answer-to-document similarity search
   - Improved retrieval for complex queries

### Context Management & Generation

#### Advanced Context Assembly
\`\`\`typescript
class ContextManager {
  async assembleContext(query: string, retrievedDocs: Document[]) {
    // Document relevance scoring
    const scoredDocs = await this.scoreRelevance(query, retrievedDocs);
    
    // Context compression for token efficiency
    const compressedContext = await this.compressContext(scoredDocs);
    
    // Multi-document synthesis
    const synthesizedContext = await this.synthesizeContext(compressedContext);
    
    return {
      context: synthesizedContext,
      sources: scoredDocs.map(doc => doc.metadata),
      confidence: this.calculateConfidence(scoredDocs)
    };
  }
}
\`\`\`

#### Context Quality Assurance
1. **Relevance Filtering**
   - Semantic relevance scoring with configurable thresholds
   - Content quality assessment using trained models
   - Fact-checking and consistency validation

2. **Source Attribution**
   - Complete citation tracking with document lineage
   - Source credibility scoring and ranking
   - Conflict detection between multiple sources

## 🚀 Performance Optimization

### Caching Strategy
1. **Multi-Level Caching**
   - Query result caching with TTL policies
   - Embedding caching for frequently accessed content
   - Precomputed similarity matrices for hot topics

2. **Cache Invalidation**
   - Smart cache invalidation on document updates
   - Distributed cache synchronization
   - Cache warming for popular queries

### Monitoring & Analytics
\`\`\`typescript
interface RAGMetrics {
  retrievalLatency: number;
  retrievalAccuracy: number;
  contextRelevance: number;
  userSatisfaction: number;
  cacheHitRate: number;
  queryVolume: number;
}
\`\`\`

## 🔐 Security & Privacy

### Data Protection
- End-to-end encryption for sensitive documents
- Field-level encryption for PII data
- Access control with document-level permissions
- Audit logging for all data access operations

### Privacy Compliance
- GDPR-compliant data processing and deletion
- Anonymization techniques for analytics
- Consent management for data usage
- Right-to-be-forgotten implementation

## 🧪 Testing & Validation

### RAG Evaluation Framework
1. **Retrieval Quality Metrics**
   - Precision@K and Recall@K measurements
   - Mean Reciprocal Rank (MRR) evaluation
   - Normalized Discounted Cumulative Gain (NDCG)

2. **Generation Quality Assessment**
   - Faithfulness scoring against source documents
   - Relevance assessment using LLM-as-judge
   - Hallucination detection and prevention

3. **End-to-End Performance Testing**
   - Query response time benchmarking
   - Throughput testing under load
   - Accuracy validation with human evaluators

This comprehensive RAG 2.0 implementation provides enterprise-grade knowledge retrieval capabilities with advanced semantic search, intelligent context management, and robust performance optimization.`,

      A2AProtocolExpertAgent: `# 🤝 Advanced Agent-to-Agent Communication Protocol Design

## 🌐 A2A Architecture Overview
**Protocol Standard:** Google A2A with MCP integration
**Communication Pattern:** Event-driven microservices with message queuing
**Discovery Mechanism:** Dynamic service registry with health monitoring
**Security Model:** OAuth 2.0 with JWT tokens and end-to-end encryption

## 🏗️ A2A Communication Infrastructure

### Agent Registry & Discovery
\`\`\`typescript
interface AgentCard {
  agentId: string;
  name: string;
  version: string;
  capabilities: string[];
  endpoints: {
    primary: string;
    health: string;
    metrics: string;
  };
  authentication: {
    method: 'oauth2' | 'api-key' | 'mutual-tls';
    scopes: string[];
  };
  metadata: {
    description: string;
    maintainer: string;
    tags: string[];
  };
}
\`\`\`

### Message Protocol Design
\`\`\`typescript
interface A2AMessage {
  messageId: string;
  conversationId: string;
  timestamp: string;
  sender: AgentIdentity;
  receiver: AgentIdentity;
  messageType: 'request' | 'response' | 'notification' | 'error';
  payload: {
    action: string;
    parameters: Record<string, any>;
    context?: Record<string, any>;
  };
  metadata: {
    priority: 'low' | 'medium' | 'high' | 'critical';
    ttl?: number;
    retryPolicy?: RetryConfig;
  };
}
\`\`\`

## 🔄 Communication Patterns

### 1. Request-Response Pattern
\`\`\`typescript
class RequestResponseAgent {
  async sendRequest(targetAgent: string, action: string, params: any) {
    const message: A2AMessage = {
      messageId: generateId(),
      conversationId: this.activeConversation,
      sender: this.identity,
      receiver: { agentId: targetAgent },
      messageType: 'request',
      payload: { action, parameters: params }
    };
    
    return await this.messageRouter.send(message);
  }
  
  async handleResponse(response: A2AMessage) {
    // Process response and update conversation state
    await this.conversationManager.updateState(response);
    return this.processBusinessLogic(response.payload);
  }
}
\`\`\`

### 2. Event-Driven Notifications
\`\`\`typescript
class EventDrivenAgent {
  private eventBus: EventBus;
  
  async publishEvent(eventType: string, eventData: any) {
    const notification: A2AMessage = {
      messageType: 'notification',
      payload: {
        action: 'event_notification',
        parameters: { eventType, data: eventData }
      }
    };
    
    await this.eventBus.publish(eventType, notification);
  }
  
  subscribeToEvents(eventTypes: string[], handler: EventHandler) {
    eventTypes.forEach(type => {
      this.eventBus.subscribe(type, handler);
    });
  }
}
\`\`\`

### 3. Workflow Orchestration
\`\`\`typescript
class WorkflowOrchestrator {
  async executeWorkflow(workflowDefinition: WorkflowSpec) {
    const execution = new WorkflowExecution(workflowDefinition);
    
    for (const step of workflowDefinition.steps) {
      const agent = await this.registry.findAgent(step.agentType);
      const result = await this.delegateTask(agent, step.task);
      
      execution.recordStepResult(step.id, result);
      
      if (result.status === 'failed' && step.retryPolicy) {
        await this.retryStep(step, result);
      }
    }
    
    return execution.getResults();
  }
}
\`\`\`

## 🛡️ Security & Authentication

### OAuth 2.0 Implementation
\`\`\`typescript
class A2ASecurityManager {
  async authenticateAgent(agentCard: AgentCard): Promise<AuthToken> {
    const authRequest = {
      client_id: agentCard.agentId,
      client_secret: this.getAgentSecret(agentCard.agentId),
      grant_type: 'client_credentials',
      scope: agentCard.authentication.scopes.join(' ')
    };
    
    const tokenResponse = await this.oauthProvider.requestToken(authRequest);
    return new AuthToken(tokenResponse.access_token, tokenResponse.expires_in);
  }
  
  async validateMessage(message: A2AMessage, token: AuthToken): Promise<boolean> {
    // Verify token validity and agent permissions
    const isValidToken = await this.oauthProvider.verifyToken(token);
    const hasPermission = await this.checkPermissions(message.sender, message.payload.action);
    
    return isValidToken && hasPermission;
  }
}
\`\`\`

### Message Encryption
\`\`\`typescript
class MessageEncryption {
  async encryptMessage(message: A2AMessage, recipientPublicKey: string): Promise<EncryptedMessage> {
    const sessionKey = crypto.randomBytes(32);
    const encryptedPayload = await this.aesEncrypt(JSON.stringify(message.payload), sessionKey);
    const encryptedSessionKey = await this.rsaEncrypt(sessionKey, recipientPublicKey);
    
    return {
      messageId: message.messageId,
      encryptedPayload,
      encryptedSessionKey,
      algorithm: 'AES-256-GCM',
      keyAlgorithm: 'RSA-OAEP'
    };
  }
}
\`\`\`

## 📊 Monitoring & Observability

### Performance Metrics
\`\`\`typescript
interface A2AMetrics {
  messagesThroughput: number;
  averageLatency: number;
  errorRate: number;
  agentAvailability: Map<string, number>;
  conversationSuccess: number;
  retryAttempts: number;
}

class MetricsCollector {
  async recordMessageMetrics(message: A2AMessage, startTime: number) {
    const metrics = {
      messageId: message.messageId,
      duration: Date.now() - startTime,
      sender: message.sender.agentId,
      receiver: message.receiver.agentId,
      success: true
    };
    
    await this.metricsStorage.record(metrics);
    await this.updateDashboard(metrics);
  }
}
\`\`\`

### Health Monitoring
\`\`\`typescript
class HealthMonitor {
  async performHealthCheck(agentId: string): Promise<HealthStatus> {
    try {
      const response = await this.httpClient.get(\`\${agentId}/health\`);
      return {
        status: 'healthy',
        responseTime: response.duration,
        version: response.data.version,
        uptime: response.data.uptime
      };
    } catch (error) {
      return {
        status: 'unhealthy',
        error: error.message,
        lastSeen: this.getLastSeenTime(agentId)
      };
    }
  }
}
\`\`\`

## 🔄 Fault Tolerance & Recovery

### Circuit Breaker Pattern
\`\`\`typescript
class CircuitBreaker {
  private state: 'CLOSED' | 'OPEN' | 'HALF_OPEN' = 'CLOSED';
  private failureCount = 0;
  private lastFailureTime = 0;
  
  async call(agentId: string, message: A2AMessage): Promise<any> {
    if (this.state === 'OPEN') {
      if (Date.now() - this.lastFailureTime > this.timeout) {
        this.state = 'HALF_OPEN';
      } else {
        throw new Error('Circuit breaker is OPEN');
      }
    }
    
    try {
      const result = await this.executeCall(agentId, message);
      this.onSuccess();
      return result;
    } catch (error) {
      this.onFailure();
      throw error;
    }
  }
}
\`\`\`

### Message Queuing & Retry Logic
\`\`\`typescript
class MessageQueue {
  async enqueue(message: A2AMessage, priority: number = 0) {
    const queueItem = {
      message,
      priority,
      timestamp: Date.now(),
      retryCount: 0,
      maxRetries: message.metadata.retryPolicy?.maxRetries || 3
    };
    
    await this.priorityQueue.enqueue(queueItem, priority);
  }
  
  async processQueue() {
    while (true) {
      const item = await this.priorityQueue.dequeue();
      
      try {
        await this.deliverMessage(item.message);
      } catch (error) {
        if (item.retryCount < item.maxRetries) {
          item.retryCount++;
          await this.scheduleRetry(item, this.calculateBackoff(item.retryCount));
        } else {
          await this.handleDeadLetter(item);
        }
      }
    }
  }
}
\`\`\`

This comprehensive A2A protocol implementation provides robust, secure, and scalable agent communication capabilities with enterprise-grade monitoring, fault tolerance, and security features.`,

      TechStackImplementationAgent_Frontend: `# 🎨 Frontend Implementation Strategy

## 🏗️ React + ${spec.frontendTechStack.join(" + ")} Architecture

### Core Technology Stack
- **Framework:** React 18 with TypeScript for type safety
- **Build Tool:** Vite for lightning-fast development and optimized builds
- **Styling:** Tailwind CSS with Shadcn UI component library
- **State Management:** Zustand for global state, React Query for server state
- **Routing:** React Router v6 with lazy loading and code splitting

### Advanced Frontend Architecture

#### Component Architecture
\`\`\`typescript
// Component hierarchy structure
src/
├── components/
│   ├── ui/                 # Base Shadcn UI components
│   ├── layout/             # Layout components (Header, Sidebar, Footer)
│   ├── forms/              # Form components with validation
│   ├── data-display/       # Tables, cards, lists
│   ├── navigation/         # Navigation components
│   └── feedback/           # Loading, error, success states
├── features/               # Feature-based organization
│   ├── auth/              # Authentication feature
│   ├── dashboard/         # Dashboard feature
│   ├── user-profile/      # User profile feature
│   └── settings/          # Settings feature
├── hooks/                 # Custom React hooks
├── services/              # API services and external integrations
├── utils/                 # Utility functions
├── types/                 # TypeScript type definitions
└── stores/                # Zustand stores
\`\`\`

#### State Management Strategy
\`\`\`typescript
// Zustand store example
import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';

interface AppState {
  user: User | null;
  theme: 'light' | 'dark' | 'system';
  sidebarOpen: boolean;
  notifications: Notification[];
  // Actions
  setUser: (user: User | null) => void;
  toggleTheme: () => void;
  toggleSidebar: () => void;
  addNotification: (notification: Notification) => void;
}

export const useAppStore = create<AppState>()(
  devtools(
    persist(
      (set, get) => ({
        user: null,
        theme: 'system',
        sidebarOpen: true,
        notifications: [],
        setUser: (user) => set({ user }),
        toggleTheme: () => {
          const currentTheme = get().theme;
          const newTheme = currentTheme === 'light' ? 'dark' : 'light';
          set({ theme: newTheme });
        },
        toggleSidebar: () => set((state) => ({ sidebarOpen: !state.sidebarOpen })),
        addNotification: (notification) => 
          set((state) => ({ 
            notifications: [...state.notifications, notification] 
          })),
      }),
      { name: 'app-storage' }
    )
  )
);
\`\`\`

### Advanced UI Components

#### Custom Hook Library
\`\`\`typescript
// useApi custom hook for data fetching
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

export function useApi<T>(
  endpoint: string,
  options?: {
    enabled?: boolean;
    staleTime?: number;
    cacheTime?: number;
  }
) {
  return useQuery({
    queryKey: [endpoint],
    queryFn: () => apiClient.get<T>(endpoint),
    ...options,
  });
}

// useLocalStorage hook
export function useLocalStorage<T>(key: string, initialValue: T) {
  const [storedValue, setStoredValue] = useState<T>(() => {
    try {
      const item = window.localStorage.getItem(key);
      return item ? JSON.parse(item) : initialValue;
    } catch (error) {
      return initialValue;
    }
  });

  const setValue = (value: T | ((val: T) => T)) => {
    try {
      const valueToStore = value instanceof Function ? value(storedValue) : value;
      setStoredValue(valueToStore);
      window.localStorage.setItem(key, JSON.stringify(valueToStore));
    } catch (error) {
      console.error('Error saving to localStorage:', error);
    }
  };

  return [storedValue, setValue] as const;
}
\`\`\`

#### Form Management with React Hook Form
\`\`\`typescript
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

const formSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

type FormData = z.infer<typeof formSchema>;

export function RegistrationForm() {
  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: '',
      password: '',
      confirmPassword: '',
    },
  });

  const onSubmit = async (data: FormData) => {
    try {
      await registerUser(data);
      toast.success('Registration successful!');
    } catch (error) {
      toast.error('Registration failed. Please try again.');
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Email</FormLabel>
              <FormControl>
                <Input placeholder="Enter your email" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        {/* Additional form fields... */}
        <Button type="submit" disabled={form.formState.isSubmitting}>
          {form.formState.isSubmitting ? 'Creating Account...' : 'Create Account'}
        </Button>
      </form>
    </Form>
  );
}
\`\`\`

### Performance Optimization

#### Code Splitting and Lazy Loading
\`\`\`typescript
// Route-based code splitting
import { lazy, Suspense } from 'react';
import { Routes, Route } from 'react-router-dom';

const Dashboard = lazy(() => import('./pages/Dashboard'));
const Profile = lazy(() => import('./pages/Profile'));
const Settings = lazy(() => import('./pages/Settings'));

function App() {
  return (
    <Routes>
      <Route
        path="/dashboard"
        element={
          <Suspense fallback={<LoadingSpinner />}>
            <Dashboard />
          </Suspense>
        }
      />
      <Route
        path="/profile"
        element={
          <Suspense fallback={<LoadingSpinner />}>
            <Profile />
          </Suspense>
        }
      />
      <Route
        path="/settings"
        element={
          <Suspense fallback={<LoadingSpinner />}>
            <Settings />
          </Suspense>
        }
      />
    </Routes>
  );
}
\`\`\`

#### Image Optimization and Lazy Loading
\`\`\`typescript
import { useState, useEffect, useRef } from 'react';

interface LazyImageProps {
  src: string;
  alt: string;
  placeholder?: string;
  className?: string;
}

export function LazyImage({ src, alt, placeholder, className }: LazyImageProps) {
  const [imageSrc, setImageSrc] = useState(placeholder || '');
  const [isLoaded, setIsLoaded] = useState(false);
  const imgRef = useRef<HTMLImageElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          setImageSrc(src);
          observer.disconnect();
        }
      },
      { threshold: 0.1 }
    );

    if (imgRef.current) {
      observer.observe(imgRef.current);
    }

    return () => observer.disconnect();
  }, [src]);

  return (
    <img
      ref={imgRef}
      src={imageSrc}
      alt={alt}
      className={\`transition-opacity duration-300 \${
        isLoaded ? 'opacity-100' : 'opacity-50'
      } \${className}\`}
      onLoad={() => setIsLoaded(true)}
    />
  );
}
\`\`\`

### Testing Strategy

#### Component Testing with React Testing Library
\`\`\`typescript
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { BrowserRouter } from 'react-router-dom';
import { LoginForm } from './LoginForm';

const createTestQueryClient = () =>
  new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  });

const renderWithProviders = (component: React.ReactElement) => {
  const queryClient = createTestQueryClient();
  
  return render(
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        {component}
      </BrowserRouter>
    </QueryClientProvider>
  );
};

describe('LoginForm', () => {
  it('should submit form with valid credentials', async () => {
    renderWithProviders(<LoginForm />);
    
    const emailInput = screen.getByLabelText(/email/i);
    const passwordInput = screen.getByLabelText(/password/i);
    const submitButton = screen.getByRole('button', { name: /sign in/i });
    
    fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
    fireEvent.change(passwordInput, { target: { value: 'password123' } });
    fireEvent.click(submitButton);
    
    await waitFor(() => {
      expect(screen.getByText(/signing in/i)).toBeInTheDocument();
    });
  });
});
\`\`\`

### Accessibility Implementation

#### ARIA and Keyboard Navigation
\`\`\`typescript
export function AccessibleDropdown({ options, onSelect, label }: DropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [focusedIndex, setFocusedIndex] = useState(-1);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const listRef = useRef<HTMLUListElement>(null);

  const handleKeyDown = (e: KeyboardEvent) => {
    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setFocusedIndex((prev) => 
          prev < options.length - 1 ? prev + 1 : 0
        );
        break;
      case 'ArrowUp':
        e.preventDefault();
        setFocusedIndex((prev) => 
          prev > 0 ? prev - 1 : options.length - 1
        );
        break;
      case 'Enter':
      case ' ':
        e.preventDefault();
        if (focusedIndex >= 0) {
          onSelect(options[focusedIndex]);
          setIsOpen(false);
        }
        break;
      case 'Escape':
        setIsOpen(false);
        buttonRef.current?.focus();
        break;
    }
  };

  return (
    <div className="relative">
      <button
        ref={buttonRef}
        type="button"
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        aria-label={label}
        onClick={() => setIsOpen(!isOpen)}
        className="w-full px-4 py-2 text-left border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
      >
        {label}
      </button>
      
      {isOpen && (
        <ul
          ref={listRef}
          role="listbox"
          aria-label={label}
          onKeyDown={handleKeyDown}
          className="absolute z-10 w-full mt-1 bg-white border rounded-md shadow-lg max-h-60 overflow-auto"
        >
          {options.map((option, index) => (
            <li
              key={option.id}
              role="option"
              aria-selected={index === focusedIndex}
              onClick={() => {
                onSelect(option);
                setIsOpen(false);
              }}
              className={\`px-4 py-2 cursor-pointer hover:bg-gray-100 \${
                index === focusedIndex ? 'bg-blue-100' : ''
              }\`}
            >
              {option.label}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
\`\`\`

This comprehensive frontend implementation provides a robust, scalable, and maintainable React application with modern development practices, performance optimization, and excellent user experience.`,

      TechStackImplementationAgent_Backend: `# ⚙️ Backend Implementation Strategy

## 🏗️ ${spec.backendTechStack.join(" + ")} Architecture

### Core Technology Stack
- **Framework:** ${spec.backendTechStack[0]} with TypeScript for type safety
- **Database:** ${spec.backendTechStack.find(tech => tech.includes('SQL') || tech.includes('Mongo')) || 'PostgreSQL'} with connection pooling
- **Cache:** Redis for session storage and caching
- **Authentication:** JWT with refresh token rotation
- **API Documentation:** OpenAPI/Swagger with automated generation

### Advanced Backend Architecture

#### Project Structure
\`\`\`typescript
src/
├── controllers/           # HTTP request handlers
├── services/             # Business logic layer
├── repositories/         # Data access layer
├── models/              # Database models and schemas
├── middleware/          # Custom middleware functions
├── routes/              # Route definitions
├── validators/          # Input validation schemas
├── utils/               # Utility functions
├── config/              # Configuration files
├── types/               # TypeScript type definitions
└── tests/               # Test files
\`\`\`

#### Database Schema Design
\`\`\`sql
-- Users table with comprehensive fields
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  first_name VARCHAR(100),
  last_name VARCHAR(100),
  avatar_url VARCHAR(500),
  email_verified BOOLEAN DEFAULT FALSE,
  role user_role DEFAULT 'user',
  preferences JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  last_login_at TIMESTAMP WITH TIME ZONE
);

-- Sessions table for JWT refresh tokens
CREATE TABLE user_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  refresh_token_hash VARCHAR(255) NOT NULL,
  device_info JSONB,
  ip_address INET,
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Audit log for security tracking
CREATE TABLE audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id),
  action VARCHAR(100) NOT NULL,
  resource_type VARCHAR(50),
  resource_id UUID,
  details JSONB,
  ip_address INET,
  user_agent TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_sessions_user_id ON user_sessions(user_id);
CREATE INDEX idx_sessions_expires_at ON user_sessions(expires_at);
CREATE INDEX idx_audit_logs_user_id ON audit_logs(user_id);
CREATE INDEX idx_audit_logs_created_at ON audit_logs(created_at);
\`\`\`

#### Authentication & Authorization Service
\`\`\`typescript
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { randomBytes } from 'crypto';

export class AuthService {
  private readonly JWT_SECRET = process.env.JWT_SECRET!;
  private readonly REFRESH_SECRET = process.env.REFRESH_SECRET!;
  private readonly JWT_EXPIRES_IN = '15m';
  private readonly REFRESH_EXPIRES_IN = '7d';

  async register(userData: RegisterData): Promise<AuthResult> {
    // Validate email uniqueness
    const existingUser = await this.userRepository.findByEmail(userData.email);
    if (existingUser) {
      throw new ConflictError('Email already registered');
    }

    // Hash password with salt
    const saltRounds = 12;
    const passwordHash = await bcrypt.hash(userData.password, saltRounds);

    // Create user
    const user = await this.userRepository.create({
      ...userData,
      passwordHash,
      emailVerified: false,
    });

    // Generate email verification token
    const verificationToken = this.generateVerificationToken(user.id);
    await this.emailService.sendVerificationEmail(user.email, verificationToken);

    // Generate auth tokens
    const tokens = await this.generateTokens(user);
    
    // Log registration
    await this.auditService.log('user_registered', user.id, { email: user.email });

    return {
      user: this.sanitizeUser(user),
      tokens,
    };
  }

  async login(email: string, password: string, deviceInfo?: DeviceInfo): Promise<AuthResult> {
    // Find user by email
    const user = await this.userRepository.findByEmail(email);
    if (!user) {
      throw new UnauthorizedError('Invalid credentials');
    }

    // Verify password
    const isPasswordValid = await bcrypt.compare(password, user.passwordHash);
    if (!isPasswordValid) {
      await this.auditService.log('login_failed', user.id, { reason: 'invalid_password' });
      throw new UnauthorizedError('Invalid credentials');
    }

    // Check if email is verified
    if (!user.emailVerified) {
      throw new ForbiddenError('Email not verified');
    }

    // Generate tokens
    const tokens = await this.generateTokens(user, deviceInfo);
    
    // Update last login
    await this.userRepository.updateLastLogin(user.id);
    
    // Log successful login
    await this.auditService.log('login_success', user.id, deviceInfo);

    return {
      user: this.sanitizeUser(user),
      tokens,
    };
  }

  private async generateTokens(user: User, deviceInfo?: DeviceInfo): Promise<Tokens> {
    const payload = {
      userId: user.id,
      email: user.email,
      role: user.role,
    };

    // Generate access token (short-lived)
    const accessToken = jwt.sign(payload, this.JWT_SECRET, {
      expiresIn: this.JWT_EXPIRES_IN,
      issuer: 'your-app',
      audience: 'your-app-users',
    });

    // Generate refresh token (long-lived)
    const refreshTokenValue = randomBytes(32).toString('hex');
    const refreshTokenHash = await bcrypt.hash(refreshTokenValue, 10);

    // Store refresh token in database
    await this.sessionRepository.create({
      userId: user.id,
      refreshTokenHash,
      deviceInfo,
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
    });

    return {
      accessToken,
      refreshToken: refreshTokenValue,
      expiresIn: 15 * 60, // 15 minutes in seconds
    };
  }
}
\`\`\`

#### API Rate Limiting & Security
\`\`\`typescript
import rateLimit from 'express-rate-limit';
import slowDown from 'express-slow-down';
import helmet from 'helmet';

// Rate limiting configuration
export const createRateLimiter = (
  windowMs: number,
  max: number,
  message: string
) => {
  return rateLimit({
    windowMs,
    max,
    message: { error: message },
    standardHeaders: true,
    legacyHeaders: false,
    skip: (req) => {
      // Skip rate limiting for trusted IPs or internal services
      return this.isTrustedIP(req.ip);
    },
  });
};

// Different rate limits for different endpoints
export const rateLimiters = {
  general: createRateLimiter(15 * 60 * 1000, 100, 'Too many requests'),
  auth: createRateLimiter(15 * 60 * 1000, 10, 'Too many authentication attempts'),
  upload: createRateLimiter(60 * 60 * 1000, 20, 'Too many upload requests'),
};

// Security middleware setup
export function setupSecurity(app: Express) {
  // Helmet for security headers
  app.use(helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        styleSrc: ["'self'", "'unsafe-inline'"],
        scriptSrc: ["'self'"],
        imgSrc: ["'self'", "data:", "https:"],
      },
    },
    hsts: {
      maxAge: 31536000,
      includeSubDomains: true,
      preload: true,
    },
  }));

  // Request size limiting
  app.use(express.json({ limit: '10mb' }));
  app.use(express.urlencoded({ extended: true, limit: '10mb' }));

  // CORS configuration
  app.use(cors({
    origin: process.env.ALLOWED_ORIGINS?.split(',') || ['http://localhost:3000'],
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  }));
}
\`\`\`

#### Data Access Layer with Repository Pattern
\`\`\`typescript
export abstract class BaseRepository<T> {
  protected constructor(protected readonly model: any) {}

  async findById(id: string): Promise<T | null> {
    const result = await this.model.findByPk(id);
    return result ? result.toJSON() : null;
  }

  async findAll(options?: FindOptions): Promise<T[]> {
    const results = await this.model.findAll(options);
    return results.map((result: any) => result.toJSON());
  }

  async create(data: Partial<T>): Promise<T> {
    const result = await this.model.create(data);
    return result.toJSON();
  }

  async update(id: string, data: Partial<T>): Promise<T | null> {
    const [affectedRows] = await this.model.update(data, {
      where: { id },
      returning: true,
    });
    
    if (affectedRows === 0) {
      return null;
    }
    
    return await this.findById(id);
  }

  async delete(id: string): Promise<boolean> {
    const affectedRows = await this.model.destroy({ where: { id } });
    return affectedRows > 0;
  }
}

export class UserRepository extends BaseRepository<User> {
  constructor() {
    super(UserModel);
  }

  async findByEmail(email: string): Promise<User | null> {
    const result = await this.model.findOne({ where: { email } });
    return result ? result.toJSON() : null;
  }

  async updateLastLogin(userId: string): Promise<void> {
    await this.model.update(
      { lastLoginAt: new Date() },
      { where: { id: userId } }
    );
  }

  async findUsersWithPagination(
    page: number,
    limit: number,
    filters?: UserFilters
  ): Promise<PaginatedResult<User>> {
    const offset = (page - 1) * limit;
    const where = this.buildWhereClause(filters);

    const { count, rows } = await this.model.findAndCountAll({
      where,
      limit,
      offset,
      order: [['createdAt', 'DESC']],
    });

    return {
      data: rows.map((row: any) => row.toJSON()),
      total: count,
      page,
      limit,
      totalPages: Math.ceil(count / limit),
    };
  }
}
\`\`\`

#### Background Job Processing
\`\`\`typescript
import Bull from 'bull';
import Redis from 'ioredis';

// Redis connection for Bull
const redis = new Redis(process.env.REDIS_URL!);

// Job queues
export const emailQueue = new Bull('email processing', {
  redis: redis.options,
  defaultJobOptions: {
    removeOnComplete: 100,
    removeOnFail: 50,
    attempts: 3,
    backoff: {
      type: 'exponential',
      delay: 2000,
    },
  },
});

export const imageProcessingQueue = new Bull('image processing', {
  redis: redis.options,
});

// Email job processor
emailQueue.process('send-verification', async (job) => {
  const { email, token } = job.data;
  
  try {
    await emailService.sendVerificationEmail(email, token);
    return { success: true, email };
  } catch (error) {
    console.error('Failed to send verification email:', error);
    throw error;
  }
});

// Image processing job processor
imageProcessingQueue.process('resize-avatar', async (job) => {
  const { userId, imageUrl, sizes } = job.data;
  
  try {
    const processedImages = await imageService.resizeImage(imageUrl, sizes);
    await userService.updateAvatarUrls(userId, processedImages);
    return { success: true, userId, processedImages };
  } catch (error) {
    console.error('Failed to process avatar:', error);
    throw error;
  }
});

// Job scheduling service
export class JobScheduler {
  static async scheduleEmailVerification(email: string, token: string) {
    await emailQueue.add('send-verification', { email, token }, {
      delay: 1000, // 1 second delay
      priority: 'high',
    });
  }

  static async scheduleAvatarProcessing(userId: string, imageUrl: string) {
    await imageProcessingQueue.add('resize-avatar', {
      userId,
      imageUrl,
      sizes: [50, 100, 200, 400],
    });
  }
}
\`\`\`

#### API Monitoring & Health Checks
\`\`\`typescript
export class HealthCheckService {
  async getSystemHealth(): Promise<HealthStatus> {
    const checks = await Promise.allSettled([
      this.checkDatabase(),
      this.checkRedis(),
      this.checkExternalServices(),
    ]);

    const [dbCheck, redisCheck, servicesCheck] = checks;

    return {
      status: checks.every(check => check.status === 'fulfilled') ? 'healthy' : 'degraded',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      version: process.env.APP_VERSION || '1.0.0',
      checks: {
        database: dbCheck.status === 'fulfilled' ? dbCheck.value : { status: 'unhealthy', error: dbCheck.reason },
        redis: redisCheck.status === 'fulfilled' ? redisCheck.value : { status: 'unhealthy', error: redisCheck.reason },
        externalServices: servicesCheck.status === 'fulfilled' ? servicesCheck.value : { status: 'unhealthy', error: servicesCheck.reason },
      },
    };
  }

  private async checkDatabase(): Promise<ServiceHealth> {
    try {
      const startTime = Date.now();
      await sequelize.authenticate();
      const responseTime = Date.now() - startTime;
      
      return {
        status: 'healthy',
        responseTime,
        details: 'Database connection successful',
      };
    } catch (error) {
      return {
        status: 'unhealthy',
        error: error.message,
      };
    }
  }

  private async checkRedis(): Promise<ServiceHealth> {
    try {
      const startTime = Date.now();
      await redis.ping();
      const responseTime = Date.now() - startTime;
      
      return {
        status: 'healthy',
        responseTime,
        details: 'Redis connection successful',
      };
    } catch (error) {
      return {
        status: 'unhealthy',
        error: error.message,
      };
    }
  }
}
\`\`\`

This comprehensive backend implementation provides a robust, secure, and scalable API architecture with enterprise-grade features including authentication, authorization, rate limiting, job processing, and comprehensive monitoring.`,

      CursorOptimizationAgent: `# 🤖 Cursor AI Development Optimization Guide

## 🎯 Cursor-Specific Development Strategy

### Project Structure for Maximum AI Efficiency
\`\`\`
project-root/
├── .cursorrules                    # Global Cursor AI instructions
├── .cursor/
│   ├── instructions.md            # Detailed project context
│   ├── conventions.md             # Coding standards and patterns
│   └── architecture.md            # System architecture overview
├── docs/
│   ├── api/                       # API documentation
│   ├── components/                # Component documentation
│   └── deployment/                # Deployment guides
├── src/
│   ├── components/                # Well-documented React components
│   ├── hooks/                     # Custom hooks with clear purposes
│   ├── services/                  # Service layer with type definitions
│   ├── types/                     # Comprehensive TypeScript definitions
│   └── utils/                     # Utility functions with examples
\`\`\`

### .cursorrules Configuration
\`\`\`markdown
# Cursor AI Development Rules for ${spec.projectDescription}

## Project Context
You are working on a ${spec.projectDescription} built with ${spec.frontendTechStack.join(", ")} and ${spec.backendTechStack.join(", ")}.

## Code Style & Conventions
- Use TypeScript for all new files
- Follow functional programming patterns where possible
- Prefer composition over inheritance
- Use descriptive variable and function names
- Include JSDoc comments for all exported functions
- Follow the established file naming conventions (kebab-case for components, camelCase for utilities)

## Component Guidelines
- Create small, focused components (< 100 lines)
- Use custom hooks for complex state logic
- Implement proper error boundaries
- Include loading and error states
- Use Tailwind CSS for styling with consistent design tokens

## API Integration
- Use React Query for server state management
- Implement proper error handling with user feedback
- Include loading states for all async operations
- Use TypeScript interfaces for all API responses
- Implement retry logic for failed requests

## Testing Requirements
- Write unit tests for all utility functions
- Include integration tests for API endpoints
- Test component rendering and user interactions
- Aim for 80%+ code coverage
- Use descriptive test names that explain the expected behavior

## Performance Optimization
- Implement code splitting for route-based components
- Use React.memo for expensive components
- Optimize images with proper sizing and lazy loading
- Minimize bundle size by avoiding unnecessary dependencies
- Use efficient state management patterns

## Security Considerations
- Validate all user inputs
- Sanitize data before displaying
- Implement proper authentication checks
- Use HTTPS for all API calls
- Follow OWASP security guidelines

## Documentation
- Include README files for complex features
- Document all environment variables
- Provide setup instructions for new developers
- Include architecture decision records (ADRs)
- Keep API documentation up to date
\`\`\`

### TypeScript Configuration for AI Understanding
\`\`\`typescript
// types/global.d.ts - Comprehensive type definitions
declare global {
  interface Window {
    gtag: (...args: any[]) => void;
    dataLayer: any[];
  }
}

// API Response Types
export interface ApiResponse<T> {
  data: T;
  success: boolean;
  message?: string;
  errors?: Record<string, string[]>;
}

export interface PaginatedResponse<T> extends ApiResponse<T[]> {
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

// User Management Types
export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  avatar?: string;
  role: UserRole;
  preferences: UserPreferences;
  createdAt: string;
  updatedAt: string;
  lastLoginAt?: string;
}

export type UserRole = 'admin' | 'user' | 'moderator';

export interface UserPreferences {
  theme: 'light' | 'dark' | 'system';
  notifications: {
    email: boolean;
    push: boolean;
    inApp: boolean;
  };
  privacy: {
    profileVisibility: 'public' | 'private' | 'friends';
    activityTracking: boolean;
  };
}

// Component Props Types
export interface BaseComponentProps {
  className?: string;
  children?: React.ReactNode;
  testId?: string;
}

export interface FormFieldProps extends BaseComponentProps {
  label: string;
  error?: string;
  required?: boolean;
  disabled?: boolean;
}

// State Management Types
export interface AppState {
  user: User | null;
  theme: 'light' | 'dark' | 'system';
  loading: boolean;
  error: string | null;
}

export interface AuthState {
  isAuthenticated: boolean;
  user: User | null;
  accessToken: string | null;
  refreshToken: string | null;
  isLoading: boolean;
}
\`\`\`

### Component Documentation Standards
\`\`\`typescript
/**
 * UserProfile Component
 * 
 * Displays user profile information with editing capabilities.
 * Handles avatar upload, profile updates, and preference management.
 * 
 * @example
 * \`\`\`tsx
 * <UserProfile
 *   user={currentUser}
 *   onUpdate={handleUserUpdate}
 *   allowEdit={true}
 * />
 * \`\`\`
 * 
 * @param user - The user object to display
 * @param onUpdate - Callback function called when user data is updated
 * @param allowEdit - Whether the profile can be edited
 * @param className - Additional CSS classes
 */
export interface UserProfileProps extends BaseComponentProps {
  user: User;
  onUpdate: (updatedUser: Partial<User>) => Promise<void>;
  allowEdit?: boolean;
}

export function UserProfile({ 
  user, 
  onUpdate, 
  allowEdit = false, 
  className 
}: UserProfileProps) {
  // Component implementation with clear state management
  const [isEditing, setIsEditing] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Custom hook for avatar upload
  const { uploadAvatar, isUploading: avatarUploading } = useAvatarUpload();

  // Form handling with validation
  const form = useForm<UserFormData>({
    resolver: zodResolver(userProfileSchema),
    defaultValues: {
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
    },
  });

  /**
   * Handles profile form submission
   * Validates data, shows loading state, and handles errors
   */
  const handleSubmit = async (data: UserFormData) => {
    try {
      setErrors({});
      await onUpdate(data);
      setIsEditing(false);
      toast.success('Profile updated successfully');
    } catch (error) {
      const validationErrors = extractValidationErrors(error);
      setErrors(validationErrors);
      toast.error('Failed to update profile');
    }
  };

  // Rest of component implementation...
}
\`\`\`

### Custom Hooks for Reusability
\`\`\`typescript
/**
 * useApi Hook
 * 
 * Provides a standardized way to make API calls with error handling,
 * loading states, and automatic retries.
 * 
 * @example
 * \`\`\`tsx
 * const { data, isLoading, error, refetch } = useApi('/api/users', {
 *   retry: 3,
 *   onError: (error) => toast.error(error.message)
 * });
 * \`\`\`
 */
export function useApi<T>(
  endpoint: string,
  options?: {
    enabled?: boolean;
    retry?: number;
    onSuccess?: (data: T) => void;
    onError?: (error: Error) => void;
  }
) {
  const { enabled = true, retry = 1, onSuccess, onError } = options || {};

  return useQuery({
    queryKey: [endpoint],
    queryFn: async (): Promise<T> => {
      const response = await apiClient.get<ApiResponse<T>>(endpoint);
      
      if (!response.data.success) {
        throw new Error(response.data.message || 'API request failed');
      }
      
      return response.data.data;
    },
    enabled,
    retry,
    onSuccess,
    onError,
    staleTime: 5 * 60 * 1000, // 5 minutes
    cacheTime: 10 * 60 * 1000, // 10 minutes
  });
}

/**
 * useLocalStorage Hook
 * 
 * Provides persistent state management using localStorage
 * with TypeScript support and error handling.
 */
export function useLocalStorage<T>(
  key: string,
  initialValue: T
): [T, (value: T | ((val: T) => T)) => void] {
  // Get initial value from localStorage or use provided initial value
  const [storedValue, setStoredValue] = useState<T>(() => {
    try {
      const item = window.localStorage.getItem(key);
      return item ? JSON.parse(item) : initialValue;
    } catch (error) {
      console.warn(\`Error reading localStorage key "\${key}":\`, error);
      return initialValue;
    }
  });

  // Return a wrapped version of useState's setter function that persists the new value to localStorage
  const setValue = (value: T | ((val: T) => T)) => {
    try {
      // Allow value to be a function so we have the same API as useState
      const valueToStore = value instanceof Function ? value(storedValue) : value;
      setStoredValue(valueToStore);
      window.localStorage.setItem(key, JSON.stringify(valueToStore));
    } catch (error) {
      console.warn(\`Error setting localStorage key "\${key}":\`, error);
    }
  };

  return [storedValue, setValue];
}
\`\`\`

### Error Handling Patterns
\`\`\`typescript
/**
 * Centralized error handling utilities
 * Provides consistent error formatting and user feedback
 */
export class AppError extends Error {
  constructor(
    message: string,
    public code?: string,
    public statusCode?: number,
    public details?: any
  ) {
    super(message);
    this.name = 'AppError';
  }
}

export function handleApiError(error: unknown): AppError {
  if (error instanceof AppError) {
    return error;
  }

  if (axios.isAxiosError(error)) {
    const status = error.response?.status || 500;
    const message = error.response?.data?.message || error.message;
    const details = error.response?.data?.errors;

    return new AppError(message, 'API_ERROR', status, details);
  }

  return new AppError(
    error instanceof Error ? error.message : 'Unknown error occurred',
    'UNKNOWN_ERROR'
  );
}

/**
 * Global error boundary for React components
 */
export class ErrorBoundary extends React.Component<
  { children: React.ReactNode; fallback?: React.ComponentType<{ error: Error }> },
  { hasError: boolean; error: Error | null }
> {
  constructor(props: any) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('Error boundary caught an error:', error, errorInfo);
    // Send error to monitoring service
    errorReportingService.captureException(error, {
      context: 'React Error Boundary',
      errorInfo,
    });
  }

  render() {
    if (this.state.hasError) {
      const FallbackComponent = this.props.fallback || DefaultErrorFallback;
      return <FallbackComponent error={this.state.error!} />;
    }

    return this.props.children;
  }
}
\`\`\`

### Performance Optimization Techniques
\`\`\`typescript
/**
 * Optimized data fetching with React Query
 */
export function useOptimizedUserData(userId: string) {
  // Prefetch related data
  const queryClient = useQueryClient();

  const userQuery = useQuery({
    queryKey: ['user', userId],
    queryFn: () => userService.getUser(userId),
    staleTime: 5 * 60 * 1000, // 5 minutes
    select: (data) => ({
      // Only select the fields we need to minimize re-renders
      id: data.id,
      name: \`\${data.firstName} \${data.lastName}\`,
      email: data.email,
      avatar: data.avatar,
    }),
  });

  // Prefetch user's posts when user data loads
  useEffect(() => {
    if (userQuery.data?.id) {
      queryClient.prefetchQuery({
        queryKey: ['user-posts', userQuery.data.id],
        queryFn: () => postService.getUserPosts(userQuery.data.id),
        staleTime: 2 * 60 * 1000, // 2 minutes
      });
    }
  }, [userQuery.data?.id, queryClient]);

  return userQuery;
}

/**
 * Memoized component for expensive renders
 */
export const UserCard = React.memo<UserCardProps>(({ user, onAction }) => {
  // Memoize expensive calculations
  const userStats = useMemo(() => {
    return calculateUserStatistics(user);
  }, [user.id, user.lastActivity, user.postCount]);

  return (
    <Card className="user-card">
      <CardHeader>
        <Avatar src={user.avatar} alt={user.name} />
        <h3>{user.name}</h3>
      </CardHeader>
      <CardContent>
        <UserStatistics stats={userStats} />
      </CardContent>
      <CardActions>
        <Button onClick={() => onAction('view', user.id)}>View Profile</Button>
      </CardActions>
    </Card>
  );
});
\`\`\`

### Testing Utilities for Cursor
\`\`\`typescript
/**
 * Test utilities with comprehensive setup
 * Provides consistent testing environment for Cursor AI understanding
 */
export function createTestWrapper() {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  });

  return function TestWrapper({ children }: { children: React.ReactNode }) {
    return (
      <QueryClientProvider client={queryClient}>
        <BrowserRouter>
          <ThemeProvider defaultTheme="light">
            <ToastProvider>
              {children}
            </ToastProvider>
          </ThemeProvider>
        </BrowserRouter>
      </QueryClientProvider>
    );
  };
}

/**
 * User event helpers for testing
 */
export const userEvents = {
  async fillForm(form: HTMLElement, data: Record<string, string>) {
    for (const [field, value] of Object.entries(data)) {
      const input = screen.getByLabelText(new RegExp(field, 'i'));
      await user.clear(input);
      await user.type(input, value);
    }
  },

  async submitForm(formName: string | RegExp) {
    const submitButton = screen.getByRole('button', { name: formName });
    await user.click(submitButton);
  },

  async selectFromDropdown(label: string | RegExp, option: string) {
    const select = screen.getByLabelText(label);
    await user.click(select);
    const optionElement = screen.getByText(option);
    await user.click(optionElement);
  },
};

/**
 * API mocking utilities
 */
export const apiMocks = {
  user: {
    getProfile: (userData?: Partial<User>) =>
      rest.get('/api/user/profile', (req, res, ctx) =>
        res(ctx.json({ success: true, data: { ...mockUser, ...userData } }))
      ),

    updateProfile: () =>
      rest.put('/api/user/profile', (req, res, ctx) =>
        res(ctx.json({ success: true, data: mockUser }))
      ),
  },

  auth: {
    login: () =>
      rest.post('/api/auth/login', (req, res, ctx) =>
        res(ctx.json({ success: true, data: { user: mockUser, tokens: mockTokens } }))
      ),

    logout: () =>
      rest.post('/api/auth/logout', (req, res, ctx) =>
        res(ctx.json({ success: true }))
      ),
  },
};
\`\`\`

This comprehensive Cursor optimization guide ensures that your development workflow with Cursor AI is maximally efficient, with clear patterns, extensive documentation, and optimized code structures that help Cursor understand your project context and generate better code suggestions.`,

      QualityAssuranceAgent: `# ✅ Comprehensive Quality Assurance & Security Framework

## 🛡️ Security Analysis & Implementation

### Authentication & Authorization Security
\`\`\`typescript
// Security configuration checklist
const securityConfig = {
  authentication: {
    jwtSecret: 'STRONG_RANDOM_SECRET', // 256-bit minimum
    jwtExpiration: '15m', // Short-lived access tokens
    refreshTokenExpiration: '7d',
    passwordPolicy: {
      minLength: 12,
      requireUppercase: true,
      requireLowercase: true,
      requireNumbers: true,
      requireSpecialChars: true,
      preventReuse: 5, // Last 5 passwords
    },
    rateLimiting: {
      loginAttempts: 5,
      lockoutDuration: '15m',
      progressiveDelay: true,
    },
  },
  authorization: {
    rbac: true, // Role-based access control
    principleOfLeastPrivilege: true,
    sessionTimeout: '30m',
    concurrentSessionLimit: 3,
  },
};
\`\`\`

### Input Validation & Sanitization
\`\`\`typescript
import { z } from 'zod';
import DOMPurify from 'dompurify';

// Comprehensive validation schemas
export const secureSchemas = {
  userRegistration: z.object({
    email: z.string()
      .email('Invalid email format')
      .max(254, 'Email too long')
      .transform(email => email.toLowerCase().trim()),
    
    password: z.string()
      .min(12, 'Password must be at least 12 characters')
      .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/, 
        'Password must contain uppercase, lowercase, number and special character'),
    
    firstName: z.string()
      .min(1, 'First name required')
      .max(50, 'First name too long')
      .regex(/^[a-zA-Z\s'-]+$/, 'Invalid characters in first name')
      .transform(name => DOMPurify.sanitize(name.trim())),
    
    lastName: z.string()
      .min(1, 'Last name required')
      .max(50, 'Last name too long')
      .regex(/^[a-zA-Z\s'-]+$/, 'Invalid characters in last name')
      .transform(name => DOMPurify.sanitize(name.trim())),
  }),

  searchQuery: z.object({
    q: z.string()
      .max(200, 'Search query too long')
      .transform(query => DOMPurify.sanitize(query.trim())),
    
    filters: z.object({
      category: z.enum(['all', 'posts', 'users', 'documents']).optional(),
      dateRange: z.object({
        start: z.string().datetime().optional(),
        end: z.string().datetime().optional(),
      }).optional(),
    }).optional(),
  }),
};

// SQL injection prevention
export class SecureQueryBuilder {
  static buildUserQuery(filters: UserFilters) {
    const whereConditions: string[] = [];
    const parameters: any[] = [];

    if (filters.email) {
      whereConditions.push('email ILIKE $' + (parameters.length + 1));
      parameters.push(\`%\${filters.email}%\`);
    }

    if (filters.role) {
      whereConditions.push('role = $' + (parameters.length + 1));
      parameters.push(filters.role);
    }

    if (filters.createdAfter) {
      whereConditions.push('created_at >= $' + (parameters.length + 1));
      parameters.push(filters.createdAfter);
    }

    const whereClause = whereConditions.length > 0 
      ? 'WHERE ' + whereConditions.join(' AND ')
      : '';

    return {
      query: \`SELECT id, email, first_name, last_name, role, created_at 
               FROM users \${whereClause} 
               ORDER BY created_at DESC 
               LIMIT $\${parameters.length + 1} 
               OFFSET $\${parameters.length + 2}\`,
      parameters: [...parameters, filters.limit || 20, filters.offset || 0],
    };
  }
}
\`\`\`

### OWASP Security Compliance
\`\`\`typescript
// OWASP Top 10 mitigation strategies
export const owaspMitigations = {
  // A01: Broken Access Control
  accessControl: {
    implementation: 'Role-based access control with resource-level permissions',
    middleware: 'authMiddleware + rbacMiddleware',
    testing: 'Automated permission testing for all endpoints',
  },

  // A02: Cryptographic Failures
  cryptography: {
    dataAtRest: 'AES-256-GCM encryption for sensitive fields',
    dataInTransit: 'TLS 1.3 with HSTS headers',
    keyManagement: 'AWS KMS / HashiCorp Vault for key rotation',
  },

  // A03: Injection
  injection: {
    sqlInjection: 'Parameterized queries with prepared statements',
    xss: 'DOMPurify sanitization + CSP headers',
    osCommand: 'Input validation + sandboxed execution',
  },

  // A04: Insecure Design
  secureDesign: {
    threatModeling: 'STRIDE methodology for feature design',
    securityRequirements: 'Security stories in sprint planning',
    defenseInDepth: 'Multiple security layers',
  },

  // A05: Security Misconfiguration
  configuration: {
    defaultCredentials: 'Forced password change on first login',
    errorHandling: 'Generic error messages to prevent information disclosure',
    securityHeaders: 'Comprehensive security header implementation',
  },
};

// Security headers middleware
export function setupSecurityHeaders(app: Express) {
  app.use((req, res, next) => {
    // Prevent XSS attacks
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('X-Frame-Options', 'DENY');
    res.setHeader('X-XSS-Protection', '1; mode=block');
    
    // HSTS for HTTPS enforcement
    res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains; preload');
    
    // CSP to prevent code injection
    res.setHeader('Content-Security-Policy', [
      "default-src 'self'",
      "script-src 'self' 'unsafe-inline'", // Consider removing unsafe-inline
      "style-src 'self' 'unsafe-inline'",
      "img-src 'self' data: https:",
      "font-src 'self'",
      "connect-src 'self'",
      "frame-ancestors 'none'",
    ].join('; '));
    
    // Referrer policy
    res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
    
    // Feature policy
    res.setHeader('Permissions-Policy', 'geolocation=(), microphone=(), camera=()');
    
    next();
  });
}
\`\`\`

## 🧪 Comprehensive Testing Strategy

### Test Coverage Requirements
\`\`\`typescript
// Jest configuration with coverage thresholds
export const testConfig = {
  coverageThreshold: {
    global: {
      branches: 85,
      functions: 90,
      lines: 90,
      statements: 90,
    },
    // Stricter requirements for critical modules
    './src/services/auth/': {
      branches: 95,
      functions: 95,
      lines: 95,
      statements: 95,
    },
    './src/services/payment/': {
      branches: 95,
      functions: 95,
      lines: 95,
      statements: 95,
    },
  },
  testEnvironment: 'jsdom',
  setupFilesAfterEnv: ['<rootDir>/src/test/setup.ts'],
  collectCoverageFrom: [
    'src/**/*.{ts,tsx}',
    '!src/**/*.d.ts',
    '!src/**/*.stories.{ts,tsx}',
    '!src/test/**/*',
  ],
};
\`\`\`

### Security Testing Suite
\`\`\`typescript
// Security-focused test cases
describe('Security Tests', () => {
  describe('Authentication Security', () => {
    it('should reject weak passwords', async () => {
      const weakPasswords = [
        'password',
        '12345678',
        'Password1',
        'password123',
      ];

      for (const password of weakPasswords) {
        const response = await request(app)
          .post('/api/auth/register')
          .send({
            email: 'test@example.com',
            password,
            firstName: 'Test',
            lastName: 'User',
          });

        expect(response.status).toBe(400);
        expect(response.body.errors).toHaveProperty('password');
      }
    });

    it('should implement rate limiting on login attempts', async () => {
      const loginData = {
        email: 'test@example.com',
        password: 'wrongpassword',
      };

      // Make 6 failed login attempts
      for (let i = 0; i < 6; i++) {
        await request(app)
          .post('/api/auth/login')
          .send(loginData);
      }

      // 7th attempt should be rate limited
      const response = await request(app)
        .post('/api/auth/login')
        .send(loginData);

      expect(response.status).toBe(429);
      expect(response.body.error).toMatch(/too many attempts/i);
    });

    it('should prevent JWT token reuse after logout', async () => {
      // Login and get token
      const loginResponse = await request(app)
        .post('/api/auth/login')
        .send(validLoginData);

      const { accessToken } = loginResponse.body.data.tokens;

      // Logout
      await request(app)
        .post('/api/auth/logout')
        .set('Authorization', \`Bearer \${accessToken}\`);

      // Try to use token after logout
      const response = await request(app)
        .get('/api/user/profile')
        .set('Authorization', \`Bearer \${accessToken}\`);

      expect(response.status).toBe(401);
    });
  });

  describe('Input Validation Security', () => {
    it('should prevent XSS attacks in user input', async () => {
      const xssPayloads = [
        '<script>alert("xss")</script>',
        'javascript:alert("xss")',
        '<img src="x" onerror="alert(1)">',
        '<svg onload="alert(1)">',
      ];

      for (const payload of xssPayloads) {
        const response = await request(app)
          .post('/api/user/profile')
          .set('Authorization', \`Bearer \${validToken}\`)
          .send({
            firstName: payload,
            lastName: 'User',
          });

        expect(response.status).toBe(400);
      }
    });

    it('should prevent SQL injection attempts', async () => {
      const sqlPayloads = [
        "'; DROP TABLE users; --",
        "' OR '1'='1",
        "' UNION SELECT * FROM users --",
        "'; INSERT INTO users VALUES('hacker', 'evil'); --",
      ];

      for (const payload of sqlPayloads) {
        const response = await request(app)
          .get('/api/users/search')
          .query({ q: payload })
          .set('Authorization', \`Bearer \${validToken}\`);

        // Should either return safe results or validation error, never crash
        expect([200, 400]).toContain(response.status);
        
        // Verify database integrity
        const userCount = await User.count();
        expect(userCount).toBeGreaterThan(0); // DB should still exist
      }
    });
  });

  describe('Authorization Security', () => {
    it('should enforce role-based access control', async () => {
      // Regular user trying to access admin endpoint
      const response = await request(app)
        .get('/api/admin/users')
        .set('Authorization', \`Bearer \${userToken}\`); // Non-admin token

      expect(response.status).toBe(403);
      expect(response.body.error).toMatch(/insufficient permissions/i);
    });

    it('should prevent privilege escalation', async () => {
      // User trying to modify their own role
      const response = await request(app)
        .put('/api/user/profile')
        .set('Authorization', \`Bearer \${userToken}\`)
        .send({
          role: 'admin', // Attempting privilege escalation
        });

      expect(response.status).toBe(400);
      expect(response.body.error).toMatch(/cannot modify role/i);
    });
  });
});
\`\`\`

### Performance Testing
\`\`\`typescript
// Load testing with Artillery or K6
export const performanceTests = {
  loadTest: {
    scenarios: {
      'api-load-test': {
        executor: 'ramping-vus',
        startVUs: 0,
        stages: [
          { duration: '2m', target: 100 }, // Ramp up
          { duration: '5m', target: 100 }, // Sustained load
          { duration: '2m', target: 200 }, // Peak load
          { duration: '1m', target: 0 },   // Ramp down
        ],
      },
    },
    thresholds: {
      http_req_duration: ['p(95)<500'], // 95% of requests under 500ms
      http_req_failed: ['rate<0.01'],   // Error rate under 1%
      http_reqs: ['rate>100'],          // At least 100 req/s
    },
  },

  endpointTests: [
    {
      name: 'User Authentication',
      endpoint: '/api/auth/login',
      method: 'POST',
      expectedResponseTime: 200, // ms
      expectedThroughput: 1000,  // req/s
    },
    {
      name: 'User Profile Fetch',
      endpoint: '/api/user/profile',
      method: 'GET',
      expectedResponseTime: 100,
      expectedThroughput: 2000,
    },
    {
      name: 'Search API',
      endpoint: '/api/search',
      method: 'GET',
      expectedResponseTime: 300,
      expectedThroughput: 500,
    },
  ],
};
\`\`\`

## 📊 Quality Metrics & Monitoring

### Code Quality Standards
\`\`\`typescript
// ESLint configuration for code quality
export const eslintConfig = {
  extends: [
    '@typescript-eslint/recommended',
    '@typescript-eslint/recommended-requiring-type-checking',
    'plugin:react-hooks/recommended',
    'plugin:security/recommended',
  ],
  rules: {
    // Complexity rules
    'complexity': ['error', { max: 10 }],
    'max-depth': ['error', 4],
    'max-lines': ['error', { max: 300, skipBlankLines: true }],
    'max-lines-per-function': ['error', { max: 50, skipBlankLines: true }],
    
    // Security rules
    'security/detect-object-injection': 'error',
    'security/detect-non-literal-regexp': 'error',
    'security/detect-unsafe-regex': 'error',
    
    // TypeScript-specific rules
    '@typescript-eslint/no-unused-vars': 'error',
    '@typescript-eslint/explicit-function-return-type': 'warn',
    '@typescript-eslint/no-explicit-any': 'error',
    '@typescript-eslint/prefer-nullish-coalescing': 'error',
    
    // React-specific rules
    'react-hooks/exhaustive-deps': 'error',
    'react/prop-types': 'off', // Using TypeScript instead
  },
};

// SonarQube quality gates
export const sonarQubeConfig = {
  qualityGate: {
    conditions: [
      { metric: 'new_coverage', operator: 'LT', threshold: '80' },
      { metric: 'new_duplicated_lines_density', operator: 'GT', threshold: '3' },
      { metric: 'new_maintainability_rating', operator: 'GT', threshold: 'A' },
      { metric: 'new_reliability_rating', operator: 'GT', threshold: 'A' },
      { metric: 'new_security_rating', operator: 'GT', threshold: 'A' },
      { metric: 'new_security_hotspots_reviewed', operator: 'LT', threshold: '100' },
    ],
  },
};
\`\`\`

### Monitoring & Alerting
\`\`\`typescript
// Application monitoring configuration
export const monitoringConfig = {
  metrics: {
    performance: {
      responseTime: { threshold: '500ms', severity: 'warning' },
      throughput: { threshold: '100req/s', severity: 'critical' },
      errorRate: { threshold: '1%', severity: 'critical' },
    },
    
    security: {
      failedLogins: { threshold: '10/min', severity: 'warning' },
      suspiciousActivity: { threshold: '5/min', severity: 'critical' },
      rateLimitHits: { threshold: '50/min', severity: 'info' },
    },
    
    business: {
      userRegistrations: { threshold: '1/min', severity: 'info' },
      activeUsers: { threshold: '100', severity: 'warning' },
      conversionRate: { threshold: '2%', severity: 'warning' },
    },
  },

  alerts: {
    channels: ['email', 'slack', 'pagerduty'],
    escalation: {
      level1: { time: '5min', contacts: ['dev-team'] },
      level2: { time: '15min', contacts: ['dev-lead', 'sre-team'] },
      level3: { time: '30min', contacts: ['engineering-manager'] },
    },
  },
};

// Health check endpoint
export class HealthCheckController {
  async getDetailedHealth(req: Request, res: Response) {
    const healthChecks = await Promise.allSettled([
      this.checkDatabase(),
      this.checkRedis(),
      this.checkExternalServices(),
      this.checkFileSystem(),
    ]);

    const results = {
      status: 'healthy',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      version: process.env.APP_VERSION,
      environment: process.env.NODE_ENV,
      checks: {
        database: healthChecks[0],
        redis: healthChecks[1],
        externalServices: healthChecks[2],
        fileSystem: healthChecks[3],
      },
      metrics: {
        memoryUsage: process.memoryUsage(),
        cpuUsage: process.cpuUsage(),
        activeConnections: await this.getActiveConnections(),
      },
    };

    const hasFailures = healthChecks.some(check => check.status === 'rejected');
    if (hasFailures) {
      results.status = 'degraded';
      res.status(503);
    }

    res.json(results);
  }
}
\`\`\`

## 🔍 Compliance & Documentation

### GDPR Compliance Implementation
\`\`\`typescript
// GDPR compliance utilities
export class GDPRComplianceService {
  async exportUserData(userId: string): Promise<UserDataExport> {
    const userData = await this.gatherUserData(userId);
    
    return {
      personal_information: userData.profile,
      activity_logs: userData.activities,
      preferences: userData.settings,
      generated_at: new Date().toISOString(),
      format_version: '1.0',
      retention_policy: '7 years from last activity',
    };
  }

  async deleteUserData(userId: string, reason: string): Promise<DeletionReport> {
    const deletionTasks = [
      this.deleteUserProfile(userId),
      this.anonymizeUserActivities(userId),
      this.removeUserFromMailing(userId),
      this.deleteUserFiles(userId),
    ];

    const results = await Promise.allSettled(deletionTasks);
    
    await this.auditLog.record({
      action: 'gdpr_data_deletion',
      userId,
      reason,
      results: results.map(r => r.status),
      timestamp: new Date(),
    });

    return {
      userId,
      deletionDate: new Date().toISOString(),
      tasksCompleted: results.filter(r => r.status === 'fulfilled').length,
      totalTasks: results.length,
      verificationCode: generateVerificationCode(),
    };
  }

  async consentManagement(userId: string, consents: ConsentSettings) {
    const currentConsents = await this.getConsents(userId);
    const changes = this.detectConsentChanges(currentConsents, consents);

    if (changes.length > 0) {
      await this.updateConsents(userId, consents);
      await this.auditLog.record({
        action: 'consent_updated',
        userId,
        changes,
        timestamp: new Date(),
      });
    }

    return { updated: changes.length > 0, changes };
  }
}
\`\`\`

### Security Audit Documentation
\`\`\`markdown
# Security Audit Checklist

## Infrastructure Security
- [ ] All services run with minimal required privileges
- [ ] Network segmentation properly configured
- [ ] Firewall rules follow least-privilege principle
- [ ] SSL/TLS certificates properly configured and up-to-date
- [ ] Database access restricted to application servers only
- [ ] Backup encryption and secure storage verified

## Application Security
- [ ] Input validation implemented for all user inputs
- [ ] Output encoding prevents XSS attacks
- [ ] SQL injection protection via parameterized queries
- [ ] Authentication mechanisms secure and properly tested
- [ ] Session management follows security best practices
- [ ] Error messages don't leak sensitive information

## Data Protection
- [ ] Sensitive data encrypted at rest using AES-256
- [ ] Data in transit protected with TLS 1.3
- [ ] PII handling complies with GDPR requirements
- [ ] Data retention policies implemented and enforced
- [ ] Regular data backup and recovery testing performed
- [ ] Third-party data processing agreements in place

## Monitoring & Incident Response
- [ ] Security event logging comprehensive and centralized
- [ ] Alerting configured for suspicious activities
- [ ] Incident response plan documented and tested
- [ ] Regular security training provided to team
- [ ] Vulnerability scanning automated and scheduled
- [ ] Penetration testing performed annually
\`\`\`

This comprehensive QA and security framework ensures your application meets enterprise-grade standards with robust security measures, thorough testing coverage, performance optimization, and compliance with industry regulations.`
    };

    const selectedResponse = responses[agent];
    if (!selectedResponse) {
      throw new Error(`No mock response available for agent: ${agent}`);
    }

    return {
      id: `mock-${Date.now()}`,
      object: "chat.completion",
      created: Math.floor(Date.now() / 1000),
      model: "deepseek-chat",
      choices: [{
        index: 0,
        message: {
          role: "assistant" as const,
          content: selectedResponse
        },
        finish_reason: "stop"
      }],
      usage: {
        prompt_tokens: 500,
        completion_tokens: selectedResponse.length / 4, // Rough estimate
        total_tokens: 500 + Math.floor(selectedResponse.length / 4)
      }
    };
  }
}
