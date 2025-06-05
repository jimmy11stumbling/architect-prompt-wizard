
import { GenerationStatus, ProjectSpec, AgentStatus, DeepSeekMessage } from "@/types/ipa-types";
import { mockTaskId, agentList } from "../mockData";
import { realTimeResponseService } from "../../integration/realTimeResponseService";

export class StatusManager {
  private currentStatus: GenerationStatus = {
    taskId: mockTaskId,
    status: "pending",
    agents: [],
    progress: 0,
    startTime: Date.now()
  };

  initializeStatus(spec: ProjectSpec): void {
    this.currentStatus = {
      taskId: mockTaskId,
      status: "processing",
      agents: agentList.map((agent, index) => ({
        id: `agent-${index}`,
        name: agent,
        agent: agent,
        status: "idle",
        progress: 0,
        timestamp: Date.now()
      })),
      progress: 0,
      startTime: Date.now(),
      spec: spec,
      messages: []
    };

    realTimeResponseService.addResponse({
      source: "status-manager",
      status: "processing",
      message: "Status manager initialized",
      data: { taskId: mockTaskId, agentCount: agentList.length }
    });

    console.log("📊 Status manager initialized with agents:", agentList);
  }

  updateAgentStatus(agentIndex: number, newStatus: AgentStatus): void {
    if (this.currentStatus.agents[agentIndex]) {
      this.currentStatus.agents[agentIndex] = newStatus;
      
      realTimeResponseService.addResponse({
        source: "status-manager",
        status: newStatus.status === "completed" ? "success" : 
                newStatus.status === "failed" ? "error" : "processing",
        message: `Agent ${newStatus.agent} status updated to ${newStatus.status}`,
        data: { 
          agent: newStatus.agent, 
          status: newStatus.status,
          output: newStatus.output?.substring(0, 100) + "..." || null
        }
      });

      console.log(`📊 Agent ${newStatus.agent} status updated:`, newStatus.status);
    }
  }

  updateProgress(progress: number): void {
    this.currentStatus.progress = progress;
    
    realTimeResponseService.addResponse({
      source: "status-manager",
      status: "processing",
      message: `Progress updated to ${progress}`,
      data: { progress, totalSteps: agentList.length + 1 }
    });

    console.log(`📊 Progress updated: ${progress}`);
  }

  setResult(result: string): void {
    this.currentStatus.result = result;
    this.currentStatus.status = "completed";
    this.currentStatus.endTime = Date.now();
    
    realTimeResponseService.addResponse({
      source: "status-manager",
      status: "success",
      message: "Generation completed successfully",
      data: { 
        resultLength: result.length,
        duration: this.currentStatus.endTime - this.currentStatus.startTime
      }
    });

    console.log("📊 Result set, generation completed");
  }

  setError(error: string): void {
    this.currentStatus.error = error;
    this.currentStatus.status = "failed";
    this.currentStatus.endTime = Date.now();
    
    realTimeResponseService.addResponse({
      source: "status-manager",
      status: "error",
      message: `Generation failed: ${error}`,
      data: { 
        error,
        duration: this.currentStatus.endTime - this.currentStatus.startTime
      }
    });

    console.error("📊 Error set:", error);
  }

  updateMessages(messages: DeepSeekMessage[]): void {
    this.currentStatus.messages = [...messages];
    
    realTimeResponseService.addResponse({
      source: "status-manager",
      status: "processing",
      message: `Conversation updated with ${messages.length} messages`,
      data: { messageCount: messages.length }
    });

    console.log(`📊 Messages updated: ${messages.length} total`);
  }

  getConversationMessages(): DeepSeekMessage[] {
    return this.currentStatus.messages || [];
  }

  getCurrentStatus(): GenerationStatus {
    return { ...this.currentStatus };
  }
}
