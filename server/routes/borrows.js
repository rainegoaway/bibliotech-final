// ROUTES - Maps borrow endpoints to controller functions
// ============================================
const express = require('express');
const router = express.Router();
const BorrowController = require('../controllers/borrowController');
const { authenticateToken, isAdmin } = require('../middleware/auth');

// All routes require authentication
router.use(authenticateToken);

// ============================================
// ADMIN ROUTES - PUT THESE FIRST!
// ============================================

// Get borrow record by book ID (Admin only)
// GET /api/borrows/book/:bookId
router.get('/book/:bookId', isAdmin, BorrowController.getBorrowByBookId);

// Get all overdue borrows
// GET /api/borrows/overdue
router.get('/overdue', isAdmin, BorrowController.getOverdueBorrows);

// ============================================
// STUDENT ROUTES - BORROWING
// ============================================

// Get current user's borrowed books
// GET /api/borrows/my-books
router.get('/my-books', BorrowController.getMyBorrows);

// Borrow a book
// POST /api/borrows/borrow/:bookId
router.post('/borrow/:bookId', BorrowController.borrowBook);

// Return a book
// POST /api/borrows/return/:borrowId
router.post('/return/:borrowId', BorrowController.returnBook);

// Renew a book (extend due date)
// POST /api/borrows/renew/:borrowId
router.post('/renew/:borrowId', BorrowController.renewBook);

// Get current user's borrow history
// GET /api/borrows/history
router.get('/history', BorrowController.getBorrowHistory);

module.exports = router;