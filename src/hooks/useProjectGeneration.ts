
import { useState, useCallback } from "react";
import { ProjectSpec, GenerationStatus, TechStack } from "@/types/ipa-types";
import { ipaService } from "@/services/ipaService";
import { useToast } from "@/hooks/use-toast";
import { realTimeResponseService } from "@/services/integration/realTimeResponseService";

export const useProjectGeneration = () => {
  const [generationStatus, setGenerationStatus] = useState<GenerationStatus | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const { toast } = useToast();

  const handleSubmit = useCallback(async (spec: ProjectSpec) => {
    try {
      // Add real-time response for form submission
      realTimeResponseService.addResponse({
        source: "form-submission",
        status: "processing",
        message: "Processing comprehensive project specification submission",
        data: { 
          projectDescription: spec.projectDescription.substring(0, 100),
          frontendTech: spec.frontendTechStack,
          backendTech: spec.backendTechStack,
          ragEnabled: spec.ragVectorDb !== "None",
          mcpEnabled: spec.mcpType !== "None",
          a2aEnabled: spec.a2aIntegrationDetails.length > 0
        }
      });

      // Prepare a complete spec with all tech stacks (standard + custom)
      const completeSpec: ProjectSpec = {
        ...spec,
        frontendTechStack: [
          ...spec.frontendTechStack,
          ...spec.customFrontendTech.filter(tech => !spec.frontendTechStack.includes(tech as TechStack)).map(tech => tech as TechStack)
        ],
        backendTechStack: [
          ...spec.backendTechStack,
          ...spec.customBackendTech.filter(tech => !spec.backendTechStack.includes(tech as TechStack)).map(tech => tech as TechStack)
        ]
      };

      setIsGenerating(true);
      setGenerationStatus(null);
      
      const taskId = await ipaService.generatePrompt(completeSpec);
      console.log("Starting comprehensive generation with task ID:", taskId);
      
      realTimeResponseService.addResponse({
        source: "form-submission",
        status: "success",
        message: "Advanced prompt generation started successfully with all template data",
        data: { taskId, specValidated: true, templateApplied: true }
      });
      
      startPolling(taskId);
    } catch (error) {
      console.error("Error generating prompt:", error);
      setIsGenerating(false);
      
      realTimeResponseService.addResponse({
        source: "form-submission",
        status: "error",
        message: `Generation failed: ${error instanceof Error ? error.message : "Unknown error"}`,
        data: { error: error instanceof Error ? error.message : String(error) }
      });
      
      toast({
        title: "Generation Failed",
        description: error instanceof Error ? error.message : "Failed to start prompt generation",
        variant: "destructive"
      });
    }
  }, [toast]);

  const startPolling = useCallback(async (taskId: string) => {
    try {
      const status = await ipaService.getGenerationStatus(taskId);
      setGenerationStatus(status);
      
      // Add real-time response for polling updates
      realTimeResponseService.addResponse({
        source: "polling-service",
        status: status.status === "completed" ? "success" : 
                status.status === "failed" ? "error" : "processing",
        message: `Status update: ${status.status} (Progress: ${status.progress})`,
        data: { 
          taskId, 
          status: status.status, 
          progress: status.progress,
          agentCount: status.agents.length
        }
      });
      
      if (status.status !== "completed" && status.status !== "failed") {
        // Continue polling with a 2-second interval
        setTimeout(() => startPolling(taskId), 2000);
      } else {
        // Generation complete or failed
        setIsGenerating(false);
        console.log("Generation completed with status:", status.status);
        
        if (status.status === "completed") {
          realTimeResponseService.addResponse({
            source: "polling-service",
            status: "success",
            message: "Comprehensive prompt generation completed successfully",
            data: { 
              taskId, 
              finalStatus: status.status,
              resultLength: status.result?.length || 0
            }
          });
          
          toast({
            title: "Generation Complete",
            description: "Your comprehensive Cursor AI prompt has been successfully generated!",
          });
        }
      }
    } catch (error) {
      console.error("Error polling status:", error);
      setIsGenerating(false);
      
      realTimeResponseService.addResponse({
        source: "polling-service",
        status: "error",
        message: `Polling error: ${error instanceof Error ? error.message : "Unknown error"}`,
        data: { taskId, error: error instanceof Error ? error.message : String(error) }
      });
      
      toast({
        title: "Polling Error",
        description: "Failed to check generation status",
        variant: "destructive"
      });
    }
  }, [toast]);

  return {
    generationStatus,
    isGenerating,
    handleSubmit
  };
};
