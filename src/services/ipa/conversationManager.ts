
import { DeepSeekMessage } from "@/types/ipa-types";

export class ConversationManager {
  private messages: DeepSeekMessage[] = [];

  reset(): void {
    this.messages = [];
  }

  initializeFromHistory(history: DeepSeekMessage[]): void {
    this.messages = [...history];
  }

  addAgentResponse(agentName: string, content: string): void {
    this.messages.push({
      role: "assistant",
      content: content
    });
  }

  getMessages(): DeepSeekMessage[] {
    return [...this.messages];
  }
}
