
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
  
  // Enhanced platform matching with multiple strategies
  const targetPlatform = spec.targetPlatform.toLowerCase();
  let platform = null;
  
  // First try exact name match
  platform = documentation.platforms?.find((p: any) => 
    p.name.toLowerCase() === targetPlatform
  );
  
  // If not found, try partial match for platform names
  if (!platform) {
    platform = documentation.platforms?.find((p: any) => 
      p.name.toLowerCase().includes(targetPlatform) || 
      targetPlatform.includes(p.name.toLowerCase().split(' ')[0])
    );
  }
  
  // Specific mappings for known platforms
  if (!platform) {
    const platformMappings: { [key: string]: string } = {
      'windsurf': 'Windsurf (Codeium)',
      'cursor': 'Cursor',
      'bolt': 'Bolt (StackBlitz)',
      'replit': 'Replit',
      'lovable': 'Lovable 2.0'
    };
    
    const mappedName = platformMappings[targetPlatform];
    if (mappedName) {
      platform = documentation.platforms?.find((p: any) => 
        p.name === mappedName
      );
    }
  }
  
  if (!platform) {
    console.warn(`Platform not found: ${spec.targetPlatform}`, documentation.platforms?.map((p: any) => p.name));
    return "";
  }
  
  console.log(`Using platform: ${platform.name} for target: ${spec.targetPlatform}`);
  
  return `
PLATFORM-SPECIFIC CONTEXT (${platform.name}):
- Overview: ${platform.description}
- Category: ${platform.category}
- Key Features: ${platform.features?.map((f: any) => f.name).join(", ") || "Advanced development capabilities"}
- Integrations: ${platform.integrations?.map((i: any) => i.name).join(", ") || "Standard APIs"}
- Pricing: ${platform.pricing?.map((p: any) => `${p.name}: ${p.price}`).join(", ") || "Contact for pricing"}
- Limitations: ${spec.platformSpecificConfig?.limitations?.join(", ") || "None specified"}
- Best Practices: ${spec.platformSpecificConfig?.bestPractices?.join(", ") || "Follow platform guidelines"}

PLATFORM KNOWLEDGE BASE:
${documentation.knowledgeBase?.find((kb: any) => kb.title.toLowerCase().includes(targetPlatform))?.content || "Standard development practices apply"}`;
}

