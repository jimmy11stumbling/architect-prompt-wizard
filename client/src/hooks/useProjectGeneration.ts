
import { useState, useCallback, useRef, useEffect } from "react";
import { ProjectSpec, GenerationStatus, TechStack, AgentName } from "@/types/ipa-types";
import { ipaService } from "@/services/ipaService";
import { useToast } from "@/hooks/use-toast";
import { realTimeResponseService } from "@/services/integration/realTimeResponseService";
import { GenerationOrchestrator } from "@/services/ipa/generationOrchestrator";
import { PromptAutoSaveService } from "@/services/promptAutoSave";

export const useProjectGeneration = () => {
  const [generationStatus, setGenerationStatus] = useState<GenerationStatus | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [orchestrator] = useState(() => new GenerationOrchestrator());
  const pollingTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const { toast } = useToast();
  const lastUpdateRef = useRef<number>(0);

  // Cleanup polling timeout on unmount
  useEffect(() => {
    return () => {
      if (pollingTimeoutRef.current) {
        clearTimeout(pollingTimeoutRef.current);
      }
    };
  }, []);

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

      // Ensure we have a valid target platform
      const targetPlatform = spec.targetPlatform || 'cursor';
      console.log(`Using platform: ${targetPlatform} for target: ${spec.targetPlatform}`);
      
      // Prepare a complete spec with all tech stacks (standard + custom)
      const completeSpec: ProjectSpec = {
        ...spec,
        targetPlatform, // Ensure platform is set
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
      
      // Debounce UI updates to prevent flickering
      const now = Date.now();
      const timeSinceLastUpdate = now - lastUpdateRef.current;
      
      // Only update UI if significant time has passed or status changed significantly
      if (timeSinceLastUpdate > 3000 || 
          status.status === "completed" || 
          status.status === "failed" ||
          !generationStatus ||
          status.progress > generationStatus.progress + 10) {
        
        setGenerationStatus(status);
        lastUpdateRef.current = now;
        
        // Add real-time response for polling updates (less frequent)
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
      }
      
      if (status.status !== "completed" && status.status !== "failed") {
        // Clear any existing timeout and set a new one
        if (pollingTimeoutRef.current) {
          clearTimeout(pollingTimeoutRef.current);
        }
        
        pollingTimeoutRef.current = setTimeout(() => {
          startPolling(taskId).catch(error => {
            console.error("Polling continuation error:", error);
            setIsGenerating(false);
          });
        }, 4000); // Increased from 2s to 4s to reduce UI flickering
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
          
          // Auto-save the generated prompt
          if (status.result && status.spec && PromptAutoSaveService.isAutoSaveEnabled()) {
            await PromptAutoSaveService.autoSaveGeneratedPrompt(
              status.result,
              status.spec,
              taskId
            );
          }
          
          toast({
            title: "Generation Complete",
            description: `Your comprehensive ${status.spec?.targetPlatform || 'AI'} prompt has been successfully generated!`,
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

  // Real-time streaming method with DeepSeek integration
  const handleStreamingSubmit = useCallback(async (spec: ProjectSpec) => {
    try {
      // Prepare complete spec
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
      await orchestrator.setProjectSpec(completeSpec);

      // Show notification for generation start
      toast({
        title: "Master Blueprint Generation Started",
        description: "Agents are now working on your comprehensive blueprint...",
      });

      // Scroll to agent workflow section after a brief delay
      setTimeout(() => {
        const agentWorkflowElement = document.querySelector('[data-component="agent-workflow"]');
        if (agentWorkflowElement) {
          agentWorkflowElement.scrollIntoView({ 
            behavior: 'smooth', 
            block: 'start' 
          });
        }
      }, 500);

      // Initialize status for streaming
      const initialStatus: GenerationStatus = {
        taskId: `streaming-${Date.now()}`,
        status: "processing",
        agents: [],
        progress: 0,
        startTime: Date.now(),
        spec: completeSpec,
        messages: []
      };
      setGenerationStatus(initialStatus);

      realTimeResponseService.addResponse({
        source: "streaming-generation",
        status: "processing",
        message: "Starting real-time DeepSeek streaming generation",
        data: { taskId: initialStatus.taskId, streaming: true }
      });

      // Start streaming generation
      await orchestrator.processAllAgentsWithStreaming(
        (agentName: AgentName) => {
          // Agent started
          setGenerationStatus(prev => {
            if (!prev) return prev;
            const updatedAgents = [...prev.agents];
            const agentIndex = updatedAgents.findIndex(a => a.name === agentName);
            if (agentIndex >= 0) {
              updatedAgents[agentIndex] = {
                ...updatedAgents[agentIndex],
                status: "processing"
              };
            } else {
              updatedAgents.push({
                id: `${agentName}-${Date.now()}`,
                name: agentName,
                agent: agentName,
                status: "processing",
                progress: 0,
                timestamp: Date.now()
              });
            }
            return { ...prev, agents: updatedAgents };
          });

          realTimeResponseService.addResponse({
            source: "agent-processing",
            status: "processing",
            message: `Agent ${agentName} started processing`,
            data: { agent: agentName, streaming: true }
          });
        },
        (agentName: AgentName, token: string) => {
          // Agent token received
          setGenerationStatus(prev => {
            if (!prev) return prev;
            const updatedAgents = [...prev.agents];
            const agentIndex = updatedAgents.findIndex(a => a.name === agentName);
            if (agentIndex >= 0) {
              const currentOutput = updatedAgents[agentIndex].output || "";
              updatedAgents[agentIndex] = {
                ...updatedAgents[agentIndex],
                output: currentOutput + token,
                progress: 50
              };
            }
            return { ...prev, agents: updatedAgents };
          });
        },
        (agentName: AgentName, response: string) => {
          // Agent completed
          setGenerationStatus(prev => {
            if (!prev) return prev;
            const updatedAgents = [...prev.agents];
            const agentIndex = updatedAgents.findIndex(a => a.name === agentName);
            if (agentIndex >= 0) {
              updatedAgents[agentIndex] = {
                ...updatedAgents[agentIndex],
                status: "completed",
                progress: 100,
                output: response,
                result: response
              };
            }
            return { ...prev, agents: updatedAgents };
          });

          realTimeResponseService.addResponse({
            source: "agent-processing",
            status: "success",
            message: `Agent ${agentName} completed successfully`,
            data: { agent: agentName, responseLength: response.length }
          });
        },
        async (finalStatus: GenerationStatus) => {
          // All agents completed
          setGenerationStatus(finalStatus);
          setIsGenerating(false);

          realTimeResponseService.addResponse({
            source: "streaming-generation",
            status: "success",
            message: "Real-time streaming generation completed successfully",
            data: { 
              taskId: finalStatus.taskId,
              completedAgents: finalStatus.agents.filter(a => a.status === "completed").length,
              finalResult: !!finalStatus.result
            }
          });

          // Auto-save the generated prompt from streaming
          if (finalStatus.result && finalStatus.spec && PromptAutoSaveService.isAutoSaveEnabled()) {
            await PromptAutoSaveService.autoSaveGeneratedPrompt(
              finalStatus.result,
              finalStatus.spec,
              finalStatus.taskId
            );
          }

          toast({
            title: "Streaming Generation Complete",
            description: "Your real-time DeepSeek prompt has been successfully generated!",
          });
        }
      );

    } catch (error) {
      console.error("Error in streaming generation:", error);
      setIsGenerating(false);
      
      realTimeResponseService.addResponse({
        source: "streaming-generation",
        status: "error",
        message: `Streaming generation failed: ${error instanceof Error ? error.message : "Unknown error"}`,
        data: { error: error instanceof Error ? error.message : String(error) }
      });

      toast({
        title: "Streaming Generation Failed",
        description: error instanceof Error ? error.message : "Failed to start streaming generation",
        variant: "destructive"
      });
    }
  }, [orchestrator, toast]);

  return {
    generationStatus,
    isGenerating,
    handleSubmit,
    handleStreamingSubmit
  };
};
