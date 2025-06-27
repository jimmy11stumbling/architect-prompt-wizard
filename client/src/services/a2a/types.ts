
export interface A2AAgent {
  id: string;
  name: string;
  capabilities: string[];
  status: "active" | "busy" | "inactive";
  specialization: string;
  performance: {
    tasksCompleted: number;
    successRate: number;
    averageResponseTime: number;
  };
}

export interface A2ATask {
  id: string;
  description: string;
  requiredCapabilities: string[];
  priority: "low" | "medium" | "high";
  deadline?: number;
  context?: Record<string, any>;
}

export interface A2ACoordinationResult {
  taskId: string;
  assignedAgent: A2AAgent;
  estimatedCompletionTime: number;
  coordinationStrategy: string;
  result?: any;
}
