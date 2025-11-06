// ROUTES - Publicly accessible endpoints
// ============================================
const express = require('express');
const router = express.Router();
const Genre = require('../models/Genre');
const Subject = require('../models/Subject');

// Get all available genres
router.get('/genres', async (req, res) => {
  try {
    const genres = await Genre.getAllGenres();
    res.json({ genres });
  } catch (error) {
    console.error('Get genres error:', error);
    res.status(500).json({ error: 'Failed to fetch genres' });
  }
});

// Get all available subjects
router.get('/subjects', async (req, res) => {
  try {
    const subjects = await Subject.getAllSubjects();
    res.json({ subjects });
  } catch (error) {
    console.error('Get all subjects error:', error);
    res.status(500).json({ error: 'Failed to fetch subjects' });
  }
});

module.exports = router;
