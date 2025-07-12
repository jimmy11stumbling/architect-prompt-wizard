// Simple direct seeding script that doesn't use top-level await
import { seedPlatformData } from './server/seedData.ts';

seedPlatformData()
  .then(() => {
    console.log('✅ Platform seeding completed successfully!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ Error during seeding:', error);
    process.exit(1);
  });