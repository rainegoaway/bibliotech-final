// ROUTES - Subject and course management endpoints
// ============================================
const express = require('express');
const router = express.Router();
const Subject = require('../models/Subject');
const { authenticateToken, isAdmin } = require('../middleware/auth');

// All routes require authentication
router.use(authenticateToken);

// ============================================
// STUDENT/USER ROUTES
// ============================================

// Get current user's subjects
// GET /api/subjects/my-subjects
router.get('/my-subjects', async (req, res) => {
  try {
    const userId = req.user.id;
    const subjects = await Subject.getUserSubjects(userId);
    res.json({ count: subjects.length, subjects });
  } catch (error) {
    console.error('Get my subjects error:', error);
    res.status(500).json({ error: 'Failed to fetch subjects' });
  }
});

// Get all available courses
// GET /api/subjects/courses
router.get('/courses', async (req, res) => {
  try {
    const courses = await Subject.getAllCourses();
    res.json({ count: courses.length, courses });
  } catch (error) {
    console.error('Get courses error:', error);
    res.status(500).json({ error: 'Failed to fetch courses' });
  }
});

// Get subjects for a specific course + year level
// GET /api/subjects/course/:courseCode/year/:yearLevel
router.get('/course/:courseCode/year/:yearLevel', async (req, res) => {
  try {
    const { courseCode, yearLevel } = req.params;
    const subjects = await Subject.getSubjectsByCourseAndYear(courseCode, parseInt(yearLevel));
    res.json({ count: subjects.length, subjects });
  } catch (error) {
    console.error('Get course subjects error:', error);
    res.status(500).json({ error: 'Failed to fetch subjects' });
  }
});

// ============================================
// ADMIN ROUTES
// ============================================

// Get all subjects
// GET /api/subjects
router.get('/', isAdmin, async (req, res) => {
  try {
    const subjects = await Subject.getAllSubjects();
    res.json({ count: subjects.length, subjects });
  } catch (error) {
    console.error('Get all subjects error:', error);
    res.status(500).json({ error: 'Failed to fetch subjects' });
  }
});

// Search subjects
// GET /api/subjects/search?q=programming
router.get('/search', isAdmin, async (req, res) => {
  try {
    const { q } = req.query;
    if (!q) {
      return res.status(400).json({ error: 'Query parameter required' });
    }
    const subjects = await Subject.searchSubjects(q);
    res.json({ count: subjects.length, subjects });
  } catch (error) {
    console.error('Search subjects error:', error);
    res.status(500).json({ error: 'Failed to search subjects' });
  }
});

// Create new subject
// POST /api/subjects
router.post('/', isAdmin, async (req, res) => {
  try {
    const { code, name, description, category } = req.body;
    
    if (!code || !name) {
      return res.status(400).json({ error: 'Code and name are required' });
    }

    const subjectId = await Subject.createSubject({ code, name, description, category });
    res.status(201).json({ message: 'Subject created successfully', subjectId });
  } catch (error) {
    console.error('Create subject error:', error);
    res.status(500).json({ error: 'Failed to create subject' });
  }
});

// Create new course
// POST /api/subjects/courses
router.post('/courses', isAdmin, async (req, res) => {
  try {
    const { code, name, description } = req.body;
    
    if (!code || !name) {
      return res.status(400).json({ error: 'Code and name are required' });
    }

    const courseId = await Subject.createCourse({ code, name, description });
    res.status(201).json({ message: 'Course created successfully', courseId });
  } catch (error) {
    console.error('Create course error:', error);
    res.status(500).json({ error: 'Failed to create course' });
  }
});

module.exports = router;