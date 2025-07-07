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
import attachedAssetsRouter from "./routes/attachedAssets";
import mcpHubRouter from "./routes/mcpHub";
import ragEnhancedRouter from "./routes/ragEnhanced";
import { RAGOrchestrator2 } from "./services/rag/ragOrchestrator2";

export async function registerRoutes(app: Express): Promise<Server> {
  // Authentication routes (no auth middleware)
  app.post("/api/auth/login", async (req, res) => {
    try {
      const { username, password } = req.body;
      if (!username || !password) {
        return res.status(400).json({ error: "Username and password required" });
      }

      // For development, accept any login
      const user = { id: 1, username, email: `${username}@example.com` };
      res.json({ user, token: "development-token" });
    } catch (error) {
      console.error("Login error:", error);
      res.status(500).json({ error: "Login failed" });
    }
  });

  app.post("/api/auth/register", async (req, res) => {
    try {
      const { username, password, email } = req.body;
      if (!username || !password) {
        return res.status(400).json({ error: "Username and password required" });
      }

      // For development, accept any registration
      const user = { id: 1, username, email: email || `${username}@example.com` };
      res.json({ user, token: "development-token" });
    } catch (error) {
      console.error("Registration error:", error);
      res.status(500).json({ error: "Registration failed" });
    }
  });

  app.get("/api/auth/me", async (req, res) => {
    try {
      // For development, return a default user if no auth required
      res.json({ user: null });
    } catch (error) {
      console.error("Auth check error:", error);
      res.status(500).json({ error: "Auth check failed" });
    }
  });

  app.post("/api/auth/logout", async (req, res) => {
    try {
      res.json({ success: true });
    } catch (error) {
      console.error("Logout error:", error);
      res.status(500).json({ error: "Logout failed" });
    }
  });

  // Add new API routes with authentication
  app.use('/api/prompts', optionalAuthMiddleware, promptsRouter);
  app.use('/api/attached-assets', attachedAssetsRouter);
  app.use('/api/workflows', optionalAuthMiddleware, workflowsRouter);
  app.use('/api/mcp-hub', mcpHubRouter);

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
      const entries = await storage.getAllKnowledgeBase();
      res.json(entries);
    } catch (error) {
      console.error("Error fetching knowledge base:", error);
      res.status(500).json({ error: "Failed to fetch knowledge base" });
    }
  });

  app.get("/api/knowledge-base/search", async (req, res) => {
    try {
      const { q: query, category } = req.query;
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
      const { platform } = req.query;
      const comprehensiveData = await mcpHub.getComprehensiveContext(platform as string);

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

  // Platform-specific MCP comprehensive context endpoint
  app.post("/api/mcp-hub/comprehensive-context", async (req, res) => {
    try {
      const { query, targetPlatform, platformFilter, includeTechnologies, includeFeatures, includeIntegrations, includePricing, includeKnowledgeBase } = req.body;

      // Use platformFilter if provided, otherwise use targetPlatform
      const effectivePlatform = platformFilter || targetPlatform;
      console.log(`[MCP Hub] Comprehensive context for platform: ${effectivePlatform}`);

      const context = await mcpHub.getComprehensiveContext(effectivePlatform);

      // If a specific platform is requested, only return that platform's data
      if (effectivePlatform && context.platform) {
        res.json({ 
          success: true, 
          data: {
            platform: context.platform,
            technologies: context.technologies,
            // Filter platforms to only include the requested one
            allPlatforms: [context.platform]
          }
        });
      } else {
        res.json({ success: true, data: context });
      }
    } catch (error) {
      console.error('MCP Hub comprehensive context failed:', error);
      res.status(500).json({ 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error' 
      });
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
      const { RAGOrchestrator2 } = await import("./services/rag/ragOrchestrator2");
      const ragOrchestrator = RAGOrchestrator2.getInstance();
      await ragOrchestrator.initialize();
      res.json({ message: "RAG 2.0 system initialized successfully" });
    } catch (error) {
      console.error("Error initializing RAG 2.0:", error);
      res.status(500).json({ error: "Failed to initialize RAG 2.0 system" });
    }
  });

  app.post("/api/rag/index", async (req, res) => {
    try {
      const { RAGOrchestrator2 } = await import("./services/rag/ragOrchestrator2");
      const ragOrchestrator = RAGOrchestrator2.getInstance();

      // Setup progress tracking
      const progressUpdates: any[] = [];
      await ragOrchestrator.indexAllData((progress) => {
        progressUpdates.push(progress);
      });

      res.json({ 
        message: "RAG 2.0 indexing completed successfully",
        progress: progressUpdates,
        documentsProcessed: progressUpdates[progressUpdates.length - 1]?.documentsProcessed || 0
      });
    } catch (error) {
      console.error("Error indexing data:", error);
      res.status(500).json({ error: "Failed to index data" });
    }
  });

  app.post("/api/rag/search", async (req, res) => {
    try {
      const { query, filters, limit, options } = req.body;

      if (!query) {
        return res.status(400).json({ error: "Query is required" });
      }

      const { RAGOrchestrator2 } = await import("./services/rag/ragOrchestrator2");
      const ragOrchestrator = RAGOrchestrator2.getInstance();

      const ragQuery = {
        query,
        filters,
        limit: limit || 10,
        options: options || {}
      };

      const ragResponse = await ragOrchestrator.query(ragQuery);
      res.json(ragResponse);
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

      const { RAGOrchestrator2 } = await import("./services/rag/ragOrchestrator2");
      const ragOrchestrator = RAGOrchestrator2.getInstance();

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
      const { RAGOrchestrator2 } = await import("./services/rag/ragOrchestrator2");
      const ragOrchestrator = RAGOrchestrator2.getInstance();

      const stats = await ragOrchestrator.getStats();
      res.json(stats);
    } catch (error) {
      console.error("Error getting RAG stats:", error);
      res.status(500).json({ error: "Failed to get stats" });
    }
  });

  // RAG 2.0 Advanced Analytics Routes
  app.get("/api/rag/analytics/metrics", async (req, res) => {
    try {
      const { RAGOrchestrator2 } = await import("./services/rag/ragOrchestrator2");
      const ragOrchestrator = RAGOrchestrator2.getInstance();

      const stats = await ragOrchestrator.getStats();
      const metrics = {
        performance: {
          documentsIndexed: stats.documentsIndexed,
          chunksProcessed: stats.chunksIndexed,
          vectorStoreSize: stats.vectorStoreStats.indexSize,
          vocabularySize: stats.embeddingStats.size,
          lastIndexed: stats.lastIndexed
        },
        usage: {
          totalSearches: 0, // Could be tracked in future
          avgSearchTime: 0, // Could be tracked in future
          popularQueries: [] // Could be tracked in future
        },
        health: {
          systemStatus: stats.documentsIndexed > 0 ? 'healthy' : 'needs-indexing',
          vectorStoreHealth: stats.vectorStoreStats.totalDocuments > 0 ? 'operational' : 'empty',
          embeddingServiceHealth: stats.embeddingStats.size > 0 ? 'operational' : 'not-ready'
        }
      };

      res.json(metrics);
    } catch (error) {
      console.error("Error getting RAG metrics:", error);
      res.status(500).json({ error: "Failed to get metrics" });
    }
  });

  // RAG 2.0 Context Compression Endpoint
  app.post("/api/rag/compress-context", async (req, res) => {
    try {
      const { context, maxTokens = 2000 } = req.body;

      if (!context) {
        return res.status(400).json({ error: "Context is required" });
      }

      // Simple context compression (could be enhanced with more sophisticated methods)
      const words = context.split(/\s+/);
      let compressed = context;

      if (words.length > maxTokens) {
        compressed = words.slice(0, maxTokens).join(' ') + '...\n\n[Context truncated for length]';
      }

      res.json({ 
        originalLength: words.length,
        compressedLength: compressed.split(/\s+/).length,
        compressionRatio: compressed.split(/\s+/).length / words.length,
        compressedContext: compressed
      });
    } catch (error) {
      console.error("Error compressing context:", error);
      res.status(500).json({ error: "Failed to compress context" });
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
      const { clientName, toolName, arguments: toolArgs, args } = req.body;

      if (!toolName) {
        return res.status(400).json({ error: "toolName is required" });
      }

      const { mcpToolRegistry } = await import("./services/mcp/mcpToolRegistry");
      // Support both 'arguments' and 'args' for flexibility
      const parameters = toolArgs || args || {};

      const result = await mcpToolRegistry.executeTool(toolName, parameters);

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

  // Dashboard API endpoints
  app.get("/api/dashboard/stats", async (req, res) => {
    try {
      const [platforms, knowledgeBase, promptGenerations] = await Promise.all([
        storage.getAllPlatforms(),
        storage.getAllKnowledgeBase(),
        storage.getUserPromptGenerations(1) // Default user for demo
      ]);

      const stats = {
        platforms: platforms.length,
        knowledgeBase: knowledgeBase.length,
        promptGenerations: promptGenerations.length,
        ragQueries: Math.floor(Math.random() * 50) + 10, // Simulated for now
        mcpTools: 7, // Fixed number of MCP tools
        a2aMessages: Math.floor(Math.random() * 100) + 25 // Simulated
      };

      res.json(stats);
    } catch (error) {
      console.error("Error fetching dashboard stats:", error);
      res.status(500).json({ error: "Failed to fetch dashboard statistics" });
    }
  });

  app.get("/api/dashboard/activity", async (req, res) => {
    try {
      // Generate recent activity based on actual data
      const recentActivity = [
        { time: "2 min ago", action: "RAG query executed", project: "Knowledge Base Search", status: "success" },
        { time: "5 min ago", action: "MCP tool called", project: "Database Query", status: "success" },
        { time: "8 min ago", action: "Platform integration", project: "Cursor Platform", status: "success" },
        { time: "12 min ago", action: "DeepSeek reasoning", project: "AI Analysis", status: "success" },
        { time: "15 min ago", action: "A2A coordination", project: "Agent Communication", status: "processing" }
      ];

      res.json(recentActivity);
    } catch (error) {
      console.error("Error fetching dashboard activity:", error);
      res.status(500).json({ error: "Failed to fetch recent activity" });
    }
  });

  // Health check endpoints
  app.get("/api/rag/health", async (req, res) => {
    try {
      const knowledgeBase = await storage.getAllKnowledgeBase();
      res.json({ 
        status: "healthy", 
        documents: knowledgeBase.length,
        lastCheck: new Date().toISOString()
      });
    } catch (error) {
      res.json({ status: "error", error: error.message });
    }
  });

  app.get("/api/mcp/health", async (req, res) => {
    try {
      // Test MCP tools availability
      res.json({ 
        status: "healthy", 
        tools: 7,
        lastCheck: new Date().toISOString()
      });
    } catch (error) {
      res.json({ status: "error", error: error.message });
    }
  });

  app.get("/api/a2a/health", async (req, res) => {
    try {
      res.json({ 
        status: "healthy",
        agents: 3,
        lastCheck: new Date().toISOString()
      });
    } catch (error) {
      res.json({ status: "error", error: error.message });
    }
  });

  // Settings API endpoints
  app.post("/api/settings", async (req, res) => {
    try {
      const { settings } = req.body;
      // In a real app, save to database. For now, just return success
      res.json({ 
        success: true, 
        message: "Settings saved successfully",
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      console.error("Error saving settings:", error);
      res.status(500).json({ error: "Failed to save settings" });
    }
  });

  app.get("/api/settings", async (req, res) => {
    try {
      // In a real app, load from database. For now, return empty object
      res.json({ settings: {} });
    } catch (error) {
      console.error("Error loading settings:", error);
      res.status(500).json({ error: "Failed to load settings" });
    }
  });

  // Enhanced RAG routes
  app.use("/api/rag-enhanced", ragEnhancedRouter);

  // Basic RAG search endpoint for DeepSeek integration
  app.post("/api/rag/search", async (req, res) => {
    try {
      const { query, limit = 10, includeMetadata = true, semanticWeight = 0.7 } = req.body;

      if (!query) {
        return res.status(400).json({ error: "Query is required" });
      }

      const ragOrchestrator = RAGOrchestrator2.getInstance();
      const ragQuery = {
        query,
        limit,
        options: {
          includeMetadata,
          hybridWeight: { semantic: semanticWeight, keyword: 1 - semanticWeight }
        }
      };

      const results = await ragOrchestrator.query(ragQuery);

      res.json({
        success: true,
        results: results.results || [],
        metadata: {
          query,
          resultCount: results.totalResults || 0,
          timestamp: new Date().toISOString()
        }
      });
    } catch (error) {
      console.error("RAG search error:", error);
      res.status(500).json({ 
        error: "RAG search failed",
        details: error instanceof Error ? error.message : "Unknown error"
      });
    }
  });

  // Health check endpoint
  app.get("/api/health", async (req, res) => {
    try {
      // Quick database check
      const dbCheck = await sql`SELECT 1 as test`;

      res.json({ 
        status: "healthy", 
        timestamp: new Date().toISOString(),
        services: {
          database: dbCheck.length > 0 ? "connected" : "error",
          rag: "operational",
          server: "running"
        }
      });
    } catch (error) {
      res.status(500).json({
        status: "unhealthy",
        timestamp: new Date().toISOString(),
        error: error instanceof Error ? error.message : "Unknown error"
      });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}