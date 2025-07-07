
const { neon } = require('@neondatabase/serverless');

async function migratePrompts() {
  const sql = neon(process.env.DATABASE_URL);
  
  try {
    // Allow null user_id in saved_prompts table
    await sql`
      ALTER TABLE saved_prompts 
      ALTER COLUMN user_id DROP NOT NULL
    `;
    
    console.log('✅ Migration completed: user_id can now be null');
  } catch (error) {
    if (error.message.includes('column "user_id" of relation "saved_prompts" is not a not-null column')) {
      console.log('✅ Migration already applied: user_id already allows null');
    } else {
      console.error('❌ Migration failed:', error);
    }
  }
}

migratePrompts();
