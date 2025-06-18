const db = require('./db.service'); // Or const { query } = require('./db.service');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

if (!process.env.JWT_SECRET) {
  console.error('JWT_SECRET is not set in environment variables!');
  process.exit(1);
}

const registerUser = async (userData) => {
  const { email, password, full_name, role } = userData;
  const salt = await bcrypt.genSalt(10);
  const password_hash = await bcrypt.hash(password, salt);
  try {
    const result = await db.query(
      'INSERT INTO users (email, password_hash, full_name, role) VALUES ($1, $2, $3, $4) RETURNING user_id, email, full_name, role, created_at',
      [email, password_hash, full_name, role || 'customer']
    );
    return { success: true, user: result.rows[0] };
  } catch (error) {
    console.error('Registration service error:', error);
    if (error.code === '23505') { // Unique violation for email
      return { success: false, statusCode: 409, message: 'Email already exists.' };
    }
    throw error; // Re-throw other errors to be caught by controller
  }
};

const loginUser = async (credentials) => {
  const { email, password } = credentials;
  try {
    console.log('Attempting login for email:', email);
    
    const result = await db.query('SELECT * FROM users WHERE email = $1', [email]);
    if (result.rows.length === 0) {
      console.log('No user found with email:', email);
      return { success: false, statusCode: 401, message: 'Invalid credentials.' };
    }
    
    const user = result.rows[0];
    console.log('Found user:', { id: user.user_id, email: user.email, role: user.role });
    
    const isValidPassword = await bcrypt.compare(password, user.password_hash);
    if (!isValidPassword) {
      console.log('Invalid password for user:', email);
      return { success: false, statusCode: 401, message: 'Invalid credentials.' };
    }
    
    const tokenPayload = { userId: user.user_id, email: user.email, role: user.role };
    console.log('Creating token with payload:', tokenPayload);
    
    const token = jwt.sign(tokenPayload, process.env.JWT_SECRET, { expiresIn: '1h' });
    console.log('Token created successfully');
    
    const { password_hash, ...userResponse } = user; // Don't send password hash
    return { success: true, token, user: userResponse };
  } catch (error) {
    console.error('Login service error:', error);
    throw error;
  }
};

const getUserProfile = async (userId) => {
  try {
    const result = await db.query('SELECT user_id, email, full_name, role, created_at FROM users WHERE user_id = $1', [userId]);
    if (result.rows.length === 0) {
      return { success: false, statusCode: 404, message: 'User not found.' };
    }
    return { success: true, user: result.rows[0] };
  } catch (error) {
    console.error('Get user profile service error:', error);
    throw error;
  }
};

module.exports = {
  registerUser,
  loginUser,
  getUserProfile,
};