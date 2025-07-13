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

// Single shared pool instance with better error handling
export const pool = new Pool({ 
  connectionString: process.env.DATABASE_URL,
  max: 3, // Reduced connection pool size
  min: 1,
  maxUses: 500,
  maxLifetime: 180000, // 3 minutes
  idleTimeout: 30000,
  connectionTimeoutMillis: 8000,
  allowExitOnIdle: true
});

// Add error handling for pool events
pool.on('error', (err: any) => {
  console.warn('[Database] Pool error handled:', err?.message || 'Unknown error');
  // Don't throw - let the connection be retried
});

// Add connection error handling
pool.on('connect', () => {
  console.log('[Database] Pool connected successfully');
});

// Graceful shutdown
process.on('SIGTERM', async () => {
  console.log('[Database] Closing pool...');
  await pool.end();
});

process.on('SIGINT', async () => {
  console.log('[Database] Closing pool...');
  await pool.end();
});

export const db = drizzle({ client: pool, schema });
