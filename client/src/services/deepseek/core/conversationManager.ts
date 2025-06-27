
import { ConversationHistory } from '../types';

export class ConversationManager {
  private conversations: Map<string, ConversationHistory[]> = new Map();

  addConversation(conversationId: string, conversation: ConversationHistory[]): void {
    this.conversations.set(conversationId, conversation);
  }

  getAllConversations(): Map<string, ConversationHistory[]> {
    return new Map(this.conversations);
  }

  clearConversation(conversationId: string): void {
    this.conversations.delete(conversationId);
  }

  generateConversationId(): string {
    return `conv_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
}
