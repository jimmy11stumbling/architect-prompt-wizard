
import { realTimeResponseService } from "../integration/realTimeResponseService";

export type { A2AAgent, A2AMessage } from "@/types/ipa-types";

export class A2AService {
  private agents: any[] = [];
  private messages: any[] = [];
  private initialized = false;

  async initialize(): Promise<void> {
    if (this.initialized) return;

    realTimeResponseService.addResponse({
      source: "a2a-service",
      status: "processing",
      message: "Initializing A2A communication service"
    });

    // Simulate initialization
    await new Promise(resolve => setTimeout(resolve, 300));

    // Initialize with mock agents
    this.agents = [
      {
        id: "agent-coordinator",
        name: "Coordination Agent",
        status: "active",
        capabilities: ["task-coordination", "resource-allocation"],
        endpoint: "a2a://coordinator.local",
        lastSeen: Date.now()
      },
      {
        id: "agent-rag-coordinator",
        name: "RAG Coordinator Agent", 
        status: "active",
        capabilities: ["rag-queries", "document-retrieval"],
        endpoint: "a2a://rag-coordinator.local",
        lastSeen: Date.now()
      },
      {
        id: "agent-mcp-bridge",
        name: "MCP Bridge Agent",
        status: "active", 
        capabilities: ["tool-execution", "resource-access"],
        endpoint: "a2a://mcp-bridge.local",
        lastSeen: Date.now()
      }
    ];

    realTimeResponseService.addResponse({
      source: "a2a-service",
      status: "success",
      message: "A2A service initialized successfully",
      data: {
        agentCount: this.agents.length,
        capabilities: this.agents.flatMap(a => a.capabilities)
      }
    });

    this.initialized = true;
  }

  isInitialized(): boolean {
    return this.initialized;
  }

  getAllAgents() {
    return [...this.agents];
  }

  getMessages() {
    return [...this.messages];
  }

  getAgentMetrics() {
    return {
      totalAgents: this.agents.length,
      activeAgents: this.agents.filter(a => a.status === "active").length,
      totalMessages: this.messages.length,
      lastActivity: this.messages.length > 0 ? Math.max(...this.messages.map(m => m.timestamp)) : Date.now()
    };
  }

  async delegateTask(taskDescription: string, requiredCapabilities: string[]) {
    realTimeResponseService.addResponse({
      source: "a2a-service",
      status: "processing",
      message: `Delegating task: ${taskDescription}`,
      data: { taskDescription, requiredCapabilities }
    });

    // Find suitable agent based on capabilities
    const suitableAgent = this.agents.find(agent => 
      agent.status === "active" && 
      requiredCapabilities.some(cap => agent.capabilities.includes(cap))
    );

    const taskId = `task-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

    if (suitableAgent) {
      realTimeResponseService.addResponse({
        source: "a2a-service",
        status: "success",
        message: `Task delegated to ${suitableAgent.name}`,
        data: { taskId, assignedAgent: suitableAgent.name }
      });

      return {
        taskId,
        assignedAgent: suitableAgent,
        status: "delegated"
      };
    } else {
      realTimeResponseService.addResponse({
        source: "a2a-service",
        status: "error",
        message: "No suitable agent found for task delegation",
        data: { taskId, requiredCapabilities }
      });

      return {
        taskId,
        assignedAgent: null,
        status: "failed"
      };
    }
  }

  async sendMessage(message: any) {
    realTimeResponseService.addResponse({
      source: "a2a-service",
      status: "processing",
      message: `Sending A2A message from ${message.from} to ${message.to}`,
      data: { messageType: message.type, from: message.from, to: message.to }
    });

    // Simulate message processing
    await new Promise(resolve => setTimeout(resolve, 200));

    const newMessage = {
      ...message,
      id: `msg-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      timestamp: Date.now()
    };

    this.messages.unshift(newMessage);

    // Keep only last 50 messages
    if (this.messages.length > 50) {
      this.messages = this.messages.slice(0, 50);
    }

    realTimeResponseService.addResponse({
      source: "a2a-service",
      status: "success",
      message: `A2A message delivered successfully`,
      data: { 
        messageId: newMessage.id,
        from: message.from,
        to: message.to,
        messageCount: this.messages.length
      }
    });

    return newMessage;
  }

  async healthCheck(): Promise<boolean> {
    realTimeResponseService.addResponse({
      source: "a2a-service", 
      status: "processing",
      message: "Performing A2A health check"
    });

    const activeAgents = this.agents.filter(a => a.status === "active").length;
    const isHealthy = this.initialized && activeAgents > 0;

    realTimeResponseService.addResponse({
      source: "a2a-service",
      status: isHealthy ? "success" : "error",
      message: `A2A health check ${isHealthy ? "passed" : "failed"}`,
      data: { 
        healthy: isHealthy,
        activeAgents,
        totalAgents: this.agents.length
      }
    });

    return isHealthy;
  }
}

export const a2aService = new A2AService();
