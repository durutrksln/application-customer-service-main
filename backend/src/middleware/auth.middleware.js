const jwt = require('jsonwebtoken');

// In a real app, you would verify the JWT and attach user info to req.user
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  console.log('Auth header:', authHeader);
  
  const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN
  console.log('Extracted token:', token ? 'Token exists' : 'No token');
  
  if (token == null) {
    return res.status(401).json({ message: 'Authentication token required.' });
  }

  // Check if JWT_SECRET is set
  if (!process.env.JWT_SECRET) {
    console.error('JWT_SECRET is not set in environment variables!');
    return res.status(500).json({ message: 'Server configuration error' });
  }

  console.log('JWT_SECRET exists:', !!process.env.JWT_SECRET);

  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) {
      console.error('JWT Verification Error:', {
        name: err.name,
        message: err.message,
        stack: err.stack
      });
      return res.status(403).json({ 
        message: 'Invalid or expired token.',
        error: process.env.NODE_ENV === 'development' ? err.message : undefined
      });
    }
    console.log('Decoded user from token:', user);
    req.user = user; // Add decoded user payload to request object
    next();
  });
};

const isAdmin = (req, res, next) => {
  if (req.user && req.user.role === 'admin') {
    next();
  } else {
    res.status(403).json({ message: 'Forbidden: Admin access required.' });
  }
};

module.exports = {
  authenticateToken,
  isAdmin,
};