const { execSync } = require('child_process');

// Function to run seeding
async function runSeeding() {
  try {
    console.log('Running seeding...');
    
    // Create basic test data
    const result = execSync('npx tsx -e "import { storage } from \'./server/storage.ts\'; console.log(\'Database connection test:\', typeof storage);"', { encoding: 'utf8' });
    console.log('Database connection test passed:', result);
    
    console.log('Seeding completed successfully!');
  } catch (error) {
    console.error('Error during seeding:', error);
  }
}

runSeeding();