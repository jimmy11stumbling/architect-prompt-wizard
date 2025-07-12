
import { WorkflowDefinition, WorkflowExecution, WorkflowStep, WorkflowStepExecution } from "@/types/workflow-types";
import { realTimeResponseService } from "../integration/realTimeResponseService";
import { ragService } from "../rag/ragService";
import { a2aService } from "../a2a/a2aService";
import { mcpService } from "../mcp/mcpService";
import { DeepSeekService } from "../deepseek";
import { workflowErrorHandler } from "./workflowErrorHandler";
import { workflowNotificationService } from "./workflowNotificationService";

export class WorkflowEngine {
  private static instance: WorkflowEngine;
  private executions = new Map<string, WorkflowExecution>();
  private definitions = new Map<string, WorkflowDefinition>();

  static getInstance(): WorkflowEngine {
    if (!WorkflowEngine.instance) {
      WorkflowEngine.instance = new WorkflowEngine();
    }
    return WorkflowEngine.instance;
  }

  async executeWorkflow(workflowId: string, variables: Record<string, any> = {}): Promise<WorkflowExecution> {
    const definition = this.definitions.get(workflowId);
    if (!definition) {
      throw new Error(`Workflow ${workflowId} not found`);
    }

    const executionId = this.generateExecutionId();
    const execution: WorkflowExecution = {
      id: executionId,
      workflowId,
      status: "running",
      startedAt: Date.now(),
      steps: definition.steps.map(step => ({
        stepId: step.id,
        status: "pending",
        retryCount: 0
      })),
      variables,
      metrics: {
        totalSteps: definition.steps.length,
        completedSteps: 0,
        failedSteps: 0,
        skippedSteps: 0,
        totalDuration: 0,
        resourceUsage: { cpu: 0, memory: 0, network: 0 }
      }
    };

    this.executions.set(executionId, execution);

    realTimeResponseService.addResponse({
      source: "workflow-engine",
      status: "processing",
      message: `Starting workflow execution: ${definition.name}`,
      data: { executionId, workflowId, stepCount: definition.steps.length }
    });

    try {
      await this.executeSteps(definition, execution);
      execution.status = "completed";
      execution.completedAt = Date.now();
      execution.metrics.totalDuration = execution.completedAt - execution.startedAt;

      realTimeResponseService.addResponse({
        source: "workflow-engine",
        status: "success",
        message: `Workflow completed successfully: ${definition.name}`,
        data: { executionId, duration: execution.metrics.totalDuration }
      });

    } catch (error) {
      execution.status = "failed";
      execution.error = error instanceof Error ? error.message : String(error);
      execution.completedAt = Date.now();

      realTimeResponseService.addResponse({
        source: "workflow-engine",
        status: "error",
        message: `Workflow failed: ${definition.name}`,
        data: { executionId, error: execution.error }
      });

      throw error;
    }

    return execution;
  }

  private async executeSteps(definition: WorkflowDefinition, execution: WorkflowExecution): Promise<void> {
    const stepResults = new Map<string, any>();

    for (const step of definition.steps) {
      const stepExecution = execution.steps.find(s => s.stepId === step.id)!;
      
      // Check dependencies
      const dependenciesMet = step.dependencies.every(depId => {
        const depStep = execution.steps.find(s => s.stepId === depId);
        return depStep?.status === "completed";
      });

      if (!dependenciesMet) {
        stepExecution.status = "skipped";
        execution.metrics.skippedSteps++;
        continue;
      }

      // Check condition
      if (step.condition && !this.evaluateCondition(step.condition, execution.variables, stepResults)) {
        stepExecution.status = "skipped";
        execution.metrics.skippedSteps++;
        continue;
      }

      stepExecution.status = "running";
      stepExecution.startedAt = Date.now();

      try {
        const result = await this.executeStep(step, execution.variables, stepResults);
        stepExecution.output = result;
        stepExecution.status = "completed";
        stepExecution.completedAt = Date.now();
        stepExecution.duration = stepExecution.completedAt - stepExecution.startedAt!;
        
        stepResults.set(step.id, result);
        execution.metrics.completedSteps++;

        realTimeResponseService.addResponse({
          source: "workflow-engine",
          status: "success",
          message: `Step completed: ${step.name}`,
          data: { stepId: step.id, duration: stepExecution.duration }
        });

      } catch (error) {
        stepExecution.error = error instanceof Error ? error.message : String(error);
        stepExecution.status = "failed";
        stepExecution.completedAt = Date.now();
        execution.metrics.failedSteps++;

        // Handle error with error handler
        const recoveryStrategy = await workflowErrorHandler.handleError(
          execution,
          stepExecution,
          error instanceof Error ? error : new Error(String(error)),
          step.id
        );

        if (recoveryStrategy) {
          const recovered = await workflowErrorHandler.applyRecoveryStrategy(
            recoveryStrategy,
            execution,
            stepExecution,
            workflowErrorHandler.getErrorsForExecution(execution.id).slice(-1)[0]
          );

          if (recovered && recoveryStrategy.type === "retry") {
            // Continue the loop to retry the step
            continue;
          } else if (recovered && recoveryStrategy.type === "skip") {
            // Skip this step and continue
            break;
          }
        }

        // If no recovery or recovery failed, handle retry logic
        if (step.retryConfig && stepExecution.retryCount < step.retryConfig.maxAttempts) {
          stepExecution.retryCount++;
          await new Promise(resolve => setTimeout(resolve, step.retryConfig!.delayMs * Math.pow(step.retryConfig!.backoffMultiplier, stepExecution.retryCount - 1)));
          // Retry the step
          continue;
        } else {
          throw error;
        }
      }
    }
  }

