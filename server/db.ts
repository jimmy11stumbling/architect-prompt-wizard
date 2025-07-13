import { neon } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-http';
import * as schema from "@shared/schema";

if (!process.env.DATABASE_URL) {
  throw new Error(
    "DATABASE_URL must be set. Did you forget to provision a database?",
  );
}

// Create the neon connection with proper configuration
const sql = neon(process.env.DATABASE_URL!);

console.log('[Database] Neon serverless connection initialized');

// Create Drizzle instance with proper schema
export const db = drizzle(sql, { 
  schema,
  logger: process.env.NODE_ENV === 'development'
});

// Export the sql function for direct queries
export { sql };

// Test the connection on startup
const testConnection = async () => {
  try {
    const result = await sql`SELECT 1 as test`;
    const resultArray = Array.isArray(result) ? result : [];
    console.log('[Database] Connection test successful:', resultArray[0]?.test === 1 ? '✓' : '✗');
  } catch (error) {
    console.error('[Database] Connection test failed:', error);
  }
};

// Test connection but don't block startup
testConnection();

// For compatibility with existing code that expects a pool
export const pool = {
  end: () => Promise.resolve(),
  query: async (text: string, params?: any[]) => {
    try {
      // Use the sql function directly for raw queries
      const result = await sql(text, params);

      // Handle different result formats from Neon
      let rows: any[] = [];
      let rowCount = 0;

      if (Array.isArray(result)) {
        rows = result;
        rowCount = result.length;
      } else if (result && typeof result === 'object') {
        rows = result.rows || [];
        rowCount = result.rowCount || rows.length;
      }

      return { rows, rowCount };
    } catch (error) {
      console.error('Pool query error:', error);
      throw error;
    }
  }
};