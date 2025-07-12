import { drizzle } from 'drizzle-orm/neon-serverless';
import { Pool, neonConfig } from '@neondatabase/serverless';
import ws from 'ws';
import * as schema from "@shared/schema";

neonConfig.webSocketConstructor = ws;

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error('DATABASE_URL is not set');
}

// Configure connection pool with retry and timeout settings
const pool = new Pool({ 
  connectionString,
  max: 10,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 10000
});

// Add error handling for pool
pool.on('error', (err) => {
  console.warn('Database pool error:', err.message);
});

export const db = drizzle({ client: pool, schema });

// Export the vectorDocuments table for use in routes
export const { vectorDocuments } = schema;