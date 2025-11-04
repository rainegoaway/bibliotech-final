// ============================================
// BORROW CONTROLLER
// ============================================
const Borrow = require('../models/Borrow');
const Book = require('../models/Book');
const User = require('../models/User');
const Reservation = require('../models/Reservation');
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
        const reservation = await Reservation.findActiveReservationByBookId(bookId);
        
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
      const borrowId = await Borrow.create(connection, userId, bookId);

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
        borrowId
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

      // Update borrow record to returned
      await Borrow.return(connection, borrowId);
      
      // Check if book has a pending reservation
      const reservation = await Reservation.findActiveReservationByBookId(borrow.book_id);
      
      if (reservation) {
        console.log('⏳ Book has pending reservation by user:', reservation.user_id);
        // If there is a pending reservation, update book status to "reserved"
        await connection.query(
          'UPDATE books SET status = "reserved", current_borrower_id = NULL WHERE id = ?',
          [borrow.book_id]
        );
        // Update reservation to "ready"
        await connection.query(
          'UPDATE reservations SET status = "ready", ready_date = NOW() WHERE id = ?',
          [reservation.id]
        );

      } else {
        // If there are no pending reservations, update book status to "available"
        await connection.query(
          'UPDATE books SET status = "available", current_borrower_id = NULL WHERE id = ?',
          [borrow.book_id]
        );
      }

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

  // Get current user's borrow history
  static async getBorrowHistory(req, res) {
    try {
      const userId = req.user.id;
      const history = await Borrow.findHistoryByUserId(userId); // Assumes this method exists
      
      res.json({
        count: history.length,
        history
      });
    } catch (error) {
      console.error('Get borrow history error:', error);
      res.status(500).json({ error: 'Failed to fetch borrow history' });
    }
  }
}

module.exports = BorrowController;