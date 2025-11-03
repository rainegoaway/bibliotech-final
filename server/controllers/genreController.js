// CONTROLLER - Handles genre-related business logic
// ============================================
const Genre = require('../models/Genre');

const GenreController = {
  // ============================================
  // GENRE MANAGEMENT (Public for logged-in users)
  // ============================================

  // Get all available genres
  getAllGenres: async (req, res) => {
    try {
      const genres = await Genre.getAllGenres();
      res.json({ genres });  // Wrap in object!
    } catch (error) {
      console.error('Get genres error:', error);
      res.status(500).json({ error: 'Failed to fetch genres' });
    }
  },
  
  // Get genre by ID
  getGenreById: async (req, res) => {
    try {
      const { id } = req.params;
      const genre = await Genre.getGenreById(id);
      
      if (!genre) {
        return res.status(404).json({ error: 'Genre not found' });
      }
      
      res.json(genre);
    } catch (error) {
      console.error('Get genre error:', error);
      res.status(500).json({ error: 'Failed to fetch genre' });
    }
  },

  // ============================================
  // USER GENRE PREFERENCES
  // ============================================

  // Get current user's genre preferences
  getMyGenres: async (req, res) => {
    try {
      const userId = req.user.id;
      const genres = await Genre.getUserGenres(userId);
      res.json(genres);
    } catch (error) {
      console.error('Get user genres error:', error);
      res.status(500).json({ error: 'Failed to fetch user genres' });
    }
  },

  // Set current user's genre preferences (replace all)
  setMyGenres: async (req, res) => {
    try {
      const userId = req.user.id;
      const { genreIds } = req.body;

      // Validate input
      if (!Array.isArray(genreIds)) {
        return res.status(400).json({ error: 'genreIds must be an array' });
      }

      // Update validation:
      if (genreIds.length < 3 || genreIds.length > 5) {
        return res.status(400).json({ error: 'Must select between 3 and 5 genres' });
      }

      // Verify all genres exist
      for (const genreId of genreIds) {
        const genre = await Genre.getGenreById(genreId);
        if (!genre) {
          return res.status(400).json({ error: `Genre ${genreId} not found` });
        }
      }

      // Set user genres
      await Genre.setUserGenres(userId, genreIds);

      // Get updated list
      const updatedGenres = await Genre.getUserGenres(userId);

      res.json({ 
        message: 'Genre preferences saved successfully',
        count: genreIds.length,
        genres: updatedGenres
      });
    } catch (error) {
      console.error('Set user genres error:', error);
      res.status(500).json({ 
        error: error.message || 'Failed to save genre preferences' 
      });
    }
  },

  // Add a single genre to current user's preferences (if under 3)
  addGenreToMyPreferences: async (req, res) => {
    try {
      const userId = req.user.id;
      const { genreId } = req.body;

      if (!genreId) {
        return res.status(400).json({ error: 'genreId is required' });
      }

      // Verify genre exists
      const genre = await Genre.getGenreById(genreId);
      if (!genre) {
        return res.status(404).json({ error: 'Genre not found' });
      }

      // Check if already exists
      const currentGenres = await Genre.getUserGenres(userId);
      const exists = currentGenres.some(g => g.id === parseInt(genreId));
      if (exists) {
        return res.status(400).json({ error: 'Genre already in preferences' });
      }

      // Add genre
      await Genre.addGenreToUser(userId, genreId);

      // Get updated list
      const updatedGenres = await Genre.getUserGenres(userId);

      res.status(201).json({
        message: 'Genre added successfully',
        genres: updatedGenres
      });
    } catch (error) {
      console.error('Add genre error:', error);
      res.status(500).json({ 
        error: error.message || 'Failed to add genre' 
      });
    }
  },

  // Remove a genre from current user's preferences
  removeGenreFromMyPreferences: async (req, res) => {
    try {
      const userId = req.user.id;
      const { genreId } = req.params;

      const success = await Genre.removeGenreFromUser(userId, genreId);

      if (!success) {
        return res.status(404).json({ error: 'Genre not found in user preferences' });
      }

      res.json({ message: 'Genre removed successfully' });
    } catch (error) {
      console.error('Remove genre error:', error);
      res.status(500).json({ error: 'Failed to remove genre' });
    }
  },

  // ============================================
  // RECOMMENDATIONS
  // ============================================

  // Get personalized book recommendations
  getRecommendations: async (req, res) => {
    try {
      const userId = req.user.id;
      const { type = 'combined', limit = 20 } = req.query;

      let books;
      
      switch(type) {
        case 'genre':
          books = await Genre.getGenreRecommendations(userId, parseInt(limit));
          break;
        case 'subject':
          books = await Genre.getSubjectRecommendations(userId, parseInt(limit));
          break;
        case 'combined':
        default:
          books = await Genre.getCombinedRecommendations(userId, parseInt(limit));
          break;
      }

      res.json({
        count: books.length,
        type,
        books
      });
    } catch (error) {
      console.error('Get recommendations error:', error);
      res.status(500).json({ error: 'Failed to fetch recommendations' });
    }
  }
};

module.exports = GenreController;