import { db } from "./storage";
import fs from "fs";
import path from "path";
import { 
  platforms, 
  platformFeatures, 
  platformIntegrations, 
  platformPricing, 
  knowledgeBase 
} from "../shared/schema";

// Function to read attached asset files
function readAttachedAsset(filename: string): string {
  const filePath = path.join(process.cwd(), "attached_assets", filename);
  try {
    return fs.readFileSync(filePath, "utf-8");
  } catch (error) {
    console.error(`Error reading ${filename}:`, error);
    return "";
  }
}

export async function seedPlatformData() {
  console.log("Starting platform data seeding...");

  try {
    // Create platforms
    const [boltPlatform] = await db.insert(platforms).values({
      name: "Bolt (StackBlitz)",
      description: "AI-powered web development agent built on WebContainer technology for full-stack application creation",
      category: "AI Development Platform",
      website: "https://bolt.new"
    }).returning();

    const [cursorPlatform] = await db.insert(platforms).values({
      name: "Cursor",
      description: "AI-first code editor built as a VS Code fork with deep AI integration for enhanced developer productivity",
      category: "AI-First IDE",
      website: "https://cursor.com"
    }).returning();

    const [lovablePlatform] = await db.insert(platforms).values({
      name: "Lovable 2.0",
      description: "AI-powered platform for building production-ready applications through conversational AI interactions",
      category: "No-Code AI Platform",
      website: "https://lovable.dev"
    }).returning();

    const [replitPlatform] = await db.insert(platforms).values({
      name: "Replit",
      description: "Cloud-based development environment with AI Agent for no-code/low-code application development",
      category: "Cloud IDE with AI",
      website: "https://replit.com"
    }).returning();

    const [windsurfPlatform] = await db.insert(platforms).values({
      name: "Windsurf (Codeium)",
      description: "Agentic IDE with advanced AI capabilities and Model Context Protocol support for database development",
      category: "Agentic IDE",
      website: "https://windsurf.com"
    }).returning();

    // NEW PLATFORMS - Adding 5 additional no-code platforms
    const [base44Platform] = await db.insert(platforms).values({
      name: "Base44",
      description: "All-in-one AI platform that enables non-technical users to build fully functional, production-ready custom applications using natural language prompts",
      category: "All-in-One No-Code AI Platform",
      website: "https://base44.com"
    }).returning();

    const [rorkPlatform] = await db.insert(platforms).values({
      name: "Rork",
      description: "Specialized AI-powered platform focused on generating native mobile applications for both iOS and Android from natural language prompts",
      category: "Mobile-First No-Code Platform",
      website: "https://rork.com"
    }).returning();

    const [v0Platform] = await db.insert(platforms).values({
      name: "V0 by Vercel",
      description: "Generative UI system from Vercel designed to create high-quality UI components from text or image prompts",
      category: "UI Generator Platform",
      website: "https://v0.dev"
    }).returning();

    const [claudeCodePlatform] = await db.insert(platforms).values({
      name: "Claude Code",
      description: "Security-first, terminal-based CLI tool from Anthropic providing unopinionated, low-level access to Claude models for agentic coding",
      category: "CLI Agent Platform",
      website: "https://claude.ai/cli"
    }).returning();

    const [geminiCLIPlatform] = await db.insert(platforms).values({
      name: "Gemini CLI",
      description: "Google's open-source terminal-based AI agent using ReAct loop architecture for reasoning and acting",
      category: "Open-Source CLI Agent",
      website: "https://github.com/google/gemini-cli"
    }).returning();

    console.log("All 10 platforms created successfully");

    // Seed platform features
    const boltFeatures = [
      {
        platformId: boltPlatform.id,
        featureName: "Prompt-Based Generation",
        description: "Core interaction model using natural language prompts to generate full-stack applications",
        category: "core",
        metadata: { type: "ai-generation" }
      },
      {
        platformId: boltPlatform.id,
        featureName: "Enhanced Prompt Feature",
        description: "Icon-indicated feature for structured information input with AI guidance",
        category: "core",
        metadata: { type: "prompt-enhancement" }
      },
      {
        platformId: boltPlatform.id,
        featureName: "AI Environment Control",
        description: "AI controls filesystem, Node.js server, package manager, terminal, and browser console",
        category: "ai",
        metadata: { capabilities: ["filesystem", "server", "npm", "terminal", "console"] }
      },
      {
        platformId: boltPlatform.id,
        featureName: "Browser-Based IDE",
        description: "Complete development environment with WebContainer technology",
        category: "development",
        metadata: { technology: "WebContainer" }
      },
      {
        platformId: boltPlatform.id,
        featureName: "Discussion Mode",
        description: "Leverages Gemini 2.0 Flash with search grounding for project insights and debugging",
        category: "ai",
        metadata: { model: "Gemini 2.0 Flash" }
      },
      {
        platformId: boltPlatform.id,
        featureName: "One-Click Deployment",
        description: "Integrated deployment directly to Netlify with project claiming",
        category: "deployment",
        metadata: { provider: "Netlify" }
      }
    ];

    await db.insert(platformFeatures).values(boltFeatures);

    // Seed platform integrations
    const integrations = [
      // Bolt integrations
      { platformId: boltPlatform.id, serviceName: "Netlify", serviceType: "deployment", isNative: true, integrationDetails: "One-click deployment and hosting" },
      { platformId: boltPlatform.id, serviceName: "Supabase", serviceType: "backend", isNative: true, integrationDetails: "Database, auth, storage integration" },
      { platformId: boltPlatform.id, serviceName: "GitHub", serviceType: "version-control", isNative: true, integrationDetails: "Direct repo integration and automation" },
      { platformId: boltPlatform.id, serviceName: "Expo", serviceType: "mobile", isNative: true, integrationDetails: "Mobile app development platform" },
      { platformId: boltPlatform.id, serviceName: "Figma (via Anima)", serviceType: "design", isNative: true, integrationDetails: "Design-to-code conversion" },
      { platformId: boltPlatform.id, serviceName: "Stripe", serviceType: "payment", isNative: true, integrationDetails: "Payment processing integration" }
    ];

    await db.insert(platformIntegrations).values(integrations);

    // Seed platform pricing
    const pricingPlans = [
      // Bolt pricing
      { platformId: boltPlatform.id, planName: "Free", pricePerMonth: "Free", features: ["StackBlitz IDE", "Unlimited public projects", "GitHub repos", "1MB file uploads"], limits: { dailyTokens: "limited" } },
      { platformId: boltPlatform.id, planName: "Pro", pricePerMonth: "$18-20", features: ["All Personal features", "Unlimited file uploads", "CORS APIs", "Localhost connection"], limits: { tokens: "10M/month" } },
      { platformId: boltPlatform.id, planName: "Teams", pricePerMonth: "$55-60", features: ["All Pro features", "Team collaboration", "Private repos", "Team management"], limits: { members: "up to 10" } },
      { platformId: boltPlatform.id, planName: "Enterprise", pricePerMonth: "Custom", features: ["All Teams features", "WebContainer API", "GitLab/Bitbucket", "Custom security"], limits: { members: "10+" } }
    ];

    await db.insert(platformPricing).values(pricingPlans);

    // Seed knowledge base with key content
    const knowledgeEntries = [
      {
        title: "Bolt.new AI Web Development Agent Overview",
        content: "Bolt.new is an AI-powered web development agent built on WebContainer technology. It enables prompt-based generation of full-stack applications with AI control over filesystem, Node.js server, package manager, terminal, and browser console. Key features include Discussion Mode with Gemini 2.0 Flash, one-click Netlify deployment, and comprehensive integrations with Supabase, GitHub, and Expo.",
        category: "platform-overview",
        tags: ["bolt", "ai-agent", "webcontainer", "full-stack"],
        sourceFile: "boltdata_1751004274086.txt"
      },
      {
        title: "Cursor AI-First Code Editor Architecture",
        content: "Cursor is built as a VS Code fork with deep AI integration. Features include codebase indexing with embeddings, custom retrieval models, @-symbols for context control, Tab autocomplete, Composer for multi-file editing, and .cursorrules for AI behavior customization. Supports multiple AI models including GPT-4, Claude, and Gemini.",
        category: "platform-overview",
        tags: ["cursor", "vscode-fork", "ai-integration", "codebase-indexing"],
        sourceFile: "Cursordata_1751004274086.txt"
      }
    ];

    await db.insert(knowledgeBase).values(knowledgeEntries);

    console.log("Platform data seeding completed successfully!");

  } catch (error) {
    console.error("Error during platform data seeding:", error);
    throw error;
  }
}