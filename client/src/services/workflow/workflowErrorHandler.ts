import { WorkflowExecution, WorkflowStepExecution } from "@/types/workflow-types";
import { realTimeResponseService } from "../integration/realTimeResponseService";

export interface WorkflowError {
  id: string;
  executionId: string;
  stepId?: string;
  type: "validation" | "execution" | "timeout" | "network" | "system";
  severity: "low" | "medium" | "high" | "critical";
  message: string;
  details?: any;
  timestamp: number;
  resolved: boolean;
  retryCount: number;
  maxRetries: number;
}

export interface ErrorRecoveryStrategy {
  type: "retry" | "skip" | "rollback" | "alternative" | "manual";
  config: any;
}

export class WorkflowErrorHandler {
  private static instance: WorkflowErrorHandler;
  private errors = new Map<string, WorkflowError>();
  private recoveryStrategies = new Map<string, ErrorRecoveryStrategy>();

  static getInstance(): WorkflowErrorHandler {
    if (!WorkflowErrorHandler.instance) {
      WorkflowErrorHandler.instance = new WorkflowErrorHandler();
    }
    return WorkflowErrorHandler.instance;
  }

  constructor() {
    this.initializeDefaultStrategies();
  }

  private initializeDefaultStrategies() {
    // Network error recovery
    this.recoveryStrategies.set("network", {
      type: "retry",
      config: {
        maxRetries: 3,
        delayMs: 1000,
        backoffMultiplier: 2,
        retryCondition: (error: any) => error.code === "NETWORK_ERROR"
      }
    });

    // Timeout error recovery
    this.recoveryStrategies.set("timeout", {
      type: "retry",
      config: {
        maxRetries: 2,
        delayMs: 5000,
        timeoutMs: 30000
      }
    });

    // Validation error recovery
    this.recoveryStrategies.set("validation", {
      type: "skip",
      config: {
        skipStep: true,
        logWarning: true
      }
    });

    // System error recovery
    this.recoveryStrategies.set("system", {
      type: "alternative",
      config: {
        fallbackSteps: [],
        notifyUser: true
      }
    });
  }

  async handleError(
    execution: WorkflowExecution,
    stepExecution: WorkflowStepExecution,
    error: Error,
    stepId?: string
  ): Promise<ErrorRecoveryStrategy | null> {
    const workflowError: WorkflowError = {
      id: this.generateErrorId(),
      executionId: execution.id,
      stepId,
      type: this.classifyError(error),
      severity: this.determineSeverity(error),
      message: error.message,
      details: {
        stack: error.stack,
        stepName: stepId,
        executionContext: {
          workflowId: execution.workflowId,
          variables: execution.variables,
          currentStep: stepExecution.stepId
        }
      },
      timestamp: Date.now(),
      resolved: false,
      retryCount: stepExecution.retryCount,
      maxRetries: 3
    };

    this.errors.set(workflowError.id, workflowError);

    // Log error for monitoring
    realTimeResponseService.addResponse({
      source: "workflow-error-handler",
      status: "error",
      message: `Workflow error: ${error.message}`,
      data: {
        errorId: workflowError.id,
        type: workflowError.type,
        severity: workflowError.severity,
        stepId: stepId,
        executionId: execution.id
      }
    });

    // Get recovery strategy
    const strategy = this.getRecoveryStrategy(workflowError);
    
    if (strategy) {
      realTimeResponseService.addResponse({
        source: "workflow-error-handler",
        status: "info",
        message: `Applying recovery strategy: ${strategy.type}`,
        data: {
          errorId: workflowError.id,
          strategy: strategy.type,
          config: strategy.config
        }
      });
    }

    return strategy;
  }

  private classifyError(error: Error): WorkflowError["type"] {
    const message = error.message.toLowerCase();
    
    if (message.includes("network") || message.includes("fetch") || message.includes("connection")) {
      return "network";
    }
    if (message.includes("timeout") || message.includes("deadline")) {
      return "timeout";
    }
    if (message.includes("validation") || message.includes("invalid") || message.includes("required")) {
      return "validation";
    }
    if (message.includes("system") || message.includes("internal") || message.includes("server")) {
      return "system";
    }
    
    return "execution";
  }

