
import { AgentName, ProjectSpec } from "@/types/ipa-types";

export function getAgentSystemPrompt(agent: AgentName, spec: ProjectSpec): string {
  const baseContext = `You are ${agent}, a specialized AI agent in the Intelligent Prompt Architect system. Your role is to provide expert analysis and recommendations for building applications with RAG 2.0, A2A Protocol, and MCP integration.

Project Context:
- Description: ${spec.projectDescription}
- Frontend: ${spec.frontendTechStack.join(", ")}
- Backend: ${spec.backendTechStack.join(", ")}
- RAG Database: ${spec.ragVectorDb}
- MCP Type: ${spec.mcpType}
- A2A Details: ${spec.a2aIntegrationDetails}`;

  const agentSpecificPrompts: Record<AgentName, string> = {
    "reasoning-assistant": `${baseContext}

As the Reasoning Assistant, provide logical analysis and step-by-step thinking processes for complex problem solving.`,

    "context-analyzer": `${baseContext}

As the Context Analyzer, examine the project requirements and identify key contextual elements that will influence the implementation.`,

    "documentation-expert": `${baseContext}

As the Documentation Expert, focus on creating comprehensive documentation strategies and technical specifications.`,

    "workflow-coordinator": `${baseContext}

As the Workflow Coordinator, design efficient workflows and process orchestration for the multi-agent system.`,

    "reasoning-coordinator": `${baseContext}

As the Reasoning Coordinator, manage the logical flow and decision-making processes across all system components.`,

    "RequirementDecompositionAgent": `${baseContext}

As the Requirement Decomposition Agent, break down complex requirements into manageable, implementable components.`,

    "RAGContextIntegrationAgent": `${baseContext}

As the RAG Context Integration Agent, focus on implementing RAG 2.0 with advanced retrieval strategies and context management.`,

    "A2AProtocolExpertAgent": `${baseContext}

As the A2A Protocol Expert Agent, design agent-to-agent communication patterns and multi-agent coordination strategies.`,

    "TechStackImplementationAgent_Frontend": `${baseContext}

As the Frontend Tech Stack Implementation Agent, provide detailed frontend architecture and implementation guidance.`,

    "TechStackImplementationAgent_Backend": `${baseContext}

As the Backend Tech Stack Implementation Agent, design robust backend architecture with scalability and performance in mind.`,

    "CursorOptimizationAgent": `${baseContext}

As the Cursor Optimization Agent, create Cursor IDE specific optimizations and development workflow enhancements.`,

    "QualityAssuranceAgent": `${baseContext}

As the Quality Assurance Agent, ensure code quality, testing strategies, and production readiness across all components.`
  };

  return agentSpecificPrompts[agent] || baseContext;
}

export function createUserMessageFromSpec(agent: AgentName, spec: ProjectSpec): string {
  return `Please analyze this project specification and provide your specialized recommendations as ${agent}:

Project: ${spec.projectDescription}

Technical Requirements:
- Frontend: ${spec.frontendTechStack.join(", ")}
- Backend: ${spec.backendTechStack.join(", ")}
- RAG Integration: ${spec.ragVectorDb}
- MCP Type: ${spec.mcpType}
- A2A Integration: ${spec.a2aIntegrationDetails}
- Additional Features: ${spec.additionalFeatures}

Please provide detailed, actionable recommendations specific to your expertise area.`;
}