function buildTechnologyContext(spec: ProjectSpec, documentation: any): string {
  if (!documentation?.technologies) return "";
  
  // Build platform-specific technology recommendations
  const platformName = spec.targetPlatform?.toLowerCase() || '';
  let platformTechContext = "";
  
  if (platformName.includes('windsurf')) {
    platformTechContext = `
WINDSURF-SPECIFIC TECHNOLOGIES:
- Agentic IDE with advanced AI capabilities and MCP native support
- Database development tools with intelligent query generation
- VSCode-compatible extensions with AI enhancement
- Built-in terminal and collaborative development features
- Real-time code analysis and optimization suggestions`;
  } else if (platformName.includes('cursor')) {
    platformTechContext = `
CURSOR-SPECIFIC TECHNOLOGIES:
- AI-first code editor with conversation-based development
- Advanced autocomplete and intelligent code generation
- Real-time collaboration with AI assistance
- Git integration with AI-powered commit messages
- Extension ecosystem optimized for AI development`;
  } else if (platformName.includes('bolt')) {
    platformTechContext = `
BOLT-SPECIFIC TECHNOLOGIES:
- WebContainer technology for instant full-stack development
- Browser-based environment with real-time preview
- npm package management and instant deployment
- AI-powered scaffolding and project generation`;
  } else if (platformName.includes('replit')) {
    platformTechContext = `
REPLIT-SPECIFIC TECHNOLOGIES:
- Cloud IDE with built-in AI agent and multiplayer development
- Automatic deployment and hosting capabilities
- Database integration (PostgreSQL, Redis) with GUI tools
- Package management across multiple programming languages`;
  } else if (platformName.includes('lovable')) {
    platformTechContext = `
LOVABLE-SPECIFIC TECHNOLOGIES:
- No-code AI platform for rapid application development
- Conversational AI for automatic UI/UX generation
- Backend service integration with real-time preview
- Production-ready deployment with one-click publishing`;
  }
  
  let context = `
TECHNOLOGY-SPECIFIC GUIDANCE FOR ${spec.targetPlatform?.toUpperCase()}:

${platformTechContext}

ADVANCED AI INTEGRATION:`;
  
  // RAG 2.0 Context
  if (spec.ragVectorDb !== "None") {
    const ragInfo = documentation.technologies.rag2;
    context += `
RAG 2.0 Implementation:
- Vector Database: ${spec.ragVectorDb}
- Description: ${ragInfo?.description || "Advanced retrieval-augmented generation with vector search"}
- Key Features: ${ragInfo?.features?.join(", ") || "Semantic search, document chunking, context compression"}
- Best Practices: ${ragInfo?.bestPractices?.join(", ") || "Use semantic chunking, implement hybrid search, optimize context windows"}`;
  }
  
  // MCP Context
  if (spec.mcpType !== "None") {
    const mcpInfo = documentation.technologies.mcp;
    context += `
Model Context Protocol (MCP):
- Type: ${spec.mcpType}
- Description: ${mcpInfo?.description || "Standardized tool and resource integration for AI agents"}
- Available Tools: ${mcpInfo?.tools?.join(", ") || "Filesystem, web search, database, code analysis"}
- Best Practices: ${mcpInfo?.bestPractices?.join(", ") || "Use JSON-RPC messaging, implement proper error handling, maintain session state"}`;
  }
  
  // A2A Context
  if (spec.a2aIntegrationDetails) {
    const a2aInfo = documentation.technologies.a2a;
    context += `
Agent-to-Agent Communication:
- Integration Details: ${spec.a2aIntegrationDetails}
- Description: ${a2aInfo?.description || "Multi-agent coordination using FIPA ACL protocols"}
- Protocols: ${a2aInfo?.protocols?.join(", ") || "FIPA ACL, Contract Net Protocol"}
- Best Practices: ${a2aInfo?.bestPractices?.join(", ") || "Use standardized messaging, implement negotiation protocols, maintain agent state"}`;
  }

  // Platform-Specific Tech Stack Recommendations
  context += `

RECOMMENDED IMPLEMENTATION APPROACH:
- Frontend: ${spec.frontendTechStack?.join(" + ") || "React + TypeScript"}
- Backend: ${spec.backendTechStack?.join(" + ") || "Node.js + Express"}
- Database: ${spec.ragVectorDb !== "None" ? spec.ragVectorDb + " for vector search" : "PostgreSQL for relational data"}
- Authentication: ${spec.authenticationMethod || "JWT-based authentication"}
- Deployment: ${spec.deploymentPreference || "Platform-native deployment"}

PLATFORM-SPECIFIC REQUIREMENTS:
- Must be optimized for ${spec.targetPlatform?.toUpperCase()} development environment
- Follow ${spec.targetPlatform} best practices and limitations
- Use ${spec.targetPlatform}-native features and integrations where possible
- Ensure compatibility with ${spec.targetPlatform}'s deployment pipeline`;
  
  return context;
}

