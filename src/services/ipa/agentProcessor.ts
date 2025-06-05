
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
        id: `agent-${Date.now()}`,
        name: agent,
        agent,
        status: "completed",
        progress: 100,
        output: agentResponse.content,
        timestamp: Date.now()
      };
    } catch (error) {
      console.error(`Error invoking DeepSeek for agent ${agent}:`, error);
      
      toast({
        title: "Agent Error",
        description: `${agent} failed: ${error instanceof Error ? error.message : String(error)}`,
        variant: "destructive"
      });
      
      return {
        id: `agent-${Date.now()}`,
        name: agent,
        agent,
        status: "failed",
        progress: 0,
        output: `Error: ${error instanceof Error ? error.message : String(error)}`,
        timestamp: Date.now()
      };
    }
  }
}
