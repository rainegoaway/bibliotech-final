// ============================================
// UPDATED BORROW CONTROLLER
// ============================================
const Borrow = require('../models/Borrow');
const Book = require('../models/Book');
const User = require('../models/User');
const db = require('../config/database');

class BorrowController {
  // ============================================
  // BORROW A BOOK (Updated to handle reservations)
  // ============================================
  static async borrowBook(req, res) {
    const connection = await db.getConnection();
    
    try {
      await connection.beginTransaction();
      
      const { bookId } = req.params;
      const userId = req.user.id;

      console.log('📥 Borrow request - User:', userId, 'Book:', bookId);

      // 1. Check if book exists
      const book = await Book.findById(bookId);
      if (!book) {
        await connection.rollback();
        return res.status(404).json({ error: 'Book not found' });
      }

      console.log('📚 Book status:', book.status);

      // 2. Check if user has overdue books
      const user = await User.findById(userId);
      if (user.has_overdue_books) {
        await connection.rollback();
        return res.status(403).json({ 
          error: 'You have overdue books. Please return them before borrowing more.' 
        });
      }

      // 3. Check if user already has this book borrowed
      const activeborrows = await Borrow.findActiveByUserId(userId);
      const alreadyBorrowed = activeborrows.some(b => b.book_id == bookId);
      if (alreadyBorrowed) {
        await connection.rollback();
        return res.status(400).json({ 
          error: 'You have already borrowed this book' 
        });
      }

      // 4. Handle different book statuses
      if (book.status === 'available') {
        // Normal borrowing - book is available
        console.log('✅ Book is available, proceeding with normal borrow');
        
      } else if (book.status === 'reserved') {
        // Check if this user is the reserver with a 'ready' reservation
        const reservation = await Borrow.findActiveReservationByBookId(bookId);
        
        if (!reservation || reservation.status !== 'ready') {
          await connection.rollback();
          return res.status(400).json({ 
            error: 'Book is reserved. Waiting for current borrower to return it.' 
          });
        }
        
        if (reservation.user_id !== userId) {
          await connection.rollback();
          return res.status(403).json({ 
            error: 'This book is reserved by another user.' 
          });
        }
        
        // Check if reservation has expired
        const now = new Date();
        const expiresAt = new Date(reservation.expires_at);
        if (now > expiresAt) {
          await connection.rollback();
          return res.status(400).json({ 
            error: 'Your reservation has expired. The book is no longer available.' 
          });
        }
        
        console.log('✅ User is the reserver, proceeding with reservation pickup');
        
        // Complete the reservation
        await connection.query(
          'UPDATE reservations SET status = "completed", completed_date = NOW() WHERE id = ?',
          [reservation.id]
        );
        
      } else {
        // Book is borrowed or in maintenance
        await connection.rollback();
        return res.status(400).json({ 
          error: `Book is currently ${book.status}. Cannot borrow.` 
        });
      }

      // 5. Create borrow record
      const dueDate = new Date(Date.now() + 3 * 24 * 60 * 60 * 1000);
      const [result] = await connection.query(
        `INSERT INTO borrows (user_id, book_id, borrowed_date, due_date) 
         VALUES (?, ?, NOW(), ?)`,
        [userId, bookId, dueDate]
      );
      const borrowId = result.insertId;

      // 6. Update book status to borrowed
      await connection.query(
        'UPDATE books SET status = "borrowed", current_borrower_id = ? WHERE id = ?',
        [userId, bookId]
      );

      await connection.commit();
      
      console.log('✅ Book borrowed successfully');

      res.status(201).json({
        message: book.status === 'reserved' 
          ? 'Reserved book picked up successfully!' 
          : 'Book borrowed successfully',
        borrowId,
        dueDate
      });
      
    } catch (error) {
      await connection.rollback();
      console.error('❌ Borrow error:', error);
      res.status(500).json({ 
        error: 'Failed to borrow book',
        details: error.message 
      });
    } finally {
      connection.release();
    }
  }

