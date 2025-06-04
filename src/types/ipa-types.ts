
export type TechStack = "React" | "Next.js" | "Vue" | "Angular" | "Svelte" | "Nuxt.js" | "Gatsby" | "Remix" |
  "Express" | "NestJS" | "FastAPI" | "Django" | "Flask" | "Spring Boot" | "Laravel" | "Ruby on Rails" | "ASP.NET Core" | "Koa.js" | "Hapi.js" |
  "PostgreSQL" | "MongoDB" | "Redis" | "MySQL" | "SQLite" | "Supabase" | "Firebase" | "DynamoDB" | "CouchDB" | "Cassandra" |
  "Docker" | "Kubernetes" | "GraphQL" | "REST API" | "WebSockets" | "Microservices" | "Serverless" | "AWS" | "Google Cloud" | "Azure" | string;

export type VectorDatabaseType = "Pinecone" | "Weaviate" | "Milvus" | "Qdrant" | "Chroma" | "PGVector" | "FAISS" | "Elasticsearch" | "OpenSearch" | "None" | string;

export type MCPType = "Standard MCP" | "Extended MCP" | "MCP with Tools" | "MCP with Resources" | "MCP with Prompts" | "MCP with Sampling" | "Custom MCP Implementation" | "None" | string;

export interface ProjectSpec {
  projectDescription: string;
  frontendTechStack: TechStack[];
  backendTechStack: TechStack[];
  customFrontendTech: string[];
  customBackendTech: string[];
  a2aIntegrationDetails: string;
  additionalFeatures: string;
  ragVectorDb: VectorDatabaseType;
  customRagVectorDb: string;
  mcpType: MCPType;
  customMcpType: string;
  advancedPromptDetails: string;
  deploymentPreference?: string;
  authenticationMethod?: string;
  performanceRequirements?: string;
  securityConsiderations?: string;
}

export type AgentName = 
  | "RequirementDecompositionAgent" 
  | "RAGContextIntegrationAgent" 
  | "A2AProtocolExpertAgent" 
  | "TechStackImplementationAgent_Frontend" 
  | "TechStackImplementationAgent_Backend" 
  | "CursorOptimizationAgent" 
  | "QualityAssuranceAgent";

export interface AgentStatus {
  agent: AgentName;
  status: "idle" | "processing" | "completed" | "failed";
  output?: string;
  reasoning?: string; // Add reasoning content support
}

export interface GenerationStatus {
  taskId: string;
  status: "pending" | "processing" | "completed" | "failed";
  progress: number;
  agents: AgentStatus[];
  result?: string;
  error?: string;
  spec?: ProjectSpec;
  messages?: DeepSeekMessage[];
  reasoningHistory?: ReasoningStep[]; // Add reasoning history
}

export interface DeepSeekMessage {
  role: "system" | "user" | "assistant";
  content: string;
  reasoning_content?: string; // Add reasoning content support
}

export interface ReasoningStep {
  agent: AgentName;
  reasoning: string;
  timestamp: number;
}

export interface DeepSeekCompletionRequest {
  model: string;
  messages: DeepSeekMessage[];
  max_tokens?: number;
  temperature?: number; // Not supported for deepseek-reasoner
  top_p?: number; // Not supported for deepseek-reasoner
  frequency_penalty?: number; // Not supported for deepseek-reasoner
  presence_penalty?: number; // Not supported for deepseek-reasoner
}

export interface DeepSeekCompletionResponse {
  id: string;
  object: string;
  created: number;
  model: string;
  choices: {
    index: number;
    message: {
      role: string;
      content: string;
      reasoning_content?: string; // Add reasoning content support
    };
    finish_reason: string;
  }[];
  usage: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
    reasoning_tokens?: number; // Add reasoning tokens tracking
  };
}

// Add MCP and A2A related types
export interface MCPServer {
  id: string;
  name: string;
  endpoint: string;
  capabilities: string[];
  status: "active" | "inactive" | "error";
}

export interface A2AAgent {
  id: string;
  name: string;
  capabilities: string[];
  endpoint: string;
  status: "online" | "offline" | "busy";
}

export interface RAGDocument {
  id: string;
  title: string;
  content: string;
  embedding?: number[];
  metadata: Record<string, any>;
  source: string;
}

export interface RAGQuery {
  query: string;
  filters?: Record<string, any>;
  limit?: number;
  threshold?: number;
}

export interface RAGResult {
  documents: RAGDocument[];
  scores: number[];
  query: string;
  totalResults: number;
}
