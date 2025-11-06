const db = require('../config/database');

class Reservation {
  static async findById(id) {
    const [rows] = await db.query('SELECT * FROM reservations WHERE id = ?', [id]);
    return rows[0];
  }

  static async findByUserId(userId) {
    const [rows] = await db.query('SELECT * FROM reservations WHERE user_id = ?', [userId]);
    return rows;
  }

  static async findByBookId(bookId) {
    const [rows] = await db.query('SELECT * FROM reservations WHERE book_id = ?', [bookId]);
    return rows;
  }

  static async findActiveReservationByBookId(bookId, connection = db) {
    const [rows] = await connection.query(
      "SELECT * FROM reservations WHERE book_id = ? AND status IN ('pending', 'ready') ORDER BY reserved_date ASC LIMIT 1",
      [bookId]
    );
    return rows[0];
  }

  static async findReservationsByUserId(userId) {
    const [rows] = await db.query(
      `SELECT r.*, b.title, b.author, b.cover_image_url
       FROM reservations r
       JOIN books b ON r.book_id = b.id
       WHERE r.user_id = ? AND r.status IN ('pending', 'ready')
       ORDER BY r.reserved_date DESC`,
      [userId]
    );
    return rows;
  }

  static async create(userId, bookId, expiresAt) {
    const [result] = await db.query(
      'INSERT INTO reservations (user_id, book_id, reserved_date, expires_at, status) VALUES (?, ?, NOW(), ?, ?)',
      [userId, bookId, expiresAt, 'pending']
    );
    return result.insertId;
  }

  static async updateStatus(id, status) {
    const [result] = await db.query('UPDATE reservations SET status = ? WHERE id = ?', [status, id]);
    return result.affectedRows > 0;
  }

  static async cancel(id) {
    const [result] = await db.query(
      'UPDATE reservations SET status = "cancelled", cancelled_date = NOW() WHERE id = ?',
      [id]
    );
    return result.affectedRows > 0;
  }
}

module.exports = Reservation;
