import { pgTable, text, serial, integer, boolean, timestamp, json } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  email: text("email"),
  createdAt: timestamp("created_at").defaultNow(),
});

// Platform data tables for storing comprehensive information from attached assets
export const platforms = pgTable("platforms", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(), // bolt, cursor, lovable, replit, windsurf
  description: text("description"),
  category: text("category"), // ide, ai-assistant, no-code, etc.
  website: text("website"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const platformFeatures = pgTable("platform_features", {
  id: serial("id").primaryKey(),
  platformId: integer("platform_id").references(() => platforms.id),
  featureName: text("feature_name").notNull(),
  description: text("description"),
  category: text("category"), // core, ai, integration, etc.
  isActive: boolean("is_active").default(true),
  metadata: json("metadata"), // Additional feature-specific data
  createdAt: timestamp("created_at").defaultNow(),
});

export const platformIntegrations = pgTable("platform_integrations", {
  id: serial("id").primaryKey(),
  platformId: integer("platform_id").references(() => platforms.id),
  serviceName: text("service_name").notNull(),
  serviceType: text("service_type"), // deployment, backend, auth, etc.
  integrationDetails: text("integration_details"),
  isNative: boolean("is_native").default(false),
  metadata: json("metadata"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const platformPricing = pgTable("platform_pricing", {
  id: serial("id").primaryKey(),
  platformId: integer("platform_id").references(() => platforms.id),
  planName: text("plan_name").notNull(),
  pricePerMonth: text("price_per_month"), // Store as text to handle "Custom", "Free", etc.
  features: text("features").array(), // Array of feature names
  limits: json("limits"), // Usage limits as JSON
  isPopular: boolean("is_popular").default(false),
  createdAt: timestamp("created_at").defaultNow(),
});

export const platformCapabilities = pgTable("platform_capabilities", {
  id: serial("id").primaryKey(),
  platformId: integer("platform_id").references(() => platforms.id),
  capability: text("capability").notNull(),
  description: text("description"),
  category: text("category"), // ai, development, deployment, etc.
  supportLevel: text("support_level"), // native, plugin, api, etc.
  createdAt: timestamp("created_at").defaultNow(),
});

// Prompt and generation history tables for IPA functionality
export const promptGenerations = pgTable("prompt_generations", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id),
  projectDescription: text("project_description").notNull(),
  techStack: text("tech_stack").array(),
  generatedPrompt: text("generated_prompt"),
  agentResults: json("agent_results"), // Results from all 12 agents
  status: text("status").notNull(), // pending, processing, completed, failed
  createdAt: timestamp("created_at").defaultNow(),
  completedAt: timestamp("completed_at"),
});

export const savedPrompts = pgTable("saved_prompts", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id),
  title: text("title").notNull(),
  description: text("description"),
  prompt: text("prompt").notNull(),
  tags: text("tags").array(),
  isPublic: boolean("is_public").default(false),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const workflows = pgTable("workflows", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id),
  name: text("name").notNull(),
  description: text("description"),
  definition: json("definition"), // Complete workflow definition
  status: text("status").notNull(), // draft, published, deprecated
  isTemplate: boolean("is_template").default(false),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const workflowExecutions = pgTable("workflow_executions", {
  id: serial("id").primaryKey(),
  workflowId: integer("workflow_id").references(() => workflows.id),
  userId: integer("user_id").references(() => users.id),
  status: text("status").notNull(), // queued, running, completed, failed
  results: json("results"),
  startedAt: timestamp("started_at").defaultNow(),
  completedAt: timestamp("completed_at"),
});

// Knowledge base for RAG implementation
export const knowledgeBase = pgTable("knowledge_base", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  content: text("content").notNull(),
  category: text("category"),
  tags: text("tags").array(),
  embedding: text("embedding"), // Vector embedding as text
  metadata: json("metadata"),
  sourceFile: text("source_file"), // Track which attached asset this comes from
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// DeepSeek reasoning sessions for database integration
export const deepseekSessions = pgTable("deepseek_sessions", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id),
  title: text("title").notNull(),
  description: text("description"),
  query: text("query").notNull(),
  reasoning: text("reasoning").notNull(),
  response: text("response").notNull(),
  ragEnabled: boolean("rag_enabled").default(false),
  mcpEnabled: boolean("mcp_enabled").default(false),
  tokensUsed: integer("tokens_used").default(0),
  reasoningTokens: integer("reasoning_tokens").default(0),
  responseTokens: integer("response_tokens").default(0),
  processingTime: integer("processing_time").default(0),
  temperature: text("temperature").default("0.1"),
  tags: text("tags").array(),
  metadata: json("metadata"),
  isPublic: boolean("is_public").default(false),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull()
});

// Schema definitions for validation
export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
  email: true,
});

