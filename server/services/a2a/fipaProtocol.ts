import { EventEmitter } from "events";

// FIPA ACL Message Structure
export interface FIPAMessage {
  performative: FIPAPerformative;
  sender: AgentIdentifier;
  receiver: AgentIdentifier[];
  content?: string;
  language?: string;
  encoding?: string;
  ontology?: string;
  protocol?: string;
  conversationId?: string;
  replyWith?: string;
  inReplyTo?: string;
  replyBy?: Date;
  replyTo?: AgentIdentifier;
}

export type FIPAPerformative = 
  | "inform" | "request" | "query-if" | "query-ref" | "propose" | "accept-proposal"
  | "reject-proposal" | "agree" | "refuse" | "confirm" | "disconfirm" | "cancel"
  | "call-for-proposal" | "subscribe" | "proxy" | "propagate" | "unknown";

export interface AgentIdentifier {
  name: string;
  addresses?: string[];
  resolvers?: AgentIdentifier[];
  userDefinedProperties?: Record<string, any>;
}

export interface ConversationContext {
  conversationId: string;
  protocol: string;
  participants: AgentIdentifier[];
  state: "active" | "completed" | "failed";
  messages: FIPAMessage[];
  created: Date;
  lastActivity: Date;
}

export class FIPAProtocol extends EventEmitter {
  private conversations = new Map<string, ConversationContext>();
  private agentDirectory = new Map<string, AgentIdentifier>();
  private messageQueue = new Map<string, FIPAMessage[]>();

  constructor() {
    super();
  }

  /**
   * Register an agent in the directory
   */
  registerAgent(agent: AgentIdentifier): void {
    this.agentDirectory.set(agent.name, agent);
    this.messageQueue.set(agent.name, []);
    console.log(`Registered agent: ${agent.name}`);
  }

  /**
   * Unregister an agent
   */
  unregisterAgent(agentName: string): void {
    this.agentDirectory.delete(agentName);
    this.messageQueue.delete(agentName);
    console.log(`Unregistered agent: ${agentName}`);
  }

  /**
   * Send a FIPA ACL message
   */
  sendMessage(message: FIPAMessage): void {
    try {
      // Validate message
      this.validateMessage(message);

      // Generate conversation ID if not provided
      if (!message.conversationId) {
        message.conversationId = this.generateConversationId();
      }

      // Create or update conversation context
      this.updateConversation(message);

      // Deliver message to receivers
      message.receiver.forEach(receiver => {
        this.deliverMessage(receiver.name, message);
      });

      // Emit message sent event
      this.emit("messageSent", message);

      console.log(`Message sent: ${message.performative} from ${message.sender.name} to ${message.receiver.map(r => r.name).join(", ")}`);
    } catch (error) {
      console.error("Error sending message:", error);
      this.emit("messageError", { message, error });
    }
  }

  /**
   * Receive messages for an agent
   */
  receiveMessages(agentName: string): FIPAMessage[] {
    const messages = this.messageQueue.get(agentName) || [];
    this.messageQueue.set(agentName, []); // Clear queue after reading
    return messages;
  }

  /**
   * Get conversation by ID
   */
  getConversation(conversationId: string): ConversationContext | undefined {
    return this.conversations.get(conversationId);
  }

  /**
   * Get all conversations for an agent
   */
  getAgentConversations(agentName: string): ConversationContext[] {
    return Array.from(this.conversations.values()).filter(conv => 
      conv.participants.some(p => p.name === agentName)
    );
  }

  /**
   * Find agents by criteria
   */
  findAgents(criteria: Partial<AgentIdentifier>): AgentIdentifier[] {
    return Array.from(this.agentDirectory.values()).filter(agent => {
      if (criteria.name && !agent.name.includes(criteria.name)) return false;
      if (criteria.userDefinedProperties) {
        for (const [key, value] of Object.entries(criteria.userDefinedProperties)) {
          if (agent.userDefinedProperties?.[key] !== value) return false;
        }
      }
      return true;
    });
  }

  /**
   * Create standard protocol messages
   */
  createInformMessage(
    sender: AgentIdentifier,
    receiver: AgentIdentifier[],
    content: string,
    options: Partial<FIPAMessage> = {}
  ): FIPAMessage {
    return {
      performative: "inform",
      sender,
      receiver,
      content,
      conversationId: options.conversationId || this.generateConversationId(),
      ...options
    };
  }

  createRequestMessage(
    sender: AgentIdentifier,
    receiver: AgentIdentifier[],
    content: string,
    options: Partial<FIPAMessage> = {}
  ): FIPAMessage {
    return {
      performative: "request",
      sender,
      receiver,
      content,
      conversationId: options.conversationId || this.generateConversationId(),
      replyWith: options.replyWith || this.generateReplyId(),
      ...options
    };
  }

  createQueryMessage(
    sender: AgentIdentifier,
    receiver: AgentIdentifier[],
    content: string,
    queryType: "query-if" | "query-ref" = "query-if",
    options: Partial<FIPAMessage> = {}
  ): FIPAMessage {
    return {
      performative: queryType,
      sender,
      receiver,
      content,
      conversationId: options.conversationId || this.generateConversationId(),
      replyWith: options.replyWith || this.generateReplyId(),
      ...options
    };
  }

