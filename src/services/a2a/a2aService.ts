
import { A2AAgent, DeepSeekMessage } from "@/types/ipa-types";

export interface A2AMessage {
  id: string;
  from: string;
  to: string;
  type: "request" | "response" | "notification";
  payload: any;
  timestamp: number;
}

export class A2AService {
  private static instance: A2AService;
  private agents: Map<string, A2AAgent> = new Map();
  private messageHistory: A2AMessage[] = [];

  static getInstance(): A2AService {
    if (!A2AService.instance) {
      A2AService.instance = new A2AService();
    }
    return A2AService.instance;
  }

  async initialize(): Promise<void> {
    await this.registerCoreAgents();
    console.log("A2A Service initialized with core agents");
  }

  private async registerCoreAgents(): Promise<void> {
    const coreAgents: A2AAgent[] = [
      {
        id: "rag-agent",
        name: "RAG Knowledge Agent",
        capabilities: ["document-retrieval", "semantic-search", "knowledge-synthesis"],
        endpoint: "/api/agents/rag",
        status: "online"
      },
      {
        id: "mcp-coordinator",
        name: "MCP Coordination Agent",
        capabilities: ["tool-orchestration", "resource-management", "prompt-generation"],
        endpoint: "/api/agents/mcp",
        status: "online"
      },
      {
        id: "reasoning-agent",
        name: "DeepSeek Reasoning Agent",
        capabilities: ["complex-reasoning", "chain-of-thought", "problem-solving"],
        endpoint: "/api/agents/reasoning",
        status: "online"
      },
      {
        id: "integration-agent",
        name: "System Integration Agent",
        capabilities: ["api-coordination", "workflow-management", "error-handling"],
        endpoint: "/api/agents/integration",
        status: "online"
      }
    ];

    coreAgents.forEach(agent => {
      this.agents.set(agent.id, agent);
    });
  }

  async sendMessage(message: A2AMessage): Promise<A2AMessage | null> {
    this.messageHistory.push(message);
    
    const targetAgent = this.agents.get(message.to);
    if (!targetAgent) {
      console.error(`Agent ${message.to} not found`);
      return null;
    }

    console.log(`A2A Message sent from ${message.from} to ${message.to}:`, message.type);
    
    // Simulate agent processing and response
    const response = await this.processAgentMessage(message, targetAgent);
    
    if (response) {
      this.messageHistory.push(response);
    }
    
    return response;
  }

  private async processAgentMessage(message: A2AMessage, agent: A2AAgent): Promise<A2AMessage | null> {
    // Simulate different agent behaviors based on their capabilities
    let responsePayload: any = {};
    
    switch (agent.id) {
      case "rag-agent":
        if (message.payload.query) {
          responsePayload = {
            documents: [`Relevant documentation for: ${message.payload.query}`],
            source: "RAG Database",
            confidence: 0.85
          };
        }
        break;
        
      case "mcp-coordinator":
        responsePayload = {
          tools: ["document-processor", "semantic-analyzer", "context-manager"],
          resources: ["knowledge-base", "vector-store", "embedding-model"],
          status: "ready"
        };
        break;
        
      case "reasoning-agent":
        responsePayload = {
          reasoning: `Analyzing request: ${JSON.stringify(message.payload)}`,
          conclusion: "Analysis complete with high confidence",
          nextSteps: ["verify-results", "integrate-findings", "generate-response"]
        };
        break;
        
      case "integration-agent":
        responsePayload = {
          integrationStatus: "success",
          connectedSystems: ["RAG", "MCP", "DeepSeek", "A2A"],
          systemHealth: "optimal"
        };
        break;
    }

    return {
      id: `resp-${Date.now()}`,
      from: agent.id,
      to: message.from,
      type: "response",
      payload: responsePayload,
      timestamp: Date.now()
    };
  }

  getAgents(): A2AAgent[] {
    return Array.from(this.agents.values());
  }

  getMessageHistory(): A2AMessage[] {
    return this.messageHistory;
  }

  async discoverAgents(capability?: string): Promise<A2AAgent[]> {
    if (!capability) {
      return this.getAgents();
    }
    
    return this.getAgents().filter(agent => 
      agent.capabilities.includes(capability)
    );
  }

  async delegateTask(taskDescription: string, requiredCapabilities: string[]): Promise<{
    assignedAgent: A2AAgent | null;
    message: A2AMessage | null;
  }> {
    const suitableAgents = this.getAgents().filter(agent =>
      requiredCapabilities.some(cap => agent.capabilities.includes(cap))
    );

    if (suitableAgents.length === 0) {
      return { assignedAgent: null, message: null };
    }

    const assignedAgent = suitableAgents[0]; // Simple selection strategy
    
    const message: A2AMessage = {
      id: `task-${Date.now()}`,
      from: "system",
      to: assignedAgent.id,
      type: "request",
      payload: {
        task: taskDescription,
        requiredCapabilities,
        priority: "normal"
      },
      timestamp: Date.now()
    };

    const response = await this.sendMessage(message);
    
    return { assignedAgent, message: response };
  }
}

export const a2aService = A2AService.getInstance();
