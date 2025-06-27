
export interface AgentNode {
  id: string;
  name: string;
  type: "reasoning" | "rag" | "mcp" | "a2a" | "coordinator";
  status: "idle" | "processing" | "completed" | "failed" | "waiting";
  progress: number;
  dependencies: string[];
  outputs: string[];
  performance: {
    avgProcessingTime: number;
    successRate: number;
    totalTasks: number;
  };
  currentTask?: string;
  lastUpdate: number;
}

export interface WorkflowExecution {
  id: string;
  name: string;
  status: "running" | "paused" | "completed" | "failed";
  startTime: number;
  currentStep: number;
  totalSteps: number;
  agents: AgentNode[];
}

export interface WorkflowMetrics {
  totalExecutions: number;
  successRate: number;
  avgExecutionTime: number;
  activeAgents: number;
}
