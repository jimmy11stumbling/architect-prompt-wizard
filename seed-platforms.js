import { storage } from "./server/storage.js";

async function seedBasicPlatforms() {
  console.log("Seeding basic platform data...");

  try {
    // Create essential platforms
    const platforms = [
      {
        name: "Bolt (StackBlitz)",
        description: "AI-powered web development agent built on WebContainer technology",
        category: "AI Development Platform",
        website: "https://bolt.new"
      },
      {
        name: "Cursor",
        description: "AI-first code editor built as a VS Code fork with deep AI integration",
        category: "AI-First IDE", 
        website: "https://cursor.com"
      },
      {
        name: "Lovable 2.0",
        description: "AI-powered platform for building production-ready applications through conversational AI",
        category: "No-Code AI Platform",
        website: "https://lovable.dev"
      },
      {
        name: "Replit",
        description: "Cloud-based development environment with AI Agent for no-code/low-code application development",
        category: "Cloud IDE with AI",
        website: "https://replit.com"
      },
      {
        name: "Windsurf (Codeium)",
        description: "Agentic IDE with advanced AI capabilities and Model Context Protocol support",
        category: "Agentic IDE",
        website: "https://windsurf.com"
      }
    ];

    for (const platform of platforms) {
      await storage.createPlatform(platform);
      console.log(`Created platform: ${platform.name}`);
    }

    console.log("Platform seeding completed successfully!");

  } catch (error) {
    console.error("Error during seeding:", error);
    throw error;
  }
}

seedBasicPlatforms();