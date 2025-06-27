/**
 * Agent-to-Agent (A2A) Communication System
 * Advanced multi-agent coordination using FIPA ACL protocol
 * Implements agent discovery, message routing, and negotiation capabilities
 */

import { PlatformType, TechStack, AgentName } from "@/types/ipa-types";

// FIPA ACL Message Types
export type ACLPerformative = 
  | "inform"      // Information sharing
  | "request"     // Task delegation
  | "query-if"    // Conditional queries
  | "query-ref"   // Reference queries
  | "propose"     // Proposals/offers
  | "accept-proposal" // Accept proposal
  | "reject-proposal" // Reject proposal
  | "confirm"     // Confirmation
  | "disconfirm"  // Disconfirmation
  | "cancel"      // Cancellation
  | "agree"       // Agreement
  | "refuse"      // Refusal
  | "not-understood"; // Communication failure

// Agent Communication Language (ACL) Message Structure
export interface ACLMessage {
  id: string;
  performative: ACLPerformative;
  sender: AgentIdentifier;
  receivers: AgentIdentifier[];
  content: MessageContent;
  language: string;
  encoding: string;
  ontology?: string;
  protocol?: string;
  conversationId?: string;
  replyWith?: string;
  inReplyTo?: string;
  replyBy?: Date;
  timestamp: Date;
}

// Agent Identification
export interface AgentIdentifier {
  name: string;
  addresses: string[];
  resolvers?: string[];
}

// Message Content Types
export interface MessageContent {
  type: 'text' | 'json' | 'binary';
  data: any;
  schema?: string;
}

// Agent Capabilities
export interface AgentCapability {
  name: string;
  description: string;
  inputs: string[];
  outputs: string[];
  constraints: string[];
  cost: number;
  reliability: number;
}

// Agent Registration Information
export interface AgentRegistration {
  identifier: AgentIdentifier;
  capabilities: AgentCapability[];
  services: string[];
  protocols: string[];
  languages: string[];
  status: 'active' | 'busy' | 'inactive';
  load: number; // 0-1
  lastHeartbeat: Date;
  metadata: {
    platform?: PlatformType;
    techStack?: TechStack[];
    specialization?: string[];
    version: string;
  };
}

// Conversation State
export interface Conversation {
  id: string;
  participants: AgentIdentifier[];
  protocol: string;
  state: 'initiating' | 'negotiating' | 'executing' | 'completed' | 'failed';
  messages: ACLMessage[];
  context: any;
  startTime: Date;
  deadline?: Date;
}

// Contract Net Protocol Structures
export interface TaskAnnouncement {
  taskId: string;
  description: string;
  requirements: {
    capabilities: string[];
    constraints: string[];
    deadline: Date;
    budget?: number;
  };
  evaluationCriteria: {
    cost: number;
    quality: number;
    time: number;
    reliability: number;
  };
}

export interface Bid {
  taskId: string;
  bidder: AgentIdentifier;
  proposal: {
    cost: number;
    deliveryTime: Date;
    quality: number;
    approach: string;
  };
  capabilities: AgentCapability[];
  timestamp: Date;
}

// Agent Directory Service
export class AgentDirectoryService {
  private agents: Map<string, AgentRegistration> = new Map();
  private capabilities: Map<string, AgentIdentifier[]> = new Map();

  /**
   * Register an agent with the directory
   */
  registerAgent(registration: AgentRegistration): boolean {
    try {
      const agentName = registration.identifier.name;
      
      // Store agent registration
      this.agents.set(agentName, registration);
      
      // Index by capabilities
      registration.capabilities.forEach(capability => {
        if (!this.capabilities.has(capability.name)) {
          this.capabilities.set(capability.name, []);
        }
        this.capabilities.get(capability.name)!.push(registration.identifier);
      });

      console.log(`Agent registered: ${agentName}`);
      return true;
    } catch (error) {
      console.error('Agent registration failed:', error);
      return false;
    }
  }

