
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
}

export interface GenerationStatus {
  taskId: string;
  status: "pending" | "processing" | "completed" | "failed";
  progress: number;
  agents: AgentStatus[];
  result?: string;
  error?: string;
}
