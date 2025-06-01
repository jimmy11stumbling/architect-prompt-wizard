
import { DeepSeekMessage, AgentStatus } from "@/types/ipa-types";

export class ConversationManager {
  private messages: DeepSeekMessage[] = [];

  addAgentResponse(agent: string, content: string): void {
    // Add the agent's system prompt
    this.messages.push({
      role: "system",
      content: `Now responding as ${agent}`
    });
    
    // Add the agent's response to the conversation history
    this.messages.push({
      role: "assistant",
      content: content
    });
  }

  getMessages(): DeepSeekMessage[] {
    return [...this.messages];
  }

  reset(): void {
    this.messages = [];
  }

  initializeFromHistory(messageHistory: DeepSeekMessage[]): void {
    this.messages = [...messageHistory];
  }
}
