import { neon } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-serverless';
import * as schema from "@shared/schema";

if (!process.env.DATABASE_URL) {
  throw new Error(
    "DATABASE_URL must be set. Did you forget to provision a database?",
  );
}

// Use direct neon connection with proper configuration
const sql = neon(process.env.DATABASE_URL!, {
  fetchConnectionCache: true,
  fullResults: true
});

console.log('[Database] Direct connection initialized');

export const db = drizzle(sql, { schema });

// Export the sql function for direct queries
export { sql };

// For compatibility with existing code that expects a pool
export const pool = {
  end: () => Promise.resolve(),
  query: async (text: string, params?: any[]) => {
    try {
      const result = await sql(text, params);
      return {
        rows: result.rows || result,
        rowCount: result.rowCount || (result.rows ? result.rows.length : 0)
      };
    } catch (error) {
      console.error('Pool query error:', error);
      throw error;
    }
  }
};
