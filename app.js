require('dotenv').config(); // Load environment variables from .env file

const express = require('express');
const cors = require('cors');
const dbService = require('./services/db.service'); // For pool shutdown and test query

const app = express();
app.use(cors()); // Enable CORS for all routes
app.use(express.json()); // Middleware to parse JSON bodies
app.use(express.urlencoded({ extended: true })); // Middleware to parse URL-encoded bodies

// Increase payload size limit for file uploads
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

const port = process.env.PORT || 5000;

// --- Test Database Connection ---
async function testDbConnection() {
  console.log('Attempting to test database connection...');
  try {
    const result = await dbService.query('SELECT NOW()'); // This will try to get a client from the pool
    console.log('Database connection test successful. Current time from DB:', result.rows[0].now);
  } catch (err) {
    console.error('!!! Database connection test FAILED !!!');
    console.error('Error Name:', err.name);
    console.error('Error Message:', err.message);
    console.error('Error Code:', err.code); // Often very informative (e.g., '28P01' for auth failure)
    console.error('Full Error:', err);
    // process.exit(1); // Optionally exit if DB is critical
  }
}
// --- End Test Database Connection ---

// --- Import Routers ---
const authRoutes = require('./routes/auth.routes');
const userRoutes = require('./routes/user.routes');
const applicationRoutes = require('./routes/application.routes');
// const documentRoutes = require('./routes/document.routes'); // If you have top-level document routes

// --- Use Routers ---
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/applications', applicationRoutes);
// app.use('/documents', documentRoutes); // If top-level, or handle as nested in application.routes.js

// Root route
app.get('/', (req, res) => {
  res.json({ message: 'Customer Service API is running' });
});

// --- Global Error Handler ---
app.use((err, req, res, next) => {
  console.error("Global Error Handler:", err.stack);
  res.status(err.status || 500).json({
    message: err.message || 'An unexpected error occurred.',
    error: process.env.NODE_ENV === 'development' ? err : {} // Only show stack in dev
  });
});

// Start the server
app.listen(port, async () => {
  console.log(`Server is running on http://localhost:${port}`);
  console.log('Ensure your PostgreSQL database is running and configured.');
  console.log('Remember to set environment variables for DB connection and JWT_SECRET.');
  await testDbConnection(); // Call the test function here
});

// Graceful shutdown for DB pool
process.on('SIGINT', async () => {
  console.log('Shutting down server...');
  try {
    await dbService.pool.end(); // Use the pool exported from db.service.js
    console.log('PostgreSQL pool has ended');
  } catch (err) {
    console.error('Error ending PostgreSQL pool', err);
  }
  process.exit(0);
});

process.on('SIGTERM', async () => {
  console.log('Shutting down server (SIGTERM)...');
  try {
    await dbService.pool.end();
    console.log('PostgreSQL pool has ended');
  } catch (err) {
    console.error('Error ending PostgreSQL pool', err);
  }
  process.exit(0);
});