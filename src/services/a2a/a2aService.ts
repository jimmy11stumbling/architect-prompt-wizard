
import { realTimeResponseService } from "../integration/realTimeResponseService";

export interface A2AAgent {
  id: string;
  name: string;
  status: "active" | "inactive" | "busy";
  capabilities: string[];
  endpoint?: string;
  lastSeen: number;
}

export interface A2AMessage {
  id: string;
  from: string;
  to: string;
  type: "request" | "response" | "notification";
  payload: any;
  timestamp: number;
  priority?: "low" | "normal" | "high";
}

export interface TaskDelegation {
  taskId: string;
  description: string;
  requiredCapabilities: string[];
  assignedAgent?: A2AAgent;
  status: "pending" | "assigned" | "completed" | "failed";
}

export interface AgentMetrics {
  totalAgents: number;
  activeAgents: number;
  busyAgents: number;
  totalMessages: number;
  lastActivity: number;
}

export class A2AService {
  private static instance: A2AService;
  private agents: Map<string, A2AAgent> = new Map();
  private messages: A2AMessage[] = [];
  private isInitialized = false;

  static getInstance(): A2AService {
    if (!A2AService.instance) {
      A2AService.instance = new A2AService();
    }
    return A2AService.instance;
  }

  public getInitializationStatus(): boolean {
    return this.isInitialized;
  }

  public getAgentMetrics(): AgentMetrics {
    const agents = Array.from(this.agents.values());
    return {
      totalAgents: agents.length,
      activeAgents: agents.filter(a => a.status === "active").length,
      busyAgents: agents.filter(a => a.status === "busy").length,
      totalMessages: this.messages.length,
      lastActivity: Math.max(...agents.map(a => a.lastSeen))
    };
  }

  async initialize(): Promise<void> {
    if (this.isInitialized) return;

    realTimeResponseService.addResponse({
      source: "a2a-service",
      status: "processing",
      message: "Initializing A2A agent network"
    });

    // Initialize with demo agents
    const demoAgents: A2AAgent[] = [
      {
        id: "reasoning-assistant",
        name: "Reasoning Assistant",
        status: "active",
        capabilities: ["logical-reasoning", "problem-solving", "analysis"],
        lastSeen: Date.now()
      },
      {
        id: "context-analyzer",
        name: "Context Analyzer",
        status: "active",
        capabilities: ["context-analysis", "information-extraction", "summarization"],
        lastSeen: Date.now()
      },
      {
        id: "documentation-expert",
        name: "Documentation Expert",
        status: "active",
        capabilities: ["documentation", "knowledge-management", "content-creation"],
        lastSeen: Date.now()
      },
      {
        id: "workflow-coordinator",
        name: "Workflow Coordinator",
        status: "active",
        capabilities: ["task-management", "coordination", "scheduling"],
        lastSeen: Date.now()
      },
      {
        id: "reasoning-coordinator",
        name: "Reasoning Coordinator",
        status: "active",
        capabilities: ["coordination", "reasoning", "task-delegation"],
        lastSeen: Date.now()
      }
    ];

    for (const agent of demoAgents) {
      this.agents.set(agent.id, agent);
    }

    this.isInitialized = true;

    realTimeResponseService.addResponse({
      source: "a2a-service",
      status: "success",
      message: `A2A network initialized with ${this.agents.size} agents`,
      data: { 
        agentCount: this.agents.size,
        activeAgents: Array.from(this.agents.values()).filter(a => a.status === "active").length
      }
    });
  }

  async sendMessage(message: A2AMessage): Promise<void> {
    await this.initialize();

    realTimeResponseService.addResponse({
      source: "a2a-service",
      status: "processing",
      message: `Sending A2A message from ${message.from} to ${message.to}`,
      data: { messageType: message.type, messageId: message.id }
    });

    this.messages.push(message);

    // Simulate message processing
    await new Promise(resolve => setTimeout(resolve, 100));

    realTimeResponseService.addResponse({
      source: "a2a-service",
      status: "success",
      message: `A2A message delivered successfully`,
      data: { 
        messageId: message.id,
        from: message.from,
        to: message.to,
        deliveryTime: new Date().toISOString()
      }
    });
  }

  async delegateTask(description: string, requiredCapabilities: string[]): Promise<TaskDelegation> {
    await this.initialize();

    realTimeResponseService.addResponse({
      source: "a2a-service",
      status: "processing",
      message: `Delegating task with capabilities: ${requiredCapabilities.join(", ")}`,
      data: { description, requiredCapabilities }
    });

    const taskId = `task-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    
    // Find suitable agent
    const suitableAgents = Array.from(this.agents.values()).filter(agent => 
      agent.status === "active" && 
      requiredCapabilities.some(cap => agent.capabilities.includes(cap))
    );

    const delegation: TaskDelegation = {
      taskId,
      description,
      requiredCapabilities,
      status: "pending"
    };

    if (suitableAgents.length > 0) {
      // Assign to first suitable agent
      delegation.assignedAgent = suitableAgents[0];
      delegation.status = "assigned";
      
      // Update agent status
      suitableAgents[0].status = "busy";

      realTimeResponseService.addResponse({
        source: "a2a-service",
        status: "success",
        message: `Task assigned to agent: ${suitableAgents[0].name}`,
        data: { 
          taskId,
          assignedAgent: suitableAgents[0].name,
          capabilities: suitableAgents[0].capabilities
        }
      });
    } else {
      realTimeResponseService.addResponse({
        source: "a2a-service",
        status: "validation",
        message: "No suitable agents available for task delegation",
        data: { taskId, requiredCapabilities }
      });
    }

    return delegation;
  }

  async registerAgent(agent: Omit<A2AAgent, "lastSeen">): Promise<void> {
    const fullAgent: A2AAgent = {
      ...agent,
      lastSeen: Date.now()
    };

    this.agents.set(agent.id, fullAgent);

    realTimeResponseService.addResponse({
      source: "a2a-service",
      status: "success",
      message: `New agent registered: ${agent.name}`,
      data: { agentId: agent.id, capabilities: agent.capabilities }
    });
  }

  getActiveAgents(): A2AAgent[] {
    return Array.from(this.agents.values()).filter(agent => agent.status === "active");
  }

  getAllAgents(): A2AAgent[] {
    return Array.from(this.agents.values());
  }

  getMessages(limit: number = 50): A2AMessage[] {
    return this.messages.slice(-limit);
  }

  getNetworkStatus() {
    const agents = Array.from(this.agents.values());
    return {
      totalAgents: agents.length,
      activeAgents: agents.filter(a => a.status === "active").length,
      busyAgents: agents.filter(a => a.status === "busy").length,
      totalMessages: this.messages.length,
      lastActivity: Math.max(...agents.map(a => a.lastSeen))
    };
  }
}

export const a2aService = A2AService.getInstance();
