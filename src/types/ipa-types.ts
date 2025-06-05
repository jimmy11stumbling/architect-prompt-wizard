
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
  | "GraphQL"
  | "REST API"
  | "Docker"
  | "Kubernetes"
  | "AWS"
  | "Azure"
  | "GCP";

export type VectorDatabase = 
  | "Chroma" 
  | "Pinecone" 
  | "Weaviate" 
  | "Qdrant" 
  | "FAISS" 
  | "PGVector"
  | "Custom"
  | "None";

export type MCPType = 
  | "Standard MCP" 
  | "Custom MCP" 
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
  agent: string; // Add this missing property
  status: "idle" | "processing" | "completed" | "error" | "failed"; // Add "failed" status
  progress: number;
  currentTask?: string;
  result?: string;
  output?: string; // Add this missing property
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

// A2A types - Export these missing types
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
  priority?: "low" | "normal" | "high"; // Fixed priority type
}

// MCP types - Export these missing types
export interface MCPServer {
  id: string;
  name: string;
  status: "online" | "offline" | "error";
  endpoint: string;
  toolCount: number;
  resourceCount: number;
}

export interface MCPTool {
  name: string;
  description: string;
  parameters: Record<string, any>;
  category?: string;
}

export interface MCPResource {
  uri: string;
  name: string;
  description: string;
  mimeType?: string;
}

// System Integration types - Export missing type
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
  | "reasoning-coordinator";
