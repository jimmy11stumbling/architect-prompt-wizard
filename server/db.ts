import { neon } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-serverless';
import * as schema from "@shared/schema";

if (!process.env.DATABASE_URL) {
  throw new Error(
    "DATABASE_URL must be set. Did you forget to provision a database?",
  );
}

// Use direct neon connection instead of pool to avoid WebSocket issues
const sql = neon(process.env.DATABASE_URL!);

console.log('[Database] Direct connection initialized');

export const db = drizzle(sql, { schema });

// Export the sql function for direct queries
export { sql };

// For compatibility with existing code that expects a pool
export const pool = {
  end: () => Promise.resolve(),
  query: async (text: string, params?: any[]) => {
    return await sql(text, params);
  }
};
