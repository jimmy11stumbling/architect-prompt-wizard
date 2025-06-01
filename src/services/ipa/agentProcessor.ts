
import { AgentName, ProjectSpec, AgentStatus, DeepSeekMessage } from "@/types/ipa-types";
import { invokeDeepSeekAgent } from "./deepseekAPI";
import { toast } from "@/hooks/use-toast";

export class AgentProcessor {
  static async processAgent(
    agent: AgentName,
    spec: ProjectSpec,
    messageHistory: DeepSeekMessage[]
  ): Promise<AgentStatus> {
    try {
      console.log(`Invoking DeepSeek API for agent ${agent} with ${messageHistory.length} messages in history`);
      const agentResponse = await invokeDeepSeekAgent(agent, spec, messageHistory);
      
      return {
        agent,
        status: "completed",
        output: agentResponse.content
      };
    } catch (error) {
      console.error(`Error invoking DeepSeek for agent ${agent}:`, error);
      
      toast({
        title: "Agent Error",
        description: `${agent} failed: ${error instanceof Error ? error.message : String(error)}`,
        variant: "destructive"
      });
      
      return {
        agent,
        status: "failed",
        output: `Error: ${error instanceof Error ? error.message : String(error)}`
      };
    }
  }
}
