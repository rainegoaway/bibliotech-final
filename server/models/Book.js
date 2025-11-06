// MODEL - Handles all database operations for books
// ============================================
const db = require('../config/database');

class Book {
  // Generate unique QR code
  static generateQRCode() {
    const timestamp = Date.now();
    const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
    return `BOOK-${timestamp}-${random}`;
  }

  // Find all books with filters
  static async findAll(filters = {}) {
    let query = `
      SELECT DISTINCT b.*, 
             GROUP_CONCAT(DISTINCT g.name) as genre_names,
             GROUP_CONCAT(DISTINCT s.name) as subject_names,
             br.due_date
      FROM books b
      LEFT JOIN book_genres bg ON b.id = bg.book_id
      LEFT JOIN genres g ON bg.genre_id = g.id
      LEFT JOIN book_subjects bs ON b.id = bs.book_id
      LEFT JOIN subjects s ON bs.subject_id = s.id
      LEFT JOIN borrows br ON b.id = br.book_id AND br.status = 'active'
      WHERE 1=1
    `;
    const params = [];

    // Search filter
    if (filters.search) {
      query += ' AND (b.title LIKE ? OR b.author LIKE ? OR b.isbn LIKE ?)';
      const searchTerm = `%${filters.search}%`;
      params.push(searchTerm, searchTerm, searchTerm);
    }

    // Status filter
    if (filters.status) {
      query += ' AND b.status = ?';
      params.push(filters.status);
    }

    // Genre filter
    if (filters.genre_id) {
      query += ' AND bg.genre_id = ?';
      params.push(filters.genre_id);
    }

    // Subject filter
    if (filters.subject_id) {
      query += ' AND bs.subject_id = ?';
      params.push(filters.subject_id);
    }

    // Shelf location filter
    if (filters.shelf_location) {
      query += ' AND b.shelf_location LIKE ?';
      params.push(`%${filters.shelf_location}%`);
    }

    query += ' GROUP BY b.id ORDER BY b.title';

    // Pagination
    if (filters.limit) {
      query += ' LIMIT ? OFFSET ?';
      params.push(parseInt(filters.limit), parseInt(filters.offset || 0));
    }

    const [books] = await db.query(query, params);
    return books;
  }

  // Find book by ID with genres and subjects
  static async findById(id, connection = db) {
    const [books] = await connection.query(
      'SELECT * FROM books WHERE id = ?',
      [id]
    );
    
    if (!books[0]) return null;

    const book = books[0];

    // Get book's genres
    const [genres] = await connection.query(
      `SELECT g.id, g.name, g.icon, g.color 
       FROM genres g
       JOIN book_genres bg ON g.id = bg.genre_id
       WHERE bg.book_id = ?`,
      [id]
    );

    // Get book's subjects
    const [subjects] = await connection.query(
      `SELECT s.id, s.code, s.name, s.category
       FROM subjects s
       JOIN book_subjects bs ON s.id = bs.subject_id
       WHERE bs.book_id = ?`,
      [id]
    );

    return {
      ...book,
      genres,
      subjects
    };
  }

  // Get book genres and subjects by book ID
  static async getBookGenresAndSubjects(bookId, connection = db) {
    const [genres] = await connection.query(
      `SELECT g.id, g.name FROM genres g
       JOIN book_genres bg ON g.id = bg.genre_id
       WHERE bg.book_id = ?`,
      [bookId]
    );

    const [subjects] = await connection.query(
      `SELECT s.id, s.name FROM subjects s
       JOIN book_subjects bs ON s.id = bs.subject_id
       WHERE bs.book_id = ?`,
      [bookId]
    );

    return { genres, subjects };
  }

  // Find book by QR code
  static async findByQRCode(qr_code, connection = db) {
    const [books] = await connection.query(
      'SELECT * FROM books WHERE qr_code = ?',
      [qr_code]
    );
    return books[0] || null;
  }

