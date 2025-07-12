import { 
  users, 
  platforms,
  platformFeatures,
  platformIntegrations,
  platformPricing,
  platformCapabilities,
  promptGenerations,
  savedPrompts,
  workflows,
  workflowExecutions,
  knowledgeBase,
  type User, 
  type InsertUser,
  type Platform,
  type InsertPlatform,
  type PlatformFeature,
  type InsertPlatformFeature,
  type PlatformIntegration,
  type InsertPlatformIntegration,
  type PlatformPricing,
  type InsertPlatformPricing,
  type PromptGeneration,
  type InsertPromptGeneration,
  type SavedPrompt,
  type InsertSavedPrompt,
  type Workflow,
  type InsertWorkflow,
  type KnowledgeBase,
  type InsertKnowledgeBase
} from "@shared/schema";
import { db } from "./db";
import { eq, ilike, or, sql } from "drizzle-orm";

export interface IStorage {
  // User management
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;

  // Platform management
  getAllPlatforms(): Promise<Platform[]>;
  getPlatform(id: number): Promise<Platform | undefined>;
  createPlatform(platform: InsertPlatform): Promise<Platform>;

  // Platform features
  getPlatformFeatures(platformId: number): Promise<PlatformFeature[]>;
  createPlatformFeature(feature: InsertPlatformFeature): Promise<PlatformFeature>;

  // Platform integrations
  getPlatformIntegrations(platformId: number): Promise<PlatformIntegration[]>;
  createPlatformIntegration(integration: InsertPlatformIntegration): Promise<PlatformIntegration>;

  // Platform pricing
  getPlatformPricing(platformId: number): Promise<PlatformPricing[]>;
  createPlatformPricing(pricing: InsertPlatformPricing): Promise<PlatformPricing>;

  // Prompt generation
  createPromptGeneration(generation: InsertPromptGeneration): Promise<PromptGeneration>;
  getPromptGeneration(id: number): Promise<PromptGeneration | undefined>;
  getUserPromptGenerations(userId: number): Promise<PromptGeneration[]>;

  // Saved prompts
  createSavedPrompt(prompt: InsertSavedPrompt): Promise<SavedPrompt>;
  getUserSavedPrompts(userId: number): Promise<SavedPrompt[]>;
  getPublicSavedPrompts(): Promise<SavedPrompt[]>;

  // Workflows
  createWorkflow(workflow: InsertWorkflow): Promise<Workflow>;
  getUserWorkflows(userId: number): Promise<Workflow[]>;
  getWorkflowTemplates(): Promise<Workflow[]>;

  // Knowledge base
  createKnowledgeBaseEntry(entry: InsertKnowledgeBase): Promise<KnowledgeBase>;
  searchKnowledgeBase(query: string, category?: string): Promise<KnowledgeBase[]>;
  getAllKnowledgeBase(): Promise<KnowledgeBase[]>;
}

// Database storage implementation
export class DatabaseStorage implements IStorage {
  // User management
  async getUser(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user || undefined;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user || undefined;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(insertUser)
      .returning();
    return user;
  }

  // Platform management
  async getAllPlatforms(): Promise<Platform[]> {
    return await db.select().from(platforms);
  }

  async getPlatform(id: number): Promise<Platform | undefined> {
    const [platform] = await db.select().from(platforms).where(eq(platforms.id, id));
    return platform || undefined;
  }

  async createPlatform(platform: InsertPlatform): Promise<Platform> {
    const [newPlatform] = await db
      .insert(platforms)
      .values(platform)
      .returning();
    return newPlatform;
  }

  // Platform features
  async getPlatformFeatures(platformId: number): Promise<PlatformFeature[]> {
    return await db.select().from(platformFeatures).where(eq(platformFeatures.platformId, platformId));
  }

  async createPlatformFeature(feature: InsertPlatformFeature): Promise<PlatformFeature> {
    const [newFeature] = await db
      .insert(platformFeatures)
      .values(feature)
      .returning();
    return newFeature;
  }

  // Platform integrations
  async getPlatformIntegrations(platformId: number): Promise<PlatformIntegration[]> {
    try {
      // Check if table exists and has the required columns
      const result = await db.execute(sql`
        SELECT column_name 
        FROM information_schema.columns 
        WHERE table_name = 'platform_integrations' 
        AND column_name IN ('id', 'platform_id', 'integration_type', 'name')
      `);
      
      if (result.rows.length < 4) {
        console.warn('Platform integrations table missing required columns, returning empty array');
        return [];
      }
      
      return await db.select().from(platformIntegrations).where(eq(platformIntegrations.platformId, platformId));
    } catch (error) {
      console.warn('Platform integrations query failed:', error);
      return [];
    }
  }

