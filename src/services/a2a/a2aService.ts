
import { realTimeResponseService } from "../integration/realTimeResponseService";
import { A2AAgent, A2AMessage } from "@/types/ipa-types";

export class A2AService {
  private agents: A2AAgent[] = [];
  private messages: A2AMessage[] = [];
  private initialized = false;

  async initialize(): Promise<void> {
    if (this.initialized) return;

    realTimeResponseService.addResponse({
      source: "a2a-service",
      status: "processing",
      message: "Initializing A2A communication protocol"
    });

    // Initialize with demo agents
    this.agents = [
      {
        id: "reasoning-assistant",
        name: "Reasoning Assistant",
        status: "active",
        capabilities: ["reasoning", "analysis", "problem-solving"],
        endpoint: "ws://localhost:8001/a2a",
        lastSeen: Date.now()
      },
      {
        id: "context-analyzer", 
        name: "Context Analyzer",
        status: "active",
        capabilities: ["context-analysis", "document-processing", "summarization"],
        endpoint: "ws://localhost:8002/a2a",
        lastSeen: Date.now()
      },
      {
        id: "documentation-expert",
        name: "Documentation Expert", 
        status: "active",
        capabilities: ["documentation", "writing", "technical-writing"],
        endpoint: "ws://localhost:8003/a2a",
        lastSeen: Date.now()
      },
      {
        id: "workflow-coordinator",
        name: "Workflow Coordinator",
        status: "active", 
        capabilities: ["workflow-management", "task-coordination", "scheduling"],
        endpoint: "ws://localhost:8004/a2a",
        lastSeen: Date.now()
      }
    ];

    realTimeResponseService.addResponse({
      source: "a2a-service",
      status: "success",
      message: "A2A protocol initialized with 4 active agents",
      data: {
        agentCount: this.agents.length,
        activeAgents: this.agents.filter(a => a.status === "active").length
      }
    });

    this.initialized = true;
  }

  isInitialized(): boolean {
    return this.initialized;
  }

  getAllAgents(): A2AAgent[] {
    return [...this.agents];
  }

  getAllMessages(): A2AMessage[] {
    return [...this.messages];
  }

  async sendMessage(messageData: {
    from: string;
    to: string;
    type: "request" | "response" | "notification";
    payload: any;
    priority?: "low" | "normal" | "high";
  }): Promise<A2AMessage> {
    realTimeResponseService.addResponse({
      source: "a2a-service",
      status: "processing",
      message: `Sending A2A message from ${messageData.from} to ${messageData.to}`,
      data: { messageType: messageData.type, hasPayload: !!messageData.payload }
    });

    const message: A2AMessage = {
      id: `msg-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      from: messageData.from,
      to: messageData.to,
      type: messageData.type,
      payload: messageData.payload,
      timestamp: Date.now(),
      priority: messageData.priority || "normal"
    };

    this.messages.push(message);

    // Update agent last seen if it's a known agent
    const targetAgent = this.agents.find(a => a.id === messageData.to);
    if (targetAgent) {
      targetAgent.lastSeen = Date.now();
    }

    realTimeResponseService.addResponse({
      source: "a2a-service",
      status: "success", 
      message: `A2A message delivered successfully`,
      data: {
        messageId: message.id,
        from: message.from,
        to: message.to,
        type: message.type
      }
    });

    return message;
  }

  async delegateTask(
    task: string, 
    requiredCapabilities: string[]
  ): Promise<{ success: boolean; assignedAgent?: A2AAgent; message?: string }> {
    realTimeResponseService.addResponse({
      source: "a2a-service",
      status: "processing",
      message: `Delegating task: ${task}`,
      data: { task: task.substring(0, 50), requiredCapabilities }
    });

    // Find agents with matching capabilities
    const eligibleAgents = this.agents.filter(agent => 
      agent.status === "active" && 
      requiredCapabilities.some(cap => agent.capabilities.includes(cap))
    );

    if (eligibleAgents.length === 0) {
      realTimeResponseService.addResponse({
        source: "a2a-service",
        status: "error",
        message: "No eligible agents found for task delegation",
        data: { requiredCapabilities, availableAgents: this.agents.length }
      });

      return {
        success: false,
        message: "No agents available with required capabilities"
      };
    }

    // Select the agent with the most matching capabilities
    const selectedAgent = eligibleAgents.reduce((best, current) => {
      const bestMatches = best.capabilities.filter(cap => requiredCapabilities.includes(cap)).length;
      const currentMatches = current.capabilities.filter(cap => requiredCapabilities.includes(cap)).length;
      return currentMatches > bestMatches ? current : best;
    });

    // Mark agent as busy
    selectedAgent.status = "busy";

    // Send task delegation message
    await this.sendMessage({
      from: "system-coordinator",
      to: selectedAgent.id,
      type: "request",
      payload: {
        task,
        requiredCapabilities,
        timestamp: Date.now()
      },
      priority: "normal"
    });

    realTimeResponseService.addResponse({
      source: "a2a-service", 
      status: "success",
      message: `Task successfully delegated to ${selectedAgent.name}`,
      data: {
        assignedAgent: selectedAgent.name,
        agentId: selectedAgent.id,
        matchingCapabilities: selectedAgent.capabilities.filter(cap => requiredCapabilities.includes(cap))
      }
    });

    // Simulate agent becoming available again after some time
    setTimeout(() => {
      selectedAgent.status = "active";
      selectedAgent.lastSeen = Date.now();
    }, 5000);

    return {
      success: true,
      assignedAgent: selectedAgent,
      message: `Task delegated to ${selectedAgent.name}`
    };
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
        totalAgents: this.agents.length,
        activeAgents,
        messageCount: this.messages.length
      }
    });

    return isHealthy;
  }
}

export const a2aService = new A2AService();
