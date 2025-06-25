
import { realTimeResponseService } from "../integration/realTimeResponseService";

export interface A2AAgent {
  id: string;
  name: string;
  capabilities: string[];
  status: "active" | "busy" | "offline";
  specialization: string;
  performance: {
    tasksCompleted: number;
    successRate: number;
    averageResponseTime: number;
  };
}

export interface A2ATask {
  id: string;
  description: string;
  requiredCapabilities: string[];
  priority: "low" | "medium" | "high";
  deadline?: number;
  context?: Record<string, any>;
}

export interface A2ACoordinationResult {
  taskId: string;
  assignedAgent: A2AAgent;
  estimatedCompletionTime: number;
  coordinationStrategy: string;
  result?: any;
}

export class A2AService {
  private static instance: A2AService;
  private agents: Map<string, A2AAgent> = new Map();
  private activeTasks: Map<string, A2ATask> = new Map();

  static getInstance(): A2AService {
    if (!A2AService.instance) {
      A2AService.instance = new A2AService();
      A2AService.instance.initializeAgents();
    }
    return A2AService.instance;
  }

  private initializeAgents(): void {
    const defaultAgents: A2AAgent[] = [
      {
        id: "agent_analyzer",
        name: "Document Analyzer",
        capabilities: ["document-analysis", "text-processing", "summarization"],
        status: "active",
        specialization: "Content Analysis",
        performance: {
          tasksCompleted: 156,
          successRate: 0.94,
          averageResponseTime: 2.3
        }
      },
      {
        id: "agent_researcher", 
        name: "Research Assistant",
        capabilities: ["web-search", "data-gathering", "fact-checking"],
        status: "active",
        specialization: "Information Retrieval",
        performance: {
          tasksCompleted: 89,
          successRate: 0.91,
          averageResponseTime: 3.1
        }
      },
      {
        id: "agent_validator",
        name: "Data Validator", 
        capabilities: ["data-validation", "quality-assurance", "error-detection"],
        status: "active",
        specialization: "Quality Control",
        performance: {
          tasksCompleted: 203,
          successRate: 0.97,
          averageResponseTime: 1.8
        }
      },
      {
        id: "agent_coordinator",
        name: "Task Coordinator",
        capabilities: ["task-management", "workflow-optimization", "resource-allocation"],
        status: "active", 
        specialization: "Process Management",
        performance: {
          tasksCompleted: 127,
          successRate: 0.93,
          averageResponseTime: 2.5
        }
      }
    ];

    defaultAgents.forEach(agent => {
      this.agents.set(agent.id, agent);
    });
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
        availableAgents: this.agents.size
      }
    });

    // Find best agent for the task
    const suitableAgent = this.findBestAgent(requiredCapabilities);
    
    if (!suitableAgent) {
      realTimeResponseService.addResponse({
        source: "a2a-service",
        status: "error",
        message: "No suitable agent found for task",
        data: { taskId, requiredCapabilities }
      });
      throw new Error("No suitable agent available for the requested capabilities");
    }

    // Simulate task execution
    const executionTime = 1000 + Math.random() * 3000;
    await new Promise(resolve => setTimeout(resolve, executionTime));

    // Generate mock result based on agent specialization
    let taskResult;
    if (suitableAgent.capabilities.includes("document-analysis")) {
      taskResult = {
        analysis: `Comprehensive analysis completed for: ${description}`,
        insights: ["Key pattern identified", "Quality metrics evaluated", "Recommendations generated"],
        confidence: 0.92
      };
    } else if (suitableAgent.capabilities.includes("web-search")) {
      taskResult = {
        sources: [`Research data for: ${description}`],
        factChecks: ["Verified primary sources", "Cross-referenced data points"],
        reliability: 0.89
      };
    } else {
      taskResult = {
        status: "completed",
        summary: `Task "${description}" processed successfully`,
        metadata: { processingTime: executionTime }
      };
    }

    const result: A2ACoordinationResult = {
      taskId,
      assignedAgent: suitableAgent,
      estimatedCompletionTime: executionTime,
      coordinationStrategy: "capability-based-assignment",
      result: taskResult
    };

    // Update agent status
    suitableAgent.performance.tasksCompleted++;
    suitableAgent.performance.averageResponseTime = 
      (suitableAgent.performance.averageResponseTime + executionTime / 1000) / 2;

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

  private findBestAgent(requiredCapabilities: string[]): A2AAgent | null {
    const availableAgents = Array.from(this.agents.values())
      .filter(agent => agent.status === "active");

    if (requiredCapabilities.length === 0) {
      // Return agent with best performance if no specific capabilities required
      return availableAgents.reduce((best, current) => 
        current.performance.successRate > best.performance.successRate ? current : best
      );
    }

    // Find agent with most matching capabilities
    let bestAgent: A2AAgent | null = null;
    let bestScore = 0;

    for (const agent of availableAgents) {
      const matchingCapabilities = requiredCapabilities.filter(cap => 
        agent.capabilities.includes(cap)
      ).length;
      
      const score = matchingCapabilities + (agent.performance.successRate * 0.5);
      
      if (score > bestScore) {
        bestScore = score;
        bestAgent = agent;
      }
    }

    return bestAgent;
  }

  getAgents(): A2AAgent[] {
    return Array.from(this.agents.values());
  }

  getAgent(id: string): A2AAgent | undefined {
    return this.agents.get(id);
  }

  async healthCheck(): Promise<{ healthy: boolean; totalAgents: number; activeAgents: number; messageCount: number }> {
    realTimeResponseService.addResponse({
      source: "a2a-service",
      status: "processing",
      message: "Performing A2A health check",
      data: {}
    });

    await new Promise(resolve => setTimeout(resolve, 300));

    const totalAgents = this.agents.size;
    const activeAgents = Array.from(this.agents.values())
      .filter(agent => agent.status === "active").length;

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
