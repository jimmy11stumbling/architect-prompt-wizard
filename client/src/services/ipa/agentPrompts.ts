
import { AgentName, ProjectSpec } from "@/types/ipa-types";

// Global documentation cache
let documentationCache: any = null;
let cacheTimestamp: number = 0;
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

async function getDocumentation(targetPlatform?: string): Promise<any> {
  const now = Date.now();
  
  // Return cached documentation if still valid
  if (documentationCache && (now - cacheTimestamp) < CACHE_DURATION) {
    return documentationCache;
  }
  
  try {
    // First try to get from MCP hub with comprehensive context and platform filtering
    const mcpResponse = await fetch('/api/mcp-hub/comprehensive-context', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ 
        targetPlatform: targetPlatform || 'cursor',
        platformFilter: targetPlatform || 'cursor',
        includeTechnology: true, 
        includeAllPlatforms: false // Only get specific platform data
      })
    });
    
    if (mcpResponse.ok) {
      const mcpData = await mcpResponse.json();
      documentationCache = mcpData;
      cacheTimestamp = now;
      return documentationCache;
    }
    
    // Fallback to legacy documentation endpoint with platform filter
    const response = await fetch(`/api/agent-documentation?platform=${encodeURIComponent(targetPlatform || 'cursor')}`);
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

async function getVectorSearchContext(query: string, platform: string): Promise<string> {
  try {
    // Ensure we have valid platform and query data
    const validPlatform = platform && platform !== 'undefined' ? platform.toLowerCase() : 'cursor';
    const validQuery = query && query !== 'undefined' ? query : `${validPlatform} platform features`;
    
    console.log(`[Vector Search] Query: "${validQuery}", Platform: "${validPlatform}"`);
    
    // Add timeout protection and use platform name as primary search query
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort("Timeout after 2 seconds"), 2000); // 2 second timeout
    
    const response = await fetch('/api/rag/search', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        query: validPlatform, // Use platform name as primary search term
        filters: {
          platform: validPlatform,
          category: 'platform-specification'
        },
        limit: 5,
        options: {
          hybridWeight: { semantic: 0.7, keyword: 0.3 },
          rerankingEnabled: true
        }
      }),
      signal: controller.signal
    });
    
    clearTimeout(timeoutId);
    
    if (response.ok) {
      const searchResults = await response.json();
      if (searchResults.results && searchResults.results.length > 0) {
        return searchResults.results.map((result: any, index: number) => 
          `[VECTOR SEARCH RESULT ${index + 1}]\nTitle: ${result.title}\nContent: ${result.content}\nRelevance: ${Math.round(result.relevanceScore * 100)}%\n`
        ).join('\n');
      }
    }
    
    // Fallback if no results or API issue  
    const fallbackPlatform = platform && platform !== 'undefined' ? platform.toLowerCase() : 'cursor';
    return getPlatformFallbackContext(fallbackPlatform);
  } catch (error) {
    console.error('Vector search failed, using platform fallback:', error);
    const fallbackPlatform = platform && platform !== 'undefined' ? platform.toLowerCase() : 'cursor';
    return getPlatformFallbackContext(fallbackPlatform);
  }
}

function getPlatformFallbackContext(platform: string): string {
  const platformContexts: Record<string, string> = {
    'cursor': `[CURSOR PLATFORM CONTEXT]\nCursor AI-first code editor: VS Code fork with deep AI integration, intelligent code completion, chat interface, codebase-wide AI assistance, and seamless GitHub Copilot integration. Features include advanced AI-powered code suggestions, natural language to code conversion, and comprehensive development tools.`,
    'bolt': `[BOLT PLATFORM CONTEXT]\nBolt.new AI web development: WebContainer technology, instant full-stack app creation, browser-based development environment, and real-time collaboration features. Supports React, Vue, Angular, and modern web frameworks with instant deployment.`,
    'replit': `[REPLIT PLATFORM CONTEXT]\nReplit cloud IDE: Collaborative coding environment, AI agent integration, instant deployment, multiplayer coding, and comprehensive language support. Features include real-time collaboration, integrated AI assistance, and seamless project sharing.`,
    'windsurf': `[WINDSURF PLATFORM CONTEXT]\nWindsurf agentic IDE: Advanced AI capabilities, MCP protocol native support, agent workflows, database tools, and AI coordination features. Designed for agent-driven development with sophisticated AI integration. Features include AI-assisted database migrations, ORM support for Prisma and TypeORM, comprehensive MCP server integration, and real-time AI collaboration capabilities.`,
    'lovable': `[LOVABLE PLATFORM CONTEXT]\nLovable no-code platform: Natural language app building, AI-powered development, visual interface creation, and rapid prototyping capabilities. Enables users to build applications through conversational AI.`
  };
  
  return platformContexts[platform.toLowerCase()] || `[${platform.toUpperCase()} PLATFORM CONTEXT]\n${platform} platform: AI-powered development environment with modern tooling and collaboration features.`;
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
- Must be optimized for ${platformName.toUpperCase()} development environment
- Follow ${platformName} best practices and limitations
- Use ${platformName}-native features and integrations where possible
- Ensure compatibility with ${platformName}'s deployment pipeline`;
  
  return context;
}