export const insertPlatformSchema = createInsertSchema(platforms).pick({
  name: true,
  description: true,
  category: true,
  website: true,
});

export const insertPlatformFeatureSchema = createInsertSchema(platformFeatures).pick({
  platformId: true,
  featureName: true,
  description: true,
  category: true,
  isActive: true,
  metadata: true,
});

export const insertPlatformIntegrationSchema = createInsertSchema(platformIntegrations).pick({
  platformId: true,
  serviceName: true,
  serviceType: true,
  integrationDetails: true,
  isNative: true,
  metadata: true,
});

export const insertPlatformPricingSchema = createInsertSchema(platformPricing).pick({
  platformId: true,
  planName: true,
  pricePerMonth: true,
  features: true,
  limits: true,
  isPopular: true,
});

export const insertPromptGenerationSchema = createInsertSchema(promptGenerations).pick({
  userId: true,
  projectDescription: true,
  techStack: true,
  generatedPrompt: true,
  agentResults: true,
  status: true,
});

export const insertSavedPromptSchema = createInsertSchema(savedPrompts).pick({
  userId: true,
  title: true,
  description: true,
  prompt: true,
  tags: true,
  isPublic: true,
});

export const insertWorkflowSchema = createInsertSchema(workflows).pick({
  userId: true,
  name: true,
  description: true,
  definition: true,
  status: true,
  isTemplate: true,
});

export const insertKnowledgeBaseSchema = createInsertSchema(knowledgeBase).pick({
  title: true,
  content: true,
  category: true,
  tags: true,
  embedding: true,
  metadata: true,
  sourceFile: true,
});

export const insertDeepSeekSessionSchema = createInsertSchema(deepseekSessions).pick({
  userId: true,
  title: true,
  description: true,
  query: true,
  reasoning: true,
  response: true,
  ragEnabled: true,
  mcpEnabled: true,
  tokensUsed: true,
  reasoningTokens: true,
  responseTokens: true,
  processingTime: true,
  temperature: true,
  tags: true,
  metadata: true,
  isPublic: true,
});

// Type definitions
export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

export type InsertPlatform = z.infer<typeof insertPlatformSchema>;
export type Platform = typeof platforms.$inferSelect;

export type InsertPlatformFeature = z.infer<typeof insertPlatformFeatureSchema>;
export type PlatformFeature = typeof platformFeatures.$inferSelect;

export type InsertPlatformIntegration = z.infer<typeof insertPlatformIntegrationSchema>;
export type PlatformIntegration = typeof platformIntegrations.$inferSelect;

export type InsertPlatformPricing = z.infer<typeof insertPlatformPricingSchema>;
export type PlatformPricing = typeof platformPricing.$inferSelect;

export type InsertPromptGeneration = z.infer<typeof insertPromptGenerationSchema>;
export type PromptGeneration = typeof promptGenerations.$inferSelect;

export type InsertSavedPrompt = z.infer<typeof insertSavedPromptSchema>;
export type SavedPrompt = typeof savedPrompts.$inferSelect;

export type InsertWorkflow = z.infer<typeof insertWorkflowSchema>;
export type Workflow = typeof workflows.$inferSelect;

export type InsertKnowledgeBase = z.infer<typeof insertKnowledgeBaseSchema>;
export type KnowledgeBase = typeof knowledgeBase.$inferSelect;

export type InsertDeepSeekSession = z.infer<typeof insertDeepSeekSessionSchema>;
export type DeepSeekSession = typeof deepseekSessions.$inferSelect;
