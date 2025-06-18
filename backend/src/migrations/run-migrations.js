const fs = require('fs');
const path = require('path');
const db = require('../services/db.service');

async function runMigrations() {
  try {
    // First, create users table
    const usersMigrationPath = path.join(__dirname, 'create_users.sql');
    const usersMigrationSQL = fs.readFileSync(usersMigrationPath, 'utf8');
    console.log('Running users migration...');
    await db.query(usersMigrationSQL);
    console.log('Users migration completed successfully!');

    // Then, create evacuation_applications table
    const evacuationMigrationPath = path.join(__dirname, 'create_evacuation_applications.sql');
    const evacuationMigrationSQL = fs.readFileSync(evacuationMigrationPath, 'utf8');
    console.log('Running evacuation applications migration...');
    await db.query(evacuationMigrationSQL);
    console.log('Evacuation applications migration completed successfully!');
  } catch (error) {
    console.error('Migration failed:', error);
    process.exit(1);
  } finally {
    await db.pool.end();
  }
}

runMigrations(); 