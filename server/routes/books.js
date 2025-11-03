// ROUTES - Book management endpoints
// ============================================
const express = require('express');
const router = express.Router();
const BookController = require('../controllers/bookController');
const { authenticateToken, isAdmin } = require('../middleware/auth');

// Public routes (authenticated users)
router.get('/', authenticateToken, BookController.getAllBooks);
router.get('/:id', authenticateToken, BookController.getBookById);
router.get('/qr/:qr_code', authenticateToken, BookController.getBookByQR);
router.get('/:id/genres', authenticateToken, BookController.getBookGenres);
router.get('/:id/subjects', authenticateToken, BookController.getBookSubjects);

// Admin-only routes
router.post('/', authenticateToken, isAdmin, BookController.createBook);
router.put('/:id', authenticateToken, isAdmin, BookController.updateBook);
router.delete('/:id', authenticateToken, isAdmin, BookController.deleteBook);

module.exports = router;