import { EventEmitter } from "events";
import { FIPAProtocol, FIPAMessage, AgentIdentifier, FIPAPerformative } from "./fipaProtocol";

export interface AgentCapability {
  name: string;
  description: string;
  inputSchema?: any;
  outputSchema?: any;
}

export interface AgentProfile {
  identifier: AgentIdentifier;
  capabilities: AgentCapability[];
  status: "active" | "busy" | "offline";
  metadata: {
    specialization: string[];
    performance: {
      successRate: number;
      averageResponseTime: number;
      totalTasks: number;
    };
    created: Date;
    lastActive: Date;
  };
}

export interface CoordinationTask {
  id: string;
  description: string;
  requiredCapabilities: string[];
  priority: "low" | "medium" | "high" | "critical";
  deadline?: Date;
  assignedAgents: string[];
  status: "pending" | "assigned" | "in-progress" | "completed" | "failed";
  result?: any;
  created: Date;
  startTime?: Date;
  endTime?: Date;
}

export class AgentCoordinator extends EventEmitter {
  private fipaProtocol: FIPAProtocol;
  private agentProfiles = new Map<string, AgentProfile>();
  private tasks = new Map<string, CoordinationTask>();
  private taskQueue: CoordinationTask[] = [];

  constructor() {
    super();
    this.fipaProtocol = new FIPAProtocol();
    this.setupProtocolHandlers();
  }

  /**
   * Register a new agent with capabilities
   */
  registerAgent(
    name: string, 
    capabilities: AgentCapability[],
    specialization: string[] = []
  ): AgentProfile {
    const identifier: AgentIdentifier = {
      name,
      addresses: [`agent://${name}`],
      userDefinedProperties: {
        type: "ai-agent",
        specialization
      }
    };

    const profile: AgentProfile = {
      identifier,
      capabilities,
      status: "active",
      metadata: {
        specialization,
        performance: {
          successRate: 1.0,
          averageResponseTime: 0,
          totalTasks: 0
        },
        created: new Date(),
        lastActive: new Date()
      }
    };

    this.agentProfiles.set(name, profile);
    this.fipaProtocol.registerAgent(identifier);

    console.log(`Registered agent: ${name} with ${capabilities.length} capabilities`);
    this.emit("agentRegistered", profile);

    return profile;
  }

  /**
   * Unregister an agent
   */
  unregisterAgent(name: string): void {
    this.agentProfiles.delete(name);
    this.fipaProtocol.unregisterAgent(name);
    
    console.log(`Unregistered agent: ${name}`);
    this.emit("agentUnregistered", name);
  }

  /**
   * Create a coordination task
   */
  createTask(
    description: string,
    requiredCapabilities: string[],
    priority: CoordinationTask["priority"] = "medium",
    deadline?: Date
  ): CoordinationTask {
    const task: CoordinationTask = {
      id: this.generateTaskId(),
      description,
      requiredCapabilities,
      priority,
      deadline,
      assignedAgents: [],
      status: "pending",
      created: new Date()
    };

    this.tasks.set(task.id, task);
    this.taskQueue.push(task);
    this.taskQueue.sort((a, b) => this.getPriorityValue(b.priority) - this.getPriorityValue(a.priority));

    console.log(`Created task: ${task.id} - ${description}`);
    this.emit("taskCreated", task);

    // Try to assign task immediately
    this.assignTask(task.id);

    return task;
  }

  /**
   * Assign a task to appropriate agents
   */
  async assignTask(taskId: string): Promise<boolean> {
    const task = this.tasks.get(taskId);
    if (!task || task.status !== "pending") {
      return false;
    }

    // Find agents with required capabilities
    const suitableAgents = this.findSuitableAgents(task.requiredCapabilities);
    
    if (suitableAgents.length === 0) {
      console.log(`No suitable agents found for task: ${taskId}`);
      return false;
    }

    // Select best agents based on performance and availability
    const selectedAgents = this.selectBestAgents(suitableAgents, task);
    
    if (selectedAgents.length === 0) {
      console.log(`No available agents for task: ${taskId}`);
      return false;
    }

    // Assign task to selected agents
    task.assignedAgents = selectedAgents.map(agent => agent.identifier.name);
    task.status = "assigned";
    task.startTime = new Date();

    // Send task assignment messages
    for (const agent of selectedAgents) {
      await this.sendTaskAssignment(agent, task);
    }

    console.log(`Assigned task ${taskId} to agents: ${task.assignedAgents.join(", ")}`);
    this.emit("taskAssigned", task);

    return true;
  }

