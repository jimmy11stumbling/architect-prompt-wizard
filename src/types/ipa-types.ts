
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
}

export interface DeepSeekMessage {
  role: "system" | "user" | "assistant";
  content: string;
}

export interface DeepSeekCompletionRequest {
  model: string;
  messages: DeepSeekMessage[];
  max_tokens?: number;
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
    };
    finish_reason: string;
  }[];
  usage: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
}
