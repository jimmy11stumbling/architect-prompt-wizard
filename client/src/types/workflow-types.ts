
export interface WorkflowStep {
  id: string;
  name: string;
  type: WorkflowStepType;
  description?: string;
  config: Record<string, any>;
  dependencies: string[];
  retryConfig?: RetryConfig;
  timeoutMs?: number;
  condition?: WorkflowCondition;
}

export type WorkflowStepType = 
  | "rag-query"
  | "a2a-coordinate"
  | "mcp-tool"
  | "deepseek-reason"
  | "http-request"
  | "data-transform"
  | "condition"
  | "loop"
  | "parallel"
  | "notification"
  | "database-query"
  | "file-operation"
  | "approval";

export interface WorkflowDefinition {
  id: string;
  name: string;
  description: string;
  version: string;
  author: string;
  tags: string[];
  steps: WorkflowStep[];
  variables: WorkflowVariable[];
  triggers: WorkflowTrigger[];
  schedule?: WorkflowSchedule;
  createdAt: number;
  updatedAt: number;
  status: "draft" | "published" | "deprecated";
}

export interface WorkflowVariable {
  name: string;
  type: "string" | "number" | "boolean" | "object" | "array";
  value: any;
  description?: string;
  required: boolean;
}

export interface WorkflowTrigger {
  type: "manual" | "schedule" | "webhook" | "event";
  config: Record<string, any>;
}

export interface WorkflowSchedule {
  cron: string;
  timezone: string;
  enabled: boolean;
}

export interface WorkflowCondition {
  field: string;
  operator: "equals" | "not_equals" | "contains" | "greater_than" | "less_than" | "exists";
  value: any;
}

export interface RetryConfig {
  maxAttempts: number;
  delayMs: number;
  backoffMultiplier: number;
}

export interface WorkflowExecution {
  id: string;
  workflowId: string;
  status: "queued" | "running" | "completed" | "failed" | "cancelled";
  startedAt: number;
  completedAt?: number;
  steps: WorkflowStepExecution[];
  variables: Record<string, any>;
  error?: string;
  result?: any;
  metrics: WorkflowMetrics;
}

export interface WorkflowStepExecution {
  stepId: string;
  status: "pending" | "running" | "completed" | "failed" | "skipped";
  startedAt?: number;
  completedAt?: number;
  output?: any;
  error?: string;
  retryCount: number;
  duration?: number;
}

export interface WorkflowMetrics {
  totalSteps: number;
  completedSteps: number;
  failedSteps: number;
  skippedSteps: number;
  totalDuration: number;
  resourceUsage: {
    cpu: number;
    memory: number;
    network: number;
  };
}

export interface WorkflowTemplate {
  id: string;
  name: string;
  description: string;
  category: string;
  definition: Partial<WorkflowDefinition>;
  preview: string;
  difficulty: "beginner" | "intermediate" | "advanced";
  tags: string[];
}