  private async executeStep(step: WorkflowStep, variables: Record<string, any>, stepResults: Map<string, any>): Promise<any> {
    const resolvedConfig = this.resolveParameters(step.config, variables, stepResults);

    switch (step.type) {
      case "rag-query":
        return await ragService.query({
          query: resolvedConfig.query,
          limit: resolvedConfig.limit || 5,
          threshold: resolvedConfig.threshold || 0.3
        });

      case "a2a-coordinate":
        return await a2aService.delegateTask(
          resolvedConfig.task,
          resolvedConfig.capabilities || []
        );

      case "mcp-tool":
        return await mcpService.callTool(
          resolvedConfig.toolName,
          resolvedConfig.parameters || {}
        );

      case "deepseek-reason":
        await DeepSeekService.processQuery(resolvedConfig.prompt, {
          ragEnabled: resolvedConfig.ragEnabled || false,
          temperature: 0.1
        });
        return { success: true, reasoning: "DeepSeek reasoning completed" };

      case "http-request":
        return await this.executeHttpRequest(resolvedConfig);

      case "data-transform":
        return this.executeDataTransform(resolvedConfig, stepResults);

      case "condition":
        return this.evaluateCondition(resolvedConfig.condition, variables, stepResults);

      case "notification":
        return await this.sendNotification(resolvedConfig);

      default:
        throw new Error(`Unsupported step type: ${step.type}`);
    }
  }

  private async executeHttpRequest(config: any): Promise<any> {
    const response = await fetch(config.url, {
      method: config.method || "GET",
      headers: config.headers || {},
      body: config.body ? JSON.stringify(config.body) : undefined
    });

    if (!response.ok) {
      throw new Error(`HTTP request failed: ${response.status} ${response.statusText}`);
    }

    return config.parseResponse ? await response.json() : await response.text();
  }

  private executeDataTransform(config: any, stepResults: Map<string, any>): any {
    const data = stepResults.get(config.sourceStepId);
    if (!data) {
      throw new Error(`Source step ${config.sourceStepId} not found`);
    }

    // Simple transformation logic - can be extended
    switch (config.operation) {
      case "map":
        return Array.isArray(data) ? data.map(item => this.applyMapping(item, config.mapping)) : this.applyMapping(data, config.mapping);
      case "filter":
        return Array.isArray(data) ? data.filter(item => this.evaluateCondition(config.condition, item, stepResults)) : data;
      case "reduce":
        return Array.isArray(data) ? data.reduce((acc, item) => acc + (item[config.field] || 0), 0) : data;
      default:
        return data;
    }
  }

  private applyMapping(data: any, mapping: Record<string, string>): any {
    const result: any = {};
    for (const [targetKey, sourceKey] of Object.entries(mapping)) {
      result[targetKey] = data[sourceKey];
    }
    return result;
  }

  private async sendNotification(config: any): Promise<any> {
    // Simulate notification sending
    console.log(`Sending ${config.type} notification:`, config.message);
    return { sent: true, type: config.type };
  }

  private evaluateCondition(condition: any, variables: Record<string, any>, stepResults: Map<string, any>): boolean {
    const value = variables[condition.field] || stepResults.get(condition.field);
    
    switch (condition.operator) {
      case "equals":
        return value === condition.value;
      case "not_equals":
        return value !== condition.value;
      case "contains":
        return String(value).includes(String(condition.value));
      case "greater_than":
        return Number(value) > Number(condition.value);
      case "less_than":
        return Number(value) < Number(condition.value);
      case "exists":
        return value !== undefined && value !== null;
      default:
        return false;
    }
  }

