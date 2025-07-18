
import { seedPlatformData } from './server/seedData.ts';

// Function to run seeding
async function runSeeding() {
  try {
    console.log('Running comprehensive platform seeding...');
    
    // Run the seeding function directly
    await seedPlatformData();
    
    console.log('Comprehensive seeding completed successfully!');
  } catch (error) {
    console.error('Error during seeding:', error);
    console.error('Error output:', error.toString());
  }
}

runSeeding();