export async function getAgentSystemPrompt(agent: AgentName, spec: ProjectSpec): Promise<string> {
  const documentation = await getDocumentation(spec.targetPlatform);
  
  // Get platform-specific context from database and vector search
  const platformContext = buildPlatformContext(spec, documentation);
  const technologyContext = buildTechnologyContext(spec, documentation);
  
  // Get vector search context for enhanced agent knowledge
  const platformName = spec.targetPlatform || 'cursor';
  const projectDesc = spec.projectDescription || 'AI-powered application';
  const searchQuery = `${platformName} ${projectDesc} ${agent} features capabilities architecture`;
  const vectorContext = await getVectorSearchContext(searchQuery, platformName);
  
  // Add vector search context and MCP tools integration
  let enhancedContext = "";
  if (vectorContext) {
    enhancedContext = `

VECTOR SEARCH ENHANCED CONTEXT:
${vectorContext}

This context was retrieved from our indexed knowledge base and provides specific, relevant information for your analysis.`;
  }
  
  // Add MCP tools context for real-time data access
  const mcpToolsContext = `

MCP TOOLS AVAILABLE FOR REAL-TIME ANALYSIS:
- Database queries: Use 'query_database' tool for live platform data
- File analysis: Use 'read_file' and 'list_files' for code examination
- Web research: Use 'web_search' for latest information
- Code analysis: Use 'analyze_code' for quality assessment
- Document processing: Use 'process_document' for content analysis

These tools provide real-time access to our database, file system, and external resources to enhance your analysis with current data.`;
  
  enhancedContext += mcpToolsContext;
  
  const baseContext = `You are ${agent}, a specialized AI agent in the Intelligent Prompt Architect system powered by DeepSeek AI. Your role is to provide expert, platform-specific analysis and recommendations for building applications on ${platformName.toUpperCase()} with RAG 2.0, A2A Protocol, and MCP integration.

CRITICAL REQUIREMENTS:
- Generate ONLY ${platformName.toUpperCase()}-specific recommendations and blueprints based on the authentic platform data below
- Use ONLY the real platform documentation, features, integrations, and capabilities provided
- Never provide generic advice - everything must be tailored to ${platformName.toUpperCase()}'s actual capabilities
- Reference specific platform features, tools, and limitations from the authentic data
- Focus on platform-native workflows and deployment options
- Utilize the vector search enhanced context below for specific technical details

${platformContext}

${technologyContext}

${enhancedContext}

TARGET PLATFORM: ${platformName.toUpperCase()}
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
- Deployment Preference: ${spec.deploymentPreference || "Platform-native"}

DEEPSEEK RAG 2.0 INTEGRATION:
- Use real platform documentation from knowledge base
- Generate custom-tailored blueprints based on authentic capabilities
- Seamlessly integrate with vector search and semantic retrieval
- No generic or placeholder recommendations allowed`;

  const agentSpecificPrompts: Record<AgentName, string> = {
    "reasoning-assistant": `${baseContext}

As the Reasoning Assistant for ${spec.targetPlatform?.toUpperCase()}, provide logical analysis and step-by-step thinking processes specifically tailored for this platform's development environment and constraints.`,

    "context-analyzer": `${baseContext}

As the Context Analyzer for ${spec.targetPlatform?.toUpperCase()}, examine the project requirements and identify key contextual elements specific to this platform's capabilities, limitations, and development workflow.`,

    "documentation-expert": `${baseContext}

As the Documentation Expert for ${spec.targetPlatform?.toUpperCase()}, focus on creating platform-specific documentation strategies and technical specifications that align with this platform's standards and best practices.`,

    "workflow-coordinator": `${baseContext}

As the Workflow Coordinator for ${spec.targetPlatform?.toUpperCase()}, design efficient workflows and process orchestration that leverage this platform's native features and development tools.`,

    "reasoning-coordinator": `${baseContext}

As the Reasoning Coordinator for ${spec.targetPlatform?.toUpperCase()}, manage the logical flow and decision-making processes specifically optimized for this platform's architecture and deployment pipeline.`,

    "RequirementDecompositionAgent": `${baseContext}

As the Requirement Decomposition Agent for ${spec.targetPlatform?.toUpperCase()}, break down complex requirements into manageable components that align with this platform's capabilities and development patterns.`,

    "RAGContextIntegrationAgent": `${baseContext}

As the RAG Context Integration Agent for ${spec.targetPlatform?.toUpperCase()}, focus on implementing RAG 2.0 strategies that work optimally within this platform's infrastructure and deployment environment.`,

    "A2AProtocolExpertAgent": `${baseContext}

As the A2A Protocol Expert Agent for ${spec.targetPlatform?.toUpperCase()}, design agent-to-agent communication patterns that leverage this platform's native capabilities and integration options.`,

    "TechStackImplementationAgent_Frontend": `${baseContext}

As the Frontend Tech Stack Implementation Agent for ${spec.targetPlatform?.toUpperCase()}, provide detailed frontend architecture specifically optimized for this platform's development environment and deployment capabilities.`,

    "TechStackImplementationAgent_Backend": `${baseContext}

As the Backend Tech Stack Implementation Agent for ${spec.targetPlatform?.toUpperCase()}, design robust backend architecture that maximizes this platform's specific hosting, database, and scaling capabilities.`,

    "BoltOptimizationAgent": `${baseContext}

As the Platform Optimization Agent, you must create platform-specific optimizations based ONLY on the authentic platform documentation provided above. 

CRITICAL MANDATE:
- Use ONLY the platform-specific features, tools, and capabilities from the authentic database documentation
- Reference specific platform deployment options, development environment, and unique features
- Address platform-specific limitations and constraints from the real data
- Optimize for the platform's native development workflow and best practices
- Leverage platform-specific integrations and services as documented`,

    "CursorOptimizationAgent": `${baseContext}

As the Platform Optimization Agent, you must create platform-specific optimizations based ONLY on the authentic platform documentation provided above. 

CRITICAL MANDATE:
- Use ONLY the platform-specific features, tools, and capabilities from the authentic database documentation
- Reference specific platform deployment options, development environment, and unique features
- Address platform-specific limitations and constraints from the real data
- Optimize for the platform's native development workflow and best practices
- Leverage platform-specific integrations and services as documented`,

    "ReplitOptimizationAgent": `${baseContext}

As the Platform Optimization Agent, you must create platform-specific optimizations based ONLY on the authentic platform documentation provided above. 

CRITICAL MANDATE:
- Use ONLY the platform-specific features, tools, and capabilities from the authentic database documentation
- Reference specific platform deployment options, development environment, and unique features
- Address platform-specific limitations and constraints from the real data
- Optimize for the platform's native development workflow and best practices
- Leverage platform-specific integrations and services as documented`,

    "WindsurfOptimizationAgent": `${baseContext}

As the Platform Optimization Agent, you must create platform-specific optimizations based ONLY on the authentic platform documentation provided above. 

CRITICAL MANDATE:
- Use ONLY the platform-specific features, tools, and capabilities from the authentic database documentation
- Reference specific platform deployment options, development environment, and unique features
- Address platform-specific limitations and constraints from the real data
- Optimize for the platform's native development workflow and best practices
- Leverage platform-specific integrations and services as documented`,

    "LovableOptimizationAgent": `${baseContext}

As the Platform Optimization Agent, you must create platform-specific optimizations based ONLY on the authentic platform documentation provided above. 

CRITICAL MANDATE:
- Use ONLY the platform-specific features, tools, and capabilities from the authentic database documentation
- Reference specific platform deployment options, development environment, and unique features
- Address platform-specific limitations and constraints from the real data
- Optimize for the platform's native development workflow and best practices
- Leverage platform-specific integrations and services as documented`,

    "QualityAssuranceAgent": `${baseContext}

As the Quality Assurance Agent for ${spec.targetPlatform?.toUpperCase()}, ensure code quality, testing strategies, and production readiness specifically aligned with this platform's deployment requirements, testing frameworks, and quality standards.`
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
