
import { drizzle } from 'drizzle-orm/neon-serverless';
import { Pool, neonConfig } from '@neondatabase/serverless';
import ws from 'ws';
import { seedPlatformData } from './server/seedData.ts';

neonConfig.webSocketConstructor = ws;

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  console.error('❌ DATABASE_URL is not set');
  process.exit(1);
}

// Improved connection with retry logic
const pool = new Pool({ 
  connectionString,
  max: 5,
  idleTimeoutMillis: 10000,
  connectionTimeoutMillis: 5000
});

pool.on('error', (err) => {
  console.warn('⚠️ Database pool error (continuing):', err.message);
});

async function seedWithRetry(maxRetries = 3) {
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      console.log(`🌱 Seeding attempt ${attempt}/${maxRetries}...`);
      
      // Test connection first
      const testDb = drizzle({ client: pool });
      await testDb.execute({ sql: 'SELECT 1' });
      console.log('✅ Database connection successful');
      
      // Run seeding
      await seedPlatformData();
      console.log('🎉 Platform data seeding completed successfully!');
      
      await pool.end();
      process.exit(0);
      
    } catch (error) {
      console.error(`❌ Attempt ${attempt} failed:`, error.message);
      
      if (attempt === maxRetries) {
        console.error('💥 All seeding attempts failed');
        await pool.end();
        process.exit(1);
      }
      
      // Wait before retry
      console.log(`⏳ Waiting 2 seconds before retry...`);
      await new Promise(resolve => setTimeout(resolve, 2000));
    }
  }
}

seedWithRetry();
