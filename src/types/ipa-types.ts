
export interface ProjectSpec {
  projectDescription: string;
  frontendTechStack: TechStack[];
  backendTechStack: TechStack[];
  customFrontendTech: string[];
  customBackendTech: string[];
  a2aIntegrationDetails: string;
  additionalFeatures: string;
  ragVectorDb: VectorDatabase;
  customRagVectorDb: string;
  mcpType: MCPType;
  customMcpType: string;
  advancedPromptDetails: string;
  deploymentPreference?: string;
  authenticationMethod?: string;
}

export type TechStack = 
  | "React"
  | "Vue"
  | "Angular"
  | "Next.js"
  | "Svelte"
  | "Nuxt.js"
  | "Gatsby"
  | "Remix"
  | "Express"
  | "FastAPI"
  | "Django"
  | "Node.js"
  | "NestJS"
  | "Flask"
  | "Spring Boot"
  | "Laravel"
  | "Ruby on Rails"
  | "ASP.NET Core"
  | "Koa.js"
  | "Hapi.js"
  | "TypeScript"
  | "JavaScript"
  | "Python"
  | "Java"
  | "Go"
  | "Rust"
  | "PostgreSQL"
  | "MySQL"
  | "MongoDB"
  | "Redis"
  | "SQLite"
  | "Supabase"
  | "Firebase"
  | "DynamoDB"
  | "CouchDB"
  | "Cassandra"
  | "GraphQL"
  | "REST API"
  | "WebSockets"
  | "Microservices"
  | "Serverless"
  | "Docker"
  | "Kubernetes"
  | "AWS"
  | "Azure"
  | "Google Cloud"
  | "GCP";

export type VectorDatabase = 
  | "Chroma" 
  | "Pinecone" 
  | "Weaviate" 
  | "Qdrant" 
  | "FAISS" 
  | "PGVector"
  | "Milvus"
  | "Elasticsearch"
  | "OpenSearch"
  | "Custom"
  | "None";

export type MCPType = 
  | "Standard MCP" 
  | "Enhanced MCP" 
  | "Enterprise MCP"
  | "Extended MCP"
  | "MCP with Tools"
  | "MCP with Resources"
  | "MCP with Prompts"
  | "MCP with Sampling"
  | "Custom MCP Implementation"
  | "None";

export interface AgentStatus {
  id: string;
  name: string;
  agent: string;
  status: "idle" | "processing" | "completed" | "error" | "failed";
  progress: number;
  currentTask?: string;
  result?: string;
  output?: string;
  error?: string;
  timestamp: number;
}

export interface GenerationStatus {
  taskId: string;
  status: "pending" | "processing" | "completed" | "failed";
  agents: AgentStatus[];
  result?: string;
  error?: string;
  progress: number;
  startTime: number;
  endTime?: number;
  spec?: ProjectSpec;
  messages?: DeepSeekMessage[];
}

export interface DeepSeekMessage {
  role: "system" | "user" | "assistant";
  content: string;
  reasoning_content?: string;
}

export interface DeepSeekCompletionRequest {
  model: string;
  messages: Array<{
    role: "system" | "user" | "assistant";
    content: string;
    reasoning_content?: string;
  }>;
  max_tokens?: number;
  temperature?: number;
  top_p?: number;
  frequency_penalty?: number;
  presence_penalty?: number;
  stream?: boolean;
}

export interface DeepSeekCompletionResponse {
  id: string;
  object: string;
  created: number;
  model: string;
  choices: Array<{
    index: number;
    message: {
      role: string;
      content: string;
      reasoning_content?: string;
    };
    finish_reason: string;
  }>;
  usage: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
    reasoning_tokens?: number;
  };
}

// RAG types
export interface RAGQuery {
  query: string;
  limit?: number;
  threshold?: number;
  filters?: Record<string, any>;
}

export interface RAGResult {
  documents: Array<{
    id: string;
    title: string;
    content: string;
    source: string;
    metadata?: Record<string, any>;
  }>;
  query: string;
  totalResults: number;
  scores: number[];
  searchTime?: number;
}

// A2A types
export interface A2AAgent {
  id: string;
  name: string;
  status: "active" | "inactive" | "busy";
  capabilities: string[];
  endpoint?: string;
  lastSeen: number;
}

export interface A2AMessage {
  id: string;
  from: string;
  to: string;
  type: "request" | "response" | "notification";
  payload: any;
  timestamp: number;
  priority?: "low" | "normal" | "high";
}

// MCP types
export interface MCPServer {
  id: string;
  name: string;
  status: "online" | "offline" | "error";
  endpoint: string;
  toolCount: number;
  resourceCount: number;
  capabilities: string[];
}

export interface MCPTool {
  id: string;
  name: string;
  description: string;
  parameters: Record<string, any>;
  category?: string;
  server?: string;
}

export interface MCPResource {
  uri: string;
  name: string;
  description: string;
  mimeType?: string;
  type?: string;
}

// System Integration types
export interface SystemHealth {
  overall: boolean;
  services: {
    rag: boolean;
    a2a: boolean;
    mcp: boolean;
    deepseek: boolean;
  };
  details: any;
  lastCheck: number;
  overallStatus: "healthy" | "degraded" | "unhealthy";
}

// Agent name type for enhanced features
export type AgentName = 
  | "reasoning-assistant"
  | "context-analyzer" 
  | "documentation-expert"
  | "workflow-coordinator"
  | "reasoning-coordinator"
  | "RequirementDecompositionAgent"
  | "RAGContextIntegrationAgent"
  | "A2AProtocolExpertAgent"
  | "TechStackImplementationAgent_Frontend"
  | "TechStackImplementationAgent_Backend"
  | "CursorOptimizationAgent"
  | "QualityAssuranceAgent";

// Type alias for compatibility
export type VectorDatabaseType = VectorDatabase;
