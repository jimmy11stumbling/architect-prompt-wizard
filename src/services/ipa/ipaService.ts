import { GenerationStatus, ProjectSpec, AgentName, AgentStatus } from "@/types/ipa-types";
import { invokeDeepSeekAgent } from "./deepseekAPI";
import { mockTaskId, agentList, initialMockStatus } from "./mockData";
import { toast } from "@/hooks/use-toast";
import { savePrompt } from "../db/promptDatabaseService";

// We'll store the current project spec in a variable that can be accessed by getGenerationStatus
let currentProjectSpec: ProjectSpec | null = null;
let currentStatus: GenerationStatus = { ...initialMockStatus };

export const ipaService = {
  generatePrompt: async (spec: ProjectSpec): Promise<string> => {
    // Store the spec for use by getGenerationStatus
    currentProjectSpec = spec;
    currentStatus = { 
      ...initialMockStatus,
      spec: spec // Store the spec in the status for later database storage
    }; // Reset status for new generation
    
    // Return a task ID (in a real implementation this would come from the backend)
    return Promise.resolve(mockTaskId);
  },
  
  getGenerationStatus: async (taskId: string): Promise<GenerationStatus> => {
    return new Promise(async (resolve) => {
      // Simulate slight network delay
      await new Promise(r => setTimeout(r, 500));
      
      const currentStep = Math.min(currentStatus.progress + 1, agentList.length + 1);
      
      // If we're processing a new agent, invoke DeepSeek API for that agent
      if (currentStep > 0 && currentStep <= agentList.length) {
        const currentAgent = agentList[currentStep - 1];
        
        try {
          // Mark the current agent as processing first
          currentStatus.agents[currentStep - 1] = {
            agent: currentAgent,
            status: "processing"
          };
          
          resolve({ ...currentStatus });
          
          // Now make the actual API call to DeepSeek
          console.log(`Invoking DeepSeek API for agent ${currentAgent}...`);
          const agentResponse = await invokeDeepSeekAgent(currentAgent, currentProjectSpec!);
          
          // Update the agent status with the actual response
          currentStatus.agents[currentStep - 1] = {
            agent: currentAgent,
            status: "completed",
            output: agentResponse.content,
            reasoningContent: agentResponse.reasoningContent
          };
        } catch (error) {
          console.error(`Error invoking DeepSeek for agent ${currentAgent}:`, error);
          currentStatus.agents[currentStep - 1] = {
            agent: currentAgent,
            status: "failed",
            output: `Error: ${error instanceof Error ? error.message : String(error)}`
          };
          
          toast({
            title: "API Error",
            description: `Failed to get response from DeepSeek API: ${error instanceof Error ? error.message : String(error)}`,
            variant: "destructive"
          });
        }
      }
      
      // Update current status
      currentStatus = {
        ...currentStatus,
        progress: currentStep,
        status: currentStep <= agentList.length ? "processing" : "completed",
        agents: agentList.map((agent, index) => {
          // Keep existing agent status or update based on current step
          if (index < currentStep - 1) {
            // Already processed agents - keep their status
            return currentStatus.agents[index];
          } else if (index === currentStep - 1) {
            // Current agent - should be processing or completed/failed based on above logic
            return currentStatus.agents[index];
          } else if (index === currentStep) {
            // Next agent - mark as processing if we're not at the end
            return {
              ...currentStatus.agents[index],
              status: currentStep <= agentList.length ? "processing" : "idle"
            };
          } else {
            // Future agents - keep as idle
            return {
              ...currentStatus.agents[index],
              status: "idle"
            };
          }
        })
      };
      
      // If we've completed all agents, generate the final result
      if (currentStep > agentList.length && !currentStatus.result) {
        try {
          // In a real implementation, we would call the API to generate the final prompt
          // using all the agent outputs. For now, we'll create a simple combined result
          const completedAgents = currentStatus.agents.filter(agent => agent.status === "completed");
          
          if (completedAgents.length === agentList.length) {
            // All agents completed successfully, build final prompt
            const finalPrompt = await generateFinalPrompt(currentStatus.agents);
            currentStatus.result = finalPrompt;
            
            // Save the completed prompt to the database
            try {
              await savePrompt(currentStatus, "Cursor AI Prompt");
              console.log("Prompt successfully saved to database");
            } catch (error) {
              console.error("Failed to save prompt to database:", error);
            }
          } else {
            // Some agents failed, create a message about it
            currentStatus.result = `⚠️ Warning: ${agentList.length - completedAgents.length} out of ${agentList.length} agents failed to complete. The generated prompt may be incomplete.\n\n` +
              completedAgents.map(agent => `## ${agent.agent} Output\n${agent.output || "No output available"}\n`).join('\n');
            currentStatus.status = "failed";
          }
        } catch (error) {
          console.error("Error generating final prompt:", error);
          currentStatus.result = `Error generating final prompt: ${error instanceof Error ? error.message : String(error)}`;
          currentStatus.status = "failed";
          
          toast({
            title: "Prompt Generation Error",
            description: `Failed to generate final prompt: ${error instanceof Error ? error.message : String(error)}`,
            variant: "destructive"
          });
        }
      }
      
      resolve({ ...currentStatus });
    });
  }
};

// Function to generate the final prompt using agent outputs
const generateFinalPrompt = async (agents: AgentStatus[]): Promise<string> => {
  // Get all completed agent outputs
  const agentOutputs = agents
    .filter(agent => agent.status === "completed" && agent.output)
    .map(agent => ({ agent: agent.agent, output: agent.output || "" }));
  
  if (agentOutputs.length === 0) {
    throw new Error("No completed agent outputs found");
  }
  
  // For now, we'll create a structured prompt from all agent outputs
  const finalPrompt = `# Cursor AI - Project Prompt
Generated by Intelligent Prompt Architect

## Project Overview
${agentOutputs.find(a => a.agent === "RequirementDecompositionAgent")?.output || "No project overview available."}

## Technical Specifications

${agentOutputs
  .filter(a => a.agent !== "RequirementDecompositionAgent" && a.agent !== "QualityAssuranceAgent")
  .map(a => `### ${a.agent.replace("Agent", "").replace("TechStackImplementation", "").replace("_", " ")}\n${a.output}`)
  .join('\n\n')}

## Quality Considerations
${agentOutputs.find(a => a.agent === "QualityAssuranceAgent")?.output || "No quality considerations available."}

## Implementation Steps
1. Set up project structure with specified tech stack
2. Implement core functionality with focus on RAG and MCP patterns
3. Develop Agent-to-Agent communication system
4. Test thoroughly particularly focusing on Integration points
5. Deploy and monitor

This prompt includes structured requirements, technical guidance, and implementation suggestions compiled from multiple specialized agents.`;

  return finalPrompt;
};
