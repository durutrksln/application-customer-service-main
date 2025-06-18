const authService = require('../services/auth.service');

const register = async (req, res, next) => {
  try {
    // Add input validation here (e.g., using express-validator or Joi)
    const { email, password, full_name, role } = req.body;
    if (!email || !password) {
        return res.status(400).json({ message: 'Email and password are required.' });
    }

    const result = await authService.registerUser({ email, password, full_name, role });
    if (!result.success) {
      return res.status(result.statusCode || 400).json({ message: result.message });
    }
    res.status(201).json({ message: 'User registered successfully', user: result.user });
  } catch (error) {
    console.error('Registration controller error:', error);
    // Pass error to a centralized error handler middleware if you have one
    // next(error); 
    res.status(500).json({ message: 'Error registering user', error: error.message });
  }
};

const login = async (req, res, next) => {
  try {
    // Add input validation here
    const { email, password } = req.body;
     if (!email || !password) {
        return res.status(400).json({ message: 'Email and password are required.' });
    }

    const result = await authService.loginUser({ email, password });
    if (!result.success) {
      return res.status(result.statusCode || 401).json({ message: result.message });
    }
    res.json({ message: 'Login successful', token: result.token, user: result.user });
  } catch (error) {
    console.error('Login controller error:', error);
    // next(error);
    res.status(500).json({ message: 'Error logging in', error: error.message });
  }
};

const getMe = async (req, res, next) => {
  try {
    // req.user is populated by authenticateToken middleware
    const userId = req.user.userId;
    const result = await authService.getUserProfile(userId);
    if (!result.success) {
      return res.status(result.statusCode || 404).json({ message: result.message });
    }
    res.json(result.user);
  } catch (error) {
    console.error('Get me controller error:', error);
    // next(error);
    res.status(500).json({ message: 'Error fetching user details', error: error.message });
  }
};

module.exports = {
  register,
  login,
  getMe,
};