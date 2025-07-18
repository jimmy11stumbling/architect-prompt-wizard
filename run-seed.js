
import { execSync } from 'child_process';

// Function to run seeding using tsx
async function runSeeding() {
  try {
    console.log('Running comprehensive platform seeding...');
    
    // Use tsx to run the TypeScript file directly
    const result = execSync('npx tsx server/seedData.ts', { 
      encoding: 'utf8',
      stdio: 'inherit'
    });
    
    console.log('Comprehensive seeding completed successfully!');
  } catch (error) {
    console.error('Error during seeding:', error);
    process.exit(1);
  }
}

runSeeding();
