
import { GenerationStatus, AgentStatus, AgentName } from "@/types/ipa-types";

export const mockTaskId = "task_12345";

export const agentList: AgentName[] = [
  "RequirementDecompositionAgent",
  "RAGContextIntegrationAgent", 
  "A2AProtocolExpertAgent",
  "TechStackImplementationAgent_Frontend",
  "TechStackImplementationAgent_Backend",
  "CursorOptimizationAgent",
  "QualityAssuranceAgent"
];

export const initialMockStatus: GenerationStatus = {
  taskId: mockTaskId,
  status: "pending",
  progress: 0,
  agents: agentList.map((agent): AgentStatus => ({
    id: `agent-${agent}`,
    name: agent,
    agent,
    status: "idle",
    progress: 0,
    timestamp: Date.now()
  })),
  startTime: Date.now(),
  messages: []
};
