
import { GenerationStatus, ProjectSpec } from "@/types/ipa-types";
import { agentList } from "../../mockData";
import { realTimeResponseService } from "../../../integration/realTimeResponseService";
import { StatusManager } from "../../status/statusManager";
import { invokeDeepSeekAgent, buildConversationHistory } from "../../deepseekAPI";
import { FinalPromptGenerator } from "../../finalPromptGenerator";
import { savePrompt } from "../../../db/promptDatabaseService";
import { toast } from "@/hooks/use-toast";

export class GenerationManager {
  private statusManager: StatusManager;

  constructor(statusManager: StatusManager) {
    this.statusManager = statusManager;
  }

  async processAgent(currentStep: number, currentProjectSpec: ProjectSpec): Promise<void> {
    if (currentStep <= 0 || currentStep > agentList.length) return;

    const currentAgent = agentList[currentStep - 1];

    try {
      // Mark the current agent as processing first
      this.statusManager.updateAgentStatus(currentStep - 1, {
        id: `agent-${Date.now()}`,
        name: currentAgent,
        agent: currentAgent,
        status: "processing",
        progress: 0,
        timestamp: Date.now()
      });

      realTimeResponseService.addResponse({
        source: "deepseek-reasoner",
        status: "processing",
        message: `Processing agent: ${currentAgent}`,
        data: { agent: currentAgent, step: currentStep }
      });

      // For multi-round conversation, build history of previous agents
      const messageHistory = buildConversationHistory(agentList.slice(0, currentStep - 1), currentProjectSpec);

      // Now make the actual API call to DeepSeek with the conversation history
      console.log(`Invoking DeepSeek API for agent ${currentAgent} with ${messageHistory.length} messages in history`);
      const agentResponse = await invokeDeepSeekAgent(currentAgent, currentProjectSpec, messageHistory);

      // Update the agent status with the actual response
      this.statusManager.updateAgentStatus(currentStep - 1, {
        id: `agent-${Date.now()}`,
        name: currentAgent,
        agent: currentAgent,
        status: "completed",
        progress: 100,
        output: agentResponse.content,
        timestamp: Date.now()
      });

      realTimeResponseService.addResponse({
        source: "deepseek-reasoner",
        status: "success",
        message: `Agent ${currentAgent} completed successfully`,
        data: { 
          agent: currentAgent, 
          responseLength: agentResponse.content.length,
          reasoning: agentResponse.content.substring(0, 200) + "..."
        }
      });

      // Add this agent's response to the conversation
      this.updateConversationHistory(messageHistory, currentAgent, agentResponse.content);

    } catch (error) {
      this.handleAgentError(currentStep - 1, currentAgent, error);
    }
  }

  private updateConversationHistory(messageHistory: any[], currentAgent: string, responseContent: string): void {
    let conversationMessages = this.statusManager.getConversationMessages();
    if (conversationMessages.length === 0) {
      conversationMessages = [...messageHistory];
    }

    // Add the agent's system prompt
    conversationMessages.push({
      role: "system",
      content: `Now responding as ${currentAgent}`
    });

    // Add the agent's response to the conversation history
    conversationMessages.push({
      role: "assistant",
      content: responseContent
    });

    // Update the messages in the status manager
    this.statusManager.updateMessages(conversationMessages);
  }

  private handleAgentError(agentIndex: number, currentAgent: string, error: any): void {
    console.error(`Error invoking DeepSeek for agent ${currentAgent}:`, error);
    this.statusManager.updateAgentStatus(agentIndex, {
      id: `agent-${Date.now()}`,
      name: currentAgent,
      agent: currentAgent,
      status: "failed",
      progress: 0,
      output: `Error: ${error instanceof Error ? error.message : String(error)}`,
      timestamp: Date.now()
    });

    realTimeResponseService.addResponse({
      source: "deepseek-reasoner",
      status: "error",
      message: `Agent ${currentAgent} failed: ${error instanceof Error ? error.message : "Unknown error"}`,
      data: { agent: currentAgent, error: error instanceof Error ? error.message : String(error) }
    });

    toast({
      title: "Agent Error",
      description: `${currentAgent} failed: ${error instanceof Error ? error.message : String(error)}`,
      variant: "destructive"
    });
  }

  async generateFinalResult(currentProjectSpec: ProjectSpec): Promise<void> {
    const updatedStatus = this.statusManager.getCurrentStatus();
    const completedAgents = updatedStatus.agents.filter(agent => agent.status === "completed");

    try {
      if (completedAgents.length === agentList.length) {
        realTimeResponseService.addResponse({
          source: "final-generator",
          status: "processing",
          message: "Generating final prompt from all agent responses",
          data: { completedAgents: completedAgents.length }
        });

        const finalPrompt = await FinalPromptGenerator.generate(updatedStatus.agents);
        this.statusManager.setResult(finalPrompt);

        // Save the completed prompt to the database
        await this.saveFinalPrompt(currentProjectSpec, finalPrompt);
      } else {
        this.handlePartialCompletion(completedAgents);
      }
    } catch (error) {
      this.handleFinalGenerationError(error);
    }
  }

  private async saveFinalPrompt(currentProjectSpec: ProjectSpec, finalPrompt: string): Promise<void> {
    try {
      await savePrompt({
        projectName: currentProjectSpec?.projectDescription.substring(0, 50) || "Cursor AI Prompt",
        prompt: finalPrompt,
        timestamp: Date.now(),
        tags: ["ipa-generated", "cursor-ai"]
      });

      console.log("Prompt successfully saved to database");

      realTimeResponseService.addResponse({
        source: "final-generator",
        status: "success",
        message: "Final prompt generated and saved successfully",
        data: { 
          promptLength: finalPrompt.length,
          savedToDatabase: true
        }
      });

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
  }

  private handlePartialCompletion(completedAgents: any[]): void {
    const errorResult = `⚠️ Warning: ${agentList.length - completedAgents.length} out of ${agentList.length} agents failed to complete. The generated prompt may be incomplete.\n\n` +
      completedAgents.map(agent => `## ${agent.agent} Output\n${agent.output || "No output available"}\n`).join('\n');
    this.statusManager.setResult(errorResult);
    this.statusManager.setError("Partial completion");

    toast({
      title: "Partial Generation",
      description: `${completedAgents.length}/${agentList.length} agents completed successfully`,
      variant: "destructive"
    });
  }

  private handleFinalGenerationError(error: any): void {
    console.error("Error generating final prompt:", error);
    const errorMessage = `Error generating final prompt: ${error instanceof Error ? error.message : String(error)}`;
    this.statusManager.setResult(errorMessage);
    this.statusManager.setError(errorMessage);

    toast({
      title: "Final Generation Error",
      description: `Failed to compile final prompt: ${error instanceof Error ? error.message : String(error)}`,
      variant: "destructive"
    });
  }
}