export async function getAgentSystemPrompt(agent: AgentName, spec: ProjectSpec): Promise<string> {
  const documentation = await getDocumentation();
  
  const baseContext = `You are ${agent}, a specialized AI agent in the Intelligent Prompt Architect system powered by DeepSeek AI. Your role is to provide expert, platform-specific analysis and recommendations for building applications on ${spec.targetPlatform?.toUpperCase()} with RAG 2.0, A2A Protocol, and MCP integration.

CRITICAL REQUIREMENTS:
- Generate ONLY ${spec.targetPlatform?.toUpperCase()}-specific recommendations and blueprints
- Use authentic platform documentation and real capabilities, never generic responses
- Integrate seamlessly with DeepSeek AI for custom-tailored solutions
- Focus on platform-native features and best practices

TARGET PLATFORM: ${spec.targetPlatform?.toUpperCase()}
PROJECT SPECIFICATION:
- Description: ${spec.projectDescription || "Custom application development"}
- Frontend Stack: ${spec.frontendTechStack?.join(", ") || "React, TypeScript"}
- Backend Stack: ${spec.backendTechStack?.join(", ") || "Node.js, Express"}
- RAG Vector Database: ${spec.ragVectorDb || "None"}
- MCP Type: ${spec.mcpType || "None"}
- A2A Integration: ${spec.a2aIntegrationDetails || "None"}
- Additional Features: ${spec.additionalFeatures || "Standard features"}
- Advanced Prompt Details: ${spec.advancedPromptDetails || "None"}
- Authentication Method: ${spec.authenticationMethod || "JWT"}
- Deployment Preference: ${spec.deploymentPreference || "Platform-native"}${buildPlatformContext(spec, documentation)}${buildTechnologyContext(spec, documentation)}

DEEPSEEK RAG 2.0 INTEGRATION:
- Use real platform documentation from knowledge base
- Generate custom-tailored blueprints based on authentic capabilities
- Seamlessly integrate with vector search and semantic retrieval
- No generic or placeholder recommendations allowed`;

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

    "BoltOptimizationAgent": `${baseContext}

As the Bolt Platform Optimization Agent, you must create Bolt/StackBlitz WebContainer-specific optimizations based ONLY on the authentic platform documentation provided above. 

CRITICAL MANDATE:
- Focus on WebContainer technology, instant deployment, and browser-based development
- Optimize for StackBlitz's in-browser environment and npm package management
- Reference specific Bolt.new AI-powered scaffolding capabilities
- Address WebContainer memory/performance constraints and browser limitations
- Leverage instant preview and hot reload features`,

    "CursorOptimizationAgent": `${baseContext}

As the Cursor Platform Optimization Agent, you must create Cursor IDE-specific optimizations based ONLY on the authentic platform documentation provided above. 

CRITICAL MANDATE:
- Focus on AI-first code editor features and conversation-based development
- Optimize for Cursor's advanced autocomplete and intelligent code generation
- Reference specific Cursor IDE collaboration features and Git integration
- Address Cursor-specific extension ecosystem and AI development tools
- Leverage real-time AI assistance and automated commit messages`,

    "ReplitOptimizationAgent": `${baseContext}

As the Replit Platform Optimization Agent, you must create Replit-specific optimizations based ONLY on the authentic platform documentation provided above. 

CRITICAL MANDATE:
- Focus on cloud IDE with built-in AI agent and multiplayer development
- Optimize for automatic deployment, hosting, and database integration
- Reference specific Replit's package management across multiple languages
- Address Replit-specific GUI tools for PostgreSQL and Redis
- Leverage collaborative coding and instant deployment capabilities`,

    "WindsurfOptimizationAgent": `${baseContext}

As the Windsurf Platform Optimization Agent, you must create Windsurf-specific optimizations based ONLY on the authentic platform documentation provided above. 

CRITICAL MANDATE:
- Focus on agentic IDE with advanced AI capabilities and MCP native support
- Optimize for database development tools and intelligent query generation
- Reference specific Windsurf's VSCode-compatible extensions with AI enhancement
- Address built-in terminal and collaborative development features
- Leverage real-time code analysis and optimization suggestions`,

    "LovableOptimizationAgent": `${baseContext}

As the Lovable Platform Optimization Agent, you must create Lovable-specific optimizations based ONLY on the authentic platform documentation provided above. 

CRITICAL MANDATE:
- Focus on no-code AI platform for rapid application development
- Optimize for conversational AI and automatic UI/UX generation
- Reference specific Lovable's backend service integration capabilities
- Address real-time preview and production-ready deployment features
- Leverage one-click publishing and AI-driven development workflow`,

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
