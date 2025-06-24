
import { GenerationStatus, ProjectSpec, AgentName, AgentStatus, DeepSeekMessage } from "@/types/ipa-types";
import { invokeDeepSeekAgent, buildConversationHistory } from "./deepseekAPI";
import { mockTaskId, agentList } from "./mockData";
import { toast } from "@/hooks/use-toast";
import { supabasePromptService } from "../db/supabasePromptService";
import { connectionPool } from "./connectionPool";
import { requestBatcher } from "./requestBatcher";
import { cacheService } from "./cacheService";
import { performanceMonitor } from "./performanceMonitor";
import { SpecValidator } from "./validation/specValidator";
import { StatusManager } from "./status/statusManager";
import { MetricsService } from "./metrics/metricsService";
import { FinalPromptGenerator } from "./finalPromptGenerator";
import { IpaServiceInterface } from "./types/serviceTypes";

// Enhanced service with scalability optimizations
const statusManager = new StatusManager();
let currentProjectSpec: ProjectSpec | null = null;

export const scalableIpaService: IpaServiceInterface = {
  generatePrompt: async (spec: ProjectSpec): Promise<string> => {
    const startTime = performance.now();
    
    try {
      // Validate the spec
      SpecValidator.validate(spec);

      // Check cache first
      const cacheKey = `prompt_${JSON.stringify(spec).slice(0, 100)}`;
      const cachedResult = cacheService.get<string>(cacheKey);
      if (cachedResult) {
        performanceMonitor.trackApiCall('generatePrompt', performance.now() - startTime, true);
        return cachedResult;
      }

      // Acquire connection from pool
      const connectionId = await connectionPool.acquireConnection();
      
      try {
        // Store the spec for use by getGenerationStatus
        currentProjectSpec = spec;
        statusManager.initializeStatus(spec);
        
        // Cache the task ID
        cacheService.set(cacheKey, mockTaskId, 600000); // 10 minute cache
        
        performanceMonitor.trackApiCall('generatePrompt', performance.now() - startTime, true);
        
        toast({
          title: "Generation Started",
          description: "Starting to generate your Cursor AI prompt with specialized agents",
        });
        
        return Promise.resolve(mockTaskId);
      } finally {
        connectionPool.releaseConnection(connectionId);
      }
    } catch (error) {
      performanceMonitor.trackApiCall('generatePrompt', performance.now() - startTime, false);
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
    const startTime = performance.now();
    
    return new Promise(async (resolve) => {
      try {
        // Check cache first
        const currentStatus = statusManager.getCurrentStatus();
        const cacheKey = `status_${taskId}_${currentStatus.progress}`;
        const cachedStatus = cacheService.get<GenerationStatus>(cacheKey);
        if (cachedStatus) {
          performanceMonitor.trackApiCall('getGenerationStatus', performance.now() - startTime, true);
          resolve(cachedStatus);
          return;
        }

        // Use request batching for high load scenarios
        const batchKey = `status_batch_${Math.floor(Date.now() / 1000)}`; // 1-second batches
        
        const result = await requestBatcher.addRequest(batchKey, async () => {
          // Simulate slight network delay
          await new Promise(r => setTimeout(r, 100)); // Reduced delay for better performance
          
          const currentStep = Math.min(currentStatus.progress + 1, agentList.length + 1);
          
          // If we're processing a new agent, invoke DeepSeek API for that agent
          if (currentStep > 0 && currentStep <= agentList.length) {
            const currentAgent = agentList[currentStep - 1];
            
            try {
              // Mark the current agent as processing first
              statusManager.updateAgentStatus(currentStep - 1, {
                id: `agent-${Date.now()}`,
                name: currentAgent,
                agent: currentAgent,
                status: "processing",
                progress: 0,
                timestamp: Date.now()
              });
              
              // For multi-round conversation, build history of previous agents
              const messageHistory = buildConversationHistory(agentList.slice(0, currentStep - 1), currentProjectSpec!);
              
              // Now make the actual API call to DeepSeek with the conversation history
              console.log(`Invoking DeepSeek API for agent ${currentAgent} with ${messageHistory.length} messages in history`);
              const agentResponse = await invokeDeepSeekAgent(currentAgent, currentProjectSpec!, messageHistory);
              
              // Update the agent status with the actual response
              statusManager.updateAgentStatus(currentStep - 1, {
                id: `agent-${Date.now()}`,
                name: currentAgent,
                agent: currentAgent,
                status: "completed",
                progress: 100,
                output: agentResponse.content,
                timestamp: Date.now()
              });
              
              // Add this agent's response to the conversation
              let conversationMessages = statusManager.getConversationMessages();
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
                content: agentResponse.content
              });
              
              // Update the messages in the status manager
              statusManager.updateMessages(conversationMessages);
            } catch (error) {
              console.error(`Error invoking DeepSeek for agent ${currentAgent}:`, error);
              statusManager.updateAgentStatus(currentStep - 1, {
                id: `agent-${Date.now()}`,
                name: currentAgent,
                agent: currentAgent,
                status: "failed",
                progress: 0,
                output: `Error: ${error instanceof Error ? error.message : String(error)}`,
                timestamp: Date.now()
              });
              
              toast({
                title: "Agent Error",
                description: `${currentAgent} failed: ${error instanceof Error ? error.message : String(error)}`,
                variant: "destructive"
              });
            }
          }
          
          // Update progress
          statusManager.updateProgress(currentStep);
          
          // If we've completed all agents, generate the final result
          const updatedStatus = statusManager.getCurrentStatus();
          if (currentStep > agentList.length && !updatedStatus.result) {
            try {
              const completedAgents = updatedStatus.agents.filter(agent => agent.status === "completed");
              
              if (completedAgents.length === agentList.length) {
                const finalPrompt = await FinalPromptGenerator.generate(updatedStatus.agents);
                statusManager.setResult(finalPrompt);
                
                // Save the completed prompt to Supabase
                try {
                  await supabasePromptService.savePrompt({
                    projectName: currentProjectSpec?.projectDescription.substring(0, 50) || "Cursor AI Prompt",
                    prompt: finalPrompt,
                    timestamp: Date.now(),
                    tags: ["ipa-generated", "cursor-ai"],
                    description: `Generated prompt for ${currentProjectSpec?.projectDescription.substring(0, 100) || "project"}`,
                    category: "ai-ml"
                  });
                  console.log("Prompt successfully saved to Supabase");
                  
                  toast({
                    title: "Prompt Generated Successfully",
                    description: "Your Cursor AI prompt has been generated and saved to your library",
                  });
                } catch (error) {
                  console.error("Failed to save prompt to Supabase:", error);
                  toast({
                    title: "Save Warning",
                    description: "Prompt generated but failed to save to database. Please make sure you're signed in.",
                    variant: "destructive"
                  });
                }
              } else {
                const errorResult = `⚠️ Warning: ${agentList.length - completedAgents.length} out of ${agentList.length} agents failed to complete. The generated prompt may be incomplete.\n\n` +
                  completedAgents.map(agent => `## ${agent.agent} Output\n${agent.output || "No output available"}\n`).join('\n');
                statusManager.setResult(errorResult);
                statusManager.setError("Partial completion");
                
                toast({
                  title: "Partial Generation",
                  description: `${completedAgents.length}/${agentList.length} agents completed successfully`,
                  variant: "destructive"
                });
              }
            } catch (error) {
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
          
          return statusManager.getCurrentStatus();
        });

        // Cache the result
        cacheService.set(cacheKey, result, 30000); // 30 second cache for status
        
        performanceMonitor.trackApiCall('getGenerationStatus', performance.now() - startTime, true);
        resolve(result);
      } catch (error) {
        performanceMonitor.trackApiCall('getGenerationStatus', performance.now() - startTime, false);
        console.error("Error in getGenerationStatus:", error);
        statusManager.setError(error instanceof Error ? error.message : String(error));
        resolve(statusManager.getCurrentStatus());
      }
    });
  },

  // Get system performance metrics
  getSystemMetrics: () => {
    return MetricsService.getSystemMetrics();
  },

  // Health check endpoint
  healthCheck: async (): Promise<{ status: string; metrics: any }> => {
    return MetricsService.healthCheck();
  }
};
