import { Pool, neonConfig } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-serverless';
import ws from "ws";
import * as schema from "@shared/schema";

neonConfig.webSocketConstructor = ws;

if (!process.env.DATABASE_URL) {
  throw new Error(
    "DATABASE_URL must be set. Did you forget to provision a database?",
  );
}

// Optimized connection pool for better performance
export const pool = new Pool({ 
  connectionString: process.env.DATABASE_URL,
  max: 5, // Limit max connections
  idleTimeoutMillis: 30000, // Close idle connections faster
  connectionTimeoutMillis: 5000, // Faster connection timeout
});

export const db = drizzle({ client: pool, schema });

// Export the vectorDocuments table for use in routes
export const { vectorDocuments } = schema;
