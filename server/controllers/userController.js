// CONTROLLER - Business logic for user management
// ============================================
const User = require('../models/User');
const Subject = require('../models/Subject');
const Genre = require('../models/Genre');
const bcrypt = require('bcrypt');

// Check if User model has all required methods
if (!User.findAll) {
  console.error('❌ User.findAll is missing from User model!');
}
if (!User.findById) {
  console.error('❌ User.findById is missing from User model!');
}
if (!User.findBySchoolId) {
  console.error('❌ User.findBySchoolId is missing from User model!');
}

class UserController {
  // Get all users (Admin only)
  static async getAllUsers(req, res) {
    try {
      const { role, search, is_active, limit = 100, offset = 0 } = req.query;
      
      // Build filter object
      const filters = {};
      if (role) filters.role = role;
      if (is_active !== undefined) filters.is_active = is_active === 'true';
      
      // Get users from database
      const users = await User.findAll(filters, parseInt(limit), parseInt(offset));
      
      // Apply search filter if provided (frontend can also do this)
      let filteredUsers = users;
      if (search) {
        const searchLower = search.toLowerCase();
        filteredUsers = users.filter(user => 
          user.name.toLowerCase().includes(searchLower) ||
          user.school_id.toLowerCase().includes(searchLower) ||
          user.email.toLowerCase().includes(searchLower)
        );
      }

      res.json({
        count: filteredUsers.length,
        users: filteredUsers
      });
    } catch (error) {
      console.error('Get all users error:', error);
      res.status(500).json({ error: 'Failed to fetch users' });
    }
  }

  // Get user by ID (Admin only) - with subjects and genres
  static async getUserById(req, res) {
    try {
      const { id } = req.params;
      
      // Get user details
      const user = await User.findById(id);
      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }

      // Get user's subjects
      let subjects = [];
      try {
        subjects = await Subject.getUserSubjects(id);
      } catch (error) {
        console.error('Failed to fetch user subjects:', error);
      }
      
      // Get user's genres (if student)
      let genres = [];
      if (user.role === 'student') {
        try {
          genres = await Genre.getUserGenres(id);
        } catch (error) {
          console.error('Failed to fetch user genres:', error);
        }
      }
      
      res.json({
        user: {
          ...user,
          subjects,
          genres
        }
      });
    } catch (error) {
      console.error('Get user error:', error);
      res.status(500).json({ error: 'Failed to fetch user' });
    }
  }

  // Get user's subjects (separate endpoint)
  static async getUserSubjects(req, res) {
    try {
      const { id } = req.params;
      
      // Check if user exists
      const user = await User.findById(id);
      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }

      const subjects = await Subject.getUserSubjects(id);
      
      res.json({
        count: subjects.length,
        subjects
      });
    } catch (error) {
      console.error('Get user subjects error:', error);
      res.status(500).json({ error: 'Failed to fetch user subjects' });
    }
  }

  // Get user's genres (separate endpoint)
  static async getUserGenres(req, res) {
    try {
      const { id } = req.params;
      
      // Check if user exists
      const user = await User.findById(id);
      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }

      // Only students have genres
      if (user.role !== 'student') {
        return res.json({
          count: 0,
          genres: [],
          message: 'Only students have genre preferences'
        });
      }

      const genres = await Genre.getUserGenres(id);
      
      res.json({
        count: genres.length,
        genres
      });
    } catch (error) {
      console.error('Get user genres error:', error);
      res.status(500).json({ error: 'Failed to fetch user genres' });
    }
  }

  // Create new user (Admin only)
  static async createUser(req, res) {
    try {
      const { school_id, name, email, role, course, year_level, password } = req.body;

      // Validate required fields
      if (!school_id || !name || !email || !role) {
        return res.status(400).json({ 
          error: 'Missing required fields: school_id, name, email, role' 
        });
      }

      // Validate role
      if (!['admin', 'student', 'teacher'].includes(role)) {
        return res.status(400).json({ 
          error: 'Invalid role. Must be: admin, student, or teacher' 
        });
      }

      // Check if school_id already exists
      const existingUser = await User.findBySchoolId(school_id);
      if (existingUser) {
        return res.status(400).json({ 
          error: 'School ID already exists' 
        });
      }

      // Generate default password if not provided (first 6 chars of school_id + "123")
      const defaultPassword = password || `${school_id.substring(0, 6)}123`;
      const hashedPassword = await bcrypt.hash(defaultPassword, 10);

      // Create user
      const userId = await User.create({
        school_id,
        password_hash: hashedPassword,
        name,
        email,
        role,
        course: course || null,
        year_level: year_level || null,
        is_first_login: true
      });

      // Auto-assign subjects if course and year_level are provided
      let assignedSubjectsCount = 0;
      if (course && year_level && role === 'student') {
        try {
          assignedSubjectsCount = await Subject.assignSubjectsToUser(userId, course, year_level);
        } catch (error) {
          console.error('Failed to auto-assign subjects:', error);
          // Don't fail the user creation, just log the error
        }
      }

      res.status(201).json({
        message: 'User created successfully',
        userId,
        tempPassword: defaultPassword, // Return temp password for admin to share
        assignedSubjects: assignedSubjectsCount
      });
    } catch (error) {
      console.error('Create user error:', error);
      res.status(500).json({ error: 'Failed to create user' });
    }
  }

  // Update user (Admin only)