  private resolveParameters(config: any, variables: Record<string, any>, stepResults: Map<string, any>): any {
    const resolved = { ...config };
    
    for (const [key, value] of Object.entries(resolved)) {
      if (typeof value === "string" && value.startsWith("${") && value.endsWith("}")) {
        const varName = value.slice(2, -1);
        resolved[key] = variables[varName] || stepResults.get(varName) || value;
      }
    }
    
    return resolved;
  }

  registerWorkflow(definition: WorkflowDefinition): void {
    this.definitions.set(definition.id, definition);
    
    realTimeResponseService.addResponse({
      source: "workflow-engine",
      status: "success",
      message: `Workflow registered: ${definition.name}`,
      data: { workflowId: definition.id, version: definition.version }
    });
  }

  getWorkflow(id: string): WorkflowDefinition | undefined {
    return this.definitions.get(id);
  }

  getAllWorkflows(): WorkflowDefinition[] {
    return Array.from(this.definitions.values());
  }

  getExecution(id: string): WorkflowExecution | undefined {
    return this.executions.get(id);
  }

  getAllExecutions(): WorkflowExecution[] {
    return Array.from(this.executions.values());
  }

  private generateExecutionId(): string {
    return `exec_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  // Additional execution methods for enhanced functionality
  async pauseExecution(executionId: string): Promise<void> {
    const execution = this.executions.get(executionId);
    if (execution && execution.status === "running") {
      execution.status = "paused";
      realTimeResponseService.addResponse({
        source: "workflow-engine",
        status: "info",
        message: `Workflow execution paused: ${executionId}`,
        data: { executionId }
      });
    }
  }

  async resumeExecution(executionId: string): Promise<void> {
    const execution = this.executions.get(executionId);
    if (execution && execution.status === "paused") {
      execution.status = "running";
      realTimeResponseService.addResponse({
        source: "workflow-engine",
        status: "info",
        message: `Workflow execution resumed: ${executionId}`,
        data: { executionId }
      });
    }
  }

  async cancelExecution(executionId: string): Promise<void> {
    const execution = this.executions.get(executionId);
    if (execution && (execution.status === "running" || execution.status === "paused")) {
      execution.status = "cancelled";
      execution.completedAt = Date.now();
      realTimeResponseService.addResponse({
        source: "workflow-engine",
        status: "warning",
        message: `Workflow execution cancelled: ${executionId}`,
        data: { executionId }
      });
    }
  }

  private async executeParallelSteps(config: any, variables: Record<string, any>, stepResults: Map<string, any>): Promise<any> {
    const parallelSteps = config.steps || [];
    const promises = parallelSteps.map(async (stepConfig: any) => {
      try {
        return await this.executeStep({
          id: stepConfig.id,
          name: stepConfig.name,
          type: stepConfig.type,
          config: stepConfig.config
        } as WorkflowStep, variables, stepResults);
      } catch (error) {
        return { error: error instanceof Error ? error.message : String(error) };
      }
    });

    const results = await Promise.allSettled(promises);
    return {
      results: results.map((result, index) => ({
        stepId: parallelSteps[index].id,
        status: result.status,
        value: result.status === 'fulfilled' ? result.value : result.reason
      }))
    };
  }

  private async executeLoopStep(config: any, variables: Record<string, any>, stepResults: Map<string, any>): Promise<any> {
    const results = [];
    const loopVariable = config.loopVariable || 'item';
    const loopData = variables[config.dataSource] || config.staticData || [];
    const maxIterations = config.maxIterations || 100;

    for (let i = 0; i < Math.min(loopData.length, maxIterations); i++) {
      const loopVars = {
        ...variables,
        [loopVariable]: loopData[i],
        loopIndex: i
      };

      try {
        const result = await this.executeStep({
          id: `loop_${i}`,
          name: `Loop iteration ${i}`,
          type: config.stepType,
          config: config.stepConfig
        } as WorkflowStep, loopVars, stepResults);

        results.push({ index: i, result });
      } catch (error) {
        results.push({ 
          index: i, 
          error: error instanceof Error ? error.message : String(error) 
        });
        
        if (config.stopOnError) {
          break;
        }
      }
    }

    return { iterations: results.length, results };
  }
}

export const workflowEngine = WorkflowEngine.getInstance();
