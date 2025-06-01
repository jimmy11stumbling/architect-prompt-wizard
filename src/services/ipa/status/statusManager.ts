
import { GenerationStatus, ProjectSpec, AgentStatus, DeepSeekMessage } from "@/types/ipa-types";
import { agentList, initialMockStatus } from "../mockData";

export class StatusManager {
  private currentStatus: GenerationStatus;
  private conversationMessages: DeepSeekMessage[];

  constructor() {
    this.currentStatus = { ...initialMockStatus };
    this.conversationMessages = [];
  }

  initializeStatus(spec: ProjectSpec): void {
    this.currentStatus = { 
      ...initialMockStatus,
      spec: spec,
      messages: []
    };
    this.conversationMessages = [];
  }

  getCurrentStatus(): GenerationStatus {
    return { ...this.currentStatus };
  }

  updateProgress(step: number): void {
    this.currentStatus = {
      ...this.currentStatus,
      progress: step,
      status: step <= agentList.length ? "processing" : "completed",
    };
  }

  updateAgentStatus(index: number, agentStatus: AgentStatus): void {
    this.currentStatus.agents[index] = agentStatus;
  }

  setResult(result: string): void {
    this.currentStatus.result = result;
  }

  setError(error: string): void {
    this.currentStatus.status = "failed";
    this.currentStatus.error = error;
  }

  updateMessages(messages: DeepSeekMessage[]): void {
    this.conversationMessages = [...messages];
    this.currentStatus.messages = [...messages];
  }

  getConversationMessages(): DeepSeekMessage[] {
    return [...this.conversationMessages];
  }
}
