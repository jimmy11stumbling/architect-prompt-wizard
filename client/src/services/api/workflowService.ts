export interface WorkflowDefinition {
  id?: number;
  name: string;
  description?: string;
  definition: any;
  userId?: number;
  status?: string;
  isTemplate?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface WorkflowExecution {
  id: number;
  workflowId: number;
  status: string;
  inputData?: any;
  outputData?: any;
  errorMessage?: string;
  startedAt: string;
  completedAt?: string;
  userId: number;
}

class WorkflowService {
  private getHeaders(): HeadersInit {
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    return {
      'Content-Type': 'application/json',
      'X-User-Id': user.id?.toString() || '',
    };
  }

  async getAllWorkflows(): Promise<WorkflowDefinition[]> {
    const response = await fetch('/api/workflows', {
      headers: this.getHeaders(),
    });
    
    if (!response.ok) {
      throw new Error('Failed to fetch workflows');
    }
    
    return response.json();
  }

  async getWorkflowById(id: number): Promise<WorkflowDefinition> {
    const response = await fetch(`/api/workflows/${id}`, {
      headers: this.getHeaders(),
    });
    
    if (!response.ok) {
      throw new Error('Failed to fetch workflow');
    }
    
    return response.json();
  }

  async saveWorkflow(workflow: Omit<WorkflowDefinition, 'id' | 'userId' | 'createdAt' | 'updatedAt'>): Promise<WorkflowDefinition> {
    const response = await fetch('/api/workflows', {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify(workflow),
    });
    
    if (!response.ok) {
      throw new Error('Failed to save workflow');
    }
    
    return response.json();
  }

  async updateWorkflow(id: number, updates: Partial<WorkflowDefinition>): Promise<WorkflowDefinition> {
    const response = await fetch(`/api/workflows/${id}`, {
      method: 'PUT',
      headers: this.getHeaders(),
      body: JSON.stringify(updates),
    });
    
    if (!response.ok) {
      throw new Error('Failed to update workflow');
    }
    
    return response.json();
  }

  async deleteWorkflow(id: number): Promise<void> {
    const response = await fetch(`/api/workflows/${id}`, {
      method: 'DELETE',
      headers: this.getHeaders(),
    });
    
    if (!response.ok) {
      throw new Error('Failed to delete workflow');
    }
  }

  async getWorkflowExecutions(workflowId: number): Promise<WorkflowExecution[]> {
    const response = await fetch(`/api/workflows/${workflowId}/executions`, {
      headers: this.getHeaders(),
    });
    
    if (!response.ok) {
      throw new Error('Failed to fetch workflow executions');
    }
    
    return response.json();
  }

  async executeWorkflow(workflowId: number, inputData?: any): Promise<WorkflowExecution> {
    const response = await fetch(`/api/workflows/${workflowId}/execute`, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify({ inputData }),
    });
    
    if (!response.ok) {
      throw new Error('Failed to execute workflow');
    }
    
    return response.json();
  }
}

export const workflowService = new WorkflowService();