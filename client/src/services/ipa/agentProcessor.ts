
import { AgentStatus, AgentName, ProjectSpec, DeepSeekMessage } from "@/types/ipa-types";
import { invokeDeepSeekAgent } from "./deepseekAPI";

export class AgentProcessor {
  static async processAgent(
    agentName: AgentName, 
    spec: ProjectSpec, 
    messageHistory: DeepSeekMessage[]
  ): Promise<AgentStatus> {
    const startTime = Date.now();
    
    try {
      console.log(`Processing agent: ${agentName}`);
      
      // Make the API call to DeepSeek
      const response = await invokeDeepSeekAgent(agentName, spec, messageHistory);
      
      return {
        id: `agent-${startTime}`,
        name: agentName,
        agent: agentName,
        status: "completed",
        progress: 100,
        output: response.content,
        timestamp: startTime
      };
    } catch (error) {
      console.error(`Error processing agent ${agentName}:`, error);
      
      return {
        id: `agent-${startTime}`,
        name: agentName,
        agent: agentName,
        status: "failed",
        progress: 0,
        error: error instanceof Error ? error.message : String(error),
        timestamp: startTime
      };
    }
  }
}
