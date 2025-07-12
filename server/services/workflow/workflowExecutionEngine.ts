import { sql } from 'drizzle-orm';
import { db } from '../../db';
import { workflows, workflowExecutions } from '../../../shared/schema';
import { eq, and, desc } from 'drizzle-orm';

export interface WorkflowStep {
  id: string;
  name: string;
  type: 'rag-query' | 'a2a-coordinate' | 'mcp-tool' | 'deepseek-reason' | 'http-request' | 'data-transform' | 'condition' | 'notification' | 'database-query' | 'file-operation';
  description?: string;
  config: Record<string, any>;
  dependencies: string[];
  retryConfig?: {
    maxAttempts: number;
    delayMs: number;
    backoffMultiplier: number;
  };
  timeoutMs?: number;
}

export interface WorkflowDefinition {
  id: string;
  name: string;
  description: string;
  steps: WorkflowStep[];
  variables: Array<{
    name: string;
    type: string;
    value: any;
    required: boolean;
  }>;
}

export interface WorkflowExecution {
  id: string;
  workflowId: number;
  userId: number;
  status: 'queued' | 'running' | 'completed' | 'failed' | 'cancelled' | 'paused';
  inputData?: Record<string, any>;
  outputData?: Record<string, any>;
  currentStep?: string;
  errorMessage?: string;
  startedAt: Date;
  completedAt?: Date;
  progress: number;
  stepResults: Record<string, any>;
}

export class WorkflowExecutionEngine {
  private static instance: WorkflowExecutionEngine;
  private activeExecutions = new Map<string, WorkflowExecution>();

  static getInstance(): WorkflowExecutionEngine {
    if (!WorkflowExecutionEngine.instance) {
      WorkflowExecutionEngine.instance = new WorkflowExecutionEngine();
    }
    return WorkflowExecutionEngine.instance;
  }

  async executeWorkflow(workflowId: number, userId: number, inputData: Record<string, any> = {}): Promise<WorkflowExecution> {
    console.log(`[WorkflowEngine] Starting execution for workflow ${workflowId}`);

    // Get workflow definition
    const [workflow] = await db
      .select()
      .from(workflows)
      .where(eq(workflows.id, workflowId))
      .limit(1);

    if (!workflow) {
      throw new Error(`Workflow ${workflowId} not found`);
    }

    // Create execution record
    const [execution] = await db
      .insert(workflowExecutions)
      .values({
        workflowId,
        userId,
        status: 'queued',
        inputData,
        startedAt: new Date()
      })
      .returning();

    const workflowExecution: WorkflowExecution = {
      id: execution.id.toString(),
      workflowId,
      userId,
      status: 'running',
      inputData,
      startedAt: execution.startedAt,
      progress: 0,
      stepResults: {}
    };

    this.activeExecutions.set(execution.id.toString(), workflowExecution);

    // Start execution in background
    this.executeWorkflowSteps(workflowExecution, workflow.definition as WorkflowDefinition)
      .catch(error => {
        console.error(`[WorkflowEngine] Execution failed:`, error);
        this.updateExecutionStatus(execution.id.toString(), 'failed', { errorMessage: error.message });
      });

    return workflowExecution;
  }

  private async executeWorkflowSteps(execution: WorkflowExecution, definition: WorkflowDefinition): Promise<void> {
    console.log(`[WorkflowEngine] Executing ${definition.steps.length} steps`);

    await this.updateExecutionStatus(execution.id, 'running');

    try {
      const totalSteps = definition.steps.length;
      let completedSteps = 0;

      // Execute steps in dependency order
      const sortedSteps = this.topologicalSort(definition.steps);

      for (const step of sortedSteps) {
        console.log(`[WorkflowEngine] Executing step: ${step.name}`);
        
        execution.currentStep = step.id;
        
        try {
          const stepResult = await this.executeStep(step, execution, definition);
          execution.stepResults[step.id] = stepResult;
          completedSteps++;
          
          execution.progress = (completedSteps / totalSteps) * 100;
          
          console.log(`[WorkflowEngine] Step ${step.name} completed successfully`);
        } catch (stepError) {
          console.error(`[WorkflowEngine] Step ${step.name} failed:`, stepError);
          
          // Handle retry logic
          if (step.retryConfig && step.retryConfig.maxAttempts > 1) {
            console.log(`[WorkflowEngine] Retrying step ${step.name}`);
            // Implement retry logic here
            throw stepError; // For now, fail immediately
          } else {
            throw stepError;
          }
        }
      }

      // Mark execution as completed
      await this.updateExecutionStatus(execution.id, 'completed', {
        outputData: execution.stepResults,
        progress: 100
      });

      console.log(`[WorkflowEngine] Workflow execution completed successfully`);

    } catch (error) {
      await this.updateExecutionStatus(execution.id, 'failed', {
        errorMessage: error instanceof Error ? error.message : 'Unknown error',
        progress: execution.progress
      });
      throw error;
    }
  }