  async createPlatformIntegration(integration: InsertPlatformIntegration): Promise<PlatformIntegration> {
    const [newIntegration] = await db
      .insert(platformIntegrations)
      .values(integration)
      .returning();
    return newIntegration;
  }

  // Platform pricing
  async getPlatformPricing(platformId: number): Promise<PlatformPricing[]> {
    try {
      // Check if table exists and has the required columns
      const result = await db.execute(sql`
        SELECT column_name 
        FROM information_schema.columns 
        WHERE table_name = 'platform_pricing' 
        AND column_name IN ('id', 'platform_id', 'tier_name', 'price')
      `);
      
      if (result.rows.length < 4) {
        console.warn('Platform pricing table missing required columns, returning empty array');
        return [];
      }
      
      return await db.select().from(platformPricing).where(eq(platformPricing.platformId, platformId));
    } catch (error) {
      console.warn('Platform pricing query failed:', error);
      return [];
    }
  }

  async createPlatformPricing(pricing: InsertPlatformPricing): Promise<PlatformPricing> {
    const [newPricing] = await db
      .insert(platformPricing)
      .values(pricing)
      .returning();
    return newPricing;
  }

  // Prompt generation
  async createPromptGeneration(generation: InsertPromptGeneration): Promise<PromptGeneration> {
    const [newGeneration] = await db
      .insert(promptGenerations)
      .values(generation)
      .returning();
    return newGeneration;
  }

  async getPromptGeneration(id: number): Promise<PromptGeneration | undefined> {
    const [generation] = await db.select().from(promptGenerations).where(eq(promptGenerations.id, id));
    return generation || undefined;
  }

  async getUserPromptGenerations(userId: number): Promise<PromptGeneration[]> {
    return await db.select().from(promptGenerations).where(eq(promptGenerations.userId, userId));
  }

  // Saved prompts
  async createSavedPrompt(prompt: InsertSavedPrompt): Promise<SavedPrompt> {
    const [newPrompt] = await db
      .insert(savedPrompts)
      .values(prompt)
      .returning();
    return newPrompt;
  }

  async getUserSavedPrompts(userId: number): Promise<SavedPrompt[]> {
    return await db.select().from(savedPrompts).where(eq(savedPrompts.userId, userId));
  }

  async getPublicSavedPrompts(): Promise<SavedPrompt[]> {
    return await db.select().from(savedPrompts).where(eq(savedPrompts.isPublic, true));
  }

  // Workflows
  async createWorkflow(workflow: InsertWorkflow): Promise<Workflow> {
    const [newWorkflow] = await db
      .insert(workflows)
      .values(workflow)
      .returning();
    return newWorkflow;
  }

  async getUserWorkflows(userId: number): Promise<Workflow[]> {
    return await db.select().from(workflows).where(eq(workflows.userId, userId));
  }

  async getWorkflowTemplates(): Promise<Workflow[]> {
    return await db.select().from(workflows).where(eq(workflows.isTemplate, true));
  }

  // Knowledge base
  async createKnowledgeBaseEntry(entry: InsertKnowledgeBase): Promise<KnowledgeBase> {
    const [newEntry] = await db
      .insert(knowledgeBase)
      .values(entry)
      .returning();
    return newEntry;
  }

  async searchKnowledgeBase(query: string, category?: string): Promise<KnowledgeBase[]> {
    const conditions = [];

    // Add text search conditions
    if (query) {
      conditions.push(
        or(
          ilike(knowledgeBase.title, `%${query}%`),
          ilike(knowledgeBase.content, `%${query}%`)
        )
      );
    }

    // Add category filter if provided
    if (category) {
      conditions.push(eq(knowledgeBase.category, category));
    }

    if (conditions.length === 0) {
      return await db.select().from(knowledgeBase);
    }

    return await db.select().from(knowledgeBase).where(
      conditions.length === 1 ? conditions[0] : or(...conditions)
    );
  }

  async getAllKnowledgeBase(): Promise<KnowledgeBase[]> {
    return await db.select().from(knowledgeBase);
  }
}

export const storage = new DatabaseStorage();
import { drizzle } from 'drizzle-orm/neon-serverless';
import { Pool, neonConfig } from '@neondatabase/serverless';
import ws from 'ws';
import * as schema from "@shared/schema";

neonConfig.webSocketConstructor = ws;

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error('DATABASE_URL is not set');
}

// Configure connection pool with better timeout settings
const pool = new Pool({ 
  connectionString,
  max: 5,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 15000,
  acquireTimeoutMillis: 5000,
  createTimeoutMillis: 10000
});

// Add error handling for pool
pool.on('error', (err) => {
  console.warn('Database pool error:', err.message);
});

export const db = drizzle({ client: pool, schema });