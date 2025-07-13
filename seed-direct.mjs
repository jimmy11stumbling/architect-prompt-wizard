import { neon } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-serverless';
import * as schema from './shared/schema.js';

const sql = neon(process.env.DATABASE_URL);
const db = drizzle(sql, { schema });

// Seed data
const platforms = [
  { name: 'Cursor', description: 'AI-first code editor with intelligent suggestions' },
  { name: 'Bolt', description: 'AI web development agent for rapid prototyping' },
  { name: 'Replit', description: 'Cloud IDE with AI agent capabilities' },
  { name: 'Windsurf', description: 'Agentic IDE with MCP support' },
  { name: 'Lovable', description: 'No-code AI platform for app development' },
  { name: 'Claude Code', description: 'AI coding assistant with context awareness' },
  { name: 'Gemini CLI', description: 'Command-line AI development tools' },
  { name: 'V0', description: 'AI-powered UI component generator' },
  { name: 'GitHub Copilot', description: 'AI pair programmer for code completion' },
  { name: 'Codeium', description: 'Free AI code completion and chat' },
  { name: 'Rork', description: 'AI-powered mobile app development platform' }
];

async function seedDatabase() {
  try {
    console.log('Starting database seeding...');
    
    // Clear existing data
    await db.delete(schema.platforms);
    console.log('Cleared existing platform data');
    
    // Insert new platforms
    for (const platform of platforms) {
      await db.insert(schema.platforms).values(platform);
      console.log(`Inserted platform: ${platform.name}`);
    }
    
    console.log('Database seeding completed successfully');
  } catch (error) {
    console.error('Database seeding failed:', error);
    process.exit(1);
  }
}

seedDatabase();