  /**
   * Deregister an agent
   */
  deregisterAgent(agentName: string): boolean {
    const registration = this.agents.get(agentName);
    if (!registration) return false;

    // Remove from capability index
    registration.capabilities.forEach(capability => {
      const agentList = this.capabilities.get(capability.name);
      if (agentList) {
        const index = agentList.findIndex(id => id.name === agentName);
        if (index >= 0) {
          agentList.splice(index, 1);
        }
      }
    });

    // Remove from main registry
    this.agents.delete(agentName);
    console.log(`Agent deregistered: ${agentName}`);
    return true;
  }

  /**
   * Find agents by capability
   */
  findAgentsByCapability(capability: string): AgentRegistration[] {
    const agentIds = this.capabilities.get(capability) || [];
    return agentIds
      .map(id => this.agents.get(id.name))
      .filter(agent => agent && agent.status === 'active') as AgentRegistration[];
  }

  /**
   * Find agents by multiple criteria
   */
  findAgents(criteria: {
    capabilities?: string[];
    platform?: PlatformType;
    techStack?: TechStack[];
    maxLoad?: number;
  }): AgentRegistration[] {
    return Array.from(this.agents.values()).filter(agent => {
      if (agent.status !== 'active') return false;
      if (criteria.maxLoad && agent.load > criteria.maxLoad) return false;
      if (criteria.platform && agent.metadata.platform !== criteria.platform) return false;
      
      if (criteria.capabilities) {
        const agentCapabilities = agent.capabilities.map(c => c.name);
        const hasAllCapabilities = criteria.capabilities.every(cap => 
          agentCapabilities.includes(cap)
        );
        if (!hasAllCapabilities) return false;
      }

      if (criteria.techStack) {
        const agentTechStack = agent.metadata.techStack || [];
        const hasCommonTech = criteria.techStack.some(tech => 
          agentTechStack.includes(tech)
        );
        if (!hasCommonTech) return false;
      }

      return true;
    });
  }

  /**
   * Get all registered agents
   */
  getAllAgents(): AgentRegistration[] {
    return Array.from(this.agents.values());
  }

  /**
   * Update agent heartbeat
   */
  updateHeartbeat(agentName: string): boolean {
    const agent = this.agents.get(agentName);
    if (agent) {
      agent.lastHeartbeat = new Date();
      return true;
    }
    return false;
  }

  /**
   * Clean up inactive agents
   */
  cleanupInactiveAgents(timeoutMs: number = 300000): number { // 5 minutes default
    const now = new Date();
    let removed = 0;

    for (const [name, agent] of this.agents) {
      const timeSinceHeartbeat = now.getTime() - agent.lastHeartbeat.getTime();
      if (timeSinceHeartbeat > timeoutMs) {
        this.deregisterAgent(name);
        removed++;
      }
    }

    return removed;
  }
}

// Message Router
export class MessageRouter {
  private messageQueue: Map<string, ACLMessage[]> = new Map();
  private deliveryCallbacks: Map<string, (message: ACLMessage) => void> = new Map();

  /**
   * Route message to recipient(s)
   */
  routeMessage(message: ACLMessage): Promise<boolean[]> {
    const results: Promise<boolean>[] = [];

    message.receivers.forEach(receiver => {
      results.push(this.deliverMessage(receiver.name, message));
    });

    return Promise.all(results);
  }

  /**
   * Deliver message to specific agent
   */
  private async deliverMessage(agentName: string, message: ACLMessage): Promise<boolean> {
    try {
      // Check if agent has active callback
      const callback = this.deliveryCallbacks.get(agentName);
      if (callback) {
        callback(message);
        return true;
      }

      // Queue message for later delivery
      if (!this.messageQueue.has(agentName)) {
        this.messageQueue.set(agentName, []);
      }
      this.messageQueue.get(agentName)!.push(message);
      
      console.log(`Message queued for agent: ${agentName}`);
      return true;
    } catch (error) {
      console.error(`Failed to deliver message to ${agentName}:`, error);
      return false;
    }
  }

