const userService = require('../services/user.service');

const listUsers = async (req, res, next) => {
  // This route is admin only (enforced by isAdmin middleware in routes)
  try {
    const result = await userService.getAllUsers();
    res.json(result.users);
  } catch (error) {
    console.error('List users controller error:', error);
    res.status(500).json({ message: 'Error fetching users', error: error.message });
  }
};

const getUser = async (req, res, next) => {
  try {
    const { userId } = req.params;
    // Authorization: Admin can get any, user can get self.
    if (req.user.role !== 'admin' && req.user.userId !== parseInt(userId, 10)) {
      return res.status(403).json({ message: 'Forbidden: You can only access your own profile or require admin rights.' });
    }
    const result = await userService.getUserById(userId);
    if (!result.success) {
      return res.status(result.statusCode).json({ message: result.message });
    }
    res.json(result.user);
  } catch (error) {
    console.error('Get user controller error:', error);
    res.status(500).json({ message: 'Error fetching user', error: error.message });
  }
};

const updateUser = async (req, res, next) => {
  try {
    const { userId } = req.params;
    const { full_name, role } = req.body;

    // Authorization: Admin can update any, user can update self (but not role).
    if (req.user.role !== 'admin' && req.user.userId !== parseInt(userId, 10)) {
      return res.status(403).json({ message: 'Forbidden: You can only update your own profile or require admin rights.' });
    }
    if (role && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Forbidden: Only admins can change user roles.' });
    }

    const result = await userService.updateUserById(userId, { full_name, role }, req.user);
    if (!result.success) {
      return res.status(result.statusCode).json({ message: result.message });
    }
    res.json({ message: 'User updated successfully', user: result.user });
  } catch (error) {
    console.error('Update user controller error:', error);
    res.status(500).json({ message: 'Error updating user', error: error.message });
  }
};

const deleteUser = async (req, res, next) => {
  // This route is admin only (enforced by isAdmin middleware in routes)
  try {
    const { userId } = req.params;
    const result = await userService.deleteUserById(userId, req.user.userId);
     if (!result.success) {
      return res.status(result.statusCode).json({ message: result.message });
    }
    res.status(204).send(); // No Content
  } catch (error) {
    console.error('Delete user controller error:', error);
    res.status(500).json({ message: 'Error deleting user', error: error.message });
  }
};

module.exports = {
  listUsers,
  getUser,
  updateUser,
  deleteUser,
};