const { Pool } = require('pg');
require('dotenv').config(); // Ensure environment variables are loaded

console.log('Initializing PostgreSQL connection with config:', {
  user: process.env.DB_USER || 'postgres',
  host: process.env.DB_HOST || 'localhost',
  database: process.env.DB_NAME || 'acs',
  port: parseInt(process.env.DB_PORT || '5432', 10),
  // Don't log password for security
});

const pool = new Pool({
  user: process.env.DB_USER || 'postgres',
  host: process.env.DB_HOST || 'localhost',
  database: process.env.DB_NAME || 'postgres',
  password: process.env.DB_PASSWORD || '12345',
  port: parseInt(process.env.DB_PORT || '5432', 10),
});

pool.on('connect', () => {
  console.log('Connected to the PostgreSQL database!');
});

pool.on('error', (err) => {
  console.error('Unexpected error on idle client', err);
  process.exit(-1);
});

// Wrap the query function to add logging
const query = async (text, params) => {
  const start = Date.now();
  try {
    console.log('Executing query:', text);
    console.log('Query parameters:', params);
    const res = await pool.query(text, params);
    const duration = Date.now() - start;
    console.log('Query executed successfully in', duration, 'ms');
    return res;
  } catch (error) {
    console.error('Query error:', error);
    throw error;
  }
};

module.exports = {
  query,
  pool, // Export the pool itself if needed for transactions, etc.
};