
import { drizzle } from 'drizzle-orm/neon-serverless';
import { Pool, neonConfig } from '@neondatabase/serverless';
import { sql } from 'drizzle-orm';
import ws from 'ws';

neonConfig.webSocketConstructor = ws;

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  console.error('DATABASE_URL environment variable is not set');
  process.exit(1);
}

const pool = new Pool({ 
  connectionString,
  max: 5,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 15000
});

const db = drizzle({ client: pool });

async function fixDatabaseColumns() {
  console.log('🔧 Fixing database column issues...');
  
  try {
    // Check and fix platform_integrations table
    console.log('Checking platform_integrations table...');
    
    try {
      const integrationColumns = await db.execute(sql`
        SELECT column_name 
        FROM information_schema.columns 
        WHERE table_name = 'platform_integrations'
      `);
      
      const columnNames = integrationColumns.rows.map(row => row.column_name);
      console.log('Current platform_integrations columns:', columnNames);
      
      if (!columnNames.includes('service_name')) {
        console.log('Adding service_name column to platform_integrations...');
        await db.execute(sql`
          ALTER TABLE platform_integrations 
          ADD COLUMN IF NOT EXISTS service_name VARCHAR(255)
        `);
        console.log('✅ Added service_name column');
      }
      
      if (!columnNames.includes('name') && !columnNames.includes('integration_name')) {
        console.log('Adding name column to platform_integrations...');
        await db.execute(sql`
          ALTER TABLE platform_integrations 
          ADD COLUMN IF NOT EXISTS name VARCHAR(255)
        `);
        console.log('✅ Added name column');
      }
      
    } catch (error) {
      console.warn('Could not fix platform_integrations:', error.message);
    }
    
    // Check and fix platform_pricing table
    console.log('Checking platform_pricing table...');
    
    try {
      const pricingColumns = await db.execute(sql`
        SELECT column_name 
        FROM information_schema.columns 
        WHERE table_name = 'platform_pricing'
      `);
      
      const pricingColumnNames = pricingColumns.rows.map(row => row.column_name);
      console.log('Current platform_pricing columns:', pricingColumnNames);
      
      if (!pricingColumnNames.includes('price_per_month')) {
        console.log('Adding price_per_month column to platform_pricing...');
        await db.execute(sql`
          ALTER TABLE platform_pricing 
          ADD COLUMN IF NOT EXISTS price_per_month DECIMAL(10,2)
        `);
        console.log('✅ Added price_per_month column');
      }
      
      if (!pricingColumnNames.includes('price') && !pricingColumnNames.includes('monthly_price')) {
        console.log('Adding price column to platform_pricing...');
        await db.execute(sql`
          ALTER TABLE platform_pricing 
          ADD COLUMN IF NOT EXISTS price DECIMAL(10,2)
        `);
        console.log('✅ Added price column');
      }
      
    } catch (error) {
      console.warn('Could not fix platform_pricing:', error.message);
    }
    
    console.log('✅ Database column fixes completed successfully!');
    
  } catch (error) {
    console.error('❌ Database column fix failed:', error);
  } finally {
    await pool.end();
  }
}

fixDatabaseColumns();
