const Reservation = require('../models/Reservation');
const Book = require('../models/Book');
const User = require('../models/User');
const db = require('../config/database');

class ReservationController {
  // ============================================
  // RESERVE A BOOK
  // ============================================
  static async reserveBook(req, res) {
    const connection = await db.getConnection();
    
    try {
      await connection.beginTransaction();
      
      const { bookId } = req.body;
      const userId = req.user.id;

      console.log('📥 Reserve request - User:', userId, 'Book:', bookId);

      // 1. Check if book exists
      const book = await Book.findById(bookId);
      if (!book) {
        await connection.rollback();
        return res.status(404).json({ error: 'Book not found' });
      }

      console.log('📚 Book found:', book.title, 'Status:', book.status);

      // 2. Check if book is borrowed (can only reserve borrowed books)
      if (book.status !== 'borrowed') {
        await connection.rollback();
        return res.status(400).json({ 
          error: book.status === 'available' 
            ? 'Book is currently available. You can borrow it directly.'
            : `Book is currently ${book.status}. Cannot reserve.`
        });
      }

      // 3. Check if user has overdue books
      const hasOverdue = await User.updateOverdueStatus(userId);
      if (hasOverdue) {
        await connection.rollback();
        return res.status(403).json({ 
          error: 'You have overdue books. Please return them before reserving.' 
        });
      }

      // 4. Check if book already has a reservation (1:1 ratio)
      const existingReservation = await Reservation.findActiveReservationByBookId(bookId);
      if (existingReservation) {
        await connection.rollback();
        return res.status(400).json({ 
          error: 'This book already has an active reservation.' 
        });
      }

      // 5. Check if user already reserved this book
      const userReservations = await Reservation.findReservationsByUserId(userId);
      const alreadyReserved = userReservations.some(r => r.book_id == bookId && r.status === 'pending');
      if (alreadyReserved) {
        await connection.rollback();
        return res.status(400).json({ 
          error: 'You have already reserved this book' 
        });
      }

      // 6. Create reservation
      const expiresAt = new Date(Date.now() + 3 * 24 * 60 * 60 * 1000); // 3 days to claim after ready
      
      const reservationId = await Reservation.create(userId, bookId, expiresAt);

      // 7. Update book status to reserved
      await connection.query(
        'UPDATE books SET status = "reserved" WHERE id = ?',
        [bookId]
      );

      await connection.commit();
      
      console.log('✅ Reservation created:', reservationId);

      res.status(201).json({
        message: 'Book reserved successfully. You will be notified when available.',
        reservationId,
        expiresAt
      });
      
    } catch (error) {
      await connection.rollback();
      console.error('❌ Reserve error:', error);
      res.status(500).json({ 
        error: 'Failed to reserve book',
        details: error.message 
      });
    } finally {
      connection.release();
    }
  }

  // ============================================
  // CANCEL RESERVATION
  // ============================================
  static async cancelReservation(req, res) {
    const connection = await db.getConnection();
    
    try {
      await connection.beginTransaction();
      
      const { reservationId } = req.params;
      const userId = req.user.id;

      console.log('📥 Cancel reservation - User:', userId, 'Reservation:', reservationId);

      // Get reservation details
      const reservation = await Reservation.findById(reservationId);
      if (!reservation) {
        await connection.rollback();
        return res.status(404).json({ error: 'Reservation not found' });
      }

      if (reservation.user_id !== userId) {
        await connection.rollback();
        return res.status(403).json({ error: 'Not authorized to cancel this reservation' });
      }

      if (reservation.status !== 'pending' && reservation.status !== 'ready') {
        await connection.rollback();
        return res.status(400).json({ 
          error: `Cannot cancel reservation with status: ${reservation.status}` 
        });
      }

      // Cancel the reservation
      await Reservation.cancel(reservationId);

      // Update book status back to borrowed (if still borrowed) or available
      const bookBorrow = await Borrow.findActiveByBookId(reservation.book_id);
      const newStatus = bookBorrow ? 'borrowed' : 'available';
      
      await connection.query(
        'UPDATE books SET status = ? WHERE id = ?',
        [newStatus, reservation.book_id]
      );

      await connection.commit();
      
      console.log('✅ Reservation cancelled');

      res.json({ 
        message: 'Reservation cancelled successfully'
      });
      
    } catch (error) {
      await connection.rollback();
      console.error('❌ Cancel reservation error:', error);
      res.status(500).json({ 
        error: 'Failed to cancel reservation',
        details: error.message 
      });
    } finally {
      connection.release();
    }
  }

  // ============================================
  // EXPIRE UNCLAIMED RESERVATIONS (Cron Job)
  // ============================================
  static async expireUnclaimedReservations(req, res) {
    const connection = await db.getConnection();
    
    try {
      await connection.beginTransaction();
      
      console.log('🕐 Running reservation expiration check...');

      // Find all 'ready' reservations that have expired
      const [expiredReservations] = await connection.query(
        `SELECT r.*, b.title as book_title
         FROM reservations r
         JOIN books b ON r.book_id = b.id
         WHERE r.status = 'ready' AND r.expires_at < NOW()`
      );

      console.log(`📋 Found ${expiredReservations.length} expired reservations`);

      for (const reservation of expiredReservations) {
        console.log(`⏰ Expiring reservation ${reservation.id} for book: ${reservation.book_title}`);
        
        // Mark reservation as expired
        await connection.query(
          'UPDATE reservations SET status = "expired", expired_date = NOW() WHERE id = ?',
          [reservation.id]
        );
        
        // Set book back to available
        await connection.query(
          'UPDATE books SET status = "available", current_borrower_id = NULL WHERE id = ?',
          [reservation.book_id]
        );
      }

      await connection.commit();
      
      console.log('✅ Reservation expiration check complete');

      if (res) {
        res.json({ 
          message: 'Expired reservations processed',
          count: expiredReservations.length,
          expired: expiredReservations.map(r => ({
            reservationId: r.id,
            bookId: r.book_id,
            bookTitle: r.book_title,
            userId: r.user_id
          }))
        });
      }
      
      return expiredReservations.length;
      
    } catch (error) {
      await connection.rollback();
      console.error('❌ Expire reservations error:', error);
      if (res) {
        res.status(500).json({ 
          error: 'Failed to expire reservations',
          details: error.message 
        });
      }
      throw error;
    } finally {
      connection.release();
    }
  }

  // ============================================
  // GET MY RESERVATIONS
  // ============================================
  static async getMyReservations(req, res) {
    try {
      const userId = req.user.id;
      const reservations = await Reservation.findReservationsByUserId(userId);
      
      res.json({
        count: reservations.length,
        reservations: reservations.map(r => ({
          ...r,
          isExpired: new Date(r.expires_at) < new Date()
        }))
      });
    } catch (error) {
      console.error('Get reservations error:', error);
      res.status(500).json({ error: 'Failed to fetch reservations' });
    }
  }
}

module.exports = ReservationController;
