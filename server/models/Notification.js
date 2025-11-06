const db = require('../config/database');

class Notification {
  static async create(notification, connection = db) {
    if (Array.isArray(notification)) {
      // Bulk insert
      if (notification.length === 0) return [];

      const values = notification.map(n => [
        n.userId,
        n.type,
        n.title,
        n.message,
        n.relatedBookId,
        n.relatedBorrowId,
      ]);

      const [result] = await connection.query(
        'INSERT INTO notifications (user_id, type, title, message, related_book_id, related_borrow_id) VALUES ?',
        [values]
      );
      // For bulk inserts, insertId is usually the ID of the first inserted row.
      // Returning an array of IDs would require more complex logic or a different database driver.
      // For simplicity, we'll return the first insertId or null if no rows were affected.
      return result.insertId ? Array.from({ length: notification.length }, (_, i) => result.insertId + i) : [];
    } else {
      // Single insert
      const {
        userId,
        type,
        title,
        message,
        relatedBookId,
        relatedBorrowId,
      } = notification;
      const [result] = await connection.execute(
        'INSERT INTO notifications (user_id, type, title, message, related_book_id, related_borrow_id) VALUES (?, ?, ?, ?, ?, ?)',
        [userId, type, title, message, relatedBookId, relatedBorrowId]
      );
      return result.insertId;
    }
  }

  static async findByUserId(userId) {
    const [rows] = await db.query(
      'SELECT * FROM notifications WHERE user_id = ? ORDER BY created_date DESC',
      [userId]
    );
    return rows;
  }

  static async markAsRead(notificationId) {
    const [result] = await db.execute(
      'UPDATE notifications SET is_read = 1, read_at = CURRENT_TIMESTAMP WHERE id = ?',
      [notificationId]
    );
    return result.affectedRows > 0;
  }
}

module.exports = Notification;