  /**
   * Register message callback for agent
   */
  registerMessageCallback(agentName: string, callback: (message: ACLMessage) => void): void {
    this.deliveryCallbacks.set(agentName, callback);
    
    // Deliver queued messages
    const queuedMessages = this.messageQueue.get(agentName) || [];
    queuedMessages.forEach(message => callback(message));
    this.messageQueue.delete(agentName);
  }

  /**
   * Unregister message callback
   */
  unregisterMessageCallback(agentName: string): void {
    this.deliveryCallbacks.delete(agentName);
  }

  /**
   * Get queued messages for agent
   */
  getQueuedMessages(agentName: string): ACLMessage[] {
    return this.messageQueue.get(agentName) || [];
  }
}

// Contract Net Protocol Implementation
export class ContractNetProtocol {
  private activeTasks: Map<string, TaskAnnouncement> = new Map();
  private receivedBids: Map<string, Bid[]> = new Map();
  private messageRouter: MessageRouter;
  private directoryService: AgentDirectoryService;

  constructor(messageRouter: MessageRouter, directoryService: AgentDirectoryService) {
    this.messageRouter = messageRouter;
    this.directoryService = directoryService;
  }

  /**
   * Announce task to potential contractors
   */
  async announceTask(task: TaskAnnouncement, initiator: AgentIdentifier): Promise<string> {
    this.activeTasks.set(task.taskId, task);
    this.receivedBids.set(task.taskId, []);

    // Find agents with required capabilities
    const eligibleAgents = this.directoryService.findAgents({
      capabilities: task.requirements.capabilities
    });

    // Send call for proposals (CFP) messages
    const cfpPromises = eligibleAgents.map(agent => {
      const message: ACLMessage = {
        id: this.generateMessageId(),
        performative: 'request',
        sender: initiator,
        receivers: [agent.identifier],
        content: {
          type: 'json',
          data: {
            type: 'call-for-proposals',
            task: task
          }
        },
        language: 'json',
        encoding: 'utf-8',
        protocol: 'contract-net',
        conversationId: task.taskId,
        timestamp: new Date()
      };

      return this.messageRouter.routeMessage(message);
    });

    await Promise.all(cfpPromises);
    console.log(`Task announced: ${task.taskId} to ${eligibleAgents.length} agents`);
    
    return task.taskId;
  }

  /**
   * Submit bid for announced task
   */
  async submitBid(bid: Bid): Promise<boolean> {
    const task = this.activeTasks.get(bid.taskId);
    if (!task) {
      console.error(`Task not found: ${bid.taskId}`);
      return false;
    }

    // Check deadline
    if (new Date() > task.requirements.deadline) {
      console.error(`Bid submitted after deadline: ${bid.taskId}`);
      return false;
    }

    // Store bid
    const bids = this.receivedBids.get(bid.taskId)!;
    bids.push(bid);

    console.log(`Bid received for task ${bid.taskId} from ${bid.bidder.name}`);
    return true;
  }

  /**
   * Evaluate bids and select winner
   */
  async evaluateBids(taskId: string): Promise<Bid | null> {
    const task = this.activeTasks.get(taskId);
    const bids = this.receivedBids.get(taskId);

    if (!task || !bids || bids.length === 0) {
      return null;
    }

    // Score each bid based on evaluation criteria
    const scoredBids = bids.map(bid => {
      const score = this.calculateBidScore(bid, task);
      return { bid, score };
    });

    // Select highest scoring bid
    scoredBids.sort((a, b) => b.score - a.score);
    const winner = scoredBids[0];

    console.log(`Task ${taskId} awarded to ${winner.bid.bidder.name} with score ${winner.score}`);
    return winner.bid;
  }