  private determineSeverity(error: Error): WorkflowError["severity"] {
    const message = error.message.toLowerCase();
    
    if (message.includes("critical") || message.includes("fatal") || message.includes("crash")) {
      return "critical";
    }
    if (message.includes("error") || message.includes("failed") || message.includes("exception")) {
      return "high";
    }
    if (message.includes("warning") || message.includes("deprecated")) {
      return "medium";
    }
    
    return "low";
  }

  private getRecoveryStrategy(error: WorkflowError): ErrorRecoveryStrategy | null {
    const strategy = this.recoveryStrategies.get(error.type);
    
    if (!strategy) {
      return null;
    }

    // Check if we should apply the strategy based on retry count
    if (strategy.type === "retry" && error.retryCount >= error.maxRetries) {
      return {
        type: "skip",
        config: { reason: "max_retries_exceeded" }
      };
    }

    return strategy;
  }

  async applyRecoveryStrategy(
    strategy: ErrorRecoveryStrategy,
    execution: WorkflowExecution,
    stepExecution: WorkflowStepExecution,
    error: WorkflowError
  ): Promise<boolean> {
    try {
      switch (strategy.type) {
        case "retry":
          return await this.applyRetryStrategy(strategy, execution, stepExecution, error);
        
        case "skip":
          return await this.applySkipStrategy(strategy, execution, stepExecution, error);
        
        case "rollback":
          return await this.applyRollbackStrategy(strategy, execution, stepExecution, error);
        
        case "alternative":
          return await this.applyAlternativeStrategy(strategy, execution, stepExecution, error);
        
        case "manual":
          return await this.applyManualStrategy(strategy, execution, stepExecution, error);
        
        default:
          return false;
      }
    } catch (recoveryError) {
      realTimeResponseService.addResponse({
        source: "workflow-error-handler",
        status: "error",
        message: `Recovery strategy failed: ${recoveryError}`,
        data: { errorId: error.id, strategy: strategy.type }
      });
      return false;
    }
  }

  private async applyRetryStrategy(
    strategy: ErrorRecoveryStrategy,
    execution: WorkflowExecution,
    stepExecution: WorkflowStepExecution,
    error: WorkflowError
  ): Promise<boolean> {
    const { delayMs = 1000, backoffMultiplier = 1 } = strategy.config;
    const delay = delayMs * Math.pow(backoffMultiplier, error.retryCount);
    
    await new Promise(resolve => setTimeout(resolve, delay));
    
    stepExecution.retryCount++;
    stepExecution.status = "pending";
    
    realTimeResponseService.addResponse({
      source: "workflow-error-handler",
      status: "info",
      message: `Retrying step after ${delay}ms delay (attempt ${stepExecution.retryCount})`,
      data: { 
        errorId: error.id, 
        retryCount: stepExecution.retryCount,
        delay 
      }
    });
    
    return true;
  }

  private async applySkipStrategy(
    strategy: ErrorRecoveryStrategy,
    execution: WorkflowExecution,
    stepExecution: WorkflowStepExecution,
    error: WorkflowError
  ): Promise<boolean> {
    stepExecution.status = "skipped";
    execution.metrics.skippedSteps++;
    
    if (strategy.config.logWarning) {
      realTimeResponseService.addResponse({
        source: "workflow-error-handler",
        status: "warning",
        message: `Step skipped due to error: ${error.message}`,
        data: { errorId: error.id, stepId: stepExecution.stepId }
      });
    }
    
    return true;
  }

