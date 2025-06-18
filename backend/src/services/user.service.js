const db = require('./db.service');

const getAllUsers = async () => {
  try {
    const result = await db.query('SELECT user_id, email, full_name, role, created_at FROM users ORDER BY user_id ASC');
    return { success: true, users: result.rows };
  } catch (error) {
    console.error('Get all users service error:', error);
    throw error;
  }
};

const getUserById = async (userId) => {
  try {
    const result = await db.query('SELECT user_id, email, full_name, role, created_at FROM users WHERE user_id = $1', [userId]);
    if (result.rows.length === 0) {
      return { success: false, statusCode: 404, message: 'User not found.' };
    }
    return { success: true, user: result.rows[0] };
  } catch (error) {
    console.error('Get user by ID service error:', error);
    throw error;
  }
};

const updateUserById = async (userId, userData, requestingUser) => {
  const { full_name, role } = userData;
  try {
    const fieldsToUpdate = [];
    const values = [];
    let queryIndex = 1;

    if (full_name !== undefined) {
      fieldsToUpdate.push(`full_name = $${queryIndex++}`);
      values.push(full_name);
    }
    if (role !== undefined && requestingUser.role === 'admin') { // Only admin can change role
      fieldsToUpdate.push(`role = $${queryIndex++}`);
      values.push(role);
    } else if (role !== undefined && requestingUser.role !== 'admin') {
        return { success: false, statusCode: 403, message: 'Forbidden: Only admins can change user roles.'};
    }

    if (fieldsToUpdate.length === 0) {
      return { success: false, statusCode: 400, message: 'No valid fields to update or unauthorized role change.' };
    }

    fieldsToUpdate.push(`updated_at = NOW()`);
    values.push(userId); // For the WHERE clause

    const query = `UPDATE users SET ${fieldsToUpdate.join(', ')} WHERE user_id = $${queryIndex} RETURNING user_id, email, full_name, role, updated_at`;
    const result = await db.query(query, values);

    if (result.rows.length === 0) {
      return { success: false, statusCode: 404, message: 'User not found or no changes made.' };
    }
    return { success: true, user: result.rows[0] };
  } catch (error) {
    console.error('Update user service error:', error);
    throw error;
  }
};

const deleteUserById = async (userIdToDelete, requestingUserId) => {
  try {
    if (parseInt(userIdToDelete, 10) === requestingUserId) {
        return { success: false, statusCode: 403, message: 'Admins cannot delete themselves through this endpoint.' };
    }
    const result = await db.query('DELETE FROM users WHERE user_id = $1 RETURNING user_id', [userIdToDelete]);
    if (result.rowCount === 0) {
      return { success: false, statusCode: 404, message: 'User not found.' };
    }
    return { success: true };
  } catch (error) {
    console.error('Delete user service error:', error);
    throw error;
  }
};

module.exports = {
  getAllUsers,
  getUserById,
  updateUserById,
  deleteUserById,
};