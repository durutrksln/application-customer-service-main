const express = require('express');
const router = express.Router();
const { authenticateToken } = require('../middleware/auth.middleware');
const dbService = require('../services/db.service');

// GET /applications/pending
router.get('/pending', authenticateToken, async (req, res) => {
  try {
    const query = `
      SELECT * FROM connection_applications
      WHERE user_id = $1 AND status = 'pending'
      ORDER BY created_at DESC
    `;
    const result = await dbService.query(query, [req.user.userId]);
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching pending applications:', error);
    res.status(500).json({ 
      message: 'Error fetching pending applications',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// GET /applications/completed
router.get('/completed', authenticateToken, async (req, res) => {
  try {
    const query = `
      SELECT * FROM connection_applications
      WHERE user_id = $1 AND status = 'completed'
      ORDER BY created_at DESC
    `;
    const result = await dbService.query(query, [req.user.userId]);
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching completed applications:', error);
    res.status(500).json({ 
      message: 'Error fetching completed applications',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

module.exports = router; 