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

export const workflowService = {
  async getAllWorkflows(): Promise<WorkflowDefinition[]> {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000);

      const response = await fetch('/api/workflows', {
        signal: controller.signal,
        headers: {
          'Cache-Control': 'no-cache',
          'Content-Type': 'application/json',
          'X-User-Id': JSON.parse(localStorage.getItem('user') || '{}').id?.toString() || '',
        }
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        console.warn(`Failed to fetch workflows: ${response.statusText}`);
        return []; // Return empty array instead of throwing
      }

      const data = await response.json();
      return Array.isArray(data) ? data : [];
    } catch (error) {
      if (error instanceof Error && error.name === 'AbortError') {
        console.warn('Workflow fetch timed out, returning empty array');
      } else {
        console.warn('Error fetching workflows, returning empty array:', error);
      }
      return [];
    }
  },

  async getAllExecutions(): Promise<WorkflowExecution[]> {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000);

      const response = await fetch('/api/workflows/executions', {
        signal: controller.signal,
        headers: {
          'Cache-Control': 'no-cache',
          'Content-Type': 'application/json',
          'X-User-Id': JSON.parse(localStorage.getItem('user') || '{}').id?.toString() || '',
        }
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        console.warn(`Failed to fetch executions: ${response.statusText}`);
        return []; // Return empty array instead of throwing
      }

      const data = await response.json();
      return Array.isArray(data) ? data : [];
    } catch (error) {
      if (error instanceof Error && error.name === 'AbortError') {
        console.warn('Execution fetch timed out, returning empty array');
      } else {
        console.warn('Error fetching executions, returning empty array:', error);
      }
      return [];
    }
  },
};