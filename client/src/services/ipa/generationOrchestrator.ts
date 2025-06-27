
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

export class GenerationOrchestrator {
  private currentStatus: GenerationStatus;
  private conversationManager: ConversationManager;
  private currentProjectSpec: ProjectSpec | null = null;
  private agentList: AgentName[] = [];

  constructor() {
    this.currentStatus = { ...initialMockStatus };
    this.conversationManager = new ConversationManager();
  }

  setProjectSpec(spec: ProjectSpec): void {
    this.currentProjectSpec = spec;
    this.agentList = getAgentListForPlatform(spec.targetPlatform);
    console.log(`Using platform: ${spec.targetPlatform} for target: ${spec.targetPlatform?.toLowerCase()}`);
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

    // Prepare agent requests with documentation-aware prompts
    const agentRequests = await Promise.all(this.agentList.map(async (agent) => {
      const systemPrompt = await getAgentSystemPrompt(agent, this.currentProjectSpec!);
      const userMessage = createUserMessageFromSpec(agent, this.currentProjectSpec!);
      
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
