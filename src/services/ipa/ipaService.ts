
import { GenerationStatus, ProjectSpec } from "@/types/ipa-types";
import { mockTaskId } from "./mockData";
import { toast } from "@/hooks/use-toast";
import { GenerationOrchestrator } from "./generationOrchestrator";

// Single instance of the orchestrator to maintain state across calls
const orchestrator = new GenerationOrchestrator();

export const ipaService = {
  generatePrompt: async (spec: ProjectSpec): Promise<string> => {
    try {
      // Validate the spec
      if (!spec.projectDescription?.trim()) {
        throw new Error("Project description is required");
      }
      
      if (!spec.frontendTechStack || spec.frontendTechStack.length === 0) {
        throw new Error("At least one frontend technology must be selected");
      }
      
      if (!spec.backendTechStack || spec.backendTechStack.length === 0) {
        throw new Error("At least one backend technology must be selected");
      }

      // Initialize the orchestrator with the new spec
      orchestrator.setProjectSpec(spec);
      
      toast({
        title: "Generation Started",
        description: "Starting to generate your Cursor AI prompt with specialized agents",
      });
      
      return Promise.resolve(mockTaskId);
    } catch (error) {
      console.error("Error starting prompt generation:", error);
      toast({
        title: "Generation Error",
        description: error instanceof Error ? error.message : "Failed to start prompt generation",
        variant: "destructive"
      });
      throw error;
    }
  },
  
  getGenerationStatus: async (taskId: string): Promise<GenerationStatus> => {
    return new Promise(async (resolve) => {
      try {
        // Simulate slight network delay
        await new Promise(r => setTimeout(r, 500));
        
        const status = await orchestrator.processNextStep();
        resolve(status);
      } catch (error) {
        console.error("Error in getGenerationStatus:", error);
        const currentStatus = orchestrator.getCurrentStatus();
        currentStatus.status = "failed";
        currentStatus.error = error instanceof Error ? error.message : String(error);
        resolve(currentStatus);
      }
    });
  }
};