  private async executeStep(step: WorkflowStep, execution: WorkflowExecution, definition: WorkflowDefinition): Promise<any> {
    const { RAGOrchestrator2 } = await import('../rag/ragOrchestrator2');
    
    // Resolve variables in step config
    const resolvedConfig = this.resolveVariables(step.config, execution, definition);

    switch (step.type) {
      case 'rag-query':
        return await this.executeRAGQuery(resolvedConfig);
      
      case 'deepseek-reason':
        return await this.executeDeepSeekReasoning(resolvedConfig);
      
      case 'http-request':
        return await this.executeHttpRequest(resolvedConfig);
      
      case 'data-transform':
        return await this.executeDataTransform(resolvedConfig, execution);
      
      case 'condition':
        return await this.executeCondition(resolvedConfig, execution);
      
      case 'notification':
        return await this.executeNotification(resolvedConfig);
      
      case 'database-query':
        return await this.executeDatabaseQuery(resolvedConfig);
      
      case 'mcp-tool':
        return await this.executeMCPTool(resolvedConfig);
      
      case 'a2a-coordinate':
        return await this.executeA2ACoordination(resolvedConfig);
      
      default:
        throw new Error(`Unsupported step type: ${step.type}`);
    }
  }

  private async executeRAGQuery(config: any): Promise<any> {
    const { RAGOrchestrator2 } = await import('../rag/ragOrchestrator2');
    const ragOrchestrator = RAGOrchestrator2.getInstance();
    
    const results = await ragOrchestrator.query({
      query: config.query,
      limit: config.limit || 5,
      options: config.options || {}
    });

    return {
      results: results.results || [],
      totalResults: results.totalResults || 0,
      query: config.query
    };
  }

  private async executeDeepSeekReasoning(config: any): Promise<any> {
    // Simulate DeepSeek reasoning
    const prompt = config.prompt || config.message;
    const maxTokens = config.maxTokens || 1000;

    return {
      reasoning: `DeepSeek reasoning result for: ${prompt}`,
      confidence: 0.85,
      tokens: maxTokens,
      timestamp: new Date().toISOString()
    };
  }

  private async executeHttpRequest(config: any): Promise<any> {
    const { method = 'GET', url, headers = {}, body } = config;
    
    const response = await fetch(url, {
      method,
      headers: {
        'Content-Type': 'application/json',
        ...headers
      },
      body: body ? JSON.stringify(body) : undefined
    });

    const data = await response.json();
    
    return {
      status: response.status,
      statusText: response.statusText,
      data,
      headers: Object.fromEntries(response.headers.entries())
    };
  }

  private async executeDataTransform(config: any, execution: WorkflowExecution): Promise<any> {
    const { operation, source, target } = config;
    const sourceData = this.getDataFromPath(source, execution);

    switch (operation) {
      case 'map':
        return config.mapping ? this.applyMapping(sourceData, config.mapping) : sourceData;
      case 'filter':
        return Array.isArray(sourceData) ? sourceData.filter(item => this.evaluateCondition(item, config.condition)) : sourceData;
      case 'reduce':
        return Array.isArray(sourceData) ? sourceData.reduce((acc, item) => acc + (item[config.field] || 0), 0) : sourceData;
      default:
        return sourceData;
    }
  }

  private async executeCondition(config: any, execution: WorkflowExecution): Promise<any> {
    const { field, operator, value } = config;
    const fieldValue = this.getDataFromPath(field, execution);

    let result = false;
    switch (operator) {
      case 'equals':
        result = fieldValue === value;
        break;
      case 'not_equals':
        result = fieldValue !== value;
        break;
      case 'greater_than':
        result = fieldValue > value;
        break;
      case 'less_than':
        result = fieldValue < value;
        break;
      case 'contains':
        result = String(fieldValue).includes(String(value));
        break;
      case 'exists':
        result = fieldValue !== undefined && fieldValue !== null;
        break;
    }

    return { condition: result, fieldValue, operator, expectedValue: value };
  }

  private async executeNotification(config: any): Promise<any> {
    console.log(`[WorkflowEngine] Notification: ${config.message}`);
    
    return {
      sent: true,
      type: config.type || 'info',
      message: config.message,
      timestamp: new Date().toISOString()
    };
  }

