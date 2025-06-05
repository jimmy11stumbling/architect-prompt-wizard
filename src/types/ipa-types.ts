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
  | "Express"
  | "FastAPI"
  | "Django"
  | "Node.js"
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
  | "GraphQL"
  | "REST API"
  | "Docker"
  | "Kubernetes"
  | "AWS"
  | "Azure"
  | "GCP";

export type VectorDatabase = "Chroma" | "Pinecone" | "Weaviate" | "Qdrant" | "FAISS" | "Custom";
export type MCPType = "Standard MCP" | "Custom MCP" | "Enterprise MCP";

export interface AgentStatus {
  id: string;
  name: string;
  status: "idle" | "processing" | "completed" | "error";
  progress: number;
  currentTask?: string;
  result?: string;
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

// Fixed RAG types
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
