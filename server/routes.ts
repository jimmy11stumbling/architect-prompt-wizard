import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
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

export async function registerRoutes(app: Express): Promise<Server> {
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
      const { mcpRegistry } = await import("./services/mcp/mcpClient");
      const tools = await mcpRegistry.getAllTools();
      res.json({ tools });
    } catch (error) {
      console.error("Error getting MCP tools:", error);
      res.status(500).json({ error: "Failed to get MCP tools" });
    }
  });

  app.post("/api/mcp/tools/call", async (req, res) => {
    try {
      const { clientName, toolName, arguments: toolArgs } = req.body;
      
      if (!clientName || !toolName) {
        return res.status(400).json({ error: "clientName and toolName are required" });
      }

      const { mcpRegistry } = await import("./services/mcp/mcpClient");
      const result = await mcpRegistry.callTool(clientName, toolName, toolArgs || {});
      
      res.json({ result });
    } catch (error) {
      console.error("Error calling MCP tool:", error);
      res.status(500).json({ error: "Failed to call MCP tool" });
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

  const httpServer = createServer(app);
  return httpServer;
}
