
import { A2AAgent } from "@/types/ipa-types";

export interface A2AMessage {
  id: string;
  from: string;
  to: string;
  type: "request" | "response" | "notification" | "delegation";
  payload: any;
  timestamp: number;
  priority?: "low" | "medium" | "high";
}

export interface A2ATaskDelegation {
  taskId: string;
  description: string;
  requiredCapabilities: string[];
  assignedAgent?: A2AAgent;
  status: "pending" | "assigned" | "completed" | "failed";
}

export class A2AService {
  private static instance: A2AService;
  private agents: A2AAgent[] = [];
  private messageQueue: A2AMessage[] = [];
  private activeTasks: Map<string, A2ATaskDelegation> = new Map();
  private initialized = false;

  static getInstance(): A2AService {
    if (!A2AService.instance) {
      A2AService.instance = new A2AService();
    }
    return A2AService.instance;
  }

  async initialize(): Promise<void> {
    // Initialize with sample A2A agents
    this.agents = [
      {
        id: "rag-agent",
        name: "RAG Knowledge Agent",
        capabilities: ["document-retrieval", "semantic-search", "knowledge-extraction"],
        endpoint: "a2a://rag-agent",
        status: "online"
      },
      {
        id: "mcp-coordinator",
        name: "MCP Tool Coordinator",
        capabilities: ["tool-orchestration", "resource-management", "protocol-bridging"],
        endpoint: "a2a://mcp-coordinator", 
        status: "online"
      },
      {
        id: "deepseek-reasoner",
        name: "DeepSeek Reasoning Agent",
        capabilities: ["complex-reasoning", "chain-of-thought", "problem-solving"],
        endpoint: "a2a://deepseek-reasoner",
        status: "online"
      },
      {
        id: "workflow-orchestrator",
        name: "Workflow Orchestration Agent",
        capabilities: ["task-delegation", "process-coordination", "system-integration"],
        endpoint: "a2a://workflow-orchestrator",
        status: "online"
      }
    ];

    this.initialized = true;
    console.log("A2A Service initialized with", this.agents.length, "agents");
  }

  async sendMessage(message: A2AMessage): Promise<A2AMessage | null> {
    console.log("A2A Message sent:", message);
    
    const targetAgent = this.agents.find(agent => agent.id === message.to);
    if (!targetAgent) {
      console.warn(`Target agent ${message.to} not found`);
      return null;
    }

    // Simulate message processing
    this.messageQueue.push(message);
    
    // Simulate response based on message type
    const response: A2AMessage = {
      id: `resp-${Date.now()}`,
      from: message.to,
      to: message.from,
      type: "response",
      payload: {
        originalMessage: message.id,
        result: `Processed by ${targetAgent.name}`,
        capabilities: targetAgent.capabilities,
        timestamp: Date.now()
      },
      timestamp: Date.now()
    };

    this.messageQueue.push(response);
    return response;
  }

  async delegateTask(description: string, requiredCapabilities: string[]): Promise<A2ATaskDelegation> {
    const taskId = `task-${Date.now()}`;
    
    // Find suitable agent based on capabilities
    const suitableAgent = this.agents.find(agent => 
      requiredCapabilities.some(cap => agent.capabilities.includes(cap)) &&
      agent.status === "online"
    );

    const delegation: A2ATaskDelegation = {
      taskId,
      description,
      requiredCapabilities,
      assignedAgent: suitableAgent,
      status: suitableAgent ? "assigned" : "pending"
    };

    this.activeTasks.set(taskId, delegation);
    
    console.log(`Task ${taskId} delegated to:`, suitableAgent?.name || "No suitable agent");
    
    return delegation;
  }

  getAgents(): A2AAgent[] {
    return [...this.agents];
  }

  getMessages(): A2AMessage[] {
    return [...this.messageQueue];
  }

  getActiveTasks(): A2ATaskDelegation[] {
    return Array.from(this.activeTasks.values());
  }

  isInitialized(): boolean {
    return this.initialized;
  }

  async updateAgentStatus(agentId: string, status: "online" | "offline" | "busy"): Promise<void> {
    const agent = this.agents.find(a => a.id === agentId);
    if (agent) {
      agent.status = status;
    }
  }

  getAgentMetrics(): any {
    return {
      totalAgents: this.agents.length,
      onlineAgents: this.agents.filter(a => a.status === "online").length,
      totalMessages: this.messageQueue.length,
      activeTasks: this.activeTasks.size,
      lastActivity: this.messageQueue.length > 0 ? 
        Math.max(...this.messageQueue.map(m => m.timestamp)) : 0
    };
  }
}

export const a2aService = A2AService.getInstance();
