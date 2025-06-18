const express = require('express');
const router = express.Router();
const userController = require('../controllers/user.controller');
const { authenticateToken, isAdmin } = require('../middleware/auth.middleware');

// GET /users - List all users (Admin only)
router.get('/', authenticateToken, isAdmin, userController.listUsers);

// GET /users/:userId - Get a specific user (Admin or self)
router.get('/:userId', authenticateToken, userController.getUser);

// PUT /users/:userId - Update a user (Admin or self, role change admin only)
router.put('/:userId', authenticateToken, userController.updateUser);

// DELETE /users/:userId - Delete a user (Admin only)
router.delete('/:userId', authenticateToken, isAdmin, userController.deleteUser);

module.exports = router;