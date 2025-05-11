
export type TechStack = "React" | "Next.js" | "Vue" | "Angular" | "Express" | "NestJS" | "FastAPI" | "Django" | "PostgreSQL" | "MongoDB" | "Redis" | "Docker";

export interface ProjectSpec {
  projectDescription: string;
  frontendTechStack: TechStack[];
  backendTechStack: TechStack[];
  a2aIntegrationDetails: string;
  additionalFeatures: string;
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
  reasoningContent?: string;
}

export interface GenerationStatus {
  taskId: string;
  status: "pending" | "processing" | "completed" | "failed";
  progress: number;
  agents: AgentStatus[];
  result?: string;
  error?: string;
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
      reasoning_content: string;
    };
    finish_reason: string;
  }[];
  usage: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
}

