
import { realTimeResponseService } from "../integration/realTimeResponseService";
import { A2AAgent, A2ATask, A2ACoordinationResult } from './types';
import { AgentManager } from './core/agentManager';
import { TaskProcessor } from './core/taskProcessor';

export * from './types';

export class A2AService {
  private static instance: A2AService;
  private agentManager = new AgentManager();
  private activeTasks: Map<string, A2ATask> = new Map();
  private initialized = false;

  static getInstance(): A2AService {
    if (!A2AService.instance) {
      A2AService.instance = new A2AService();
    }
    return A2AService.instance;
  }

  async initialize(): Promise<void> {
    if (this.initialized) return;
    
    try {
      this.agentManager.initialize();
      this.initialized = true;
    } catch (error) {
      console.error("Failed to initialize A2A service:", error);
      throw error;
    }
  }

  async delegateTask(description: string, requiredCapabilities: string[] = []): Promise<A2ACoordinationResult> {
    const taskId = `task_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    const task: A2ATask = {
      id: taskId,
      description,
      requiredCapabilities,
      priority: "medium"
    };

    this.activeTasks.set(taskId, task);

    realTimeResponseService.addResponse({
      source: "a2a-service",
      status: "processing",
      message: `Coordinating task delegation: "${description}"`,
      data: { 
        taskId,
        requiredCapabilities,
        availableAgents: this.agentManager.getAgents().length
      }
    });

    const suitableAgent = this.agentManager.findBestAgent(requiredCapabilities);
    
    if (!suitableAgent) {
      realTimeResponseService.addResponse({
        source: "a2a-service",
        status: "error",
        message: "No suitable agent found for task",
        data: { taskId, requiredCapabilities }
      });
      throw new Error("No suitable agent available for the requested capabilities");
    }

    const { result: taskResult, executionTime } = await TaskProcessor.executeTask(suitableAgent, description);

    const result: A2ACoordinationResult = {
      taskId,
      assignedAgent: suitableAgent,
      estimatedCompletionTime: executionTime,
      coordinationStrategy: "capability-based-assignment",
      result: taskResult
    };

    this.agentManager.updateAgentPerformance(suitableAgent.id, executionTime);
    this.activeTasks.delete(taskId);

    realTimeResponseService.addResponse({
      source: "a2a-service",
      status: "success", 
      message: `Task delegated successfully to ${suitableAgent.name}`,
      data: {
        taskId,
        agentId: suitableAgent.id,
        executionTime,
        result: taskResult
      }
    });

    return result;
  }

  getAgents(): A2AAgent[] {
    return this.agentManager.getAgents();
  }

  getAgent(id: string): A2AAgent | undefined {
    return this.agentManager.getAgent(id);
  }

  async healthCheck(): Promise<{ healthy: boolean; totalAgents: number; activeAgents: number; messageCount: number }> {
    realTimeResponseService.addResponse({
      source: "a2a-service",
      status: "processing",
      message: "Performing A2A health check",
      data: {}
    });

    await new Promise(resolve => setTimeout(resolve, 300));

    const totalAgents = this.agentManager.getAgents().length;
    const activeAgents = this.agentManager.getActiveAgentCount();

    const healthStatus = {
      healthy: true,
      totalAgents,
      activeAgents,
      messageCount: 0
    };

    realTimeResponseService.addResponse({
      source: "a2a-service",
      status: "success",
      message: "A2A health check passed", 
      data: healthStatus
    });

    return healthStatus;
  }
}

export const a2aService = A2AService.getInstance();
