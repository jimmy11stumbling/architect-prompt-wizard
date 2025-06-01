
import { GenerationStatus, ProjectSpec, AgentStatus, DeepSeekMessage } from "@/types/ipa-types";
import { agentList, initialMockStatus } from "./mockData";
import { buildConversationHistory } from "./deepseekAPI";
import { AgentProcessor } from "./agentProcessor";
import { ConversationManager } from "./conversationManager";
import { FinalPromptGenerator } from "./finalPromptGenerator";
import { savePrompt } from "../db/promptDatabaseService";
import { toast } from "@/hooks/use-toast";

export class GenerationOrchestrator {
  private currentStatus: GenerationStatus;
  private conversationManager: ConversationManager;
  private currentProjectSpec: ProjectSpec | null = null;

  constructor() {
    this.currentStatus = { ...initialMockStatus };
    this.conversationManager = new ConversationManager();
  }

  setProjectSpec(spec: ProjectSpec): void {
    this.currentProjectSpec = spec;
    this.currentStatus = { 
      ...initialMockStatus,
      spec: spec,
      messages: []
    };
    this.conversationManager.reset();
  }

  async processNextStep(): Promise<GenerationStatus> {
    const currentStep = Math.min(this.currentStatus.progress + 1, agentList.length + 1);
    
    // If we're processing a new agent, invoke DeepSeek API for that agent
    if (currentStep > 0 && currentStep <= agentList.length) {
      const currentAgent = agentList[currentStep - 1];
      
      // Mark the current agent as processing first
      this.currentStatus.agents[currentStep - 1] = {
        agent: currentAgent,
        status: "processing"
      };
      
      // For multi-round conversation, build history of previous agents
      const messageHistory = buildConversationHistory(agentList.slice(0, currentStep - 1), this.currentProjectSpec!);
      
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
      status: currentStep <= agentList.length ? "processing" : "completed",
      agents: this.currentStatus.agents
    };
    
    // If we've completed all agents, generate the final result
    if (currentStep > agentList.length && !this.currentStatus.result) {
      await this.generateFinalResult();
    }
    
    return { ...this.currentStatus };
  }

  private async generateFinalResult(): Promise<void> {
    try {
      const completedAgents = this.currentStatus.agents.filter(agent => agent.status === "completed");
      
      if (completedAgents.length === agentList.length) {
        const finalPrompt = await FinalPromptGenerator.generate(this.currentStatus.agents);
        this.currentStatus.result = finalPrompt;
        
        // Save the completed prompt to the database
        try {
          await savePrompt(this.currentStatus, "Cursor AI Prompt");
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
        this.currentStatus.result = `⚠️ Warning: ${agentList.length - completedAgents.length} out of ${agentList.length} agents failed to complete. The generated prompt may be incomplete.\n\n` +
          completedAgents.map(agent => `## ${agent.agent} Output\n${agent.output || "No output available"}\n`).join('\n');
        this.currentStatus.status = "failed";
        
        toast({
          title: "Partial Generation",
          description: `${completedAgents.length}/${agentList.length} agents completed successfully`,
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
