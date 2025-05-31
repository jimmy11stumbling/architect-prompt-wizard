
import { GenerationStatus, ProjectSpec, AgentName, AgentStatus, DeepSeekMessage } from "@/types/ipa-types";
import { invokeDeepSeekAgent, buildConversationHistory } from "./deepseekAPI";
import { mockTaskId, agentList, initialMockStatus } from "./mockData";
import { toast } from "@/hooks/use-toast";
import { savePrompt } from "../db/promptDatabaseService";

// We'll store the current project spec in a variable that can be accessed by getGenerationStatus
let currentProjectSpec: ProjectSpec | null = null;
let currentStatus: GenerationStatus = { ...initialMockStatus };
let conversationMessages: DeepSeekMessage[] = [];

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

      // Store the spec for use by getGenerationStatus
      currentProjectSpec = spec;
      currentStatus = { 
        ...initialMockStatus,
        spec: spec,
        messages: []
      };
      
      // Initialize conversation messages
      conversationMessages = [];
      
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
            
            // For multi-round conversation, build history of previous agents
            const messageHistory = buildConversationHistory(agentList.slice(0, currentStep - 1), currentProjectSpec!);
            
            // Now make the actual API call to DeepSeek with the conversation history
            console.log(`Invoking DeepSeek API for agent ${currentAgent} with ${messageHistory.length} messages in history`);
            const agentResponse = await invokeDeepSeekAgent(currentAgent, currentProjectSpec!, messageHistory);
            
            // Update the agent status with the actual response
            currentStatus.agents[currentStep - 1] = {
              agent: currentAgent,
              status: "completed",
              output: agentResponse.content
            };
            
            // Add this agent's response to the conversation
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
            
            // Update the messages in the generation status
            currentStatus.messages = [...conversationMessages];
          } catch (error) {
            console.error(`Error invoking DeepSeek for agent ${currentAgent}:`, error);
            currentStatus.agents[currentStep - 1] = {
              agent: currentAgent,
              status: "failed",
              output: `Error: ${error instanceof Error ? error.message : String(error)}`
            };
            
            toast({
              title: "Agent Error",
              description: `${currentAgent} failed: ${error instanceof Error ? error.message : String(error)}`,
              variant: "destructive"
            });
          }
        }
        
        // Update current status
        currentStatus = {
          ...currentStatus,
          progress: currentStep,
          status: currentStep <= agentList.length ? "processing" : "completed",
          agents: currentStatus.agents
        };
        
        // If we've completed all agents, generate the final result
        if (currentStep > agentList.length && !currentStatus.result) {
          try {
            const completedAgents = currentStatus.agents.filter(agent => agent.status === "completed");
            
            if (completedAgents.length === agentList.length) {
              const finalPrompt = await generateFinalPrompt(currentStatus.agents);
              currentStatus.result = finalPrompt;
              
              // Save the completed prompt to the database
              try {
                await savePrompt(currentStatus, "Cursor AI Prompt");
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
              currentStatus.result = `⚠️ Warning: ${agentList.length - completedAgents.length} out of ${agentList.length} agents failed to complete. The generated prompt may be incomplete.\n\n` +
                completedAgents.map(agent => `## ${agent.agent} Output\n${agent.output || "No output available"}\n`).join('\n');
              currentStatus.status = "failed";
              
              toast({
                title: "Partial Generation",
                description: `${completedAgents.length}/${agentList.length} agents completed successfully`,
                variant: "destructive"
              });
            }
          } catch (error) {
            console.error("Error generating final prompt:", error);
            currentStatus.result = `Error generating final prompt: ${error instanceof Error ? error.message : String(error)}`;
            currentStatus.status = "failed";
            
            toast({
              title: "Final Generation Error",
              description: `Failed to compile final prompt: ${error instanceof Error ? error.message : String(error)}`,
              variant: "destructive"
            });
          }
        }
        
        resolve({ ...currentStatus });
      } catch (error) {
        console.error("Error in getGenerationStatus:", error);
        currentStatus.status = "failed";
        currentStatus.error = error instanceof Error ? error.message : String(error);
        resolve({ ...currentStatus });
      }
    });
  }
};

// Function to generate the final prompt using agent outputs
const generateFinalPrompt = async (agents: AgentStatus[]): Promise<string> => {
  const agentOutputs = agents
    .filter(agent => agent.status === "completed" && agent.output)
    .map(agent => ({ agent: agent.agent, output: agent.output || "" }));
  
  if (agentOutputs.length === 0) {
    throw new Error("No completed agent outputs found");
  }
  
  const finalPrompt = `# Cursor AI - Project Implementation Prompt
Generated by Intelligent Prompt Architect (IPA)

## Project Overview
${agentOutputs.find(a => a.agent === "RequirementDecompositionAgent")?.output || "No project overview available."}

## Technical Implementation Guide

${agentOutputs
  .filter(a => a.agent !== "RequirementDecompositionAgent" && a.agent !== "QualityAssuranceAgent")
  .map(a => `### ${a.agent.replace("Agent", "").replace("TechStackImplementation", "Tech Stack").replace("_", " - ")}\n${a.output}`)
  .join('\n\n')}

## Quality Assurance & Best Practices
${agentOutputs.find(a => a.agent === "QualityAssuranceAgent")?.output || "No quality considerations available."}

## Implementation Roadmap
1. **Setup & Configuration**: Initialize project with selected tech stack
2. **Core Architecture**: Implement basic application structure and routing
3. **Database & Storage**: Set up data persistence and vector storage (if applicable)
4. **Authentication**: Implement user authentication and authorization
5. **API Development**: Create backend APIs and endpoints
6. **Frontend Development**: Build user interface components and pages
7. **Agent Integration**: Implement A2A communication and MCP protocols
8. **RAG Implementation**: Set up retrieval-augmented generation (if applicable)
9. **Testing & QA**: Comprehensive testing and quality assurance
10. **Deployment**: Deploy to production environment

---
*This comprehensive prompt has been compiled from ${agentOutputs.length} specialized AI agents to ensure complete coverage of your project requirements.*`;

  return finalPrompt;
};
