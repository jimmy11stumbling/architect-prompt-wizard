
import { A2AMessage, A2AAgent } from "@/types/ipa-types";
import { realTimeResponseService } from "../integration/realTimeResponseService";

export { A2AMessage, A2AAgent };

export interface TaskDelegation {
  taskId: string;
  assignedAgent?: A2AAgent;
  status: "pending" | "assigned" | "completed" | "failed";
  timestamp: number;
}

export class A2AService {
  private initialized = false;
  private agents: A2AAgent[] = [];
  private messages: A2AMessage[] = [];
  private tasks: TaskDelegation[] = [];

  async initialize(): Promise<void> {
    if (this.initialized) return;

    realTimeResponseService.addResponse({
      source: "a2a-service",
      status: "processing",
      message: "Initializing A2A network service"
    });

    await new Promise(resolve => setTimeout(resolve, 500));

    // Initialize with sample agents
    this.agents = [
      {
        id: "agent-rag-coordinator",
        name: "RAG Coordinator",
        status: "active",
        capabilities: ["document-retrieval", "semantic-search", "rag-operations"],
        endpoint: "a2a://localhost:9001",
        lastSeen: Date.now()
      },
      {
        id: "agent-mcp-coordinator", 
        name: "MCP Coordinator",
        status: "active",
        capabilities: ["tool-execution", "resource-access", "mcp-operations"],
        endpoint: "a2a://localhost:9002",
        lastSeen: Date.now()
      },
      {
        id: "agent-workflow-orchestrator",
        name: "Workflow Orchestrator",
        status: "active", 
        capabilities: ["task-coordination", "workflow-management"],
        endpoint: "a2a://localhost:9003",
        lastSeen: Date.now()
      }
    ];

    realTimeResponseService.addResponse({
      source: "a2a-service",
      status: "success",
      message: "A2A network initialized successfully",
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

  getAllAgents(): A2AAgent[] {
    return [...this.agents];
  }

  getMessages(): A2AMessage[] {
    return [...this.messages];
  }

  getAgentMetrics(): any {
    const onlineAgents = this.agents.filter(a => a.status === "active").length;
    return {
      totalAgents: this.agents.length,
      onlineAgents,
      totalMessages: this.messages.length,
      activeTasks: this.tasks.filter(t => t.status === "pending" || t.status === "assigned").length
    };
  }

  async sendMessage(message: A2AMessage): Promise<A2AMessage | null> {
    this.messages.push(message);
    
    realTimeResponseService.addResponse({
      source: "a2a-service",
      status: "success",
      message: `Message sent from ${message.from} to ${message.to}`,
      data: { messageId: message.id, type: message.type }
    });

    // Simulate response
    if (message.type === "request") {
      const response: A2AMessage = {
        id: `response-${Date.now()}`,
        from: message.to,
        to: message.from,
        type: "response",
        payload: { status: "acknowledged", originalMessage: message.id },
        timestamp: Date.now()
      };
      
      setTimeout(() => {
        this.messages.push(response);
      }, 500);
      
      return response;
    }
    
    return null;
  }

  async delegateTask(description: string, requiredCapabilities: string[]): Promise<TaskDelegation> {
    const availableAgents = this.agents.filter(agent => 
      agent.status === "active" && 
      requiredCapabilities.some(cap => agent.capabilities.includes(cap))
    );

    const taskId = `task-${Date.now()}`;
    const assignedAgent = availableAgents[0] || null;

    const delegation: TaskDelegation = {
      taskId,
      assignedAgent,
      status: assignedAgent ? "assigned" : "pending",
      timestamp: Date.now()
    };

    this.tasks.push(delegation);

    realTimeResponseService.addResponse({
      source: "a2a-service",
      status: assignedAgent ? "success" : "warning",
      message: `Task ${taskId} ${assignedAgent ? 'assigned to ' + assignedAgent.name : 'pending - no suitable agent found'}`,
      data: { taskId, requiredCapabilities, assignedAgent: assignedAgent?.name }
    });

    return delegation;
  }

  async healthCheck(): Promise<boolean> {
    return this.initialized && this.agents.some(a => a.status === "active");
  }
}

export const a2aService = new A2AService();