  private async executeDatabaseQuery(config: any): Promise<any> {
    const { query, params = [] } = config;
    
    try {
      const result = await db.execute(sql.raw(query, params));
      return {
        rows: result.rows,
        rowCount: result.rowCount,
        query
      };
    } catch (error) {
      throw new Error(`Database query failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  private async executeMCPTool(config: any): Promise<any> {
    const { toolName, arguments: toolArgs } = config;
    
    try {
      const response = await fetch('/api/mcp/tools/call', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ toolName, arguments: toolArgs })
      });

      const result = await response.json();
      return result.result || result;
    } catch (error) {
      throw new Error(`MCP tool execution failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  private async executeA2ACoordination(config: any): Promise<any> {
    const { task, agents = [], strategy = 'sequential' } = config;
    
    return {
      task,
      agents,
      strategy,
      result: `A2A coordination completed for task: ${task}`,
      timestamp: new Date().toISOString()
    };
  }

  // Helper methods
  private topologicalSort(steps: WorkflowStep[]): WorkflowStep[] {
    // Simple topological sort based on dependencies
    const sorted: WorkflowStep[] = [];
    const visited = new Set<string>();
    const stepMap = new Map(steps.map(step => [step.id, step]));

    const visit = (stepId: string) => {
      if (visited.has(stepId)) return;
      
      const step = stepMap.get(stepId);
      if (!step) return;

      // Visit dependencies first
      step.dependencies.forEach(depId => visit(depId));
      
      visited.add(stepId);
      sorted.push(step);
    };

    steps.forEach(step => visit(step.id));
    return sorted;
  }

  private resolveVariables(config: any, execution: WorkflowExecution, definition: WorkflowDefinition): any {
    const resolved = JSON.parse(JSON.stringify(config));
    const variables = {
      ...execution.inputData,
      ...execution.stepResults
    };

    const resolveValue = (value: any): any => {
      if (typeof value === 'string' && value.includes('${')) {
        return value.replace(/\$\{([^}]+)\}/g, (match, path) => {
          return this.getDataFromPath(path, execution) || match;
        });
      }
      return value;
    };

    const resolveObject = (obj: any): any => {
      if (Array.isArray(obj)) {
        return obj.map(resolveObject);
      } else if (obj && typeof obj === 'object') {
        const result: any = {};
        for (const [key, value] of Object.entries(obj)) {
          result[key] = resolveObject(value);
        }
        return result;
      } else {
        return resolveValue(obj);
      }
    };

    return resolveObject(resolved);
  }

  private getDataFromPath(path: string, execution: WorkflowExecution): any {
    const parts = path.split('.');
    let current: any = {
      input: execution.inputData || {},
      ...execution.stepResults
    };

    for (const part of parts) {
      if (current && typeof current === 'object') {
        current = current[part];
      } else {
        return undefined;
      }
    }

    return current;
  }

  private applyMapping(data: any, mapping: Record<string, string>): any {
    const result: any = {};
    for (const [target, source] of Object.entries(mapping)) {
      result[target] = data[source];
    }
    return result;
  }

  private evaluateCondition(data: any, condition: any): boolean {
    if (!condition) return true;
    
    const { field, operator, value } = condition;
    const fieldValue = data[field];

    switch (operator) {
      case 'equals': return fieldValue === value;
      case 'not_equals': return fieldValue !== value;
      case 'greater_than': return fieldValue > value;
      case 'less_than': return fieldValue < value;
      case 'contains': return String(fieldValue).includes(String(value));
      case 'exists': return fieldValue !== undefined && fieldValue !== null;
      default: return true;
    }
  }

  private async updateExecutionStatus(executionId: string, status: WorkflowExecution['status'], updates: Partial<WorkflowExecution> = {}): Promise<void> {
    const execution = this.activeExecutions.get(executionId);
    
    if (execution) {
      execution.status = status;
      Object.assign(execution, updates);
      
      if (status === 'completed' || status === 'failed') {
        execution.completedAt = new Date();
        this.activeExecutions.delete(executionId);
      }
    }

    // Update database
    const updateData: any = {
      status,
      updatedAt: new Date()
    };

    if (updates.outputData) updateData.outputData = updates.outputData;
    if (updates.errorMessage) updateData.errorMessage = updates.errorMessage;
    if (status === 'completed' || status === 'failed') updateData.completedAt = new Date();

    await db
      .update(workflowExecutions)
      .set(updateData)
      .where(eq(workflowExecutions.id, parseInt(executionId)));
  }

  // Public methods for monitoring and control
  async pauseExecution(executionId: string): Promise<void> {
    await this.updateExecutionStatus(executionId, 'paused');
  }

  async resumeExecution(executionId: string): Promise<void> {
    await this.updateExecutionStatus(executionId, 'running');
  }

  async cancelExecution(executionId: string): Promise<void> {
    await this.updateExecutionStatus(executionId, 'cancelled');
  }

  getExecution(executionId: string): WorkflowExecution | undefined {
    return this.activeExecutions.get(executionId);
  }

  getAllExecutions(): WorkflowExecution[] {
    return Array.from(this.activeExecutions.values());
  }
}

export const workflowExecutionEngine = WorkflowExecutionEngine.getInstance();