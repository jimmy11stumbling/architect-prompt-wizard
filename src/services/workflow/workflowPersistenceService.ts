
import { supabase } from "@/integrations/supabase/client";
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

export class WorkflowPersistenceService {
  private static instance: WorkflowPersistenceService;

  static getInstance(): WorkflowPersistenceService {
    if (!WorkflowPersistenceService.instance) {
      WorkflowPersistenceService.instance = new WorkflowPersistenceService();
    }
    return WorkflowPersistenceService.instance;
  }

  async saveWorkflow(definition: WorkflowDefinition): Promise<WorkflowRecord> {
    const user = await supabase.auth.getUser();
    if (!user.data.user) {
      throw new Error('User must be authenticated to save workflows');
    }

    const { data, error } = await supabase
      .from('workflow_definitions')
      .insert({
        name: definition.name,
        definition: definition as any, // Cast to Json type
        user_id: user.data.user.id,
        is_active: true
      })
      .select()
      .single();

    if (error) throw error;
    
    // Cast the returned data to our expected type
    return {
      ...data,
      definition: data.definition as WorkflowDefinition
    } as WorkflowRecord;
  }

  async getWorkflows(): Promise<WorkflowRecord[]> {
    const user = await supabase.auth.getUser();
    if (!user.data.user) return [];

    const { data, error } = await supabase
      .from('workflow_definitions')
      .select('*')
      .eq('user_id', user.data.user.id)
      .eq('is_active', true)
      .order('updated_at', { ascending: false });

    if (error) throw error;
    
    // Cast the returned data to our expected type
    return (data || []).map(item => ({
      ...item,
      definition: item.definition as WorkflowDefinition
    })) as WorkflowRecord[];
  }

  async saveExecution(execution: WorkflowExecution): Promise<WorkflowExecutionRecord> {
    const user = await supabase.auth.getUser();
    if (!user.data.user) {
      throw new Error('User must be authenticated to save executions');
    }

    const { data, error } = await supabase
      .from('workflow_executions')
      .insert({
        workflow_id: execution.workflowId,
        status: execution.status,
        input_data: execution.variables,
        output_data: execution.result,
        error_message: execution.error,
        started_at: new Date(execution.startedAt).toISOString(),
        completed_at: execution.completedAt ? new Date(execution.completedAt).toISOString() : null,
        user_id: user.data.user.id
      })
      .select()
      .single();

    if (error) throw error;
    return data as WorkflowExecutionRecord;
  }

  async getExecutions(workflowId?: string): Promise<WorkflowExecutionRecord[]> {
    const user = await supabase.auth.getUser();
    if (!user.data.user) return [];

    let query = supabase
      .from('workflow_executions')
      .select('*')
      .eq('user_id', user.data.user.id);

    if (workflowId) {
      query = query.eq('workflow_id', workflowId);
    }

    const { data, error } = await query.order('started_at', { ascending: false });

    if (error) throw error;
    return (data || []) as WorkflowExecutionRecord[];
  }
}

export const workflowPersistenceService = WorkflowPersistenceService.getInstance();