  /**
   * Execute a collaborative task with multiple agents
   */
  async executeCollaborativeTask(
    taskDescription: string,
    agents: string[],
    coordinationStrategy: "sequential" | "parallel" | "pipeline" = "parallel"
  ): Promise<any> {
    const task = this.createTask(
      taskDescription,
      [], // Will be determined by agent capabilities
      "high"
    );

    switch (coordinationStrategy) {
      case "sequential":
        return await this.executeSequentialTask(task, agents);
      case "parallel":
        return await this.executeParallelTask(task, agents);
      case "pipeline":
        return await this.executePipelineTask(task, agents);
      default:
        throw new Error(`Unknown coordination strategy: ${coordinationStrategy}`);
    }
  }

  /**
   * Negotiate between agents using FIPA Contract Net Protocol
   */
  async negotiateTask(
    initiatorAgent: string,
    participants: string[],
    taskDescription: string
  ): Promise<{ winner?: string; proposals: FIPAMessage[] }> {
    const initiator = this.agentProfiles.get(initiatorAgent)?.identifier;
    if (!initiator) {
      throw new Error(`Initiator agent not found: ${initiatorAgent}`);
    }

    const participantAgents = participants
      .map(name => this.agentProfiles.get(name)?.identifier)
      .filter(agent => agent !== undefined) as AgentIdentifier[];

    if (participantAgents.length === 0) {
      throw new Error("No valid participant agents found");
    }

    const result = await this.fipaProtocol.contractNet(
      initiator,
      participantAgents,
      taskDescription
    );

    return {
      winner: result.selected?.sender.name,
      proposals: result.proposals
    };
  }

  /**
   * Get agent performance metrics
   */
  getAgentMetrics(agentName: string): AgentProfile["metadata"]["performance"] | undefined {
    return this.agentProfiles.get(agentName)?.metadata.performance;
  }

  /**
   * Get coordination statistics
   */
  getCoordinationStats(): {
    totalAgents: number;
    activeAgents: number;
    totalTasks: number;
    completedTasks: number;
    pendingTasks: number;
    averageTaskTime: number;
  } {
    const activeAgents = Array.from(this.agentProfiles.values())
      .filter(profile => profile.status === "active").length;

    const tasks = Array.from(this.tasks.values());
    const completedTasks = tasks.filter(task => task.status === "completed").length;
    const pendingTasks = tasks.filter(task => task.status === "pending").length;

    const completedTasksWithTime = tasks.filter(task => 
      task.status === "completed" && task.startTime && task.endTime
    );

    const averageTaskTime = completedTasksWithTime.length > 0
      ? completedTasksWithTime.reduce((sum, task) => {
          const duration = task.endTime!.getTime() - task.startTime!.getTime();
          return sum + duration;
        }, 0) / completedTasksWithTime.length
      : 0;

    return {
      totalAgents: this.agentProfiles.size,
      activeAgents,
      totalTasks: tasks.length,
      completedTasks,
      pendingTasks,
      averageTaskTime
    };
  }

  /**
   * Process incoming FIPA messages
   */
  processMessage(agentName: string, message: FIPAMessage): void {
    this.fipaProtocol.sendMessage(message);
    
    // Update agent last active time
    const profile = this.agentProfiles.get(agentName);
    if (profile) {
      profile.metadata.lastActive = new Date();
    }

    this.emit("messageProcessed", { agentName, message });
  }

  /**
   * Find agents with specific capabilities
   */
  private findSuitableAgents(requiredCapabilities: string[]): AgentProfile[] {
    return Array.from(this.agentProfiles.values()).filter(profile => {
      const agentCapabilities = profile.capabilities.map(cap => cap.name);
      return requiredCapabilities.every(required => 
        agentCapabilities.includes(required)
      );
    });
  }

  /**
   * Select best agents based on performance and availability
   */
  private selectBestAgents(candidates: AgentProfile[], task: CoordinationTask): AgentProfile[] {
    // Filter by availability
    const availableAgents = candidates.filter(agent => agent.status === "active");
    
    // Sort by performance score
    const scoredAgents = availableAgents.map(agent => ({
      agent,
      score: this.calculateAgentScore(agent, task)
    })).sort((a, b) => b.score - a.score);

    // Return top agents (for now, just return the best one)
    return scoredAgents.slice(0, 1).map(scored => scored.agent);
  }

