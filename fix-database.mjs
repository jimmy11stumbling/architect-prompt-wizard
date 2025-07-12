
import { drizzle } from 'drizzle-orm/neon-serverless';
import { Pool, neonConfig } from '@neondatabase/serverless';
import ws from 'ws';

neonConfig.webSocketConstructor = ws;

const connectionString = process.env.DATABASE_URL;
if (!connectionString) {
  console.error('DATABASE_URL is not set');
  process.exit(1);
}

const pool = new Pool({ connectionString });
const db = drizzle(pool);

async function fixDatabase() {
  try {
    console.log('Checking database structure...');
    
    // Check if tables exist and repair them
    const repairQueries = [
      // Ensure platform_integrations has service_name column
      `ALTER TABLE platform_integrations ADD COLUMN IF NOT EXISTS service_name VARCHAR(255);`,
      
      // Ensure platform_pricing has price_per_month column  
      `ALTER TABLE platform_pricing ADD COLUMN IF NOT EXISTS price_per_month DECIMAL(10,2);`,
      
      // Ensure platform_pricing has monthly_price column (alternative name)
      `ALTER TABLE platform_pricing ADD COLUMN IF NOT EXISTS monthly_price DECIMAL(10,2);`,
      
      // Update any missing service_name values
      `UPDATE platform_integrations SET service_name = 'default' WHERE service_name IS NULL;`,
      
      // Update any missing price_per_month values
      `UPDATE platform_pricing SET price_per_month = 0.00 WHERE price_per_month IS NULL;`,
      
      // Update monthly_price if price_per_month doesn't exist
      `UPDATE platform_pricing SET monthly_price = COALESCE(price_per_month, 0.00) WHERE monthly_price IS NULL;`
    ];
    
    for (const query of repairQueries) {
      try {
        await db.execute({ sql: query });
        console.log('✓ Executed:', query.substring(0, 50) + '...');
      } catch (error) {
        console.warn('⚠️ Query failed:', error.message);
      }
    }
    
    console.log('Database repair completed');
    
  } catch (error) {
    console.error('Database repair failed:', error);
  } finally {
    await pool.end();
  }
}

fixDatabase();
