// MODEL - Handles genre-related database operations
// ============================================
const db = require('../config/database');

class Genre {
  // ============================================
  // GENRE MANAGEMENT
  // ============================================

  // Get all available genres
  static async getAllGenres() {
    const [genres] = await db.query(
      'SELECT * FROM genres WHERE is_active = true ORDER BY name'
    );
    return genres;
  }

  // Get genre by ID
  static async getGenreById(id) {
    const [genres] = await db.query(
      'SELECT * FROM genres WHERE id = ?',
      [id]
    );
    return genres[0] || null;
  }

  // Create new genre (admin only)
  static async createGenre(genreData) {
    const { name, description, icon, color } = genreData;
    const [result] = await db.query(
      'INSERT INTO genres (name, description, icon, color) VALUES (?, ?, ?, ?)',
      [name, description, icon, color]
    );
    return result.insertId;
  }

  // ============================================
  // USER GENRE PREFERENCES
  // ============================================

  // Get user's selected genres
  static async getUserGenres(userId) {
    const [genres] = await db.query(
      `SELECT g.id, g.name, g.description, g.icon, g.color
       FROM genres g
       JOIN user_genres ug ON g.id = ug.genre_id
       WHERE ug.user_id = ?
       ORDER BY ug.selected_at DESC`,
      [userId]
    );
    return genres;
  }

  // Set user's genre preferences (replaces all, max 5)
  static async setUserGenres(userId, genreIds) {
    if (genreIds.length < 3 || genreIds.length > 5) {
      throw new Error('Must select between 3 and 5 genres');
    }

    try {
      // Start transaction
      await db.query('START TRANSACTION');

      // Clear existing genres
      await db.query('DELETE FROM user_genres WHERE user_id = ?', [userId]);

      // Insert new genres
      if (genreIds.length > 0) {
        const values = genreIds.map(genreId => [userId, genreId]);
        await db.query(
          'INSERT INTO user_genres (user_id, genre_id) VALUES ?',
          [values]
        );
      }

      // Commit transaction
      await db.query('COMMIT');
      return true;
    } catch (error) {
      await db.query('ROLLBACK');
      throw error;
    }
  }

  // Add single genre to user (if under 3)
  static async addGenreToUser(userId, genreId) {
    // Check current count
    const [count] = await db.query(
      'SELECT COUNT(*) as count FROM user_genres WHERE user_id = ?',
      [userId]
    );

    if (count[0].count >= 5) {
      throw new Error('User already has 5 genres. Remove one first.');
    }

    const [result] = await db.query(
      'INSERT INTO user_genres (user_id, genre_id) VALUES (?, ?)',
      [userId, genreId]
    );
    return result.insertId;
  }

  // Remove genre from user
  static async removeGenreFromUser(userId, genreId) {
    const [result] = await db.query(
      'DELETE FROM user_genres WHERE user_id = ? AND genre_id = ?',
      [userId, genreId]
    );
    return result.affectedRows > 0;
  }

  // Check if user has completed genre selection (has 3 genres)
  static async hasCompletedGenreSelection(userId) {
    const [count] = await db.query(
      'SELECT COUNT(*) as count FROM user_genres WHERE user_id = ?',
      [userId]
    );
    return count[0].count >= 3;
  }

  // ============================================
  // BOOK GENRE TAGGING
  // ============================================

  // Get book's genres
  static async getBookGenres(bookId) {
    const [genres] = await db.query(
      `SELECT g.id, g.name, g.icon, g.color
       FROM genres g
       JOIN book_genres bg ON g.id = bg.genre_id
       WHERE bg.book_id = ?
       ORDER BY g.name`,
      [bookId]
    );
    return genres;
  }

  // Set book's genres (replaces all)
  static async setBookGenres(bookId, genreIds) {
    try {
      await db.query('START TRANSACTION');

      // Clear existing genres
      await db.query('DELETE FROM book_genres WHERE book_id = ?', [bookId]);

      // Insert new genres
      if (genreIds.length > 0) {
        const values = genreIds.map(genreId => [bookId, genreId]);
        await db.query(
          'INSERT INTO book_genres (book_id, genre_id) VALUES ?',
          [values]
        );
      }

      await db.query('COMMIT');
      return true;
    } catch (error) {
      await db.query('ROLLBACK');
      throw error;
    }
  }

