// ROUTES - Maps user endpoints to controller functions
// ============================================
const express = require('express');
const router = express.Router();
const UserController = require('../controllers/userController');
const { authenticateToken, isAdmin } = require('../middleware/auth');

// All routes require authentication
router.use(authenticateToken);

// ============================================
// STUDENT/USER ROUTES (Own data only)
// ============================================

// Get current user's borrowed books
// GET /api/users/my-books
router.get('/my-books', UserController.getMyBooks);

// Get current user's unpaid fines
// GET /api/users/my-fines
router.get('/my-fines', UserController.getMyFines);

// Get current user's profile (for profile screen)
// GET /api/users/profile
router.get('/profile', UserController.getUserProfile);


// ============================================
// ADMIN ROUTES
// ============================================

// Get all users (with filters)
// GET /api/users?role=student&search=john&limit=50
router.get('/', isAdmin, UserController.getAllUsers);

// Reset user password (admin only)
// POST /api/users/:id/reset-password
router.post('/:id/reset-password', isAdmin, UserController.resetPassword);

// Get user's subjects (admin can view any user's subjects)
// GET /api/users/:id/subjects
router.get('/:id/subjects', isAdmin, UserController.getUserSubjects);

// Get user's genres (admin can view any user's genres)
// GET /api/users/:id/genres 
router.get('/:id/genres', isAdmin, UserController.getUserGenres);

// Get user by ID (must be AFTER specific routes like /my-books)
// GET /api/users/:id
router.get('/:id', isAdmin, UserController.getUserById);

// Create new user
// POST /api/users
router.post('/', isAdmin, UserController.createUser);

// Update user
// PUT /api/users/:id
router.put('/:id', isAdmin, UserController.updateUser);

// Delete user
// DELETE /api/users/:id
router.delete('/:id', isAdmin, UserController.deleteUser);

module.exports = router;