  // Create new book
    static async create(bookData, connection = db) {
      const {
        title,
        author,
        isbn,
        publication_year,
        publisher,
        pages,
        synopsis,
        shelf_location,
        genre_ids = [],
        subject_ids = []
      } = bookData;
  
      // Generate unique QR code
      let qr_code = this.generateQRCode();
      
      // Ensure QR code is unique
      let attempts = 0;
      while (attempts < 5) {
        const existing = await this.findByQRCode(qr_code, connection);
        if (!existing) break;
        qr_code = this.generateQRCode();
        attempts++;
      }
  
      // Insert book
      const [result] = await connection.query(
        `INSERT INTO books (
          title, author, isbn, qr_code, publication_year,
          publisher, pages, synopsis, shelf_location, status
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 'available')`,
        [title, author, isbn, qr_code, publication_year, publisher, pages, synopsis, shelf_location]
      );
  
      const bookId = result.insertId;
  
      // Link genres
      if (genre_ids && genre_ids.length > 0) {
        await this.updateGenres(bookId, genre_ids, connection);
      }
  
      // Link subjects
      if (subject_ids && subject_ids.length > 0) {
        await this.updateSubjects(bookId, subject_ids, connection);
      }
  
      return { bookId, qr_code };
    }
  // Update book
  static async update(id, bookData) {
    const fields = [];
    const values = [];
    
    // Whitelist of allowed fields (exclude qr_code, status, current_borrower_id)
    const allowedFields = [
      'title', 'author', 'isbn', 'publication_year', 
      'publisher', 'pages', 'synopsis', 'shelf_location'
    ];
    
    for (const [key, value] of Object.entries(bookData)) {
      if (allowedFields.includes(key) && value !== undefined) {
        fields.push(`${key} = ?`);
        values.push(value);
      }
    }
    
    if (fields.length === 0 && !bookData.genre_ids && !bookData.subject_ids) {
      return false; // Nothing to update
    }

    // Update basic fields
    if (fields.length > 0) {
      values.push(id);
      const [result] = await db.query(
        `UPDATE books SET ${fields.join(', ')} WHERE id = ?`,
        values
      );
      
      if (result.affectedRows === 0) return false;
    }

    // Update genres if provided
    if (bookData.genre_ids) {
      await this.updateGenres(id, bookData.genre_ids);
    }

    // Update subjects if provided
    if (bookData.subject_ids) {
      await this.updateSubjects(id, bookData.subject_ids);
    }

    return true;
  }

  // Update book genres
  static async updateGenres(bookId, genreIds, connection = db) {
    // Clear existing genres
    await connection.query('DELETE FROM book_genres WHERE book_id = ?', [bookId]);
    
    // Insert new genres
    if (genreIds && genreIds.length > 0) {
      const values = genreIds.map(genreId => [bookId, genreId]);
      await connection.query(
        'INSERT INTO book_genres (book_id, genre_id) VALUES ?',
        [values]
      );
    }
  }

  // Update book subjects
  static async updateSubjects(bookId, subjectIds, connection = db) {
    // Clear existing subjects
    await connection.query('DELETE FROM book_subjects WHERE book_id = ?', [bookId]);
    
    // Insert new subjects
    if (subjectIds && subjectIds.length > 0) {
      const values = subjectIds.map(subjectId => [bookId, subjectId]);
      await connection.query(
        'INSERT INTO book_subjects (book_id, subject_id) VALUES ?',
        [values]
      );
    }
  }

  // Delete book
  static async delete(id) {
    // Check if book is currently borrowed
    const book = await this.findById(id);
    if (book && book.status === 'borrowed') {
      throw new Error('Cannot delete a book that is currently borrowed');
    }

    // Foreign keys will cascade delete book_genres and book_subjects
    const [result] = await db.query('DELETE FROM books WHERE id = ?', [id]);
    return result.affectedRows > 0;
  }

  // Get available books
  static async findAvailable() {
    const [books] = await db.query(
      'SELECT * FROM books WHERE status = "available" ORDER BY title'
    );
    return books;
  }

  // Get book genres
  static async getBookGenres(bookId) {
    const [genres] = await db.query(
      `SELECT g.* FROM genres g
       JOIN book_genres bg ON g.id = bg.genre_id
       WHERE bg.book_id = ?`,
      [bookId]
    );
    return genres;
  }

  // Get book subjects
  static async getBookSubjects(bookId) {
    const [subjects] = await db.query(
      `SELECT s.* FROM subjects s
       JOIN book_subjects bs ON s.id = bs.subject_id
       WHERE bs.book_id = ?`,
      [bookId]
    );
    return subjects;
  }

  // Search for books by query
  static async search(query) {
    const searchTerm = `%${query}%`;
    const sql = `
      SELECT
        b.id,
        b.title,
        b.author,
        b.cover_image_url,
        b.status,
        GROUP_CONCAT(DISTINCT g.name) as genre_names
      FROM books b
      LEFT JOIN book_genres bg ON b.id = bg.book_id
      LEFT JOIN genres g ON bg.genre_id = g.id
      WHERE
        b.title LIKE ? OR
        b.author LIKE ? OR
        b.isbn LIKE ? OR
        b.synopsis LIKE ?
      GROUP BY b.id
      ORDER BY b.title;
    `;
    
    const [books] = await db.query(sql, [searchTerm, searchTerm, searchTerm, searchTerm]);
    return books;
  }
}

module.exports = Book;