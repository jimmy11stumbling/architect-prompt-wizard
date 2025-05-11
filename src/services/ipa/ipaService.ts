
import { GenerationStatus, ProjectSpec, AgentName } from "@/types/ipa-types";
import { invokeDeepSeekAgent } from "./deepseekAPI";
import { mockTaskId, agentList, initialMockStatus, enhancedExamplePrompt } from "./mockData";

// We'll store the current project spec in a variable that can be accessed by getGenerationStatus
let currentProjectSpec: ProjectSpec | null = null;
let mockStatus: GenerationStatus = { ...initialMockStatus };

export const ipaService = {
  generatePrompt: async (spec: ProjectSpec): Promise<string> => {
    // Store the spec for use by getGenerationStatus
    currentProjectSpec = spec;
    // In a real app, this would call the backend API
    return Promise.resolve(mockTaskId);
  },
  
  getGenerationStatus: async (taskId: string): Promise<GenerationStatus> => {
    // In a real app, this would poll the backend API
    return new Promise((resolve) => {
      setTimeout(async () => {
        const currentStep = Math.min(mockStatus.progress + 1, 7);
        
        // If we're processing a new agent, invoke DeepSeek for that agent
        if (currentStep > 0 && currentStep <= agentList.length) {
          const currentAgent = agentList[currentStep - 1];
          
          try {
            // Only make the API call if we're not in development/mock mode
            if (process.env.NODE_ENV === "production" && currentProjectSpec) {
              const agentResponse = await invokeDeepSeekAgent(currentAgent, currentProjectSpec);
              
              // Update the agent status with the response
              mockStatus.agents[currentStep - 1] = {
                agent: currentAgent,
                status: "completed",
                output: agentResponse.content,
                reasoningContent: agentResponse.reasoningContent
              };
            } else {
              // In development/mock mode, just update the status
              mockStatus.agents[currentStep - 1] = {
                agent: currentAgent,
                status: "completed"
              };
            }
          } catch (error) {
            console.error(`Error invoking DeepSeek for agent ${currentAgent}:`, error);
            mockStatus.agents[currentStep - 1] = {
              agent: currentAgent,
              status: "failed",
              output: `Error: ${error instanceof Error ? error.message : String(error)}`
            };
          }
        }
        
        // Update mock status
        mockStatus = {
          ...mockStatus,
          progress: currentStep,
          status: currentStep < 7 ? "processing" : "completed",
          agents: agentList.map((agent, index) => ({
            ...mockStatus.agents[index],
            status:
              index < currentStep
                ? mockStatus.agents[index].status || "completed"
                : index === currentStep
                ? "processing"
                : "idle"
          }))
        };
        
        if (currentStep === 7) {
          mockStatus.result = enhancedExamplePrompt;
        }
        
        resolve(mockStatus);
      }, 2000); // Simulate network delay
    });
  }
};