  /**
   * Calculate agent performance score for task assignment
   */
  private calculateAgentScore(agent: AgentProfile, task: CoordinationTask): number {
    const perf = agent.metadata.performance;
    let score = perf.successRate * 100;

    // Bonus for specialization match
    const specializationMatch = task.requiredCapabilities.some(cap =>
      agent.metadata.specialization.includes(cap)
    );
    if (specializationMatch) {
      score += 20;
    }

    // Penalty for high response time
    if (perf.averageResponseTime > 10000) { // 10 seconds
      score -= 10;
    }

    return score;
  }

  /**
   * Send task assignment message to agent
   */
  private async sendTaskAssignment(agent: AgentProfile, task: CoordinationTask): Promise<void> {
    const coordinatorId: AgentIdentifier = {
      name: "agent-coordinator",
      addresses: ["agent://coordinator"]
    };

    const message = this.fipaProtocol.createRequestMessage(
      coordinatorId,
      [agent.identifier],
      JSON.stringify({
        type: "task-assignment",
        taskId: task.id,
        description: task.description,
        requiredCapabilities: task.requiredCapabilities,
        priority: task.priority,
        deadline: task.deadline
      }),
      {
        protocol: "task-coordination",
        conversationId: `task-${task.id}`
      }
    );

    this.fipaProtocol.sendMessage(message);
  }

  /**
   * Execute sequential task coordination
   */
  private async executeSequentialTask(task: CoordinationTask, agents: string[]): Promise<any> {
    let result = null;
    
    for (const agentName of agents) {
      const agent = this.agentProfiles.get(agentName);
      if (!agent) continue;

      // Send task to agent and wait for completion
      result = await this.sendTaskToAgent(agent, task, result);
    }

    return result;
  }

  /**
   * Execute parallel task coordination
   */
  private async executeParallelTask(task: CoordinationTask, agents: string[]): Promise<any> {
    const promises = agents.map(agentName => {
      const agent = this.agentProfiles.get(agentName);
      if (!agent) return Promise.resolve(null);
      
      return this.sendTaskToAgent(agent, task, null);
    });

    const results = await Promise.all(promises);
    return results.filter(result => result !== null);
  }

  /**
   * Execute pipeline task coordination
   */
  private async executePipelineTask(task: CoordinationTask, agents: string[]): Promise<any> {
    // Similar to sequential but with specific pipeline semantics
    return this.executeSequentialTask(task, agents);
  }

  /**
   * Send task to individual agent
   */
  private async sendTaskToAgent(agent: AgentProfile, task: CoordinationTask, previousResult: any): Promise<any> {
    // This would integrate with the actual agent execution system
    // For now, return a simulated result
    return `Result from ${agent.identifier.name} for task ${task.id}`;
  }

  /**
   * Setup FIPA protocol event handlers
   */
  private setupProtocolHandlers(): void {
    this.fipaProtocol.on("messageSent", (message: FIPAMessage) => {
      this.handleProtocolMessage(message);
    });

    this.fipaProtocol.on("messageDelivered", ({ agentName, message }: { agentName: string; message: FIPAMessage }) => {
      this.handleMessageDelivery(agentName, message);
    });
  }

  /**
   * Handle protocol-level messages
   */
  private handleProtocolMessage(message: FIPAMessage): void {
    // Update agent performance metrics based on message patterns
    if (message.performative === "agree" || message.performative === "confirm") {
      this.updateAgentPerformance(message.sender.name, true);
    } else if (message.performative === "refuse" || message.performative === "cancel") {
      this.updateAgentPerformance(message.sender.name, false);
    }
  }

  /**
   * Handle message delivery events
   */
  private handleMessageDelivery(agentName: string, message: FIPAMessage): void {
    const profile = this.agentProfiles.get(agentName);
    if (profile) {
      profile.metadata.lastActive = new Date();
    }
  }

  /**
   * Update agent performance metrics
   */
  private updateAgentPerformance(agentName: string, success: boolean): void {
    const profile = this.agentProfiles.get(agentName);
    if (!profile) return;

    const perf = profile.metadata.performance;
    perf.totalTasks++;
    
    if (success) {
      perf.successRate = (perf.successRate * (perf.totalTasks - 1) + 1) / perf.totalTasks;
    } else {
      perf.successRate = (perf.successRate * (perf.totalTasks - 1)) / perf.totalTasks;
    }
  }

  /**
   * Generate unique task ID
   */
  private generateTaskId(): string {
    return `task_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Get numeric priority value for sorting
   */
  private getPriorityValue(priority: CoordinationTask["priority"]): number {
    switch (priority) {
      case "critical": return 4;
      case "high": return 3;
      case "medium": return 2;
      case "low": return 1;
      default: return 0;
    }
  }
}