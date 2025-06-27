
import { GenerationStatus, ProjectSpec, AgentStatus, DeepSeekMessage, AgentName, DeepSeekCompletionRequest } from "@/types/ipa-types";
import { getAgentListForPlatform, initialMockStatus } from "./mockData";
import { buildConversationHistory } from "./deepseekAPI";
import { getAgentSystemPrompt, createUserMessageFromSpec } from "./agentPrompts";
import { AgentProcessor } from "./agentProcessor";
import { ConversationManager } from "./conversationManager";
import { FinalPromptGenerator } from "./finalPromptGenerator";
import { savePrompt } from "../db/promptApiService";
import { toast } from "@/hooks/use-toast";
import { DeepSeekClient } from "./api/deepseekClient";

// A2A and MCP Protocol Integration
interface A2AMessage {
  sender: AgentName;
  receiver: AgentName;
  content: string;
  messageType: 'request' | 'response' | 'notification' | 'coordination';
  timestamp: number;
  contextData?: any;
}

interface MCPRequest {
  jsonrpc: "2.0";
  id: string | number;
  method: string;
  params?: any;
}

export class GenerationOrchestrator {
  private currentStatus: GenerationStatus;
  private conversationManager: ConversationManager;
  private currentProjectSpec: ProjectSpec | null = null;
  private agentList: AgentName[] = [];
  private a2aMessages: A2AMessage[] = [];
  private mcpCache: Map<string, any> = new Map();

  constructor() {
    this.currentStatus = { ...initialMockStatus };
    this.conversationManager = new ConversationManager();
  }