  /**
   * Calculate bid score based on evaluation criteria
   */
  private calculateBidScore(bid: Bid, task: TaskAnnouncement): number {
    const criteria = task.evaluationCriteria;
    
    // Normalize factors (0-1)
    const costScore = 1 - Math.min(bid.proposal.cost / 10000, 1); // Assume max cost of 10000
    const timeScore = 1 - Math.min(
      (bid.proposal.deliveryTime.getTime() - new Date().getTime()) / 
      (task.requirements.deadline.getTime() - new Date().getTime()), 1
    );
    const qualityScore = bid.proposal.quality;
    const reliabilityScore = this.getAgentReliability(bid.bidder.name);

    // Weighted average
    return (
      costScore * criteria.cost +
      timeScore * criteria.time +
      qualityScore * criteria.quality +
      reliabilityScore * criteria.reliability
    ) / (criteria.cost + criteria.time + criteria.quality + criteria.reliability);
  }

  /**
   * Get agent reliability from directory
   */
  private getAgentReliability(agentName: string): number {
    const agents = this.directoryService.getAllAgents();
    const agent = agents.find(a => a.identifier.name === agentName);
    
    if (agent && agent.capabilities.length > 0) {
      return agent.capabilities.reduce((avg, cap) => avg + cap.reliability, 0) / agent.capabilities.length;
    }
    
    return 0.5; // Default reliability
  }

  /**
   * Award contract to winning bidder
   */
  async awardContract(taskId: string, winningBid: Bid, initiator: AgentIdentifier): Promise<boolean> {
    try {
      // Send acceptance to winner
      const acceptMessage: ACLMessage = {
        id: this.generateMessageId(),
        performative: 'accept-proposal',
        sender: initiator,
        receivers: [winningBid.bidder],
        content: {
          type: 'json',
          data: {
            type: 'contract-award',
            taskId: taskId,
            bid: winningBid
          }
        },
        language: 'json',
        encoding: 'utf-8',
        protocol: 'contract-net',
        conversationId: taskId,
        timestamp: new Date()
      };

      // Send rejections to other bidders
      const rejectedBids = this.receivedBids.get(taskId)!.filter(
        bid => bid.bidder.name !== winningBid.bidder.name
      );

      const rejectPromises = rejectedBids.map(bid => {
        const rejectMessage: ACLMessage = {
          id: this.generateMessageId(),
          performative: 'reject-proposal',
          sender: initiator,
          receivers: [bid.bidder],
          content: {
            type: 'json',
            data: {
              type: 'contract-rejection',
              taskId: taskId,
              reason: 'Better proposal selected'
            }
          },
          language: 'json',
          encoding: 'utf-8',
          protocol: 'contract-net',
          conversationId: taskId,
          timestamp: new Date()
        };

        return this.messageRouter.routeMessage(rejectMessage);
      });

      await this.messageRouter.routeMessage(acceptMessage);
      await Promise.all(rejectPromises);

      return true;
    } catch (error) {
      console.error('Failed to award contract:', error);
      return false;
    }
  }

