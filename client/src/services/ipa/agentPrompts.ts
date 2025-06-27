
import { AgentName, ProjectSpec } from "@/types/ipa-types";

// Global documentation cache
let documentationCache: any = null;
let cacheTimestamp: number = 0;
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

async function getDocumentation(): Promise<any> {
  const now = Date.now();
  
  // Return cached documentation if still valid
  if (documentationCache && (now - cacheTimestamp) < CACHE_DURATION) {
    return documentationCache;
  }
  
  try {
    const response = await fetch('/api/agent-documentation');
    if (!response.ok) {
      throw new Error(`Documentation fetch failed: ${response.status}`);
    }
    
    documentationCache = await response.json();
    cacheTimestamp = now;
    return documentationCache;
  } catch (error) {
    console.error('Error fetching documentation:', error);
    return null;
  }
}

function buildPlatformContext(spec: ProjectSpec, documentation: any): string {
  if (!documentation || !spec.targetPlatform) return "";
  
  const platform = documentation.platforms?.find((p: any) => 
    p.name.toLowerCase() === spec.targetPlatform.toLowerCase()
  );
  
  if (!platform) return "";
  
  return `
PLATFORM-SPECIFIC CONTEXT (${spec.targetPlatform}):
- Overview: ${platform.description}
- Capabilities: ${platform.capabilities || "Standard web development"}
- Key Features: ${platform.features?.map((f: any) => f.name).join(", ") || "Not specified"}
- Integrations: ${platform.integrations?.map((i: any) => i.name).join(", ") || "Standard APIs"}
- Limitations: ${spec.platformSpecificConfig?.limitations?.join(", ") || "None specified"}
- Best Practices: ${spec.platformSpecificConfig?.bestPractices?.join(", ") || "Follow platform guidelines"}`;
}

function buildTechnologyContext(spec: ProjectSpec, documentation: any): string {
  if (!documentation?.technologies) return "";
  
  let context = "\nTECHNOLOGY-SPECIFIC GUIDANCE:";
  
  // RAG 2.0 Context
  if (spec.ragVectorDb !== "None") {
    const ragInfo = documentation.technologies.rag2;
    context += `
RAG 2.0 Implementation:
- Vector Database: ${spec.ragVectorDb}
- Description: ${ragInfo.description}
- Key Features: ${ragInfo.features.join(", ")}
- Best Practices: ${ragInfo.bestPractices.join(", ")}`;
  }
  
  // MCP Context
  if (spec.mcpType !== "None") {
    const mcpInfo = documentation.technologies.mcp;
    context += `
Model Context Protocol (MCP):
- Type: ${spec.mcpType}
- Description: ${mcpInfo.description}
- Available Tools: ${mcpInfo.tools.join(", ")}
- Best Practices: ${mcpInfo.bestPractices.join(", ")}`;
  }
  
  // A2A Context
  if (spec.a2aIntegrationDetails) {
    const a2aInfo = documentation.technologies.a2a;
    context += `
Agent-to-Agent Communication:
- Integration Details: ${spec.a2aIntegrationDetails}
- Description: ${a2aInfo.description}
- Protocols: ${a2aInfo.protocols.join(", ")}
- Best Practices: ${a2aInfo.bestPractices.join(", ")}`;
  }
  
  return context;
}

export async function getAgentSystemPrompt(agent: AgentName, spec: ProjectSpec): Promise<string> {
  const documentation = await getDocumentation();
  
  const baseContext = `You are ${agent}, a specialized AI agent in the Intelligent Prompt Architect system. Your role is to provide expert analysis and recommendations for building applications with RAG 2.0, A2A Protocol, and MCP integration.

PROJECT SPECIFICATION:
- Description: ${spec.projectDescription}
- Frontend Stack: ${spec.frontendTechStack.join(", ")}
- Backend Stack: ${spec.backendTechStack.join(", ")}
- RAG Vector Database: ${spec.ragVectorDb}
- MCP Type: ${spec.mcpType}
- A2A Integration: ${spec.a2aIntegrationDetails}
- Additional Features: ${spec.additionalFeatures}
- Advanced Prompt Details: ${spec.advancedPromptDetails}
- Authentication Method: ${spec.authenticationMethod}
- Deployment Preference: ${spec.deploymentPreference}${buildPlatformContext(spec, documentation)}${buildTechnologyContext(spec, documentation)}`;

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