  // ============================================
  // RETURN A BOOK (Updated to handle reservations)
  // ============================================
  static async returnBook(req, res) {
    const connection = await db.getConnection();
    
    try {
      await connection.beginTransaction();
      
      const { borrowId } = req.params;
      const userId = req.user.id;
      const isAdmin = req.user.role === 'admin';

      console.log('📥 Return request - User:', userId, 'Borrow:', borrowId, 'IsAdmin:', isAdmin);

      // Get the borrow record
      let borrow;
      if (isAdmin) {
        borrow = await Borrow.findById(borrowId);
      } else {
        const borrows = await Borrow.findActiveByUserId(userId);
        borrow = borrows.find(b => b.id == borrowId);
      }
      
      if (!borrow) {
        await connection.rollback();
        return res.status(404).json({ error: 'Borrow record not found' });
      }

      if (borrow.status !== 'active') {
        await connection.rollback();
        return res.status(400).json({ error: 'This book has already been returned' });
      }

      console.log('📚 Returning book ID:', borrow.book_id);

      // Check if book has a pending reservation
      const reservation = await Borrow.findActiveReservationByBookId(borrow.book_id);
      
      if (reservation) {
        console.log('⏳ Book has pending reservation by user:', reservation.user_id);
      }

      // Update borrow record to returned
      // The database trigger will automatically handle:
      // - Updating book status
      // - Updating reservation status if exists
      // - Clearing current_borrower_id
      // - Updating user's overdue status
      await connection.query(
        'UPDATE borrows SET status = ?, returned_date = NOW() WHERE id = ?',
        ['returned', borrowId]
      );
      
      console.log('✅ Borrow record updated to returned');
      console.log('✅ Database triggers handled book and reservation status updates');

      await connection.commit();
      
      console.log('✅ Book returned successfully');

      res.json({ 
        message: reservation 
          ? 'Book returned successfully. Reservation holder has been notified and can now pick up the book.'
          : 'Book returned successfully',
        returnedDate: new Date(),
        hasReservation: !!reservation,
        reservationStatus: reservation ? 'ready' : null
      });
      
    } catch (error) {
      await connection.rollback();
      console.error('❌ Return error:', error);
      res.status(500).json({ 
        error: 'Failed to return book',
        details: error.message 
      });
    } finally {
      connection.release();
    }
  }

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
      const user = await User.findById(userId);
      if (user.has_overdue_books) {
        await connection.rollback();
        return res.status(403).json({ 
          error: 'You have overdue books. Please return them before reserving.' 
        });
      }

      // 4. Check if book already has a reservation (1:1 ratio)
      const existingReservation = await Borrow.findActiveReservationByBookId(bookId);
      if (existingReservation) {
        await connection.rollback();
        return res.status(400).json({ 
          error: 'This book already has an active reservation.' 
        });
      }

      // 5. Check if user already reserved this book
      const userReservations = await Borrow.findReservationsByUserId(userId);
      const alreadyReserved = userReservations.some(r => r.book_id == bookId && r.status === 'pending');
      if (alreadyReserved) {
        await connection.rollback();
        return res.status(400).json({ 
          error: 'You have already reserved this book' 
        });
      }

      // 6. Create reservation
      const expiresAt = new Date(Date.now() + 3 * 24 * 60 * 60 * 1000); // 3 days to claim after ready
      
      const [result] = await connection.query(
        `INSERT INTO reservations (user_id, book_id, reserved_date, expires_at, status)
         VALUES (?, ?, NOW(), ?, 'pending')`,
        [userId, bookId, expiresAt]
      );
      const reservationId = result.insertId;

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
      const reservation = await Borrow.findReservationById(reservationId);
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
      await connection.query(
        'UPDATE reservations SET status = "cancelled", cancelled_date = NOW() WHERE id = ?',
        [reservationId]
      );

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
  // OTHER METHODS (Keep existing implementations)
  // ============================================
  
