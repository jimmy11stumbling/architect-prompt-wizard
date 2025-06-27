
import { GenerationStatus, ProjectSpec, AgentStatus, DeepSeekMessage } from "@/types/ipa-types";
import { agentList, initialMockStatus } from "../mockData";

export class StatusManager {
  private currentStatus: GenerationStatus;

  constructor() {
    this.currentStatus = { ...initialMockStatus };
  }

  initializeStatus(spec: ProjectSpec): void {
    this.currentStatus = {
      ...initialMockStatus,
      spec: spec,
      messages: [],
      agents: agentList.map((agentName, index) => ({
        id: `agent-${index}`,
        name: agentName,
        agent: agentName,
        status: "idle",
        progress: 0,
        timestamp: Date.now()
      }))
    };
  }

  updateAgentStatus(index: number, agentStatus: AgentStatus): void {
    if (index >= 0 && index < this.currentStatus.agents.length) {
      this.currentStatus.agents[index] = agentStatus;
    }
  }

  updateProgress(progress: number): void {
    this.currentStatus.progress = progress;
    if (progress > agentList.length) {
      this.currentStatus.status = "completed";
      this.currentStatus.endTime = Date.now();
    } else {
      this.currentStatus.status = "processing";
    }
  }

  setResult(result: string): void {
    this.currentStatus.result = result;
    this.currentStatus.status = "completed";
    this.currentStatus.endTime = Date.now();
  }

  setError(error: string): void {
    this.currentStatus.error = error;
    this.currentStatus.status = "failed";
    this.currentStatus.endTime = Date.now();
  }

  updateMessages(messages: DeepSeekMessage[]): void {
    this.currentStatus.messages = messages;
  }

  getConversationMessages(): DeepSeekMessage[] {
    return this.currentStatus.messages || [];
  }

  getCurrentStatus(): GenerationStatus {
    return { ...this.currentStatus };
  }
}
