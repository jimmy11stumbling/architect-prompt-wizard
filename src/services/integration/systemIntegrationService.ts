
import { ragService } from "../rag/ragService";
import { a2aService } from "../a2a/a2aService";
import { mcpService } from "../mcp/mcpService";
import { DeepSeekClient } from "../ipa/api/deepseekClient";
import { ProjectSpec, AgentName, VectorDatabaseType } from "@/types/ipa-types";

export interface SystemHealth {
  ragService: "healthy" | "degraded" | "offline";
  a2aService: "healthy" | "degraded" | "offline";
  mcpService: "healthy" | "degraded" | "offline";
  deepseekAPI: "healthy" | "degraded" | "offline";
  overallStatus: "operational" | "degraded" | "critical";
}

export class SystemIntegrationService {
  private static instance: SystemIntegrationService;
  private initialized = false;

  static getInstance(): SystemIntegrationService {
    if (!SystemIntegrationService.instance) {
      SystemIntegrationService.instance = new SystemIntegrationService();
    }
    return SystemIntegrationService.instance;
  }

  async initialize(spec: ProjectSpec): Promise<void> {
    if (this.initialized) {
      console.log("System already initialized");
      return;
    }

    console.log("Initializing integrated system...");
    
    try {
      // Initialize RAG service with project's vector database
      await ragService.initialize(spec.ragVectorDb);
      
      // Initialize A2A communication
      await a2aService.initialize();
      
      // Initialize MCP hub
      await mcpService.initialize();
      
      // Test DeepSeek API connectivity
      const apiKey = localStorage.getItem("deepseek_api_key");
      if (apiKey) {
        const isValid = await DeepSeekClient.validateApiKey(apiKey);
        console.log("DeepSeek API validation:", isValid ? "success" : "failed");
      }
      
      this.initialized = true;
      console.log("System integration complete");
      
    } catch (error) {
      console.error("System initialization failed:", error);
      throw error;
    }
  }

  async processEnhancedAgentRequest(
    agent: AgentName,
    spec: ProjectSpec,
    userQuery: string
  ): Promise<{
    response: string;
    reasoning?: string;
    ragContext?: any[];
    mcpTools?: any[];
    a2aCoordination?: any;
  }> {
    console.log(`Processing enhanced request for ${agent}:`, userQuery);
    
    // Step 1: Query RAG database for relevant documentation
    const ragResults = await ragService.query({
      query: `${agent} ${userQuery} ${spec.frontendTechStack.join(' ')} ${spec.backendTechStack.join(' ')}`,
      limit: 3,
      threshold: 0.4
    });

    // Step 2: Coordinate with other agents via A2A
    const coordinationResult = await a2aService.delegateTask(
      `Assist with ${agent} processing: ${userQuery}`,
      ["document-retrieval", "semantic-search", "tool-orchestration"]
    );

    // Step 3: Gather MCP tools and resources
    const relevantTools = await mcpService.listTools();
    const relevantResources = await mcpService.listResources();

    // Step 4: Use DeepSeek Reasoner for enhanced processing
    const enhancedRequest = {
      model: "deepseek-reasoner",
      messages: [
        {
          role: "system" as const,
          content: `You are ${agent}, an expert AI agent with access to:
            
            RAG Context: ${JSON.stringify(ragResults.documents.map(d => d.title))}
            Available MCP Tools: ${relevantTools.map(t => t.name).join(', ')}
            A2A Coordination: ${coordinationResult.assignedAgent?.name || 'None'}
            
            Use this context to provide comprehensive, accurate responses.`
        },
        {
          role: "user" as const,
          content: `Project Spec: ${JSON.stringify(spec, null, 2)}
          
          Query: ${userQuery}
          
          Please provide a detailed response incorporating the available context and tools.`
        }
      ],
      max_tokens: 4096
    };

    const reasonerResponse = await DeepSeekClient.makeReasonerCall(enhancedRequest);

    return {
      response: reasonerResponse.content,
      reasoning: reasonerResponse.reasoning_content,
      ragContext: ragResults.documents,
      mcpTools: relevantTools.slice(0, 5),
      a2aCoordination: coordinationResult
    };
  }

  async getSystemHealth(): Promise<SystemHealth> {
    const health: SystemHealth = {
      ragService: "offline",
      a2aService: "offline", 
      mcpService: "offline",
      deepseekAPI: "offline",
      overallStatus: "critical"
    };

    try {
      // Check RAG service
      const ragDocCount = ragService.getDocumentCount();
      health.ragService = ragDocCount > 0 ? "healthy" : "degraded";
    } catch {
      health.ragService = "offline";
    }

    try {
      // Check A2A service
      const agents = a2aService.getAgents();
      health.a2aService = agents.length > 0 ? "healthy" : "degraded";
    } catch {
      health.a2aService = "offline";
    }

    try {
      // Check MCP service
      const servers = mcpService.getServers();
      health.mcpService = servers.length > 0 ? "healthy" : "degraded";
    } catch {
      health.mcpService = "offline";
    }

    try {
      // Check DeepSeek API
      const apiKey = localStorage.getItem("deepseek_api_key");
      if (apiKey) {
        const isValid = await DeepSeekClient.validateApiKey(apiKey);
        health.deepseekAPI = isValid ? "healthy" : "degraded";
      } else {
        health.deepseekAPI = "degraded";
      }
    } catch {
      health.deepseekAPI = "offline";
    }

    // Determine overall status
    const healthyServices = Object.values(health).filter(status => status === "healthy").length;
    if (healthyServices >= 3) {
      health.overallStatus = "operational";
    } else if (healthyServices >= 2) {
      health.overallStatus = "degraded";
    } else {
      health.overallStatus = "critical";
    }

    return health;
  }

  async demonstrateIntegration(): Promise<{
    ragDemo: any;
    a2aDemo: any;
    mcpDemo: any;
    integrationTest: any;
  }> {
    console.log("Running integration demonstration...");

    // RAG demonstration
    const ragDemo = await ragService.query({
      query: "Cursor AI MCP integration best practices",
      limit: 2
    });

    // A2A demonstration
    const a2aDemo = await a2aService.sendMessage({
      id: "demo-msg",
      from: "system",
      to: "rag-agent",
      type: "request",
      payload: { query: "Test coordination", priority: "low" },
      timestamp: Date.now()
    });

    // MCP demonstration
    const mcpDemo = await mcpService.callTool("read_file", {
      path: "/config/app.json"
    });

    // Integration test
    const integrationTest = {
      ragIntegration: ragDemo.documents.length > 0,
      a2aIntegration: a2aDemo !== null,
      mcpIntegration: mcpDemo.content !== undefined,
      timestamp: new Date().toISOString()
    };

    return {
      ragDemo,
      a2aDemo,
      mcpDemo,
      integrationTest
    };
  }

  isInitialized(): boolean {
    return this.initialized;
  }

  async reset(): Promise<void> {
    this.initialized = false;
    console.log("System integration reset");
  }
}

export const systemIntegrationService = SystemIntegrationService.getInstance();
