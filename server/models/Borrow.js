// MODEL - Handles borrowing operations
// ============================================
const db = require('../config/database');

class Borrow {
  // Create new borrow
  static async create(user_id, book_id) {
    const [result] = await db.query(
      'INSERT INTO borrows (user_id, book_id, borrowed_date, due_date) VALUES (?, ?, NOW(), DATE_ADD(NOW(), INTERVAL 3 DAY))',
      [user_id, book_id]
    );
    return result.insertId;
  }

  // Get user's active borrows
  static async findActiveByUserId(user_id) {
    const [borrows] = await db.query(
      `SELECT b.*, bk.title, bk.author, bk.cover_image_url
       FROM borrows b
       JOIN books bk ON b.book_id = bk.id
       WHERE b.user_id = ? AND b.status = 'active'
       ORDER BY b.due_date ASC`,
      [user_id]
    );
    return borrows;
  }

  // Get user's borrow history
  static async findHistoryByUserId(user_id) {
    const [history] = await db.query(
      `SELECT b.id, b.book_id, b.borrowed_date, b.returned_date, 
              bk.title, bk.author, bk.cover_image_url
       FROM borrows b
       JOIN books bk ON b.book_id = bk.id
       WHERE b.user_id = ? AND b.status = 'returned'
       ORDER BY b.returned_date DESC`,
      [user_id]
    );
    return history;
  }

  // Mark as returned
  static async return(id) {
    const [result] = await db.query(
      'UPDATE borrows SET status = "returned", returned_date = NOW() WHERE id = ?',
      [id]
    );
    return result.affectedRows > 0;
  }

  // Renew borrow
  // Renew a borrow (extend due date by 1 day)
static async renew(borrowId) {
  const query = `
    UPDATE borrows 
    SET due_date = DATE_ADD(due_date, INTERVAL 1 DAY),
        renewal_count = renewal_count + 1,
        last_renewed_date = NOW(),
        updated_at = NOW()
    WHERE id = ? AND status = 'active'
  `;
  
  const [result] = await db.query(query, [borrowId]);
  return result.affectedRows > 0;
}

  // Get overdue borrows
  static async findOverdue() {
    const [borrows] = await db.query(
      `SELECT b.*, u.name as user_name, bk.title as book_title
       FROM borrows b
       JOIN users u ON b.user_id = u.id
       JOIN books bk ON b.book_id = bk.id
       WHERE b.status = 'active' AND b.due_date < NOW()`
    );
    return borrows;
  }

  // ============================================
// RESERVATION METHODS
// ============================================

// Create a reservation
static async createReservation(userId, bookId) {
  try {
    const expiresAt = new Date(Date.now() + 3 * 24 * 60 * 60 * 1000); // 3 days from now
    
    const query = `
      INSERT INTO reservations (user_id, book_id, reserved_date, expires_at, status)
      VALUES (?, ?, NOW(), ?, 'pending')
    `;
    
    const [result] = await db.query(query, [userId, bookId, expiresAt]);
    
    // Update book status to reserved
    await db.query('UPDATE books SET status = ? WHERE id = ?', ['reserved', bookId]);
    
    return result.insertId;
  } catch (error) {
    console.error('Create reservation error:', error);
    throw error;
  }
}

// Find active reservation by book ID
static async findActiveReservationByBookId(bookId) {
  try {
    const query = `
      SELECT r.*, u.name as user_name, u.school_id
      FROM reservations r
      JOIN users u ON r.user_id = u.id
      WHERE r.book_id = ? AND r.status = 'pending'
      LIMIT 1
    `;
    
    const [rows] = await db.query(query, [bookId]);
    return rows[0] || null;
  } catch (error) {
    console.error('Find active reservation error:', error);
    throw error;
  }
}

// Find all reservations by user ID
static async findReservationsByUserId(userId) {
  try {
    const query = `
      SELECT r.*, 
             b.title, b.author, b.qr_code, b.status as book_status
      FROM reservations r
      JOIN books b ON r.book_id = b.id
      WHERE r.user_id = ? AND r.status = 'pending'
      ORDER BY r.reserved_date DESC
    `;
    
    const [rows] = await db.query(query, [userId]);
    return rows;
  } catch (error) {
    console.error('Find reservations by user error:', error);
    throw error;
  }
}

// Find reservation by ID
static async findReservationById(reservationId) {
  try {
    const query = `
      SELECT r.*, 
             b.title, b.author, b.status as book_status,
             u.name as user_name, u.school_id
      FROM reservations r
      JOIN books b ON r.book_id = b.id
      JOIN users u ON r.user_id = u.id
      WHERE r.id = ?
    `;
    
    const [rows] = await db.query(query, [reservationId]);
    return rows[0] || null;
  } catch (error) {
    console.error('Find reservation by ID error:', error);
    throw error;
  }
}

// Cancel a reservation
static async cancelReservation(reservationId) {
  try {
    // Get the reservation first to get book_id
    const reservation = await this.findReservationById(reservationId);
    if (!reservation) return false;
    
    const query = `
      UPDATE reservations 
      SET status = 'cancelled', cancelled_date = NOW()
      WHERE id = ? AND status = 'pending'
    `;
    
    const [result] = await db.query(query, [reservationId]);
    
    // If successful, update book status back to borrowed
    if (result.affectedRows > 0) {
      await db.query('UPDATE books SET status = ? WHERE id = ?', ['borrowed', reservation.book_id]);
    }
    
    return result.affectedRows > 0;
  } catch (error) {
    console.error('Cancel reservation error:', error);
    throw error;
  }
}