static async updateUser(req, res) {
  try {
    const { id } = req.params;
    const bodyData = req.body;
    
    // Extract old values for comparison
    const oldCourse = bodyData.oldCourse;
    const oldYearLevel = bodyData.oldYearLevel;
    
    // Build a clean updates object with ONLY allowed fields
    const updates = {};
    const allowedFields = ['name', 'email', 'role', 'course', 'year_level', 'is_active', 'school_id', 'program'];
    
    for (const field of allowedFields) {
      if (bodyData.hasOwnProperty(field)) {
        updates[field] = bodyData[field];
      }
    }
    
    console.log('Old values - Course:', oldCourse, 'Year:', oldYearLevel);
    console.log('New values - Course:', updates.course, 'Year:', updates.year_level);
    console.log('Clean updates object:', updates);
    
    // If updating school_id, check it doesn't exist
    if (updates.school_id) {
      const existing = await User.findBySchoolId(updates.school_id);
      if (existing && existing.id != id) {
        return res.status(400).json({ 
          error: 'School ID already exists' 
        });
      }
    }

    console.log('Updating user in database...');
    const success = await User.update(id, updates);
    if (!success) {
      console.error('User not found');
      return res.status(404).json({ error: 'User not found' });
    }
    console.log('User updated successfully');

    // Re-assign subjects if course or year_level changed
    let reassignedCount = 0;
    const { course, year_level, role } = updates;
    
    if (role === 'student' && course && year_level) {
      // Check if course or year changed
      const courseChanged = String(course) !== String(oldCourse);
      const yearChanged = Number(year_level) !== Number(oldYearLevel);
      
      console.log('Course changed?', courseChanged, `(${oldCourse} → ${course})`);
      console.log('Year changed?', yearChanged, `(${oldYearLevel} → ${year_level})`);
      
      if (courseChanged || yearChanged) {
        try {
          console.log(`Reassigning subjects: ${oldCourse} Y${oldYearLevel} → ${course} Y${year_level}`);
          reassignedCount = await Subject.assignSubjectsToUser(id, course, year_level);
          console.log(`Successfully reassigned ${reassignedCount} subjects`);
        } catch (error) {
          console.error('Failed to reassign subjects:', error.message);
        }
      } else {
        console.log('No changes to course/year, skipping subject reassignment');
      }
    }

    res.json({ 
      message: 'User updated successfully',
      reassignedSubjects: reassignedCount
    });
  } catch (error) {
    console.error('Update user error:', error);
    res.status(500).json({ 
      error: 'Failed to update user',
      details: error.message
    });
  }
}

  // Delete user (Admin only)
  static async deleteUser(req, res) {
    try {
      const { id } = req.params;

      // Prevent deleting yourself
      if (req.user.id == id) {
        return res.status(400).json({ 
          error: 'Cannot delete your own account' 
        });
      }

      const success = await User.delete(id);
      if (!success) {
        return res.status(404).json({ error: 'User not found' });
      }

      res.json({ message: 'User deleted successfully' });
    } catch (error) {
      console.error('Delete user error:', error);
      res.status(500).json({ error: 'Failed to delete user' });
    }
  }

  // Reset user password (admin only)
  static async resetPassword(req, res) {
    try {
      const { id } = req.params;
      
      // Get user
      const user = await User.findById(id);
      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }
      
      // Generate new temp password (same format as registration)
      const tempPassword = `${user.school_id.substring(0, 6)}123`;
      const hashedPassword = await bcrypt.hash(tempPassword, 10);
      
      // Update password and set first_login flag back to true
      await User.updatePassword(id, hashedPassword);
      
      res.json({ 
        message: 'Password reset successfully',
        tempPassword: tempPassword
      });
    } catch (error) {
      console.error('Reset password error:', error);
      res.status(500).json({ error: 'Failed to reset password' });
    }
  }

  // Get current user's borrowed books
  static async getMyBooks(req, res) {
    try {
      const userId = req.user.id;
      const Borrow = require('../models/Borrow');
      
      const borrows = await Borrow.findActiveByUserId(userId);
      
      res.json({
        count: borrows.length,
        books: borrows
      });
    } catch (error) {
      console.error('Get my books error:', error);
      res.status(500).json({ error: 'Failed to fetch borrowed books' });
    }
  }

  // Get current user's fines
  static async getMyFines(req, res) {
    try {
      const userId = req.user.id;
      const db = require('../config/database');
      
      const [fines] = await db.query(
        `SELECT f.*, b.book_id, bk.title as book_title
         FROM fines f
         LEFT JOIN borrows b ON f.borrow_id = b.id
         LEFT JOIN books bk ON b.book_id = bk.id
         WHERE f.user_id = ? AND f.is_paid = false
         ORDER BY f.created_at DESC`,
        [userId]
      );

      const totalUnpaid = fines.reduce((sum, fine) => sum + parseFloat(fine.amount), 0);
      
      res.json({
        count: fines.length,
        totalUnpaid: totalUnpaid.toFixed(2),
        fines
      });
    } catch (error) {
      console.error('Get my fines error:', error);
      res.status(500).json({ error: 'Failed to fetch fines' });
    }
  }

  // Get current user's profile (for profile screen)
  static async getUserProfile(req, res) {
    try {
      const userId = req.user.id;
      
      // Get user details
      const user = await User.findById(userId);
      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }

      // Get user's subjects
      const subjects = await Subject.getUserSubjects(userId);
      
      // Get user's genres
      const genres = await Genre.getUserGenres(userId);
      
      res.json({
        ...user,
        subjects,
        genres
      });
    } catch (error) {
      console.error('Get user profile error:', error);
      res.status(500).json({ error: 'Failed to fetch user profile' });
    }
  }
}

module.exports = UserController;