import { seedPlatformData } from './server/seedData.ts';

async function main() {
  try {
    console.log('Starting database seeding...');
    await seedPlatformData();
    console.log('Database seeding completed successfully');
    process.exit(0);
  } catch (error) {
    console.error('Error during seeding:', error);
    process.exit(1);
  }
}

main();