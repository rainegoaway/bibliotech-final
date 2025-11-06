// ROUTES - Subject and course management endpoints
// ============================================
const express = require('express');
const router = express.Router();
const SubjectController = require('../controllers/subjectController');
const { authenticateToken, isAdmin } = require('../middleware/auth');

// All routes require authentication
router.use(authenticateToken);

// ============================================
// STUDENT/USER ROUTES
// ============================================

// Get current user's subjects
router.get('/my-subjects', SubjectController.getMySubjects);

// Set current user's subjects
router.put('/my-subjects', SubjectController.setMySubjects);

// Get all available courses
router.get('/courses', SubjectController.getAllCourses);

// Get subjects for a specific course + year level
router.get('/course/:courseCode/year/:yearLevel', SubjectController.getSubjectsByCourseAndYear);

// ============================================
// ADMIN ROUTES
// ============================================

// Get all subjects
router.get('/', isAdmin, SubjectController.getAllSubjects);

// Search subjects
router.get('/search', isAdmin, SubjectController.searchSubjects);

// Create new subject
router.post('/', isAdmin, SubjectController.createSubject);

// Create new course
router.post('/courses', isAdmin, SubjectController.createCourse);

module.exports = router;