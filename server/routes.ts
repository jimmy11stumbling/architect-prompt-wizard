import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { mcpHub } from "./services/mcpHub";
import { mcpServer, MCPRequest } from "./services/mcpServer";
import { 
  insertPlatformSchema,
  insertPlatformFeatureSchema,
  insertPlatformIntegrationSchema,
  insertPlatformPricingSchema,
  insertPromptGenerationSchema,
  insertSavedPromptSchema,
  insertWorkflowSchema,
  insertKnowledgeBaseSchema
} from "@shared/schema";
import { authMiddleware, optionalAuthMiddleware } from "./middleware/auth";
import promptsRouter from "./routes/prompts";
import workflowsRouter from "./routes/workflows";

export async function registerRoutes(app: Express): Promise<Server> {
  // Add new API routes with authentication
  app.use('/api/prompts', authMiddleware, promptsRouter);
  app.use('/api/workflows', authMiddleware, workflowsRouter);

  // Platform management routes
  app.get("/api/platforms", async (req, res) => {
    try {
      const platforms = await storage.getAllPlatforms();
      res.json(platforms);
    } catch (error) {
      console.error("Error fetching platforms:", error);
      res.status(500).json({ error: "Failed to fetch platforms" });
    }
  });

  app.get("/api/platforms/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const platform = await storage.getPlatform(id);
      if (!platform) {
        return res.status(404).json({ error: "Platform not found" });
      }
      res.json(platform);
    } catch (error) {
      console.error("Error fetching platform:", error);
      res.status(500).json({ error: "Failed to fetch platform" });
    }
  });

  app.post("/api/platforms", async (req, res) => {
    try {
      const validatedData = insertPlatformSchema.parse(req.body);
      const platform = await storage.createPlatform(validatedData);
      res.status(201).json(platform);
    } catch (error) {
      console.error("Error creating platform:", error);
      res.status(400).json({ error: "Invalid platform data" });
    }
  });

  // Platform features routes
  app.get("/api/platforms/:id/features", async (req, res) => {
    try {
      const platformId = parseInt(req.params.id);
      const features = await storage.getPlatformFeatures(platformId);
      res.json(features);
    } catch (error) {
      console.error("Error fetching platform features:", error);
      res.status(500).json({ error: "Failed to fetch platform features" });
    }
  });

  app.post("/api/platforms/:id/features", async (req, res) => {
    try {
      const platformId = parseInt(req.params.id);
      const validatedData = insertPlatformFeatureSchema.parse({
        ...req.body,
        platformId
      });
      const feature = await storage.createPlatformFeature(validatedData);
      res.status(201).json(feature);
    } catch (error) {
      console.error("Error creating platform feature:", error);
      res.status(400).json({ error: "Invalid feature data" });
    }
  });

  // Platform integrations routes
  app.get("/api/platforms/:id/integrations", async (req, res) => {
    try {
      const platformId = parseInt(req.params.id);
      const integrations = await storage.getPlatformIntegrations(platformId);
      res.json(integrations);
    } catch (error) {
      console.error("Error fetching platform integrations:", error);
      res.status(500).json({ error: "Failed to fetch platform integrations" });
    }
  });

  app.post("/api/platforms/:id/integrations", async (req, res) => {
    try {
      const platformId = parseInt(req.params.id);
      const validatedData = insertPlatformIntegrationSchema.parse({
        ...req.body,
        platformId
      });
      const integration = await storage.createPlatformIntegration(validatedData);
      res.status(201).json(integration);
    } catch (error) {
      console.error("Error creating platform integration:", error);
      res.status(400).json({ error: "Invalid integration data" });
    }
  });

  // Platform pricing routes
  app.get("/api/platforms/:id/pricing", async (req, res) => {
    try {
      const platformId = parseInt(req.params.id);
      const pricing = await storage.getPlatformPricing(platformId);
      res.json(pricing);
    } catch (error) {
      console.error("Error fetching platform pricing:", error);
      res.status(500).json({ error: "Failed to fetch platform pricing" });
    }
  });

  app.post("/api/platforms/:id/pricing", async (req, res) => {
    try {
      const platformId = parseInt(req.params.id);
      const validatedData = insertPlatformPricingSchema.parse({
        ...req.body,
        platformId
      });
      const pricing = await storage.createPlatformPricing(validatedData);
      res.status(201).json(pricing);
    } catch (error) {
      console.error("Error creating platform pricing:", error);
      res.status(400).json({ error: "Invalid pricing data" });
    }
  });

  // Prompt generation routes
  app.post("/api/prompt-generations", async (req, res) => {
    try {
      const validatedData = insertPromptGenerationSchema.parse(req.body);
      const generation = await storage.createPromptGeneration(validatedData);
      res.status(201).json(generation);
    } catch (error) {
      console.error("Error creating prompt generation:", error);
      res.status(400).json({ error: "Invalid generation data" });
    }
  });

  app.get("/api/prompt-generations/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const generation = await storage.getPromptGeneration(id);
      if (!generation) {
        return res.status(404).json({ error: "Generation not found" });
      }
      res.json(generation);
    } catch (error) {
      console.error("Error fetching prompt generation:", error);
      res.status(500).json({ error: "Failed to fetch generation" });
    }
  });

  app.get("/api/users/:userId/prompt-generations", async (req, res) => {
    try {
      const userId = parseInt(req.params.userId);
      const generations = await storage.getUserPromptGenerations(userId);
      res.json(generations);
    } catch (error) {
      console.error("Error fetching user generations:", error);
      res.status(500).json({ error: "Failed to fetch user generations" });
    }
  });

  // Saved prompts routes
  app.post("/api/saved-prompts", async (req, res) => {
    try {
      const validatedData = insertSavedPromptSchema.parse(req.body);
      const prompt = await storage.createSavedPrompt(validatedData);
      res.status(201).json(prompt);
    } catch (error) {
      console.error("Error creating saved prompt:", error);
      res.status(400).json({ error: "Invalid prompt data" });
    }
  });

  app.get("/api/users/:userId/saved-prompts", async (req, res) => {
    try {
      const userId = parseInt(req.params.userId);
      const prompts = await storage.getUserSavedPrompts(userId);
      res.json(prompts);
    } catch (error) {
      console.error("Error fetching user prompts:", error);
      res.status(500).json({ error: "Failed to fetch user prompts" });
    }
  });

  app.get("/api/saved-prompts/public", async (req, res) => {
    try {
      const prompts = await storage.getPublicSavedPrompts();
      res.json(prompts);
    } catch (error) {
      console.error("Error fetching public prompts:", error);
      res.status(500).json({ error: "Failed to fetch public prompts" });
    }
  });

  app.get("/api/saved-prompts/public", async (req, res) => {
    try {
      const prompts = await storage.getPublicSavedPrompts();
      res.json(prompts);
    } catch (error) {
      console.error("Error fetching public prompts:", error);
      res.status(500).json({ error: "Failed to fetch public prompts" });
    }
  });

  // Workflow routes
  app.post("/api/workflows", async (req, res) => {
    try {
      const validatedData = insertWorkflowSchema.parse(req.body);
      const workflow = await storage.createWorkflow(validatedData);
      res.status(201).json(workflow);
    } catch (error) {
      console.error("Error creating workflow:", error);
      res.status(400).json({ error: "Invalid workflow data" });
    }
  });

  app.get("/api/users/:userId/workflows", async (req, res) => {
    try {
      const userId = parseInt(req.params.userId);
      const workflows = await storage.getUserWorkflows(userId);
      res.json(workflows);
    } catch (error) {
      console.error("Error fetching user workflows:", error);
      res.status(500).json({ error: "Failed to fetch user workflows" });
    }
  });

  app.get("/api/workflow-templates", async (req, res) => {
    try {
      const templates = await storage.getWorkflowTemplates();
      res.json(templates);
    } catch (error) {
      console.error("Error fetching workflow templates:", error);
      res.status(500).json({ error: "Failed to fetch workflow templates" });
    }
  });

  // Knowledge base routes
  app.post("/api/knowledge-base", async (req, res) => {
    try {
      const validatedData = insertKnowledgeBaseSchema.parse(req.body);
      const entry = await storage.createKnowledgeBaseEntry(validatedData);
      res.status(201).json(entry);
    } catch (error) {
      console.error("Error creating knowledge base entry:", error);
      res.status(400).json({ error: "Invalid knowledge base data" });
    }
  });

  app.get("/api/knowledge-base", async (req, res) => {
    try {
      const { query, category } = req.query;
      const entries = await storage.searchKnowledgeBase(
        query as string, 
        category as string
      );
      res.json(entries);
    } catch (error) {
      console.error("Error searching knowledge base:", error);
      res.status(500).json({ error: "Failed to search knowledge base" });
    }
  });

  app.get("/api/knowledge-base/all", async (req, res) => {
    try {
      const entries = await storage.getAllKnowledgeBase();
      res.json(entries);
    } catch (error) {
      console.error("Error fetching all knowledge base entries:", error);
      res.status(500).json({ error: "Failed to fetch knowledge base entries" });
    }
  });

  // MCP Hub routes - comprehensive platform data management
  app.get("/api/agent-documentation", async (req, res) => {
    try {
      const comprehensiveData = await mcpHub.getComprehensiveContext();
      
      // Convert to the format expected by existing agents
      const documentation = {
        platforms: comprehensiveData.allPlatforms.map(p => ({
          ...p.platform,
          features: p.features,
          integrations: p.integrations,
          pricing: p.pricing
        })),
        knowledgeBase: comprehensiveData.allPlatforms.flatMap(p => p.knowledgeBase),
        technologies: comprehensiveData.technologies,
        timestamp: new Date().toISOString()
      };

      res.json(documentation);
    } catch (error) {
      console.error("Error fetching agent documentation:", error);
      res.status(500).json({ error: "Failed to fetch documentation" });
    }
  });

  // MCP Server routes
  app.post("/api/mcp", async (req, res) => {
    try {
      const mcpRequest: MCPRequest = req.body;
      const response = await mcpServer.handleRequest(mcpRequest);
      res.json(response);
    } catch (error) {
      console.error("Error handling MCP request:", error);
      res.status(500).json({
        jsonrpc: "2.0",
        id: req.body?.id || null,
        error: {
          code: -1,
          message: "Internal server error",
          data: error
        }
      });
    }
  });

  app.get("/api/mcp/hub/status", async (req, res) => {
    try {
      const status = mcpHub.getCacheStatus();
      res.json(status);
    } catch (error) {
      console.error("Error getting MCP hub status:", error);
      res.status(500).json({ error: "Failed to get hub status" });
    }
  });

  app.post("/api/mcp/hub/refresh", async (req, res) => {
    try {
      await mcpHub.invalidateCache();
      await mcpHub.getAllPlatformData(); // Rebuild cache
      res.json({ success: true, message: "MCP Hub refreshed successfully" });
    } catch (error) {
      console.error("Error refreshing MCP hub:", error);
      res.status(500).json({ error: "Failed to refresh hub" });
    }
  });

  app.get("/api/mcp/platform/:name", async (req, res) => {
    try {
      const platformData = await mcpHub.getPlatformByName(req.params.name);
      if (!platformData) {
        return res.status(404).json({ error: "Platform not found" });
      }
      res.json(platformData);
    } catch (error) {
      console.error("Error getting platform data:", error);
      res.status(500).json({ error: "Failed to get platform data" });
    }
  });

  app.get("/api/mcp/context/:platform?", async (req, res) => {
    try {
      const context = await mcpHub.getComprehensiveContext(req.params.platform);
      res.json(context);
    } catch (error) {
      console.error("Error getting comprehensive context:", error);
      res.status(500).json({ error: "Failed to get context" });
    }
  });

  // Data seeding route for attached assets
  app.post("/api/seed-platform-data", async (req, res) => {
    try {
      // Import the seeding script
      const seedDataModule = await import("./seedData.js");
      await seedDataModule.seedPlatformData();
      res.json({ message: "Platform data seeded successfully" });
    } catch (error) {
      console.error("Error seeding platform data:", error);
      res.status(500).json({ error: "Failed to seed platform data" });
    }
  });

  // RAG 2.0 Vector Search Routes
  app.post("/api/rag/initialize", async (req, res) => {
    try {
      const { RAGOrchestrator } = await import("./services/rag/ragOrchestrator");
      const ragOrchestrator = new RAGOrchestrator();
      await ragOrchestrator.initialize();
      res.json({ message: "RAG system initialized successfully" });
    } catch (error) {
      console.error("Error initializing RAG:", error);
      res.status(500).json({ error: "Failed to initialize RAG system" });
    }
  });

  app.post("/api/rag/index", async (req, res) => {
    try {
      const { RAGOrchestrator } = await import("./services/rag/ragOrchestrator");
      const ragOrchestrator = new RAGOrchestrator();
      
      // Setup progress tracking
      const progressUpdates: any[] = [];
      await ragOrchestrator.indexAllData((progress) => {
        progressUpdates.push(progress);
      });
      
      res.json({ 
        message: "Indexing completed successfully",
        progress: progressUpdates 
      });
    } catch (error) {
      console.error("Error indexing data:", error);
      res.status(500).json({ error: "Failed to index data" });
    }
  });

  app.post("/api/rag/search", async (req, res) => {
    try {
      const { query, filters, maxResults } = req.body;
      
      if (!query) {
        return res.status(400).json({ error: "Query is required" });
      }

      const { RAGOrchestrator } = await import("./services/rag/ragOrchestrator");
      const ragOrchestrator = new RAGOrchestrator();
      
      const result = await ragOrchestrator.query({
        query,
        filters: {
          platform: filters?.platform,
          category: filters?.category,
          maxResults: maxResults || 10
        }
      });
      
      res.json(result);
    } catch (error) {
      console.error("Error performing RAG search:", error);
      res.status(500).json({ error: "Failed to perform search" });
    }
  });

  app.get("/api/rag/suggestions", async (req, res) => {
    try {
      const { q: query, limit } = req.query;
      
      if (!query) {
        return res.status(400).json({ error: "Query parameter 'q' is required" });
      }

      const { RAGOrchestrator } = await import("./services/rag/ragOrchestrator");
      const ragOrchestrator = new RAGOrchestrator();
      
      const suggestions = await ragOrchestrator.getSuggestions(
        query as string, 
        parseInt(limit as string) || 5
      );
      
      res.json({ suggestions });
    } catch (error) {
      console.error("Error getting suggestions:", error);
      res.status(500).json({ error: "Failed to get suggestions" });
    }
  });

  app.get("/api/rag/stats", async (req, res) => {
    try {
      const { RAGOrchestrator } = await import("./services/rag/ragOrchestrator");
      const ragOrchestrator = new RAGOrchestrator();
      
      const stats = await ragOrchestrator.getStats();
      res.json(stats);
    } catch (error) {
      console.error("Error getting RAG stats:", error);
      res.status(500).json({ error: "Failed to get stats" });
    }
  });

  app.get("/api/rag/analytics/metrics", async (req, res) => {
    try {
      const { ragMonitor } = await import("./services/rag/ragMonitor");
      const metrics = await ragMonitor.getPerformanceMetrics();
      res.json(metrics);
    } catch (error) {
      console.error("Error getting RAG metrics:", error);
      res.status(500).json({ error: "Failed to get metrics" });
    }
  });

  app.get("/api/rag/analytics/patterns", async (req, res) => {
    try {
      const { ragMonitor } = await import("./services/rag/ragMonitor");
      const patterns = await ragMonitor.analyzeQueryPatterns();
      res.json(patterns);
    } catch (error) {
      console.error("Error analyzing patterns:", error);
      res.status(500).json({ error: "Failed to analyze patterns" });
    }
  });

  app.post("/api/rag/reindex", async (req, res) => {
    try {
      const { RAGOrchestrator } = await import("./services/rag/ragOrchestrator");
      const ragOrchestrator = new RAGOrchestrator();
      
      await ragOrchestrator.reIndex();
      res.json({ message: "Re-indexing completed successfully" });
    } catch (error) {
      console.error("Error re-indexing:", error);
      res.status(500).json({ error: "Failed to re-index" });
    }
  });

  // MCP (Model Context Protocol) Routes
  app.post("/api/mcp/initialize", async (req, res) => {
    try {
      const { mcpRegistry } = await import("./services/mcp/mcpClient");
      
      // Register default MCP clients
      mcpRegistry.registerClient("platform-tools", {
        serverName: "platform-tools",
        transport: "stdio"
      });

      await mcpRegistry.initializeAll();
      
      res.json({ 
        message: "MCP system initialized successfully",
        clients: mcpRegistry.listClients()
      });
    } catch (error) {
      console.error("Error initializing MCP:", error);
      res.status(500).json({ error: "Failed to initialize MCP system" });
    }
  });

  app.get("/api/mcp/tools", async (req, res) => {
    try {
      const { mcpToolRegistry } = await import("./services/mcp/mcpToolRegistry");
      const tools = mcpToolRegistry.getAllTools().map(tool => ({
        name: tool.name,
        description: tool.description,
        inputSchema: tool.inputSchema,
        clientName: "ipa-mcp-server"
      }));
      res.json({ tools });
    } catch (error) {
      console.error("Error getting MCP tools:", error);
      res.status(500).json({ error: "Failed to get MCP tools" });
    }
  });

  app.post("/api/mcp/tools/call", async (req, res) => {
    try {
      const { clientName, toolName, arguments: toolArgs } = req.body;
      
      if (!toolName) {
        return res.status(400).json({ error: "toolName is required" });
      }

      const { mcpToolRegistry } = await import("./services/mcp/mcpToolRegistry");
      const result = await mcpToolRegistry.executeTool(toolName, toolArgs || {});
      
      res.json({ result });
    } catch (error) {
      console.error("Error calling MCP tool:", error);
      res.status(500).json({ error: error instanceof Error ? error.message : "Failed to call MCP tool" });
    }
  });

  app.get("/api/mcp/resources", async (req, res) => {
    try {
      // Return some default resources
      const resources = [
        {
          uri: "config://app",
          name: "Application Configuration",
          description: "Current application configuration and settings",
          mimeType: "application/json",
          clientName: "ipa-mcp-server"
        },
        {
          uri: "docs://api",
          name: "API Documentation",
          description: "API endpoints and usage documentation",
          mimeType: "text/markdown",
          clientName: "ipa-mcp-server"
        },
        {
          uri: "schema://database",
          name: "Database Schema",
          description: "Current database schema and relationships",
          mimeType: "application/json",
          clientName: "ipa-mcp-server"
        }
      ];
      res.json({ resources });
    } catch (error) {
      console.error("Error getting MCP resources:", error);
      res.status(500).json({ error: "Failed to get MCP resources" });
    }
  });

  app.post("/api/mcp/resources/read", async (req, res) => {
    try {
      const { uri } = req.body;
      
      if (!uri) {
        return res.status(400).json({ error: "uri is required" });
      }

      let result;
      switch (uri) {
        case "config://app":
          result = {
            name: "IPA Application",
            version: "2.0.0",
            features: ["RAG 2.0", "MCP", "A2A Communication"],
            database: "PostgreSQL",
            environment: process.env.NODE_ENV
          };
          break;
        
        case "docs://api":
          result = `# IPA API Documentation\n\n## Endpoints\n\n### RAG System\n- POST /api/rag/initialize\n- POST /api/rag/index\n- POST /api/rag/search\n\n### MCP System\n- POST /api/mcp/initialize\n- GET /api/mcp/tools\n- POST /api/mcp/tools/call\n\n### A2A System\n- POST /api/a2a/initialize\n- POST /api/a2a/message\n- GET /api/a2a/agents`;
          break;
        
        case "schema://database":
          result = {
            tables: ["users", "platforms", "platform_features", "prompt_generations", "saved_prompts", "workflows", "knowledge_base"],
            relationships: {
              platform_features: "belongs to platforms",
              prompt_generations: "belongs to users"
            }
          };
          break;
        
        default:
          return res.status(404).json({ error: "Resource not found" });
      }
      
      res.json({ result });
    } catch (error) {
      console.error("Error reading MCP resource:", error);
      res.status(500).json({ error: "Failed to read MCP resource" });
    }
  });

  app.get("/api/mcp/resources", async (req, res) => {
    try {
      const { mcpRegistry } = await import("./services/mcp/mcpClient");
      const resources = await mcpRegistry.getAllResources();
      res.json({ resources });
    } catch (error) {
      console.error("Error getting MCP resources:", error);
      res.status(500).json({ error: "Failed to get MCP resources" });
    }
  });

  app.post("/api/mcp/resources/read", async (req, res) => {
    try {
      const { clientName, uri } = req.body;
      
      if (!clientName || !uri) {
        return res.status(400).json({ error: "clientName and uri are required" });
      }

      const { mcpRegistry } = await import("./services/mcp/mcpClient");
      const result = await mcpRegistry.readResource(clientName, uri);
      
      res.json({ result });
    } catch (error) {
      console.error("Error reading MCP resource:", error);
      res.status(500).json({ error: "Failed to read MCP resource" });
    }
  });

  // A2A (Agent-to-Agent) Communication Routes
  app.post("/api/a2a/initialize", async (req, res) => {
    try {
      const { AgentCoordinator } = await import("./services/a2a/agentCoordinator");
      const coordinator = new AgentCoordinator();

      // Register default agents
      coordinator.registerAgent("reasoning-assistant", [
        { name: "reasoning", description: "Advanced reasoning and analysis" },
        { name: "problem-solving", description: "Complex problem solving" }
      ], ["reasoning", "analysis"]);

      coordinator.registerAgent("context-analyzer", [
        { name: "context-analysis", description: "Context analysis and interpretation" },
        { name: "information-extraction", description: "Information extraction from context" }
      ], ["context", "analysis"]);

      coordinator.registerAgent("documentation-expert", [
        { name: "documentation", description: "Documentation generation and analysis" },
        { name: "technical-writing", description: "Technical writing and editing" }
      ], ["documentation", "writing"]);

      res.json({ 
        message: "A2A communication system initialized successfully",
        stats: coordinator.getCoordinationStats()
      });
    } catch (error) {
      console.error("Error initializing A2A:", error);
      res.status(500).json({ error: "Failed to initialize A2A system" });
    }
  });

  app.post("/api/a2a/task", async (req, res) => {
    try {
      const { description, requiredCapabilities, priority, agents, strategy } = req.body;
      
      if (!description) {
        return res.status(400).json({ error: "Task description is required" });
      }

      const { AgentCoordinator } = await import("./services/a2a/agentCoordinator");
      const coordinator = new AgentCoordinator();

      let result;
      if (agents && strategy) {
        result = await coordinator.executeCollaborativeTask(description, agents, strategy);
      } else {
        result = coordinator.createTask(
          description,
          requiredCapabilities || [],
          priority || "medium"
        );
      }
      
      res.json({ result });
    } catch (error) {
      console.error("Error creating A2A task:", error);
      res.status(500).json({ error: "Failed to create A2A task" });
    }
  });

  app.post("/api/a2a/negotiate", async (req, res) => {
    try {
      const { initiator, participants, task } = req.body;
      
      if (!initiator || !participants || !task) {
        return res.status(400).json({ error: "initiator, participants, and task are required" });
      }

      const { AgentCoordinator } = await import("./services/a2a/agentCoordinator");
      const coordinator = new AgentCoordinator();

      const result = await coordinator.negotiateTask(initiator, participants, task);
      
      res.json({ result });
    } catch (error) {
      console.error("Error in A2A negotiation:", error);
      res.status(500).json({ error: "Failed to perform A2A negotiation" });
    }
  });

  app.get("/api/a2a/stats", async (req, res) => {
    try {
      const { AgentCoordinator } = await import("./services/a2a/agentCoordinator");
      const coordinator = new AgentCoordinator();
      
      const stats = coordinator.getCoordinationStats();
      res.json(stats);
    } catch (error) {
      console.error("Error getting A2A stats:", error);
      res.status(500).json({ error: "Failed to get A2A stats" });
    }
  });

  app.post("/api/a2a/negotiate", async (req, res) => {
    try {
      const { initiator, participants, task } = req.body;
      
      if (!initiator || !participants || !task) {
        return res.status(400).json({ error: "Initiator, participants, and task are required" });
      }

      const { FIPAProtocol } = await import("./services/a2a/fipaProtocol");
      const protocol = new FIPAProtocol();
      
      // Simulate Contract Net Protocol negotiation
      const proposals = participants.map((participant: string) => ({
        performative: "propose",
        sender: { name: participant },
        content: `Agent ${participant} proposes to handle task: ${task}`
      }));
      
      // Simple winner selection (could be based on capabilities, availability, etc.)
      const winner = participants[Math.floor(Math.random() * participants.length)];
      
      res.json({ 
        result: {
          winner,
          proposals
        }
      });
    } catch (error) {
      console.error("Error performing negotiation:", error);
      res.status(500).json({ error: "Failed to perform negotiation" });
    }
  });

  // Authentication Routes
  app.post("/api/auth/register", async (req, res) => {
    try {
      const { username, password, email } = req.body;
      
      if (!username || !password) {
        return res.status(400).json({ error: "Username and password are required" });
      }

      // Simple password hashing using crypto (in production use proper bcrypt)
      const crypto = await import("crypto");
      const hashedPassword = crypto.createHash('sha256').update(password).digest('hex');
      
      const user = await storage.createUser({
        username,
        password: hashedPassword,
        email
      });
      
      // Set user ID in response header (simple auth)
      res.setHeader('X-User-Id', user.id.toString());
      res.json({ user: { id: user.id, username: user.username, email: user.email } });
    } catch (error) {
      console.error("Error registering user:", error);
      res.status(500).json({ error: "Failed to register user" });
    }
  });

  app.post("/api/auth/login", async (req, res) => {
    try {
      const { username, password } = req.body;
      
      if (!username || !password) {
        return res.status(400).json({ error: "Username and password are required" });
      }

      const user = await storage.getUserByUsername(username);
      if (!user) {
        return res.status(401).json({ error: "Invalid credentials" });
      }

      // Simple password verification
      const crypto = await import("crypto");
      const hashedPassword = crypto.createHash('sha256').update(password).digest('hex');
      
      if (hashedPassword !== user.password) {
        return res.status(401).json({ error: "Invalid credentials" });
      }
      
      // Set user ID in response header
      res.setHeader('X-User-Id', user.id.toString());
      res.json({ user: { id: user.id, username: user.username, email: user.email } });
    } catch (error) {
      console.error("Error logging in:", error);
      res.status(500).json({ error: "Failed to login" });
    }
  });

  app.post("/api/auth/logout", (req, res) => {
    // Simple logout - client should clear stored user data
    res.json({ message: "Logged out successfully" });
  });

  app.get("/api/auth/me", async (req, res) => {
    // Get user ID from header (simple auth)
    const userId = req.headers['x-user-id'];
    
    if (!userId) {
      return res.status(401).json({ error: "Not authenticated" });
    }

    try {
      const user = await storage.getUser(parseInt(userId as string));
      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }
      
      res.json({ user: { id: user.id, username: user.username, email: user.email } });
    } catch (error) {
      console.error("Error fetching user:", error);
      res.status(500).json({ error: "Failed to fetch user" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