  createProposeMessage(
    sender: AgentIdentifier,
    receiver: AgentIdentifier[],
    content: string,
    options: Partial<FIPAMessage> = {}
  ): FIPAMessage {
    return {
      performative: "propose",
      sender,
      receiver,
      content,
      conversationId: options.conversationId || this.generateConversationId(),
      replyWith: options.replyWith || this.generateReplyId(),
      ...options
    };
  }

  /**
   * Protocol-specific conversation patterns
   */
  
  // Request-Response Protocol
  async requestResponse(
    requester: AgentIdentifier,
    responder: AgentIdentifier,
    request: string,
    timeout = 30000
  ): Promise<FIPAMessage> {
    return new Promise((resolve, reject) => {
      const conversationId = this.generateConversationId();
      const replyWith = this.generateReplyId();

      // Send request
      const requestMessage = this.createRequestMessage(
        requester,
        [responder],
        request,
        { conversationId, replyWith }
      );
      
      this.sendMessage(requestMessage);

      // Wait for response
      const timeout_handle = setTimeout(() => {
        reject(new Error("Request timeout"));
      }, timeout);

      const responseHandler = (message: FIPAMessage) => {
        if (message.conversationId === conversationId && 
            message.inReplyTo === replyWith) {
          clearTimeout(timeout_handle);
          this.off("messageSent", responseHandler);
          resolve(message);
        }
      };

      this.on("messageSent", responseHandler);
    });
  }

  // Contract Net Protocol
  async contractNet(
    initiator: AgentIdentifier,
    participants: AgentIdentifier[],
    callForProposal: string,
    timeout = 60000
  ): Promise<{ proposals: FIPAMessage[]; selected?: FIPAMessage }> {
    const conversationId = this.generateConversationId();
    const replyWith = this.generateReplyId();

    // Send call for proposal
    const cfpMessage: FIPAMessage = {
      performative: "call-for-proposal",
      sender: initiator,
      receiver: participants,
      content: callForProposal,
      conversationId,
      replyWith,
      protocol: "fipa-contract-net"
    };

    this.sendMessage(cfpMessage);

    // Collect proposals
    return new Promise((resolve) => {
      const proposals: FIPAMessage[] = [];
      
      const timeout_handle = setTimeout(() => {
        // Select best proposal (simple implementation)
        const selected = proposals.length > 0 ? proposals[0] : undefined;
        resolve({ proposals, selected });
      }, timeout);

      const proposalHandler = (message: FIPAMessage) => {
        if (message.conversationId === conversationId && 
            message.performative === "propose") {
          proposals.push(message);
        }
      };

      this.on("messageSent", proposalHandler);
    });
  }

  /**
   * Validate FIPA message structure
   */
  private validateMessage(message: FIPAMessage): void {
    if (!message.performative) {
      throw new Error("Message must have a performative");
    }
    if (!message.sender) {
      throw new Error("Message must have a sender");
    }
    if (!message.receiver || message.receiver.length === 0) {
      throw new Error("Message must have at least one receiver");
    }
  }

  /**
   * Deliver message to agent's message queue
   */
  private deliverMessage(agentName: string, message: FIPAMessage): void {
    if (!this.agentDirectory.has(agentName)) {
      console.warn(`Agent not found: ${agentName}`);
      return;
    }

    const queue = this.messageQueue.get(agentName) || [];
    queue.push(message);
    this.messageQueue.set(agentName, queue);

    this.emit("messageDelivered", { agentName, message });
  }

  /**
   * Update conversation context
   */
  private updateConversation(message: FIPAMessage): void {
    const conversationId = message.conversationId!;
    
    let conversation = this.conversations.get(conversationId);
    if (!conversation) {
      conversation = {
        conversationId,
        protocol: message.protocol || "unknown",
        participants: [message.sender, ...message.receiver],
        state: "active",
        messages: [],
        created: new Date(),
        lastActivity: new Date()
      };
      this.conversations.set(conversationId, conversation);
    }

    conversation.messages.push(message);
    conversation.lastActivity = new Date();

    // Update state based on performative
    if (["refuse", "cancel"].includes(message.performative)) {
      conversation.state = "failed";
    } else if (["agree", "confirm"].includes(message.performative)) {
      // Check if conversation should be completed
      // This is a simplified check - real implementation would be more sophisticated
      if (conversation.messages.length > 2) {
        conversation.state = "completed";
      }
    }
  }

  /**
   * Generate unique conversation ID
   */
  private generateConversationId(): string {
    return `conv_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Generate unique reply ID
   */
  private generateReplyId(): string {
    return `reply_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Get system statistics
   */
  getStats(): {
    totalAgents: number;
    activeConversations: number;
    totalMessages: number;
    queuedMessages: number;
  } {
    const activeConversations = Array.from(this.conversations.values())
      .filter(conv => conv.state === "active").length;
    
    const totalMessages = Array.from(this.conversations.values())
      .reduce((total, conv) => total + conv.messages.length, 0);
    
    const queuedMessages = Array.from(this.messageQueue.values())
      .reduce((total, queue) => total + queue.length, 0);

    return {
      totalAgents: this.agentDirectory.size,
      activeConversations,
      totalMessages,
      queuedMessages
    };
  }
}