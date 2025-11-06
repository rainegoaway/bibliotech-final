// CONTROLLER - Handles book management logic
// ============================================
const Book = require('../models/Book');
const User = require('../models/User');
const Notification = require('../models/Notification');
const db = require('../config/database');

class BookController {
  // Get all books with filters
  static async getAllBooks(req, res) {
    try {
      const { status, genre_id, subject_id, search, shelf_location, limit = 100, offset = 0 } = req.query;
      
      const filters = {
        status,
        genre_id,
        subject_id,
        search,
        shelf_location,
        limit: parseInt(limit),
        offset: parseInt(offset)
      };

      const books = await Book.findAll(filters);

      const booksWithOverdue = books.map(book => {
        const isOverdue = book.due_date && new Date(book.due_date) < new Date();
        let fine = 0;
        if (isOverdue) {
          let daysOverdue = Math.floor((Date.now() - new Date(book.due_date).getTime()) / (1000 * 60 * 60 * 24));
          if (daysOverdue === 0) {
            daysOverdue = 1;
          }
          fine = daysOverdue * 5;
        }
        return {
          ...book,
          is_overdue: isOverdue,
          fine: fine
        };
      });

      res.json({ 
        count: books.length,
        books: booksWithOverdue
      });
    } catch (error) {
      console.error('❌ Get books error:', error);
      res.status(500).json({ error: 'Failed to fetch books' });
    }
  }

  // Get book by ID
  static async getBookById(req, res) {
    try {
      const { id } = req.params;
      
      const book = await Book.findById(id);
      if (!book) {
        return res.status(404).json({ error: 'Book not found' });
      }

      res.json({ book });
    } catch (error) {
      console.error('❌ Get book error:', error);
      res.status(500).json({ error: 'Failed to fetch book' });
    }
  }

  // Get book by QR code
  static async getBookByQR(req, res) {
    try {
      const { qr_code } = req.params;
      
      const book = await Book.findByQRCode(qr_code);
      if (!book) {
        return res.status(404).json({ error: 'Book not found' });
      }

      res.json({ book });
    } catch (error) {
      console.error('❌ Get book by QR error:', error);
      res.status(500).json({ error: 'Failed to fetch book' });
    }
  }

  // Create new book (admin only)
    static async createBook(req, res) {
      const connection = await db.getConnection();
      try {
        await connection.beginTransaction();
  
        const {
          title,
          author,
          isbn,
          publication_year,
          publisher,
          pages,
          synopsis,
          shelf_location,
          genre_ids,
          subject_ids
        } = req.body;
  
        // Validation
        if (!title || !title.trim()) {
          await connection.rollback();
          return res.status(400).json({ error: 'Title is required' });
        }
  
        if (!author || !author.trim()) {
          await connection.rollback();
          return res.status(400).json({ error: 'Author is required' });
        }
  
        if (!shelf_location || !shelf_location.trim()) {
          await connection.rollback();
          return res.status(400).json({ error: 'Shelf location is required' });
        }
  
        console.log('📚 Creating book:', title);
  
        const result = await Book.create({
          title: title.trim(),
          author: author.trim(),
          isbn: isbn?.trim() || null,
          publication_year: publication_year || null,
          publisher: publisher?.trim() || null,
          pages: pages || null,
          synopsis: synopsis?.trim() || null,
          shelf_location: shelf_location.trim(),
          genre_ids: genre_ids || [],
          subject_ids: subject_ids || []
        }, connection);
  
        console.log('✅ Book created:', result);
  
        // Notify users with matching preferences
        const { genres, subjects } = await Book.getBookGenresAndSubjects(result.bookId, connection);
        const genreIds = genres.map(g => g.id);
        const subjectIds = subjects.map(s => s.id);
  
        const notificationsToCreate = [];
        if (genreIds.length > 0 || subjectIds.length > 0) {
          const interestedUsers = await User.findUsersByPreferences(genreIds, subjectIds, connection);
          for (const user of interestedUsers) {
            notificationsToCreate.push({
              userId: user.id,
              type: 'new_book',
              title: 'New Book Alert!',
              message: `A new book, \'${title}\' by ${author}, matching your preferences has been added to the library!`,
              relatedBookId: result.bookId,
              relatedBorrowId: null,
            });
          }
        }
  
        if (notificationsToCreate.length > 0) {
          await Notification.create(notificationsToCreate, connection);
        }
  
        await connection.commit();
  
        res.status(201).json({
          message: 'Book added successfully',
          bookId: result.bookId,
          qr_code: result.qr_code
        });
      } catch (error) {
        await connection.rollback();
        console.error('❌ Create book error:', error);
        res.status(500).json({
          error: 'Failed to add book',
          details: error.message
        });
      } finally {
        connection.release();
      }
    }
  // Update book (admin only)
  static async updateBook(req, res) {
    try {
      const { id } = req.params;
      const updates = { ...req.body };

      console.log('📝 Updating book ID:', id);

      // Don't allow updating these fields
      delete updates.qr_code;
      delete updates.status;
      delete updates.current_borrower_id;
      delete updates.total_borrows;

      const success = await Book.update(id, updates);
      
      if (!success) {
        return res.status(404).json({ error: 'Book not found' });
      }

      console.log('✅ Book updated successfully');

      res.json({ message: 'Book updated successfully' });
    } catch (error) {
      console.error('❌ Update book error:', error);
      res.status(500).json({ 
        error: 'Failed to update book',
        details: error.message 
      });
    }
  }

  // Delete book (admin only)
  static async deleteBook(req, res) {
    try {
      const { id } = req.params;

      console.log('🗑️ Deleting book ID:', id);

      const success = await Book.delete(id);
      
      if (!success) {
        return res.status(404).json({ error: 'Book not found' });
      }

      console.log('✅ Book deleted successfully');

      res.json({ message: 'Book deleted successfully' });
    } catch (error) {
      console.error('❌ Delete book error:', error);
      
      if (error.message.includes('currently borrowed')) {
        return res.status(400).json({ error: error.message });
      }
      
      res.status(500).json({ 
        error: 'Failed to delete book',
        details: error.message 
      });
    }
  }

  // Get book's genres
  static async getBookGenres(req, res) {
    try {
      const { id } = req.params;
      
      const genres = await Book.getBookGenres(id);
      
      res.json({
        count: genres.length,
        genres
      });
    } catch (error) {
      console.error('❌ Get book genres error:', error);
      res.status(500).json({ error: 'Failed to fetch book genres' });
    }
  }

  // Get book's subjects
  static async getBookSubjects(req, res) {
    try {
      const { id } = req.params;
      
      const subjects = await Book.getBookSubjects(id);
      
      res.json({
        count: subjects.length,
        subjects
      });
    } catch (error) {
      console.error('❌ Get book subjects error:', error);
      res.status(500).json({ error: 'Failed to fetch book subjects' });
    }
  }

  // Search for books
  static async searchBooks(req, res) {
    try {
      const { q } = req.query;

      if (!q || !q.trim()) {
        return res.status(400).json({ error: 'Search query is required' });
      }

      console.log(`🔍 Searching for books with query: "${q}"`);

      const books = await Book.search(q);

      res.json({
        count: books.length,
        books
      });
      
    } catch (error) {
      console.error('❌ Book search error:', error);
      res.status(500).json({ 
        error: 'Failed to search for books',
        details: error.message 
      });
    }
  }
}

module.exports = BookController;