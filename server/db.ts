
import { neon } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-serverless';
import * as schema from "@shared/schema";

if (!process.env.DATABASE_URL) {
  throw new Error(
    "DATABASE_URL must be set. Did you forget to provision a database?",
  );
}

// Create the neon connection
const sql = neon(process.env.DATABASE_URL!, {
  fetchConnectionCache: true,
  fullResults: true
});

console.log('[Database] Neon serverless connection initialized');

// Create Drizzle instance with proper schema
export const db = drizzle(sql, { schema });

// Export the sql function for direct queries
export { sql };

// For compatibility with existing code that expects a pool
export const pool = {
  end: () => Promise.resolve(),
  query: async (text: string, params?: any[]) => {
    try {
      // Use the sql function directly for raw queries
      const result = await sql(text, params);
      return {
        rows: Array.isArray(result) ? result : result.rows || [],
        rowCount: Array.isArray(result) ? result.length : result.rowCount || 0
      };
    } catch (error) {
      console.error('Pool query error:', error);
      throw error;
    }
  }
};