  static async renewBook(req, res) {
    try {
      const { borrowId } = req.params;
      const userId = req.user.id;

      const borrows = await Borrow.findActiveByUserId(userId);
      const borrow = borrows.find(b => b.id == borrowId);
      
      if (!borrow) {
        return res.status(404).json({ error: 'Borrow record not found' });
      }

      if (borrow.renewal_count >= 99) {
        return res.status(400).json({ 
          error: 'Maximum renewal limit reached (99 renewals)'
        });
      }

      const now = new Date();
      const dueDate = new Date(borrow.due_date);
      if (now > dueDate) {
        return res.status(400).json({ 
          error: 'Cannot renew overdue books. Please return the book.' 
        });
      }

      const success = await Borrow.renew(borrowId);
      if (!success) {
        return res.status(400).json({ error: 'Failed to renew book' });
      }

      const newDueDate = new Date(dueDate.getTime() + 24 * 60 * 60 * 1000);

      res.json({ 
        message: 'Book renewed successfully',
        newDueDate: newDueDate,
        renewalsRemaining: 99 - (borrow.renewal_count + 1)
      });
    } catch (error) {
      console.error('Renew error:', error);
      res.status(500).json({ error: 'Failed to renew book' });
    }
  }

  static async getMyBorrows(req, res) {
    try {
      const userId = req.user.id;
      const borrows = await Borrow.findActiveByUserId(userId);
      
      res.json({
        count: borrows.length,
        borrows: borrows.map(b => ({
          ...b,
          is_overdue: new Date(b.due_date) < new Date(),
          daysUntilDue: Math.ceil((new Date(b.due_date) - Date.now()) / (1000 * 60 * 60 * 24))
        }))
      });
    } catch (error) {
      console.error('Get my borrows error:', error);
      res.status(500).json({ error: 'Failed to fetch borrowed books' });
    }
  }

  static async getMyReservations(req, res) {
    try {
      const userId = req.user.id;
      const reservations = await Borrow.findReservationsByUserId(userId);
      
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

  static async getOverdueBorrows(req, res) {
    try {
      const overdueBorrows = await Borrow.findOverdue();
      
      res.json({
        count: overdueBorrows.length,
        borrows: overdueBorrows.map(b => ({
          ...b,
          daysOverdue: Math.floor((Date.now() - new Date(b.due_date)) / (1000 * 60 * 60 * 24))
        }))
      });
    } catch (error) {
      console.error('Get overdue error:', error);
      res.status(500).json({ error: 'Failed to fetch overdue borrows' });
    }
  }

  static async getAllActiveBorrows(req, res) {
    try {
      const borrows = await Borrow.findAll();
      
      res.json({
        count: borrows.length,
        borrows: borrows.map(b => ({
          ...b,
          is_overdue: new Date(b.due_date) < new Date(),
          daysUntilDue: Math.ceil((new Date(b.due_date) - Date.now()) / (1000 * 60 * 60 * 24))
        }))
      });
    } catch (error) {
      console.error('Get all borrows error:', error);
      res.status(500).json({ error: 'Failed to fetch borrows' });
    }
  }

  static async getBorrowByBookId(req, res) {
    try {
      const { bookId } = req.params;
      
      const borrow = await Borrow.findActiveByBookId(bookId);
      
      if (!borrow) {
        return res.status(404).json({ error: 'No active borrow found for this book' });
      }

      res.json({
        borrow: {
          ...borrow,
          is_overdue: new Date(borrow.due_date) < new Date(),
          daysUntilDue: Math.ceil((new Date(borrow.due_date) - Date.now()) / (1000 * 60 * 60 * 24))
        }
      });
    } catch (error) {
      console.error('Get borrow by book error:', error);
      res.status(500).json({ error: 'Failed to fetch borrow record' });
    }
  }
}

module.exports = BorrowController;