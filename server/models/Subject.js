// MODEL - Handles subject-related database operations
// ============================================
const db = require('../config/database');

class Subject {
  // Resolve course by code OR name (returns course row or null)
  static async resolveCourse(courseCodeOrName) {
    const [rows] = await db.query(
      `SELECT id, code, name
       FROM courses
       WHERE code = ? OR name = ?
       LIMIT 1`,
      [courseCodeOrName, courseCodeOrName]
    );
    return rows[0] || null;
  }

  // Get subjects by course id and year level
  static async getSubjectsByCourseAndYear(courseCodeOrName, yearLevel) {
    const course = await this.resolveCourse(courseCodeOrName);
    if (!course) return [];

    const [subjects] = await db.query(
      `SELECT DISTINCT s.id, s.code, s.name, s.category, cs.is_required
       FROM subjects s
       JOIN course_subjects cs ON s.id = cs.subject_id
       WHERE cs.course_id = ? AND cs.year_level = ? AND s.is_active = true
       ORDER BY s.name`,
      [course.id, yearLevel]
    );
    return subjects;
  }

  // Get all subjects assigned to a user
  static async getUserSubjects(userId) {
    const [subjects] = await db.query(
      `SELECT s.id, s.code, s.name, s.category
       FROM subjects s
       JOIN user_subjects us ON s.id = us.subject_id
       WHERE us.user_id = ?
       ORDER BY s.name`,
      [userId]
    );
    return subjects;
  }

  // Clear existing subject assignments for a user
  static async clearUserSubjects(userId) {
    const [result] = await db.query('DELETE FROM user_subjects WHERE user_id = ?', [userId]);
    return result.affectedRows;
  }

  // Auto-assign subjects to user based on course + year level
  // Accepts course code or name; resolves to course.id internally.
  static async assignSubjectsToUser(userId, courseCodeOrName, yearLevel) {
    try {
      // Resolve course first
      const course = await this.resolveCourse(courseCodeOrName);
      if (!course) {
        // no matching course found
        return 0;
      }

      // Clear existing subject assignments
      await db.query('DELETE FROM user_subjects WHERE user_id = ?', [userId]);

      // Insert new subjects using course_id
      const [result] = await db.query(
        `INSERT INTO user_subjects (user_id, subject_id)
         SELECT ?, cs.subject_id
         FROM course_subjects cs
         WHERE cs.course_id = ? AND cs.year_level = ?`,
        [userId, course.id, yearLevel]
      );

      return result.affectedRows || 0;
    } catch (error) {
      console.error('Error assigning subjects:', error);
      throw error;
    }
  }

  // Get all available courses
  static async getAllCourses() {
    const [courses] = await db.query(
      'SELECT * FROM courses WHERE is_active = true ORDER BY name'
    );
    return courses;
  }

  // Get course by code
  static async getCourseByCode(code) {
    const [courses] = await db.query(
      'SELECT * FROM courses WHERE code = ?',
      [code]
    );
    return courses[0] || null;
  }

  // Get all subjects (for admin management)
  static async getAllSubjects() {
    const [subjects] = await db.query(
      'SELECT * FROM subjects WHERE is_active = true ORDER BY category, name'
    );
    return subjects;
  }

  // Create new subject
  static async createSubject(subjectData) {
    const { code, name, description, category } = subjectData;
    const [result] = await db.query(
      'INSERT INTO subjects (code, name, description, category) VALUES (?, ?, ?, ?)',
      [code, name, description, category]
    );
    return result.insertId;
  }

  // Create new course
  static async createCourse(courseData) {
    const { code, name, description } = courseData;
    const [result] = await db.query(
      'INSERT INTO courses (code, name, description) VALUES (?, ?, ?)',
      [code, name, description]
    );
    return result.insertId;
  }

  // Link subject to course + year level
  static async linkSubjectToCourse(courseId, subjectId, yearLevel, semester = null, isRequired = true) {
    const [result] = await db.query(
      'INSERT INTO course_subjects (course_id, subject_id, year_level, semester, is_required) VALUES (?, ?, ?, ?, ?)',
      [courseId, subjectId, yearLevel, semester, isRequired]
    );
    return result.insertId;
  }

  // Get subjects by category (for book tagging)
  static async getSubjectsByCategory(category) {
    const [subjects] = await db.query(
      'SELECT * FROM subjects WHERE category = ? AND is_active = true ORDER BY name',
      [category]
    );
    return subjects;
  }

  // Search subjects by name or code
  static async searchSubjects(query) {
    const [subjects] = await db.query(
      `SELECT * FROM subjects 
       WHERE (name LIKE ? OR code LIKE ?) AND is_active = true
       ORDER BY name LIMIT 20`,
      [`%${query}%`, `%${query}%`]
    );
    return subjects;
  }
}

module.exports = Subject;