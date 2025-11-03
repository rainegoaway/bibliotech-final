// CONTROLLER - Handles book management logic
// ============================================
const Book = require('../models/Book');

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
      
      res.json({ 
        count: books.length,
        books 
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
    try {
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
        return res.status(400).json({ error: 'Title is required' });
      }

      if (!author || !author.trim()) {
        return res.status(400).json({ error: 'Author is required' });
      }

      if (!shelf_location || !shelf_location.trim()) {
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
      });

      console.log('✅ Book created:', result);

      res.status(201).json({
        message: 'Book added successfully',
        bookId: result.bookId,
        qr_code: result.qr_code
      });
    } catch (error) {
      console.error('❌ Create book error:', error);
      res.status(500).json({ 
        error: 'Failed to add book',
        details: error.message 
      });
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
}

module.exports = BookController;