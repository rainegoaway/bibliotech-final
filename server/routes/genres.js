// ROUTES - Genre-related endpoints
// ============================================
const express = require('express');
const router = express.Router();
const GenreController = require('../controllers/genreController');
const { authenticateToken } = require('../middleware/auth');

// All routes require authentication
router.use(authenticateToken);

// ============================================
// GENRE MANAGEMENT (Public for logged-in users)
// ============================================

// GET /api/genres/:id - Get genre by ID
router.get('/:id', GenreController.getGenreById);

// ============================================
// USER GENRE PREFERENCES
// ============================================

// GET /api/genres/my-genres - Get current user's genre preferences
router.get('/my-genres', GenreController.getMyGenres);

// POST /api/genres/my-genres - Set current user's genre preferences (exactly 3)
router.post('/my-genres', GenreController.setMyGenres);

// PUT /api/genres/my-genres - Update user's genre preferences (same as POST)
router.put('/my-genres', GenreController.setMyGenres);

// POST /api/genres/my-genres/add - Add a single genre (if under 3)
router.post('/my-genres/add', GenreController.addGenreToMyPreferences);

// DELETE /api/genres/my-genres/:genreId - Remove a genre
router.delete('/my-genres/:genreId', GenreController.removeGenreFromMyPreferences);

// ============================================
// RECOMMENDATIONS
// ============================================

// GET /api/genres/recommendations - Get personalized book recommendations
router.get('/recommendations', GenreController.getRecommendations);

module.exports = router;