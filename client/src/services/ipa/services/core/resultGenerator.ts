import { ProjectSpec } from "@/types/ipa-types";
import { agentList } from "../../mockData";
import { realTimeResponseService } from "../../../integration/realTimeResponseService";
import { FinalPromptGenerator } from "../../finalPromptGenerator";
import { PromptAutoSaveService } from '@/services/promptAutoSave';
import { toast } from "@/hooks/use-toast";

export class ResultGenerator {
  static async generateFinalResult(statusManager: any, currentProjectSpec: ProjectSpec): Promise<void> {
    const updatedStatus = statusManager.getCurrentStatus();
    const completedAgents = updatedStatus.agents.filter((agent: any) => agent.status === "completed");

    try {
      if (completedAgents.length === agentList.length) {
        realTimeResponseService.addResponse({
          source: "result-generator",
          status: "processing",
          message: "Generating final prompt from all agent responses",
          data: { completedAgents: completedAgents.length }
        });

        const finalPrompt = await FinalPromptGenerator.generate(updatedStatus.agents);
        statusManager.setResult(finalPrompt);

        // Save the completed prompt to the database
        await this.saveFinalPrompt(currentProjectSpec, finalPrompt);
      } else {
        this.handlePartialCompletion(statusManager, completedAgents);
      }
    } catch (error) {
      this.handleFinalGenerationError(statusManager, error);
    }
  }

  private static async saveFinalPrompt(currentProjectSpec: ProjectSpec, finalPrompt: string): Promise<void> {
    try {
      await PromptAutoSaveService.savePrompt({
        projectName: currentProjectSpec?.projectDescription.substring(0, 50) || "Cursor AI Prompt",
        prompt: finalPrompt,
        timestamp: Date.now(),
        tags: ["ipa-generated", "cursor-ai"]
      });

      console.log("Prompt successfully saved to database");

      realTimeResponseService.addResponse({
        source: "result-generator",
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

  private static handlePartialCompletion(statusManager: any, completedAgents: any[]): void {
    const errorResult = `⚠️ Warning: ${agentList.length - completedAgents.length} out of ${agentList.length} agents failed to complete. The generated prompt may be incomplete.\n\n` +
      completedAgents.map((agent: any) => `## ${agent.agent} Output\n${agent.output || "No output available"}\n`).join('\n');
    statusManager.setResult(errorResult);
    statusManager.setError("Partial completion");

    toast({
      title: "Partial Generation",
      description: `${completedAgents.length}/${agentList.length} agents completed successfully`,
      variant: "destructive"
    });
  }

  private static handleFinalGenerationError(statusManager: any, error: any): void {
    console.error("Error generating final prompt:", error);
    const errorMessage = `Error generating final prompt: ${error instanceof Error ? error.message : String(error)}`;
    statusManager.setResult(errorMessage);
    statusManager.setError(errorMessage);

    toast({
      title: "Final Generation Error",
      description: `Failed to compile final prompt: ${error instanceof Error ? error.message : String(error)}`,
      variant: "destructive"
    });
  }
}