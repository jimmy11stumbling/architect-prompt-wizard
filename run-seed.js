import { execSync } from 'child_process';

// Function to run seeding
async function runSeeding() {
  try {
    console.log('Running comprehensive platform seeding...');
    
    // Run the actual seeding function
    const result = execSync('npx tsx -e "import { seedPlatformData } from \'./server/seedData.ts\'; await seedPlatformData();"', { encoding: 'utf8' });
    console.log('Seeding output:', result);
    
    console.log('Comprehensive seeding completed successfully!');
  } catch (error) {
    console.error('Error during seeding:', error);
    console.error('Error output:', error.toString());
  }
}

runSeeding();