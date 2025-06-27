import { storage } from "./storage";
import fs from "fs";
import path from "path";

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
    const boltPlatform = await storage.createPlatform({
      name: "Bolt (StackBlitz)",
      description: "AI-powered web development agent built on WebContainer technology for full-stack application creation",
      category: "AI Development Platform",
      website: "https://bolt.new"
    });

    const cursorPlatform = await storage.createPlatform({
      name: "Cursor",
      description: "AI-first code editor built as a VS Code fork with deep AI integration for enhanced developer productivity",
      category: "AI-First IDE",
      website: "https://cursor.com"
    });

    const lovablePlatform = await storage.createPlatform({
      name: "Lovable 2.0",
      description: "AI-powered platform for building production-ready applications through conversational AI interactions",
      category: "No-Code AI Platform",
      website: "https://lovable.dev"
    });

    const replitPlatform = await storage.createPlatform({
      name: "Replit",
      description: "Cloud-based development environment with AI Agent for no-code/low-code application development",
      category: "Cloud IDE with AI",
      website: "https://replit.com"
    });

    const windsurfPlatform = await storage.createPlatform({
      name: "Windsurf (Codeium)",
      description: "Agentic IDE with advanced AI capabilities and Model Context Protocol support for database development",
      category: "Agentic IDE",
      website: "https://windsurf.com"
    });

    console.log("Platforms created successfully");

    // Seed Bolt features
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

    for (const feature of boltFeatures) {
      await storage.createPlatformFeature(feature);
    }

    // Seed Cursor features
    const cursorFeatures = [
      {
        platformId: cursorPlatform.id,
        featureName: "Codebase Indexing",
        description: "Computes embeddings for each file to improve AI suggestions and codebase understanding",
        category: "ai",
        metadata: { technology: "embeddings" }
      },
      {
        platformId: cursorPlatform.id,
        featureName: "Custom Retrieval Models",
        description: "Reduces manual context provision through intelligent codebase understanding",
        category: "ai",
        metadata: { type: "context-retrieval" }
      },
      {
        platformId: cursorPlatform.id,
        featureName: "@-Symbols",
        description: "Precise context control with @files, @folders, @Docs, @Web, @git, @Recent Changes",
        category: "core",
        metadata: { symbols: ["@files", "@folders", "@Docs", "@Web", "@git", "@Recent Changes"] }
      },
      {
        platformId: cursorPlatform.id,
        featureName: "Tab Autocomplete",
        description: "AI-powered code completion with multi-line suggestions and smart rewrites",
        category: "ai",
        metadata: { type: "autocomplete" }
      },
      {
        platformId: cursorPlatform.id,
        featureName: "Composer",
        description: "Multi-file editing agent for complex codebase modifications",
        category: "ai",
        metadata: { type: "multi-file-agent" }
      },
      {
        platformId: cursorPlatform.id,
        featureName: "Rules (.cursorrules)",
        description: "Global and project-specific rules to guide AI behavior",
        category: "core",
        metadata: { configuration: "cursorrules" }
      }
    ];

    for (const feature of cursorFeatures) {
      await storage.createPlatformFeature(feature);
    }

    // Seed Lovable features
    const lovableFeatures = [
      {
        platformId: lovablePlatform.id,
        featureName: "Vibe Coding",
        description: "AI-powered development through natural language descriptions with rapid iteration focus",
        category: "ai",
        metadata: { philosophy: "trust-ai-generation" }
      },
      {
        platformId: lovablePlatform.id,
        featureName: "Multiplayer Collaboration",
        description: "Real-time co-editing and shared team workspaces with tiered access",
        category: "collaboration",
        metadata: { technology: "WebSockets", maxUsers: 20 }
      },
      {
        platformId: lovablePlatform.id,
        featureName: "Agentic Chat Mode",
        description: "Intelligent chat agent for planning and debugging without direct code modification",
        category: "ai",
        metadata: { capabilities: ["planning", "debugging", "multi-step-reasoning"] }
      },
      {
        platformId: lovablePlatform.id,
        featureName: "Dev Mode",
        description: "Direct editing of underlying project code within Lovable interface",
        category: "development",
        metadata: { access: "paid-plans" }
      },
      {
        platformId: lovablePlatform.id,
        featureName: "Visual Edits",
        description: "Visual modification of application styling similar to Figma/Webflow",
        category: "design",
        metadata: { capabilities: ["padding", "margins", "alignment"] }
      },
      {
        platformId: lovablePlatform.id,
        featureName: "Security Scan",
        description: "Automatic vulnerability scanning, especially for Supabase-connected projects",
        category: "security",
        metadata: { focus: "Supabase", checks: ["RLS", "data-exposure"] }
      }
    ];

    for (const feature of lovableFeatures) {
      await storage.createPlatformFeature(feature);
    }

    // Seed Replit features
    const replitFeatures = [
      {
        platformId: replitPlatform.id,
        featureName: "Replit Agent",
        description: "AI agent for no-code application development with structured lifecycle",
        category: "ai",
        metadata: { capabilities: ["build-planning", "code-generation", "deployment"] }
      },
      {
        platformId: replitPlatform.id,
        featureName: "Zero Setup Development",
        description: "Instant development environment with pre-installed dependencies",
        category: "development",
        metadata: { setup: "instant" }
      },
      {
        platformId: replitPlatform.id,
        featureName: "Integrated Services",
        description: "Seamless integration with databases, authentication, and third-party APIs",
        category: "integration",
        metadata: { services: ["PostgreSQL", "auth", "external-APIs"] }
      },
      {
        platformId: replitPlatform.id,
        featureName: "Multiple Deployment Types",
        description: "Autoscale, Static, Reserved VM, and Scheduled deployments",
        category: "deployment",
        metadata: { types: ["autoscale", "static", "reserved-vm", "scheduled"] }
      },
      {
        platformId: replitPlatform.id,
        featureName: "Mobile Development with Expo",
        description: "Extended capabilities for mobile app development through Expo integration",
        category: "mobile",
        metadata: { platform: "Expo", preview: "QR-code" }
      }
    ];

    for (const feature of replitFeatures) {
      await storage.createPlatformFeature(feature);
    }

    // Seed Windsurf features
    const windsurfFeatures = [
      {
        platformId: windsurfPlatform.id,
        featureName: "Cascade AI Agent",
        description: "Primary AI agent with full codebase contextual awareness and multi-file editing",
        category: "ai",
        metadata: { modes: ["Write Mode", "Chat Mode"], capabilities: ["multi-file-edits", "debugging"] }
      },
      {
        platformId: windsurfPlatform.id,
        featureName: "Model Context Protocol (MCP)",
        description: "Connect to external tools and services including database management systems",
        category: "integration",
        metadata: { databases: ["PostgreSQL", "MongoDB", "MySQL"], servers: "MCP" }
      },
      {
        platformId: windsurfPlatform.id,
        featureName: "Inline AI",
        description: "Targeted modifications using natural language commands (Cmd+I / Ctrl+I)",
        category: "ai",
        metadata: { trigger: "Cmd+I / Ctrl+I" }
      },
      {
        platformId: windsurfPlatform.id,
        featureName: "Supercomplete",
        description: "Advanced autocompletion predicting developer intent for substantial code generation",
        category: "ai",
        metadata: { type: "predictive-completion" }
      },
      {
        platformId: windsurfPlatform.id,
        featureName: "AI Terminal",
        description: "Natural language terminal command generation for database CLI tools",
        category: "ai",
        metadata: { capabilities: ["CLI-generation", "database-commands"] }
      }
    ];

    for (const feature of windsurfFeatures) {
      await storage.createPlatformFeature(feature);
    }

    console.log("Platform features created successfully");

    // Seed platform integrations
    const integrations = [
      // Bolt integrations
      { platformId: boltPlatform.id, serviceName: "Netlify", serviceType: "deployment", isNative: true, integrationDetails: "One-click deployment and hosting" },
      { platformId: boltPlatform.id, serviceName: "Supabase", serviceType: "backend", isNative: true, integrationDetails: "Database, auth, storage integration" },
      { platformId: boltPlatform.id, serviceName: "GitHub", serviceType: "version-control", isNative: true, integrationDetails: "Direct repo integration and automation" },
      { platformId: boltPlatform.id, serviceName: "Expo", serviceType: "mobile", isNative: true, integrationDetails: "Mobile app development platform" },
      { platformId: boltPlatform.id, serviceName: "Figma (via Anima)", serviceType: "design", isNative: true, integrationDetails: "Design-to-code conversion" },
      { platformId: boltPlatform.id, serviceName: "Stripe", serviceType: "payment", isNative: true, integrationDetails: "Payment processing integration" },
      
      // Cursor integrations
      { platformId: cursorPlatform.id, serviceName: "OpenAI", serviceType: "ai-model", isNative: true, integrationDetails: "GPT-4, GPT-4o, o1, o3 series models" },
      { platformId: cursorPlatform.id, serviceName: "Anthropic", serviceType: "ai-model", isNative: true, integrationDetails: "Claude series models including 3.5 Sonnet" },
      { platformId: cursorPlatform.id, serviceName: "Google", serviceType: "ai-model", isNative: true, integrationDetails: "Gemini models including 2.5 Pro" },
      { platformId: cursorPlatform.id, serviceName: "xAI", serviceType: "ai-model", isNative: true, integrationDetails: "Grok models series" },
      
      // Lovable integrations
      { platformId: lovablePlatform.id, serviceName: "GitHub", serviceType: "version-control", isNative: true, integrationDetails: "Deep real-time two-way sync" },
      { platformId: lovablePlatform.id, serviceName: "Supabase", serviceType: "backend", isNative: true, integrationDetails: "Comprehensive backend integration" },
      { platformId: lovablePlatform.id, serviceName: "Stripe", serviceType: "payment", isNative: true, integrationDetails: "Native payment processing" },
      { platformId: lovablePlatform.id, serviceName: "Replicate", serviceType: "ai-media", isNative: true, integrationDetails: "AI-generated media (images, video, audio)" },
      { platformId: lovablePlatform.id, serviceName: "Builder.io", serviceType: "design", isNative: false, integrationDetails: "Figma import capability" },
      
      // Replit integrations
      { platformId: replitPlatform.id, serviceName: "PostgreSQL", serviceType: "database", isNative: true, integrationDetails: "Managed PostgreSQL database" },
      { platformId: replitPlatform.id, serviceName: "Expo", serviceType: "mobile", isNative: true, integrationDetails: "Mobile app development and deployment" },
      { platformId: replitPlatform.id, serviceName: "Netlify", serviceType: "deployment", isNative: false, integrationDetails: "Static site deployment option" },
      { platformId: replitPlatform.id, serviceName: "GitHub", serviceType: "version-control", isNative: false, integrationDetails: "Repository integration" },
      
      // Windsurf integrations
      { platformId: windsurfPlatform.id, serviceName: "Neon", serviceType: "database", isNative: true, integrationDetails: "PostgreSQL via MCP server" },
      { platformId: windsurfPlatform.id, serviceName: "Prisma", serviceType: "orm", isNative: true, integrationDetails: "Database ORM via MCP server" },
      { platformId: windsurfPlatform.id, serviceName: "MongoDB", serviceType: "database", isNative: true, integrationDetails: "NoSQL database via MCP" },
      { platformId: windsurfPlatform.id, serviceName: "MySQL", serviceType: "database", isNative: true, integrationDetails: "Relational database via MCP" }
    ];

    for (const integration of integrations) {
      await storage.createPlatformIntegration(integration);
    }

    console.log("Platform integrations created successfully");

    // Seed platform pricing
    const pricingPlans = [
      // Bolt pricing
      { platformId: boltPlatform.id, planName: "Free", pricePerMonth: "Free", features: ["StackBlitz IDE", "Unlimited public projects", "GitHub repos", "1MB file uploads"], limits: { dailyTokens: "limited" } },
      { platformId: boltPlatform.id, planName: "Pro", pricePerMonth: "$18-20", features: ["All Personal features", "Unlimited file uploads", "CORS APIs", "Localhost connection"], limits: { tokens: "10M/month" } },
      { platformId: boltPlatform.id, planName: "Teams", pricePerMonth: "$55-60", features: ["All Pro features", "Team collaboration", "Private repos", "Team management"], limits: { members: "up to 10" } },
      { platformId: boltPlatform.id, planName: "Enterprise", pricePerMonth: "Custom", features: ["All Teams features", "WebContainer API", "GitLab/Bitbucket", "Custom security"], limits: { members: "10+" } },
      
      // Cursor pricing
      { platformId: cursorPlatform.id, planName: "Free", pricePerMonth: "Free", features: ["Basic AI features", "Limited requests"], limits: { requests: "200/month" } },
      { platformId: cursorPlatform.id, planName: "Pro", pricePerMonth: "$20", features: ["Unlimited autocomplete", "500 premium requests", "GPT-4", "Claude"], limits: { premiumRequests: "500/month", files: "50K" } },
      { platformId: cursorPlatform.id, planName: "Business", pricePerMonth: "$40", features: ["All Pro features", "Privacy mode", "Admin features"], limits: { files: "250K", enforced: "privacy" } },
      
      // Lovable pricing
      { platformId: lovablePlatform.id, planName: "Free", pricePerMonth: "Free", features: ["Public projects", "Basic AI"], limits: { credits: "30/month", projects: "public only" } },
      { platformId: lovablePlatform.id, planName: "Pro", pricePerMonth: "$25-30", features: ["Private projects", "Custom domains", "Remove badge"], limits: { credits: "100/month", editors: "3/project" } },
      { platformId: lovablePlatform.id, planName: "Teams", pricePerMonth: "$30+", features: ["All Pro features", "Team workspaces", "Shared credits"], limits: { seats: "20", credits: "shared pool" } },
      { platformId: lovablePlatform.id, planName: "Enterprise", pricePerMonth: "Custom", features: ["Custom support", "SSO", "Data training opt-out"], limits: { custom: "tailored" } },
      
      // Replit pricing
      { platformId: replitPlatform.id, planName: "Starter", pricePerMonth: "Free", features: ["Basic Replit", "Public repls"], limits: { compute: "limited", storage: "1GB" } },
      { platformId: replitPlatform.id, planName: "Core", pricePerMonth: "$1+", features: ["Autoscale deployments", "Static deployments", "AI features"], limits: { deployment: "100 GiB transfer" } },
      { platformId: replitPlatform.id, planName: "Reserved VM", pricePerMonth: "$10+", features: ["Always-on applications", "High uptime", "Dedicated resources"], limits: { uptime: "99.9%" } },
      
      // Windsurf pricing
      { platformId: windsurfPlatform.id, planName: "Free", pricePerMonth: "Free", features: ["Basic AI features", "Local indexing"], limits: { credits: "limited" } },
      { platformId: windsurfPlatform.id, planName: "Pro", pricePerMonth: "TBD", features: ["Advanced AI", "Cascade agent", "Premium models"], limits: { credits: "extended" } }
    ];

    for (const pricing of pricingPlans) {
      await storage.createPlatformPricing(pricing);
    }

    console.log("Platform pricing created successfully");

    // Seed knowledge base with key content from attached assets
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
      },
      {
        title: "Lovable 2.0 Vibe Coding Philosophy",
        content: "Lovable 2.0 promotes 'vibe coding' - trusting AI for rapid code generation with features like Multiplayer Collaboration, Agentic Chat Mode, Dev Mode, Visual Edits, and Security Scan. Built with Claude Sonnet 3.7, React/Tailwind frontend, and deep Supabase integration for full-stack development.",
        category: "platform-overview",
        tags: ["lovable", "vibe-coding", "no-code", "collaboration"],
        sourceFile: "lovable2.0 data_1751004274087.txt"
      },
      {
        title: "Replit Agent No-Code Development Lifecycle",
        content: "Replit Agent enables no-code application development through structured lifecycle: idea articulation, build plan generation, iterative development with checkpoints, and multiple deployment options (Autoscale, Static, Reserved VM, Scheduled). Includes Expo integration for mobile development and comprehensive third-party service automation.",
        category: "platform-overview",
        tags: ["replit", "no-code", "lifecycle", "deployment"],
        sourceFile: "Replitdata_1751004274087.txt"
      },
      {
        title: "Windsurf Agentic IDE with MCP Integration",
        content: "Windsurf (formerly Codeium) is an agentic IDE featuring Cascade AI agent with full codebase awareness, Model Context Protocol (MCP) for external tool integration, Inline AI for targeted modifications, Supercomplete for predictive code generation, and AI Terminal for natural language command generation. Specialized for database development with PostgreSQL, MongoDB, and MySQL support.",
        category: "platform-overview",
        tags: ["windsurf", "agentic-ide", "mcp", "database-development"],
        sourceFile: "windsurfdata_1751004274088.txt"
      }
    ];

    for (const entry of knowledgeEntries) {
      await storage.createKnowledgeBaseEntry(entry);
    }

    console.log("Knowledge base entries created successfully");
    console.log("Platform data seeding completed!");

  } catch (error) {
    console.error("Error during platform data seeding:", error);
    throw error;
  }
}