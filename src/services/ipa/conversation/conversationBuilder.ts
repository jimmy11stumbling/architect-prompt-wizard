
import { AgentName, ProjectSpec, DeepSeekMessage } from "@/types/ipa-types";
import { getAgentSystemPrompt, createUserMessageFromSpec } from "../agentPrompts";

export class ConversationBuilder {
  static buildConversationHistory(
    completedAgents: AgentName[], 
    spec: ProjectSpec
  ): DeepSeekMessage[] {
    const messages: DeepSeekMessage[] = [];
    
    // Add initial system context
    messages.push({
      role: "system",
      content: "You are part of a multi-agent system generating Cursor AI prompts. Previous agents have contributed their expertise."
    });
    
    // Add each completed agent's contribution
    completedAgents.forEach(agentName => {
      const systemPrompt = getAgentSystemPrompt(agentName, spec);
      const userMessage = createUserMessageFromSpec(agentName, spec);
      
      messages.push({
        role: "system",
        content: `Agent ${agentName}: ${systemPrompt}`
      });
      
      messages.push({
        role: "user",
        content: userMessage
      });
      
      // Add a simulated response (in production, this would be the actual response)
      messages.push({
        role: "assistant",
        content: `As ${agentName}, I have analyzed the requirements and provided specialized recommendations for this aspect of the project.`
      });
    });
    
    return messages;
  }
}
