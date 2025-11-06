const Subject = require('../models/Subject');

class SubjectController {
  // Get all subjects
  static async getAllSubjects(req, res) {
    try {
      const subjects = await Subject.getAllSubjects();
      res.json({ count: subjects.length, subjects });
    } catch (error) {
      console.error('Get all subjects error:', error);
      res.status(500).json({ error: 'Failed to fetch subjects' });
    }
  }

  // Get current user's subjects
  static async getMySubjects(req, res) {
    try {
      const userId = req.user.id;
      const subjects = await Subject.getUserSubjects(userId);
      res.json({ count: subjects.length, subjects });
    } catch (error) {
      console.error('Get my subjects error:', error);
      res.status(500).json({ error: 'Failed to fetch subjects' });
    }
  }

  // Set current user's subjects
  static async setMySubjects(req, res) {
    try {
      const userId = req.user.id;
      const { subjectIds } = req.body;

      if (!Array.isArray(subjectIds)) {
        return res.status(400).json({ error: 'subjectIds must be an array' });
      }

      await Subject.setUserSubjects(userId, subjectIds);

      res.json({ message: 'Subjects updated successfully' });
    } catch (error) {
      console.error('Set my subjects error:', error);
      res.status(500).json({ error: 'Failed to update subjects' });
    }
  }

    // Get all available courses
    static async getAllCourses(req, res) {
        try {
            const courses = await Subject.getAllCourses();
            res.json({ count: courses.length, courses });
        } catch (error) {
            console.error('Get courses error:', error);
            res.status(500).json({ error: 'Failed to fetch courses' });
        }
    }

    // Get subjects for a specific course + year level
    static async getSubjectsByCourseAndYear(req, res) {
        try {
            const { courseCode, yearLevel } = req.params;
            const subjects = await Subject.getSubjectsByCourseAndYear(courseCode, parseInt(yearLevel));
            res.json({ count: subjects.length, subjects });
        } catch (error) {
            console.error('Get course subjects error:', error);
            res.status(500).json({ error: 'Failed to fetch subjects' });
        }
    }

    // Search subjects
    static async searchSubjects(req, res) {
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
    }

    // Create new subject
    static async createSubject(req, res) {
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
    }

    // Create new course
    static async createCourse(req, res) {
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
    }
}

module.exports = SubjectController;