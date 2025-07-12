
import { GenerationStatus, AgentName } from "@/types/ipa-types";

export const mockTaskId = "task-12345-67890";

// Base agents used for all platforms
export const baseAgentList: AgentName[] = [
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
  "QualityAssuranceAgent"
];

// Platform-specific optimization agents
export const platformAgents: Record<string, AgentName> = {
  "bolt": "BoltOptimizationAgent",
  "cursor": "CursorOptimizationAgent", 
  "replit": "ReplitOptimizationAgent",
  "windsurf": "WindsurfOptimizationAgent",
  "lovable": "LovableOptimizationAgent",
  "base44": "Base44OptimizationAgent",
  "rork": "RorkOptimizationAgent",
  "v0": "V0OptimizationAgent",
  "claude-code": "ClaudeCodeOptimizationAgent",
  "gemini-cli": "GeminiCLIOptimizationAgent"
};

// Dynamic agent list generation based on target platform
export function getAgentListForPlatform(targetPlatform?: string): AgentName[] {
  const platform = targetPlatform?.toLowerCase() || 'generic';
  const platformAgent = platformAgents[platform];
  
  if (platformAgent) {
    // Insert platform-specific agent before QualityAssuranceAgent
    const agents = [...baseAgentList];
    const qaIndex = agents.indexOf("QualityAssuranceAgent");
    agents.splice(qaIndex, 0, platformAgent);
    return agents;
  }
  
  return baseAgentList;
}

// Legacy export for backward compatibility - defaults to cursor
export const agentList: AgentName[] = getAgentListForPlatform("cursor");

export const initialMockStatus: GenerationStatus = {
  taskId: mockTaskId,
  status: "pending",
  agents: [],
  progress: 0,
  startTime: Date.now(),
  messages: []
};
