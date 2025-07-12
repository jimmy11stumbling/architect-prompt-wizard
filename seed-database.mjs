import { seedPlatformData } from './server/seedData.ts';

async function main() {
  console.log('Starting database seeding...');
  try {
    await seedPlatformData();
    console.log('Seeding completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Error during seeding:', error);
    process.exit(1);
  }
}

main();