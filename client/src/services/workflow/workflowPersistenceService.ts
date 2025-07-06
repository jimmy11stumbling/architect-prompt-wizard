import { workflowService, WorkflowDefinition as APIWorkflow, WorkflowExecution as APIExecution } from "@/services/api/workflowService";
import { WorkflowDefinition, WorkflowExecution } from "@/types/workflow-types";

export interface WorkflowRecord {
  id: string;
  name: string;
  definition: WorkflowDefinition;
  user_id: string;
  created_at: string;
  updated_at: string;
  is_active: boolean;
}

export interface WorkflowExecutionRecord {
  id: string;
  workflow_id: string;
  status: string;
  input_data: any;
  output_data: any;
  error_message?: string;
  started_at: string;
  completed_at?: string;
  user_id: string;
}

// Convert between API format and legacy format
function convertWorkflowFromAPI(apiWorkflow: APIWorkflow): WorkflowRecord {
  return {
    id: apiWorkflow.id!.toString(),
    name: apiWorkflow.name,
    definition: apiWorkflow.definition as WorkflowDefinition,
    user_id: apiWorkflow.userId!.toString(),
    created_at: apiWorkflow.createdAt!,
    updated_at: apiWorkflow.updatedAt!,
    is_active: true,
  };
}

function convertExecutionFromAPI(apiExecution: APIExecution): WorkflowExecutionRecord {
  return {
    id: apiExecution.id.toString(),
    workflow_id: apiExecution.workflowId.toString(),
    status: apiExecution.status,
    input_data: apiExecution.inputData,
    output_data: apiExecution.outputData,
    error_message: apiExecution.errorMessage,
    started_at: apiExecution.startedAt,
    completed_at: apiExecution.completedAt,
    user_id: apiExecution.userId.toString(),
  };
}

export class WorkflowPersistenceService {
  private static instance: WorkflowPersistenceService;

  static getInstance(): WorkflowPersistenceService {
    if (!WorkflowPersistenceService.instance) {
      WorkflowPersistenceService.instance = new WorkflowPersistenceService();
    }
    return WorkflowPersistenceService.instance;
  }

  async saveWorkflow(definition: WorkflowDefinition): Promise<WorkflowRecord> {
    try {
      const savedWorkflow = await workflowService.saveWorkflow({
        name: definition.name,
        definition: definition as any,
        isTemplate: false
      });

      return convertWorkflowFromAPI(savedWorkflow);
    } catch (error) {
      console.error('Error saving workflow:', error);
      throw error;
    }
  }

  async getWorkflows(): Promise<WorkflowRecord[]> {
    try {
      const workflows = await workflowService.getAllWorkflows();
      return workflows.map(convertWorkflowFromAPI);
    } catch (error) {
      console.error('Error fetching workflows:', error);
      return [];
    }
  }

  async saveExecution(execution: WorkflowExecution): Promise<WorkflowExecutionRecord> {
    try {
      const savedExecution = await workflowService.executeWorkflow(
        parseInt(execution.workflowId),
        execution.variables
      );

      return convertExecutionFromAPI(savedExecution);
    } catch (error) {
      console.error('Error saving execution:', error);
      throw error;
    }
  }

  async getExecutions(workflowId?: string): Promise<WorkflowExecutionRecord[]> {
    if (!workflowId) {
      // Return all executions for all workflows
      try {
        const response = await fetch('/api/workflows/executions/all');
        if (!response.ok) {
          throw new Error('Failed to fetch all executions');
        }
        const executions = await response.json();
        return executions.map(convertExecutionFromAPI);
      } catch (error) {
        console.error('Error fetching all executions:', error);
        return [];
      }
    }
    
    const executions = await workflowService.getWorkflowExecutions(parseInt(workflowId));
    return executions.map(convertExecutionFromAPI);
  }

  async updateExecution(executionId: string, updates: Partial<WorkflowExecution>): Promise<WorkflowExecutionRecord> {
    // For now, we'll just fetch the execution as the API doesn't support updates yet
    const executions = await workflowService.getWorkflowExecutions(parseInt(updates.workflowId || '1'));
    const execution = executions.find(e => e.id.toString() === executionId);
    
    if (!execution) {
      throw new Error('Execution not found');
    }

    return convertExecutionFromAPI(execution);
  }

  async deleteWorkflow(workflowId: string): Promise<void> {
    await workflowService.deleteWorkflow(parseInt(workflowId));
  }
}

// Export singleton instance for backward compatibility
export const workflowPersistenceService = WorkflowPersistenceService.getInstance();