  // Add single genre to book
  static async addGenreToBook(bookId, genreId) {
    const [result] = await db.query(
      'INSERT INTO book_genres (book_id, genre_id) VALUES (?, ?)',
      [bookId, genreId]
    );
    return result.insertId;
  }

  // Remove genre from book
  static async removeGenreFromBook(bookId, genreId) {
    const [result] = await db.query(
      'DELETE FROM book_genres WHERE book_id = ? AND genre_id = ?',
      [bookId, genreId]
    );
    return result.affectedRows > 0;
  }

  // ============================================
  // BOOK SUBJECT TAGGING
  // ============================================

  // Get book's subjects
  static async getBookSubjects(bookId) {
    const [subjects] = await db.query(
      `SELECT s.id, s.code, s.name, s.category
       FROM subjects s
       JOIN book_subjects bs ON s.id = bs.subject_id
       WHERE bs.book_id = ?
       ORDER BY s.name`,
      [bookId]
    );
    return subjects;
  }

  // Set book's subjects (replaces all)
  static async setBookSubjects(bookId, subjectIds) {
    try {
      await db.query('START TRANSACTION');

      // Clear existing subjects
      await db.query('DELETE FROM book_subjects WHERE book_id = ?', [bookId]);

      // Insert new subjects
      if (subjectIds.length > 0) {
        const values = subjectIds.map(subjectId => [bookId, subjectId]);
        await db.query(
          'INSERT INTO book_subjects (book_id, subject_id) VALUES ?',
          [values]
        );
      }

      await db.query('COMMIT');
      return true;
    } catch (error) {
      await db.query('ROLLBACK');
      throw error;
    }
  }

  // ============================================
  // RECOMMENDATIONS
  // ============================================

  // Get genre-based recommendations for user
  static async getGenreRecommendations(userId, limit = 10) {
    const [books] = await db.query(
      `SELECT DISTINCT b.*, COUNT(bg.genre_id) as match_score
       FROM books b
       JOIN book_genres bg ON b.id = bg.book_id
       JOIN user_genres ug ON bg.genre_id = ug.genre_id
       WHERE ug.user_id = ? AND b.status = 'available'
       GROUP BY b.id
       ORDER BY match_score DESC, b.total_borrows DESC
       LIMIT ?`,
      [userId, limit]
    );
    return books;
  }

  // Get subject-based recommendations for user
  static async getSubjectRecommendations(userId, limit = 10) {
    const [books] = await db.query(
      `SELECT DISTINCT b.*, COUNT(bs.subject_id) as match_score
       FROM books b
       JOIN book_subjects bs ON b.id = bs.book_id
       JOIN user_subjects us ON bs.subject_id = us.subject_id
       WHERE us.user_id = ? AND b.status = 'available'
       GROUP BY b.id
       ORDER BY match_score DESC, b.total_borrows DESC
       LIMIT ?`,
      [userId, limit]
    );
    return books;
  }

  // Get combined recommendations (genres + subjects)
  static async getCombinedRecommendations(userId, limit = 20) {
    const [books] = await db.query(
      `SELECT DISTINCT b.*, 
        (IFNULL(genre_matches, 0) * 2 + IFNULL(subject_matches, 0) * 3) as total_score,
        IFNULL(genre_matches, 0) as genre_match_count,
        IFNULL(subject_matches, 0) as subject_match_count
       FROM books b
       LEFT JOIN (
         SELECT bg.book_id, COUNT(*) as genre_matches
         FROM book_genres bg
         JOIN user_genres ug ON bg.genre_id = ug.genre_id
         WHERE ug.user_id = ?
         GROUP BY bg.book_id
       ) g ON b.id = g.book_id
       LEFT JOIN (
         SELECT bs.book_id, COUNT(*) as subject_matches
         FROM book_subjects bs
         JOIN user_subjects us ON bs.subject_id = us.subject_id
         WHERE us.user_id = ?
         GROUP BY bs.book_id
       ) s ON b.id = s.book_id
       WHERE (genre_matches > 0 OR subject_matches > 0) AND b.status = 'available'
       ORDER BY total_score DESC, b.total_borrows DESC
       LIMIT ?`,
      [userId, userId, limit]
    );
    return books;
  }
}

module.exports = Genre;