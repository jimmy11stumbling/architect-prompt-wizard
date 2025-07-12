import { Router } from 'express';
import { db } from '../db';
import { eq, desc, and } from 'drizzle-orm';
import { workflows, workflowExecutions } from '../../shared/schema';
import { z } from 'zod';
import { AuthenticatedRequest } from '../middleware/auth';

const router = Router();

// Validation schemas
const workflowSchema = z.object({
  name: z.string().min(1),
  description: z.string().optional(),
  definition: z.object({}).passthrough(),
  isTemplate: z.boolean().optional(),
});

const executionSchema = z.object({
  workflowId: z.number(),
  inputData: z.object({}).passthrough().optional(),
});

// Get all workflows for authenticated user
router.get('/', async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const userWorkflows = await db
      .select()
      .from(workflows)
      .where(eq(workflows.userId, req.user.id))
      .orderBy(desc(workflows.updatedAt));

    res.json(userWorkflows);
  } catch (error) {
    console.error('Error fetching workflows:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get workflow by ID
router.get('/:id', async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const { id } = req.params;
    
    const workflow = await db
      .select()
      .from(workflows)
      .where(
        and(
          eq(workflows.id, parseInt(id)),
          eq(workflows.userId, req.user.id)
        )
      )
      .limit(1);

    if (workflow.length === 0) {
      return res.status(404).json({ error: 'Workflow not found' });
    }

    res.json(workflow[0]);
  } catch (error) {
    console.error('Error fetching workflow:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Create new workflow
router.post('/', async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const validation = workflowSchema.safeParse(req.body);
    if (!validation.success) {
      return res.status(400).json({ error: validation.error.issues });
    }

    const workflowData = validation.data;
    
    const newWorkflow = await db
      .insert(workflows)
      .values({
        ...workflowData,
        userId: req.user.id,
        status: 'draft',
        isTemplate: workflowData.isTemplate || false,
      })
      .returning();

    res.status(201).json(newWorkflow[0]);
  } catch (error) {
    console.error('Error creating workflow:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Update workflow
router.put('/:id', async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const { id } = req.params;
    const validation = workflowSchema.partial().safeParse(req.body);
    if (!validation.success) {
      return res.status(400).json({ error: validation.error.issues });
    }

    const updateData = validation.data;
    
    const updatedWorkflow = await db
      .update(workflows)
      .set({
        ...updateData,
        updatedAt: new Date(),
      })
      .where(
        and(
          eq(workflows.id, parseInt(id)),
          eq(workflows.userId, req.user.id)
        )
      )
      .returning();

    if (updatedWorkflow.length === 0) {
      return res.status(404).json({ error: 'Workflow not found or access denied' });
    }

    res.json(updatedWorkflow[0]);
  } catch (error) {
    console.error('Error updating workflow:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Delete workflow
router.delete('/:id', async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const { id } = req.params;
    
    const deletedWorkflow = await db
      .delete(workflows)
      .where(
        and(
          eq(workflows.id, parseInt(id)),
          eq(workflows.userId, req.user.id)
        )
      )
      .returning();

    if (deletedWorkflow.length === 0) {
      return res.status(404).json({ error: 'Workflow not found or access denied' });
    }

    res.json({ message: 'Workflow deleted successfully' });
  } catch (error) {
    console.error('Error deleting workflow:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get all workflow executions for dashboard
router.get('/executions/all', async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const executions = await db
      .select()
      .from(workflowExecutions)
      .where(eq(workflowExecutions.userId, req.user.id))
      .orderBy(desc(workflowExecutions.startedAt))
      .limit(50); // Limit to last 50 executions

    res.json(executions);
  } catch (error) {
    console.error('Error fetching all workflow executions:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get workflow executions
router.get('/:id/executions', async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const { id } = req.params;
    
    // Validate that id is a valid number
    const workflowId = parseInt(id);
    if (isNaN(workflowId)) {
      return res.status(400).json({ error: "Invalid workflow ID" });
    }
    
    const executions = await db
      .select()
      .from(workflowExecutions)
      .where(
        and(
          eq(workflowExecutions.workflowId, workflowId),
          eq(workflowExecutions.userId, req.user.id)
        )
      )
      .orderBy(desc(workflowExecutions.startedAt));

    res.json(executions);
  } catch (error) {
    console.error('Error fetching workflow executions:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Create workflow execution
router.post('/:id/execute', async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const { id } = req.params;
    const workflowId = parseInt(id);
    
    if (isNaN(workflowId)) {
      return res.status(400).json({ error: 'Invalid workflow ID' });
    }

    const { inputData = {} } = req.body;

    // Import and use the workflow execution engine
    const { workflowExecutionEngine } = await import('../services/workflow/workflowExecutionEngine');
    
    const execution = await workflowExecutionEngine.executeWorkflow(
      workflowId,
      req.user.id,
      inputData
    );

    res.status(201).json({
      id: execution.id,
      workflowId: execution.workflowId,
      status: execution.status,
      progress: execution.progress,
      startedAt: execution.startedAt,
      message: 'Workflow execution started successfully'
    });
  } catch (error) {
    console.error('Error executing workflow:', error);
    res.status(500).json({ 
      error: 'Failed to execute workflow',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// Workflow execution control endpoints
router.post('/:id/executions/:executionId/pause', async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const { executionId } = req.params;
    const { workflowExecutionEngine } = await import('../services/workflow/workflowExecutionEngine');
    
    await workflowExecutionEngine.pauseExecution(executionId);
    res.json({ message: 'Execution paused successfully' });
  } catch (error) {
    console.error('Error pausing execution:', error);
    res.status(500).json({ error: 'Failed to pause execution' });
  }
});

router.post('/:id/executions/:executionId/resume', async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const { executionId } = req.params;
    const { workflowExecutionEngine } = await import('../services/workflow/workflowExecutionEngine');
    
    await workflowExecutionEngine.resumeExecution(executionId);
    res.json({ message: 'Execution resumed successfully' });
  } catch (error) {
    console.error('Error resuming execution:', error);
    res.status(500).json({ error: 'Failed to resume execution' });
  }
});

router.post('/:id/executions/:executionId/cancel', async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const { executionId } = req.params;
    const { workflowExecutionEngine } = await import('../services/workflow/workflowExecutionEngine');
    
    await workflowExecutionEngine.cancelExecution(executionId);
    res.json({ message: 'Execution cancelled successfully' });
  } catch (error) {
    console.error('Error cancelling execution:', error);
    res.status(500).json({ error: 'Failed to cancel execution' });
  }
});

// Get execution status
router.get('/:id/executions/:executionId/status', async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const { executionId } = req.params;
    const { workflowExecutionEngine } = await import('../services/workflow/workflowExecutionEngine');
    
    const execution = workflowExecutionEngine.getExecution(executionId);
    
    if (!execution) {
      return res.status(404).json({ error: 'Execution not found' });
    }

    res.json(execution);
  } catch (error) {
    console.error('Error getting execution status:', error);
    res.status(500).json({ error: 'Failed to get execution status' });
  }
});

export default router;