  // Find active borrow by book ID
static async findActiveByBookId(bookId) {
  const query = `
    SELECT b.*, 
           bk.title, bk.author, bk.qr_code,
           u.name as borrower_name, u.school_id
    FROM borrows b
    JOIN books bk ON b.book_id = bk.id
    JOIN users u ON b.user_id = u.id
    WHERE b.book_id = ? AND b.status = 'active'
    LIMIT 1
  `;
  const [rows] = await db.query(query, [bookId]);
  return rows[0] || null;
}

// Find all active borrows (for admin)
static async findAll() {
  const query = `
    SELECT b.*, 
           bk.title, bk.author, bk.qr_code,
           u.name as borrower_name, u.school_id
    FROM borrows b
    JOIN books bk ON b.book_id = bk.id
    JOIN users u ON b.user_id = u.id
    WHERE b.status = 'active'
    ORDER BY b.borrowed_date DESC
  `;
  const [rows] = await db.query(query);
  return rows;
}

// Find borrow by ID (single borrow record by its ID)
static async findById(borrowId) {
  const query = `
    SELECT b.*, 
           bk.title, bk.author, bk.qr_code,
           u.name as borrower_name, u.school_id
    FROM borrows b
    JOIN books bk ON b.book_id = bk.id
    JOIN users u ON b.user_id = u.id
    WHERE b.id = ?
    LIMIT 1
  `;
  const [rows] = await db.query(query, [borrowId]);
  return rows[0] || null;
}

// Update reservation status to 'ready'
static async markReservationReady(reservationId) {
  try {
    const query = `
      UPDATE reservations 
      SET status = 'ready', 
          ready_date = NOW(),
          updated_at = NOW()
      WHERE id = ? AND status = 'pending'
    `;
    
    const [result] = await db.query(query, [reservationId]);
    return result.affectedRows > 0;
  } catch (error) {
    console.error('Mark reservation ready error:', error);
    throw error;
  }
}

// Complete/claim a reservation (when reserver borrows the book)
static async completeReservation(reservationId) {
  try {
    const query = `
      UPDATE reservations 
      SET status = 'completed', 
          completed_date = NOW(),
          updated_at = NOW()
      WHERE id = ? AND status = 'ready'
    `;
    
    const [result] = await db.query(query, [reservationId]);
    return result.affectedRows > 0;
  } catch (error) {
    console.error('Complete reservation error:', error);
    throw error;
  }
}

// Expire unclaimed reservations (to be called by a cron job or when checking)
static async expireReservation(reservationId, bookId) {
  try {
    const query = `
      UPDATE reservations 
      SET status = 'expired', 
          expired_date = NOW(),
          updated_at = NOW()
      WHERE id = ? AND status = 'ready'
    `;
    
    const [result] = await db.query(query, [reservationId]);
    
    // If expired successfully, update book status to available
    if (result.affectedRows > 0) {
      await db.query(
        'UPDATE books SET status = ?, current_borrower_id = NULL WHERE id = ?', 
        ['available', bookId]
      );
    }
    
    return result.affectedRows > 0;
  } catch (error) {
    console.error('Expire reservation error:', error);
    throw error;
  }
}

}
module.exports = Borrow;