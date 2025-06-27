
import { ProjectSpec } from "@/types/ipa-types";
import { agentList } from "../../mockData";
import { realTimeResponseService } from "../../../integration/realTimeResponseService";
import { invokeDeepSeekAgent, buildConversationHistory } from "../../deepseekAPI";
import { toast } from "@/hooks/use-toast";

export class AgentExecutor {
  static async executeAgent(agentIndex: number, currentProjectSpec: ProjectSpec, statusManager: any): Promise<void> {
    if (agentIndex < 0 || agentIndex >= agentList.length) return;

    const currentAgent = agentList[agentIndex];

    try {
      // Mark the current agent as processing first
      statusManager.updateAgentStatus(agentIndex, {
        id: `agent-${Date.now()}`,
        name: currentAgent,
        agent: currentAgent,
        status: "processing",
        progress: 0,
        timestamp: Date.now()
      });

      realTimeResponseService.addResponse({
        source: "agent-executor",
        status: "processing",
        message: `Processing agent: ${currentAgent}`,
        data: { agent: currentAgent, step: agentIndex + 1 }
      });

      // For multi-round conversation, build history of previous agents
      const messageHistory = buildConversationHistory(agentList.slice(0, agentIndex), currentProjectSpec);

      // Now make the actual API call to DeepSeek with the conversation history
      console.log(`Invoking DeepSeek API for agent ${currentAgent} with ${messageHistory.length} messages in history`);
      const agentResponse = await invokeDeepSeekAgent(currentAgent, currentProjectSpec, messageHistory);

      // Update the agent status with the actual response
      statusManager.updateAgentStatus(agentIndex, {
        id: `agent-${Date.now()}`,
        name: currentAgent,
        agent: currentAgent,
        status: "completed",
        progress: 100,
        output: agentResponse.content,
        timestamp: Date.now()
      });

      realTimeResponseService.addResponse({
        source: "agent-executor",
        status: "success",
        message: `Agent ${currentAgent} completed successfully`,
        data: { 
          agent: currentAgent, 
          responseLength: agentResponse.content.length,
          reasoning: agentResponse.content.substring(0, 200) + "..."
        }
      });

      // Update conversation history
      this.updateConversationHistory(statusManager, messageHistory, currentAgent, agentResponse.content);

    } catch (error) {
      this.handleAgentError(statusManager, agentIndex, currentAgent, error);
    }
  }

  private static updateConversationHistory(statusManager: any, messageHistory: any[], currentAgent: string, responseContent: string): void {
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
      content: responseContent
    });

    // Update the messages in the status manager
    statusManager.updateMessages(conversationMessages);
  }

  private static handleAgentError(statusManager: any, agentIndex: number, currentAgent: string, error: any): void {
    console.error(`Error invoking DeepSeek for agent ${currentAgent}:`, error);
    statusManager.updateAgentStatus(agentIndex, {
      id: `agent-${Date.now()}`,
      name: currentAgent,
      agent: currentAgent,
      status: "failed",
      progress: 0,
      output: `Error: ${error instanceof Error ? error.message : String(error)}`,
      timestamp: Date.now()
    });

    realTimeResponseService.addResponse({
      source: "agent-executor",
      status: "error",
      message: `Agent ${currentAgent} failed: ${error instanceof Error ? error.message : "Unknown error"}`,
      data: { agent: currentAgent, error: error instanceof Error ? error.message : String(error) }
    });

    toast({
      title: "Agent Error",
      description: `${currentAgent} failed: ${error instanceof Error ? error.message : String(error)}`,
      variant: "destructive"
    });
  }
}
