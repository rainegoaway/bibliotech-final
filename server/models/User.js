// MODEL - Handles all database operations for users
// ============================================
const db = require('../config/database');

class User {
  // Find user by school ID
  static async findBySchoolId(school_id) {
    const [users] = await db.query(
      'SELECT * FROM users WHERE school_id = ?',
      [school_id]
    );
    return users[0] || null;
  }

  // Find user by ID
  static async findById(id) {
    const [users] = await db.query(
      'SELECT id, school_id, name, email, role, course, year_level, preferred_genres, is_first_login, is_active FROM users WHERE id = ?',
      [id]
    );
    return users[0] || null;
  }

  // Create new user
  static async create(userData) {
    const { school_id, password_hash, name, role, course, year_level, email } = userData;
    const [result] = await db.query(
      `INSERT INTO users (school_id, password_hash, name, role, course, year_level, email) 
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [school_id, password_hash, name, role, course, year_level, email]
    );
    return result.insertId;
  }

  // Update user
  static async update(id, userData) {
    const fields = [];
    const values = [];
    
    // Whitelist of allowed fields (security measure)
    const allowedFields = [
      'name', 'email', 'role', 'course', 'year_level', 
      'is_active', 'school_id', 'program', 'preferred_genres'
    ];
    
    for (const [key, value] of Object.entries(userData)) {
      // Only update allowed fields
      if (allowedFields.includes(key) && value !== undefined) {
        fields.push(`${key} = ?`);  // ✅ FIXED: Added parentheses
        values.push(value);
      }
    }
    
    if (fields.length === 0) return false;
    
    values.push(id);
    const [result] = await db.query(
      `UPDATE users SET ${fields.join(', ')} WHERE id = ?`,
      values
    );
    return result.affectedRows > 0;
  }

  // Delete user
  static async delete(id) {
    const [result] = await db.query('DELETE FROM users WHERE id = ?', [id]);
    return result.affectedRows > 0;
  }

  // Update user's password and clear first_login flag
  static async updatePassword(userId, hashedPassword) {
    const [result] = await db.query(
      'UPDATE users SET password_hash = ?, is_first_login = false, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
      [hashedPassword, userId]
    );
    return result.affectedRows > 0;
  }

  // Optional: Reset password (for admin reset - sets first_login back to true)
  static async resetPassword(userId, hashedPassword) {
    const [result] = await db.query(
      'UPDATE users SET password_hash = ?, is_first_login = true, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
      [hashedPassword, userId]
    );
    return result.affectedRows > 0;
  }

  // Get all users with filters
  static async findAll(filters = {}, limit = 100, offset = 0) {
    let query = 'SELECT id, school_id, name, email, role, course, year_level, is_active FROM users WHERE 1=1';
    const params = [];
    
    // Filter out users with null critical fields
    query += ' AND name IS NOT NULL AND school_id IS NOT NULL';
    
    if (filters.role) {
      query += ' AND role = ?';
      params.push(filters.role);
    }
    
    if (filters.search) {
      query += ' AND (name LIKE ? OR school_id LIKE ? OR email LIKE ?)';
      params.push(`%${filters.search}%`, `%${filters.search}%`, `%${filters.search}%`); // ✅ FIXED
    }
    
    if (filters.is_active !== undefined) {
      query += ' AND is_active = ?';
      params.push(filters.is_active);
    }
    
    // Add pagination
    query += ' ORDER BY created_at DESC LIMIT ? OFFSET ?';
    params.push(limit, offset);
    
    const [users] = await db.query(query, params);
    return users;
  }

  // Update last login
  static async updateLastLogin(id) {
    await db.query('UPDATE users SET last_login = NOW() WHERE id = ?', [id]);
  }

  // Update password
  static async updatePassword(id, password_hash) {
    await db.query(
      'UPDATE users SET password_hash = ?, is_first_login = FALSE WHERE id = ?',
      [password_hash, id]
    );
  }

  // Check and update user's overdue status
  static async updateOverdueStatus(userId) {
    const [overdueBorrows] = await db.query(
      `SELECT COUNT(*) as count FROM borrows WHERE user_id = ? AND status = 'active' AND due_date < NOW()`,
      [userId]
    );
    
    const hasOverdue = overdueBorrows[0].count > 0;
    
    await db.query(
      'UPDATE users SET has_overdue_books = ? WHERE id = ?',
      [hasOverdue, userId]
    );
    
    return hasOverdue;
  }
}

module.exports = User;