  private async applyRollbackStrategy(
    strategy: ErrorRecoveryStrategy,
    execution: WorkflowExecution,
    stepExecution: WorkflowStepExecution,
    error: WorkflowError
  ): Promise<boolean> {
    // Implement rollback logic
    const rollbackSteps = strategy.config.rollbackSteps || 1;
    
    realTimeResponseService.addResponse({
      source: "workflow-error-handler",
      status: "warning",
      message: `Rolling back ${rollbackSteps} steps due to error`,
      data: { errorId: error.id, rollbackSteps }
    });
    
    // Mark previous steps for re-execution
    const currentIndex = execution.steps.findIndex(s => s.stepId === stepExecution.stepId);
    const startIndex = Math.max(0, currentIndex - rollbackSteps);
    
    for (let i = startIndex; i <= currentIndex; i++) {
      execution.steps[i].status = "pending";
      execution.steps[i].retryCount = 0;
    }
    
    return true;
  }

  private async applyAlternativeStrategy(
    strategy: ErrorRecoveryStrategy,
    execution: WorkflowExecution,
    stepExecution: WorkflowStepExecution,
    error: WorkflowError
  ): Promise<boolean> {
    const { fallbackSteps = [], notifyUser = false } = strategy.config;
    
    if (fallbackSteps.length > 0) {
      realTimeResponseService.addResponse({
        source: "workflow-error-handler",
        status: "info",
        message: `Using alternative execution path with ${fallbackSteps.length} fallback steps`,
        data: { errorId: error.id, fallbackSteps }
      });
    }
    
    if (notifyUser) {
      realTimeResponseService.addResponse({
        source: "workflow-error-handler",
        status: "warning",
        message: `User intervention may be required for error: ${error.message}`,
        data: { errorId: error.id, severity: error.severity }
      });
    }
    
    return true;
  }

  private async applyManualStrategy(
    strategy: ErrorRecoveryStrategy,
    execution: WorkflowExecution,
    stepExecution: WorkflowStepExecution,
    error: WorkflowError
  ): Promise<boolean> {
    execution.status = "paused";
    
    realTimeResponseService.addResponse({
      source: "workflow-error-handler",
      status: "warning",
      message: `Workflow paused for manual intervention: ${error.message}`,
      data: { 
        errorId: error.id, 
        executionId: execution.id,
        requiresManualAction: true 
      }
    });
    
    return false; // Don't continue automatically
  }

  getError(errorId: string): WorkflowError | undefined {
    return this.errors.get(errorId);
  }

  getAllErrors(): WorkflowError[] {
    return Array.from(this.errors.values());
  }

  getErrorsForExecution(executionId: string): WorkflowError[] {
    return Array.from(this.errors.values()).filter(error => error.executionId === executionId);
  }

  resolveError(errorId: string): void {
    const error = this.errors.get(errorId);
    if (error) {
      error.resolved = true;
      realTimeResponseService.addResponse({
        source: "workflow-error-handler",
        status: "success",
        message: `Error resolved: ${error.message}`,
        data: { errorId, resolvedAt: Date.now() }
      });
    }
  }

  private generateErrorId(): string {
    return `error_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  // Add recovery strategy
  addRecoveryStrategy(errorType: string, strategy: ErrorRecoveryStrategy): void {
    this.recoveryStrategies.set(errorType, strategy);
  }

  // Get error statistics
  getErrorStatistics(): {
    total: number;
    byType: Record<string, number>;
    bySeverity: Record<string, number>;
    resolved: number;
    unresolved: number;
  } {
    const errors = Array.from(this.errors.values());
    
    return {
      total: errors.length,
      byType: errors.reduce((acc, error) => {
        acc[error.type] = (acc[error.type] || 0) + 1;
        return acc;
      }, {} as Record<string, number>),
      bySeverity: errors.reduce((acc, error) => {
        acc[error.severity] = (acc[error.severity] || 0) + 1;
        return acc;
      }, {} as Record<string, number>),
      resolved: errors.filter(e => e.resolved).length,
      unresolved: errors.filter(e => !e.resolved).length
    };
  }
}

export const workflowErrorHandler = WorkflowErrorHandler.getInstance();