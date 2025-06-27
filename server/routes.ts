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
      const { seedPlatformData } = await import("./seedData");
      await seedPlatformData();
      res.json({ message: "Platform data seeded successfully" });
    } catch (error) {
      console.error("Error seeding platform data:", error);
      res.status(500).json({ error: "Failed to seed platform data" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