  private generateMessageId(): string {
    return `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
}

// Main A2A Communication System
export class A2ACommunicationSystem {
  private directoryService: AgentDirectoryService;
  private messageRouter: MessageRouter;
  private contractNet: ContractNetProtocol;
  private conversations: Map<string, Conversation> = new Map();

  constructor() {
    this.directoryService = new AgentDirectoryService();
    this.messageRouter = new MessageRouter();
    this.contractNet = new ContractNetProtocol(this.messageRouter, this.directoryService);
  }

  /**
   * Initialize the A2A system
   */
  async initialize(): Promise<void> {
    console.log('Initializing A2A Communication System...');
    
    // Register core agents
    await this.registerCoreAgents();
    
    // Start cleanup routine
    setInterval(() => {
      const removed = this.directoryService.cleanupInactiveAgents();
      if (removed > 0) {
        console.log(`Cleaned up ${removed} inactive agents`);
      }
    }, 60000); // Every minute

    console.log('A2A Communication System initialized');
  }

  /**
   * Register core system agents
   */
  private async registerCoreAgents(): Promise<void> {
    const coreAgents: AgentRegistration[] = [
      {
        identifier: {
          name: 'reasoning-assistant',
          addresses: ['local://reasoning-assistant']
        },
        capabilities: [
          {
            name: 'logical-reasoning',
            description: 'Advanced logical reasoning and problem analysis',
            inputs: ['problem-statement', 'constraints'],
            outputs: ['reasoning-chain', 'conclusions'],
            constraints: ['max-complexity-level: 10'],
            cost: 1.0,
            reliability: 0.95
          }
        ],
        services: ['analysis', 'reasoning', 'problem-solving'],
        protocols: ['contract-net', 'direct-communication'],
        languages: ['json', 'text'],
        status: 'active',
        load: 0.0,
        lastHeartbeat: new Date(),
        metadata: {
          specialization: ['logical-reasoning', 'analysis'],
          version: '2.0'
        }
      },
      {
        identifier: {
          name: 'context-analyzer',
          addresses: ['local://context-analyzer']
        },
        capabilities: [
          {
            name: 'context-analysis',
            description: 'Deep context analysis and requirement extraction',
            inputs: ['raw-context', 'specifications'],
            outputs: ['structured-context', 'requirements'],
            constraints: ['max-context-size: 100KB'],
            cost: 0.8,
            reliability: 0.92
          }
        ],
        services: ['context-analysis', 'requirement-extraction'],
        protocols: ['contract-net', 'direct-communication'],
        languages: ['json', 'text'],
        status: 'active',
        load: 0.0,
        lastHeartbeat: new Date(),
        metadata: {
          specialization: ['context-analysis', 'requirements'],
          version: '2.0'
        }
      },
      {
        identifier: {
          name: 'documentation-expert',
          addresses: ['local://documentation-expert']
        },
        capabilities: [
          {
            name: 'documentation-generation',
            description: 'Generate comprehensive technical documentation',
            inputs: ['code-structure', 'requirements', 'specifications'],
            outputs: ['documentation', 'guides', 'api-docs'],
            constraints: ['supported-formats: markdown,html,pdf'],
            cost: 1.2,
            reliability: 0.98
          }
        ],
        services: ['documentation', 'technical-writing'],
        protocols: ['contract-net', 'direct-communication'],
        languages: ['json', 'text', 'markdown'],
        status: 'active',
        load: 0.0,
        lastHeartbeat: new Date(),
        metadata: {
          specialization: ['documentation', 'technical-writing'],
          version: '2.0'
        }
      }
    ];

    for (const agent of coreAgents) {
      this.directoryService.registerAgent(agent);
    }

    console.log(`Registered ${coreAgents.length} core agents`);
  }

  /**
   * Send message between agents
   */
  async sendMessage(message: ACLMessage): Promise<boolean[]> {
    // Store conversation if needed
    if (message.conversationId) {
      const conversation = this.conversations.get(message.conversationId);
      if (conversation) {
        conversation.messages.push(message);
      }
    }

    return this.messageRouter.routeMessage(message);
  }

  /**
   * Create new conversation
   */
  createConversation(participants: AgentIdentifier[], protocol: string): Conversation {
    const conversation: Conversation = {
      id: this.generateConversationId(),
      participants,
      protocol,
      state: 'initiating',
      messages: [],
      context: {},
      startTime: new Date()
    };

    this.conversations.set(conversation.id, conversation);
    return conversation;
  }

  /**
   * Get system statistics
   */
  getSystemStats() {
    const agents = this.directoryService.getAllAgents();
    const activeAgents = agents.filter(a => a.status === 'active');
    
    return {
      totalAgents: agents.length,
      activeAgents: activeAgents.length,
      totalCapabilities: new Set(
        agents.flatMap(a => a.capabilities.map(c => c.name))
      ).size,
      activeConversations: Array.from(this.conversations.values())
        .filter(c => c.state === 'negotiating' || c.state === 'executing').length,
      averageLoad: activeAgents.length > 0 
        ? activeAgents.reduce((sum, a) => sum + a.load, 0) / activeAgents.length 
        : 0
    };
  }

  // Getters for subsystems
  get directory() { return this.directoryService; }
  get router() { return this.messageRouter; }
  get contractNetProtocol() { return this.contractNet; }

  private generateConversationId(): string {
    return `conv_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
}

// Export singleton instance
export const a2aSystem = new A2ACommunicationSystem();