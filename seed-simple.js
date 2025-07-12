import { createRequire } from 'module';
import { seedPlatformData } from './server/seedData.js';

const require = createRequire(import.meta.url);

async function main() {
  try {
    console.log('Starting database seeding...');
    await seedPlatformData();
    console.log('Database seeding completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Seeding failed:', error);
    process.exit(1);
  }
}

main();