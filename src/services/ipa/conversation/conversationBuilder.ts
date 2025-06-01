
import { AgentName, ProjectSpec, DeepSeekMessage } from "@/types/ipa-types";
import { getAgentSystemPrompt } from "../agentPrompts";

export class ConversationBuilder {
  static buildConversationHistory(prevAgents: AgentName[], spec: ProjectSpec): DeepSeekMessage[] {
    const messages: DeepSeekMessage[] = [];
    
    // Add a high-level system prompt to start the conversation
    messages.push({
      role: "system", 
      content: "You are a collaborative AI system helping to create a comprehensive project specification."
    });
    
    // Add the initial user request with project details
    messages.push({
      role: "user",
      content: `I need assistance with this project: ${spec.projectDescription}`
    });
    
    // For each previous agent that has completed, add their contribution to the conversation
    prevAgents.forEach(agentName => {
      // Get the system prompt for this agent
      const agentSystemPrompt = getAgentSystemPrompt(agentName, spec);
      
      // Add the agent's system prompt as a user message (to provide context)
      messages.push({
        role: "user",
        content: `Now I need you to act as a ${agentName}. ${agentSystemPrompt}`
      });
      
      // In a real multi-round conversation, we would add the agent's response here
      // For now, we'll use placeholder content (this will be replaced by real implementation)
      messages.push({
        role: "assistant",
        content: `[${agentName}'s analysis and recommendations would appear here]`
      });
    });
    
    return messages;
  }
}
