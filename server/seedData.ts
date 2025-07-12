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

    // NEW PLATFORMS - Adding 5 additional no-code platforms

    const base44Platform = await storage.createPlatform({
      name: "Base44",
      description: "All-in-one AI platform that enables non-technical users to build fully functional, production-ready custom applications using natural language prompts",
      category: "All-in-One No-Code AI Platform",
      website: "https://base44.com"
    });

    const rorkPlatform = await storage.createPlatform({
      name: "Rork",
      description: "Specialized AI-powered platform focused on generating native mobile applications for both iOS and Android from natural language prompts",
      category: "Mobile-First No-Code Platform",
      website: "https://rork.com"
    });

    const v0Platform = await storage.createPlatform({
      name: "V0 by Vercel",
      description: "Generative UI system from Vercel designed to create high-quality UI components from text or image prompts",
      category: "UI Generator Platform",
      website: "https://v0.dev"
    });

    const claudeCodePlatform = await storage.createPlatform({
      name: "Claude Code",
      description: "Security-first, terminal-based CLI tool from Anthropic providing unopinionated, low-level access to Claude models for agentic coding",
      category: "CLI Agent Platform",
      website: "https://claude.ai/cli"
    });

    const geminiCLIPlatform = await storage.createPlatform({
      name: "Gemini CLI",
      description: "Google's open-source, terminal-based AI agent using ReAct loop and built-in tools for complex development tasks",
      category: "Open-Source CLI Agent",
      website: "https://github.com/google/gemini-cli"
    });

    console.log("All 10 platforms created successfully");

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

    // NEW PLATFORM FEATURES - Base44
    const base44Features = [
      {
        platformId: base44Platform.id,
        featureName: "Conversational App Generation",
        description: "Chat-based interface where AI interprets user ideas and generates complete applications",
        category: "core",
        metadata: { type: "ai-generation" }
      },
      {
        platformId: base44Platform.id,
        featureName: "Built-in Database System",
        description: "Fully integrated database system eliminating need for external services like Supabase",
        category: "database",
        metadata: { type: "integrated-backend" }
      },
      {
        platformId: base44Platform.id,
        featureName: "Instant Deployment",
        description: "Automatic and instant deployment with built-in hosting and shareable URLs",
        category: "deployment",
        metadata: { type: "hosting" }
      },
      {
        platformId: base44Platform.id,
        featureName: "User Authentication",
        description: "Built-in user management and authentication with industry-standard encryption",
        category: "authentication",
        metadata: { type: "security" }
      },
      {
        platformId: base44Platform.id,
        featureName: "GitHub Integration",
        description: "Formal integration with GitHub for version control (Builder plan and higher)",
        category: "integration",
        metadata: { type: "version-control" }
      }
    ];

    // NEW PLATFORM FEATURES - Rork
    const rorkFeatures = [
      {
        platformId: rorkPlatform.id,
        featureName: "React Native Generation",
        description: "Built on React Native and Expo toolchain for cross-platform mobile applications",
        category: "core",
        metadata: { type: "mobile-framework" }
      },
      {
        platformId: rorkPlatform.id,
        featureName: "Visual Prompt Support",
        description: "Supports both text and image-based prompts including screenshots and mockups",
        category: "core",
        metadata: { type: "prompt-types" }
      },
      {
        platformId: rorkPlatform.id,
        featureName: "In-Browser Emulator",
        description: "Real-time testing with in-browser emulator and physical device testing via Expo Go",
        category: "testing",
        metadata: { type: "emulation" }
      },
      {
        platformId: rorkPlatform.id,
        featureName: "App Store Publishing",
        description: "Facilitates building and publishing to Apple App Store and Google Play Store",
        category: "deployment",
        metadata: { type: "mobile-publishing" }
      },
      {
        platformId: rorkPlatform.id,
        featureName: "Backend Integration",
        description: "Experimental backend functionality with Supabase, Firebase, and Airtable",
        category: "integration",
        metadata: { type: "backend-services" }
      }
    ];

    // NEW PLATFORM FEATURES - V0 by Vercel
    const v0Features = [
      {
        platformId: v0Platform.id,
        featureName: "UI Component Generation",
        description: "Transforms natural language or design mockups into multiple UI variations",
        category: "core",
        metadata: { type: "ui-generation" }
      },
      {
        platformId: v0Platform.id,
        featureName: "Iterative Refinement",
        description: "Users can iteratively customize generated components via chat interface",
        category: "core",
        metadata: { type: "refinement" }
      },
      {
        platformId: v0Platform.id,
        featureName: "Framework Support",
        description: "Supports React (JSX), Vue, Svelte, and plain HTML/CSS generation",
        category: "framework",
        metadata: { type: "multi-framework" }
      },
      {
        platformId: v0Platform.id,
        featureName: "Vercel Integration",
        description: "Tightly integrated with Vercel platform for seamless one-click deployment",
        category: "deployment",
        metadata: { type: "platform-integration" }
      },
      {
        platformId: v0Platform.id,
        featureName: "Custom AI Model",
        description: "Powered by proprietary v0-1.0-md model fine-tuned for framework-aware generation",
        category: "ai",
        metadata: { type: "custom-model" }
      }
    ];

    // NEW PLATFORM FEATURES - Claude Code
    const claudeCodeFeatures = [
      {
        platformId: claudeCodePlatform.id,
        featureName: "Terminal-Based Interface",
        description: "Security-first terminal-based CLI providing direct access to Claude models",
        category: "core",
        metadata: { type: "cli-interface" }
      },
      {
        platformId: claudeCodePlatform.id,
        featureName: "Granular Permissions",
        description: "Security-first design with granular permissions and access control",
        category: "security",
        metadata: { type: "access-control" }
      },
      {
        platformId: claudeCodePlatform.id,
        featureName: "MCP Extensibility",
        description: "Highly scriptable and extensible via Model Context Protocol for external tools",
        category: "integration",
        metadata: { type: "mcp-support" }
      },
      {
        platformId: claudeCodePlatform.id,
        featureName: "GitHub Integration",
        description: "Direct orchestration of GitHub and databases from terminal interface",
        category: "integration",
        metadata: { type: "github-integration" }
      },
      {
        platformId: claudeCodePlatform.id,
        featureName: "Claude Model Access",
        description: "Unopinionated access to Claude 3.7 Sonnet and Claude 4 Opus models",
        category: "ai",
        metadata: { type: "model-access" }
      }
    ];

    // NEW PLATFORM FEATURES - Gemini CLI
    const geminiCLIFeatures = [
      {
        platformId: geminiCLIPlatform.id,
        featureName: "ReAct Loop Architecture",
        description: "Uses ReAct loop for reasoning and acting with built-in tools and web search",
        category: "core",
        metadata: { type: "reasoning-loop" }
      },
      {
        platformId: geminiCLIPlatform.id,
        featureName: "Open Source",
        description: "Open-source terminal-based AI agent with community contributions",
        category: "core",
        metadata: { type: "open-source" }
      },
      {
        platformId: geminiCLIPlatform.id,
        featureName: "Built-in Tools",
        description: "Includes grep, file I/O, web search, and terminal command execution",
        category: "tools",
        metadata: { type: "built-in-utilities" }
      },
      {
        platformId: geminiCLIPlatform.id,
        featureName: "Generous Free Tier",
        description: "Unmatched free usage limits with Gemini 2.5 Pro and 1M token context window",
        category: "pricing",
        metadata: { type: "free-tier" }
      },
      {
        platformId: geminiCLIPlatform.id,
        featureName: "MCP Extensible",
        description: "Extensible via Model Context Protocol for connecting external tools",
        category: "integration",
        metadata: { type: "mcp-extensibility" }
      }
    ];

    // Create all new platform features
    const allNewFeatures = [
      ...base44Features,
      ...rorkFeatures, 
      ...v0Features,
      ...claudeCodeFeatures,
      ...geminiCLIFeatures
    ];

    for (const feature of allNewFeatures) {
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

    // NEW PLATFORM INTEGRATIONS
    const newPlatformIntegrations = [
      // Base44 integrations
      { platformId: base44Platform.id, serviceName: "GitHub", serviceType: "version-control", isNative: true, integrationDetails: "Built-in GitHub integration for Builder plan and higher" },
      { platformId: base44Platform.id, serviceName: "Amazon S3", serviceType: "storage", isNative: true, integrationDetails: "Cloud storage integration for file management" },
      { platformId: base44Platform.id, serviceName: "Twilio SendGrid", serviceType: "email", isNative: true, integrationDetails: "Email service integration for transactional emails" },
      { platformId: base44Platform.id, serviceName: "OpenAI", serviceType: "ai-model", isNative: true, integrationDetails: "AI model integration for enhanced capabilities" },
      
      // Rork integrations
      { platformId: rorkPlatform.id, serviceName: "Supabase", serviceType: "backend", isNative: false, integrationDetails: "Experimental backend functionality and data persistence" },
      { platformId: rorkPlatform.id, serviceName: "Firebase", serviceType: "backend", isNative: false, integrationDetails: "Google Firebase backend integration" },
      { platformId: rorkPlatform.id, serviceName: "Airtable", serviceType: "database", isNative: false, integrationDetails: "No-code database integration" },
      { platformId: rorkPlatform.id, serviceName: "Expo Go", serviceType: "testing", isNative: true, integrationDetails: "Real-time testing on physical devices via QR code" },
      { platformId: rorkPlatform.id, serviceName: "Apple App Store", serviceType: "deployment", isNative: true, integrationDetails: "iOS app publishing and distribution" },
      { platformId: rorkPlatform.id, serviceName: "Google Play Store", serviceType: "deployment", isNative: true, integrationDetails: "Android app publishing and distribution" },
      
      // V0 by Vercel integrations
      { platformId: v0Platform.id, serviceName: "Vercel", serviceType: "deployment", isNative: true, integrationDetails: "Seamless one-click deployment to Vercel platform" },
      { platformId: v0Platform.id, serviceName: "Next.js", serviceType: "framework", isNative: true, integrationDetails: "Deep integration with Next.js applications and deployment" },
      { platformId: v0Platform.id, serviceName: "Figma", serviceType: "design", isNative: false, integrationDetails: "Design mockup import and component generation" },
      
      // Claude Code integrations
      { platformId: claudeCodePlatform.id, serviceName: "GitHub", serviceType: "version-control", isNative: true, integrationDetails: "Direct GitHub orchestration from terminal" },
      { platformId: claudeCodePlatform.id, serviceName: "PostgreSQL", serviceType: "database", isNative: true, integrationDetails: "Database management through MCP tools" },
      { platformId: claudeCodePlatform.id, serviceName: "MCP Protocol", serviceType: "integration", isNative: true, integrationDetails: "Model Context Protocol for external tool access" },
      
      // Gemini CLI integrations
      { platformId: geminiCLIPlatform.id, serviceName: "Google Search", serviceType: "search", isNative: true, integrationDetails: "Built-in web search capabilities for context gathering" },
      { platformId: geminiCLIPlatform.id, serviceName: "MCP Protocol", serviceType: "integration", isNative: true, integrationDetails: "Extensible via Model Context Protocol" },
      { platformId: geminiCLIPlatform.id, serviceName: "GitHub", serviceType: "version-control", isNative: false, integrationDetails: "Version control through terminal commands" }
    ];

    const allIntegrations = [...integrations, ...newPlatformIntegrations];

    for (const integration of allIntegrations) {
      await storage.createPlatformIntegration(integration);
    }

    console.log("All platform integrations created successfully");

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

    // NEW PLATFORM PRICING
    const newPlatformPricing = [
      // Base44 pricing
      { platformId: base44Platform.id, planName: "Hobby", pricePerMonth: "Free", features: ["Limited apps", "Basic support", "Community access"], limits: { apps: "3", requests: "limited" } },
      { platformId: base44Platform.id, planName: "Builder", pricePerMonth: "$29", features: ["Unlimited apps", "GitHub integration", "Custom domains", "Priority support"], limits: { apps: "unlimited", integrations: "full" } },
      { platformId: base44Platform.id, planName: "Business", pricePerMonth: "$99", features: ["All Builder features", "Team collaboration", "Advanced analytics", "SSO"], limits: { team: "10 users", analytics: "advanced" } },
      { platformId: base44Platform.id, planName: "Enterprise", pricePerMonth: "Custom", features: ["All Business features", "Custom security", "Dedicated support", "SLA"], limits: { custom: "tailored", sla: "99.9%" } },
      
      // Rork pricing
      { platformId: rorkPlatform.id, planName: "Free", pricePerMonth: "Free", features: ["Basic app generation", "In-browser testing", "Limited projects"], limits: { projects: "3", builds: "10/month" } },
      { platformId: rorkPlatform.id, planName: "Pro", pricePerMonth: "$19", features: ["Unlimited projects", "App Store publishing", "Advanced features", "Priority support"], limits: { projects: "unlimited", builds: "unlimited" } },
      { platformId: rorkPlatform.id, planName: "Team", pricePerMonth: "$49", features: ["All Pro features", "Team collaboration", "Shared workspace", "Admin controls"], limits: { team: "5 users", shared: "workspace" } },
      
      // V0 by Vercel pricing
      { platformId: v0Platform.id, planName: "Free", pricePerMonth: "Free", features: ["Basic component generation", "Limited requests", "Personal use"], limits: { requests: "200/month", usage: "personal" } },
      { platformId: v0Platform.id, planName: "Pro", pricePerMonth: "$20", features: ["Unlimited generations", "Advanced models", "Commercial use", "Priority support"], limits: { generations: "unlimited", models: "advanced" } },
      { platformId: v0Platform.id, planName: "Team", pricePerMonth: "$60", features: ["All Pro features", "Team workspaces", "Shared components", "Analytics"], limits: { team: "unlimited", analytics: "detailed" } },
      
      // Claude Code pricing
      { platformId: claudeCodePlatform.id, planName: "Free", pricePerMonth: "Free", features: ["Basic Claude access", "Limited requests", "Standard models"], limits: { requests: "1000/month", models: "claude-3-haiku" } },
      { platformId: claudeCodePlatform.id, planName: "Pro", pricePerMonth: "$20", features: ["Claude 3.7 Sonnet", "Increased limits", "MCP tools", "Priority access"], limits: { requests: "unlimited", models: "sonnet" } },
      { platformId: claudeCodePlatform.id, planName: "Team", pricePerMonth: "$60", features: ["All Pro features", "Team management", "Usage analytics", "Custom MCP"], limits: { team: "unlimited", mcp: "custom" } },
      
      // Gemini CLI pricing
      { platformId: geminiCLIPlatform.id, planName: "Free", pricePerMonth: "Free", features: ["Gemini 2.5 Pro", "1M token context", "Built-in tools", "Open source"], limits: { tokens: "1M context", usage: "generous" } },
      { platformId: geminiCLIPlatform.id, planName: "Pro", pricePerMonth: "$0-5", features: ["Enhanced limits", "Priority access", "Advanced tools", "Support"], limits: { enhanced: "limits", priority: "access" } }
    ];

    const allPricing = [...pricingPlans, ...newPlatformPricing];

    for (const pricing of allPricing) {
      await storage.createPlatformPricing(pricing);
    }

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
      },
      {
        title: "Base44 All-in-One AI Platform Architecture",
        content: "Base44 is an all-in-one AI platform enabling non-technical users to build production-ready applications through conversational AI. Features include built-in database system eliminating external dependencies, instant deployment with hosting, user authentication with industry-standard encryption, and GitHub integration for version control. Supports full application lifecycle from ideation to deployment.",
        category: "platform-overview",
        tags: ["base44", "all-in-one", "no-code", "built-in-database"],
        sourceFile: "comprehensive-platform-analysis.txt"
      },
      {
        title: "Rork Mobile-First AI App Generation",
        content: "Rork specializes in mobile app generation using React Native and Expo toolchain for cross-platform development. Supports text and visual prompts including screenshots and mockups, features in-browser emulator and physical device testing via Expo Go, facilitates App Store publishing, and includes experimental backend functionality with Supabase, Firebase, and Airtable integration.",
        category: "platform-overview",
        tags: ["rork", "mobile-first", "react-native", "expo"],
        sourceFile: "comprehensive-platform-analysis.txt"
      },
      {
        title: "V0 by Vercel UI Component Generator",
        content: "V0 by Vercel is a specialized generative UI system creating high-quality UI components from natural language or design mockups. Powered by proprietary v0-1.0-md model fine-tuned for framework-aware generation, supports React, Vue, Svelte, and HTML/CSS, features iterative refinement via chat interface, and integrates seamlessly with Vercel platform for one-click deployment.",
        category: "platform-overview",
        tags: ["v0", "vercel", "ui-generator", "components"],
        sourceFile: "comprehensive-platform-analysis.txt"
      },
      {
        title: "Claude Code Terminal-Based AI Agent",
        content: "Claude Code is Anthropic's security-first, terminal-based CLI tool providing unopinionated access to Claude models for agentic coding. Features granular permissions and access control, highly scriptable via Model Context Protocol (MCP), direct GitHub and database orchestration, and supports Claude 3.7 Sonnet and Claude 4 Opus models with comprehensive extensibility.",
        category: "platform-overview",
        tags: ["claude-code", "cli", "security-first", "anthropic"],
        sourceFile: "comprehensive-platform-analysis.txt"
      },
      {
        title: "Gemini CLI Open-Source Terminal Agent",
        content: "Gemini CLI is Google's open-source terminal-based AI agent using ReAct loop architecture for reasoning and acting. Features built-in tools including grep, file I/O, web search, and terminal command execution, offers generous free tier with Gemini 2.5 Pro and 1M token context window, and extensible via Model Context Protocol for connecting external tools.",
        category: "platform-overview",
        tags: ["gemini-cli", "open-source", "react-loop", "google"],
        sourceFile: "comprehensive-platform-analysis.txt"
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