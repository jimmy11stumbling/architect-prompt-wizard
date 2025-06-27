
import { A2AAgent } from '../types';

export class AgentManager {
  private agents: Map<string, A2AAgent> = new Map();

  initialize(): void {
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

  findBestAgent(requiredCapabilities: string[]): A2AAgent | null {
    const availableAgents = Array.from(this.agents.values())
      .filter(agent => agent.status === "active");

    if (requiredCapabilities.length === 0) {
      return availableAgents.reduce((best, current) => 
        current.performance.successRate > best.performance.successRate ? current : best
      );
    }

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

  updateAgentPerformance(agentId: string, executionTime: number): void {
    const agent = this.agents.get(agentId);
    if (agent) {
      agent.performance.tasksCompleted++;
      agent.performance.averageResponseTime = 
        (agent.performance.averageResponseTime + executionTime / 1000) / 2;
    }
  }

  getAgents(): A2AAgent[] {
    return Array.from(this.agents.values());
  }

  getAgent(id: string): A2AAgent | undefined {
    return this.agents.get(id);
  }

  getActiveAgentCount(): number {
    return Array.from(this.agents.values())
      .filter(agent => agent.status === "active").length;
  }
}