  // MCP Protocol Integration
  private async makeMCPRequest(method: string, params?: any): Promise<any> {
    const cacheKey = `${method}_${JSON.stringify(params)}`;
    
    // Check cache first for performance
    if (this.mcpCache.has(cacheKey)) {
      return this.mcpCache.get(cacheKey);
    }

    const request: MCPRequest = {
      jsonrpc: "2.0",
      id: Date.now(),
      method,
      params
    };

    try {
      const response = await fetch('/api/mcp/request', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(request)
      });

      if (!response.ok) {
        throw new Error(`MCP request failed: ${response.status}`);
      }

      const result = await response.json();
      
      // Cache result for future use
      this.mcpCache.set(cacheKey, result);
      
      return result;
    } catch (error) {
      console.error(`MCP request error for ${method}:`, error);
      throw error;
    }
  }

  // A2A Protocol Integration
  private sendA2AMessage(sender: AgentName, receiver: AgentName, content: string, messageType: A2AMessage['messageType'], contextData?: any): void {
    const message: A2AMessage = {
      sender,
      receiver,
      content,
      messageType,
      timestamp: Date.now(),
      contextData
    };

    this.a2aMessages.push(message);
    console.log(`[A2A] ${sender} → ${receiver}: ${messageType}`, { content: content.substring(0, 100) });
  }

  private getA2AMessagesForAgent(agent: AgentName): A2AMessage[] {
    return this.a2aMessages.filter(msg => msg.receiver === agent || msg.sender === agent);
  }

  // Enhanced Platform Context via MCP
  private async getEnhancedPlatformContext(targetPlatform: string): Promise<any> {
    try {
      // Use MCP to get comprehensive platform context
      const platformData = await this.makeMCPRequest('tools/call', {
        name: 'get_comprehensive_context',
        arguments: { platform: targetPlatform }
      });

      // Get technology compatibility analysis via MCP
      const techStack = this.currentProjectSpec?.frontendTechStack?.concat(this.currentProjectSpec?.backendTechStack || []) || [];
      const compatibility = await this.makeMCPRequest('tools/call', {
        name: 'analyze_platform_compatibility',
        arguments: { 
          platform: targetPlatform,
          techStack: techStack,
          requirements: this.currentProjectSpec?.projectDescription || ''
        }
      });

      return {
        platform: platformData,
        compatibility,
        techStack
      };
    } catch (error) {
      console.warn('MCP platform context fetch failed, using fallback:', error);
      return null;
    }
  }

  async setProjectSpec(spec: ProjectSpec): Promise<void> {
    this.currentProjectSpec = spec;
    this.agentList = getAgentListForPlatform(spec.targetPlatform);
    
    // Clear A2A messages and MCP cache for new project
    this.a2aMessages = [];
    this.mcpCache.clear();
    
    console.log(`Using platform: ${spec.targetPlatform} for target: ${spec.targetPlatform?.toLowerCase()}`);
    
    // Pre-fetch enhanced platform context via MCP
    if (spec.targetPlatform) {
      try {
        const enhancedContext = await this.getEnhancedPlatformContext(spec.targetPlatform);
        console.log(`[MCP] Enhanced platform context loaded for ${spec.targetPlatform}`);
      } catch (error) {
        console.warn('[MCP] Failed to load enhanced context:', error);
      }
    }
    
    this.currentStatus = { 
      ...initialMockStatus,
      spec: spec,
      messages: []
    };
    this.conversationManager.reset();
  }

  async processNextStep(): Promise<GenerationStatus> {
    const currentStep = Math.min(this.currentStatus.progress + 1, this.agentList.length + 1);
    
    // If we're processing a new agent, invoke DeepSeek API for that agent
    if (currentStep > 0 && currentStep <= this.agentList.length) {
      const currentAgent = this.agentList[currentStep - 1];
      
      // Mark the current agent as processing first
      this.currentStatus.agents[currentStep - 1] = {
        id: `agent-${Date.now()}`,
        name: currentAgent,
        agent: currentAgent,
        status: "processing",
        progress: 0,
        timestamp: Date.now()
      };
      
      // For multi-round conversation, build history of previous agents
      const messageHistory = buildConversationHistory(this.agentList.slice(0, currentStep - 1), this.currentProjectSpec!);
      
      // Process the agent
      const agentResult = await AgentProcessor.processAgent(currentAgent, this.currentProjectSpec!, messageHistory);
      this.currentStatus.agents[currentStep - 1] = agentResult;
      
      // Update conversation if agent succeeded
      if (agentResult.status === "completed" && agentResult.output) {
        if (this.conversationManager.getMessages().length === 0) {
          this.conversationManager.initializeFromHistory(messageHistory);
        }
        this.conversationManager.addAgentResponse(currentAgent, agentResult.output);
        this.currentStatus.messages = this.conversationManager.getMessages();
      }
    }
    
    // Update current status
    this.currentStatus = {
      ...this.currentStatus,
      progress: currentStep,
      status: currentStep <= this.agentList.length ? "processing" : "completed",
      agents: this.currentStatus.agents
    };
    
    // If we've completed all agents, generate the final result
    if (currentStep > this.agentList.length && !this.currentStatus.result) {
      await this.generateFinalResult();
    }
    
    return { ...this.currentStatus };
  }

  /**
   * Process all agents with real-time streaming support
   */
  async processAllAgentsWithStreaming(
    onAgentStart: (agentName: AgentName) => void,
    onAgentToken: (agentName: AgentName, token: string) => void,
    onAgentComplete: (agentName: AgentName, response: string) => void,
    onAllComplete: (finalStatus: GenerationStatus) => void
  ): Promise<void> {
    if (!this.currentProjectSpec) {
      throw new Error("No project specification set");
    }

    // Prepare agent requests with enhanced MCP context and A2A coordination
    const agentRequests = await Promise.all(this.agentList.map(async (agent, index) => {
      const systemPrompt = await getAgentSystemPrompt(agent, this.currentProjectSpec!);
      let userMessage = createUserMessageFromSpec(agent, this.currentProjectSpec!);
      
      // Add MCP-enhanced platform context
      try {
        const enhancedContext = await this.getEnhancedPlatformContext(this.currentProjectSpec!.targetPlatform!);
        if (enhancedContext) {
          userMessage += `\n\nENHANCED PLATFORM CONTEXT (via MCP):\n${JSON.stringify(enhancedContext, null, 2)}`;
        }
      } catch (error) {
        console.warn(`[MCP] Failed to get enhanced context for ${agent}:`, error);
      }
      
      // Add A2A coordination context (previous agent outputs)
      if (index > 0) {
        const previousAgents = this.agentList.slice(0, index);
        const a2aContext = previousAgents.map(prevAgent => {
          const messages = this.getA2AMessagesForAgent(prevAgent);
          return `\n[A2A CONTEXT from ${prevAgent}]: Previous findings and recommendations to coordinate with.`;
        }).join('\n');
        
        if (a2aContext) {
          userMessage += `\n\nA2A COORDINATION CONTEXT:${a2aContext}`;
        }
      }
      
      const request: DeepSeekCompletionRequest = {
        model: "deepseek-chat",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userMessage }
        ],
        max_tokens: 4096,
        temperature: 0.7
      };

      return { name: agent, request };
    }));

    // Initialize all agents as processing
    this.currentStatus.agents = this.agentList.map((agent, index) => ({
      id: `agent-${Date.now()}-${index}`,
      name: agent,
      agent: agent,
      status: "idle",
      progress: 0,
      timestamp: Date.now()
    }));
    
    this.currentStatus.status = "processing";
    this.currentStatus.progress = 0;

    try {
      await DeepSeekClient.streamAgentResponses(
        agentRequests,
        (agentName) => {
          // Mark agent as processing
          const agentIndex = this.agentList.indexOf(agentName);
          if (agentIndex >= 0) {
            this.currentStatus.agents[agentIndex] = {
              ...this.currentStatus.agents[agentIndex],
              status: "processing",
              progress: 0
            };
          }
          onAgentStart(agentName);
        },
        (agentName, token) => {
          // Update agent with streaming token
          const agentIndex = this.agentList.indexOf(agentName);
          if (agentIndex >= 0) {
            this.currentStatus.agents[agentIndex] = {
              ...this.currentStatus.agents[agentIndex],
              status: "processing",
              progress: 50 // Indicate active processing
            };
            
            // Add token to existing output
            const currentOutput = this.currentStatus.agents[agentIndex].output || "";
            this.currentStatus.agents[agentIndex].output = currentOutput + token;
          }
          onAgentToken(agentName, token);
        },
        (agentName, fullResponse) => {
          // Mark agent as complete
          const agentIndex = this.agentList.indexOf(agentName);
          if (agentIndex >= 0) {
            this.currentStatus.agents[agentIndex] = {
              ...this.currentStatus.agents[agentIndex],
              status: "completed",
              progress: 100,
              output: fullResponse,
              result: fullResponse
            };
            
            // A2A Protocol: Share agent results with subsequent agents
            const remainingAgents = this.agentList.slice(agentIndex + 1);
            remainingAgents.forEach(nextAgent => {
              this.sendA2AMessage(
                agentName,
                nextAgent,
                `Agent ${agentName} completed analysis. Key findings: ${fullResponse.substring(0, 500)}...`,
                'notification',
                { fullResponse, agentType: agentName }
              );
            });
            
            // Update conversation
            this.conversationManager.addAgentResponse(agentName, fullResponse);
          }
          onAgentComplete(agentName, fullResponse);
        },
        async () => {
          // All agents completed
          this.currentStatus.status = "completed";
          this.currentStatus.progress = this.agentList.length;
          this.currentStatus.messages = this.conversationManager.getMessages();
          
          // Generate final result
          await this.generateFinalResult();
          
          onAllComplete({ ...this.currentStatus });
        }
      );
    } catch (error) {
      console.error("Error in streaming agent processing:", error);
      this.currentStatus.status = "failed";
      this.currentStatus.error = error instanceof Error ? error.message : "Unknown error";
      onAllComplete({ ...this.currentStatus });
    }
  }

  private async generateFinalResult(): Promise<void> {
    try {
      const completedAgents = this.currentStatus.agents.filter(agent => agent.status === "completed");
      
      if (completedAgents.length === this.agentList.length) {
        const finalPrompt = await FinalPromptGenerator.generate(this.currentStatus.agents);
        this.currentStatus.result = finalPrompt;
        
        // Save the completed prompt to the database
        try {
          await savePrompt({
            projectName: this.currentProjectSpec?.projectDescription.substring(0, 50) || "Cursor AI Prompt",
            prompt: finalPrompt,
            timestamp: Date.now(),
            tags: ["ipa-generated", "cursor-ai"]
          });
          console.log("Prompt successfully saved to database");
          
          toast({
            title: "Prompt Generated Successfully",
            description: "Your Cursor AI prompt has been generated and saved",
          });
        } catch (error) {
          console.error("Failed to save prompt to database:", error);
          toast({
            title: "Save Warning",
            description: "Prompt generated but failed to save to database",
            variant: "destructive"
          });
        }
      } else {
        this.currentStatus.result = `⚠️ Warning: ${this.agentList.length - completedAgents.length} out of ${this.agentList.length} agents failed to complete. The generated prompt may be incomplete.\n\n` +
          completedAgents.map(agent => `## ${agent.agent} Output\n${agent.output || "No output available"}\n`).join('\n');
        this.currentStatus.status = "failed";
        
        toast({
          title: "Partial Generation",
          description: `${completedAgents.length}/${this.agentList.length} agents completed successfully`,
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error("Error generating final prompt:", error);
      this.currentStatus.result = `Error generating final prompt: ${error instanceof Error ? error.message : String(error)}`;
      this.currentStatus.status = "failed";
      
      toast({
        title: "Final Generation Error",
        description: `Failed to compile final prompt: ${error instanceof Error ? error.message : String(error)}`,
        variant: "destructive"
      });
    }
  }

  getCurrentStatus(): GenerationStatus {
    return { ...this.currentStatus };
  }
}
