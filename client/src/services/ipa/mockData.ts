
import { GenerationStatus, AgentName } from "@/types/ipa-types";

export const mockTaskId = "task-12345-67890";

export const agentList: AgentName[] = [
  "reasoning-assistant",
  "context-analyzer", 
  "documentation-expert",
  "workflow-coordinator",
  "reasoning-coordinator",
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
  agents: [],
  progress: 0,
  startTime: Date.now(),
  messages: []
};
