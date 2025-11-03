// CONTROLLER - Authentication logic
// ============================================
const User = require('../models/User');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

class AuthController {
  // Login
  static async login(req, res) {
    try {
      const { school_id, password, role } = req.body;

      // Validate input
      if (!school_id || !password || !role) {
        return res.status(400).json({ 
          error: 'School ID, password, and role are required' 
        });
      }

      // Find user
      const user = await User.findBySchoolId(school_id);
      if (!user) {
        return res.status(401).json({ error: 'Invalid credentials' });
      }

      // Verify role matches
      if (user.role !== role) {
        return res.status(401).json({ 
          error: `This account is not registered as ${role}` 
        });
      }

      // Check password
      const validPassword = await bcrypt.compare(password, user.password_hash);
      if (!validPassword) {
        return res.status(401).json({ error: 'Invalid credentials' });
      }

      // Update last login
      await User.updateLastLogin(user.id);

      // Check if user needs genre selection (students only)
      let needsGenreSelection = false;
      if (user.role === 'student' && user.is_first_login) {
        const Genre = require('../models/Genre');
        const hasCompleted = await Genre.hasCompletedGenreSelection(user.id);
        needsGenreSelection = !hasCompleted;
      }

      // Generate token
      const token = jwt.sign(
        { id: user.id, role: user.role },
        process.env.JWT_SECRET,
        { expiresIn: '7d' }
      );

      // Return user data (exclude password)
      const { password_hash, ...userData } = user;

      res.json({
        token,
        user: {
          ...userData,
          needs_genre_selection: needsGenreSelection
        }
      });
    } catch (error) {
      console.error('Login error:', error);
      res.status(500).json({ error: 'Login failed' });
    }
  }

  // Get current user (from token)
  static async getMe(req, res) {
    try {
      const user = await User.findById(req.user.id);
      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }

      // Check if user needs genre selection (students only)
      let needsGenreSelection = false;
      if (user.role === 'student' && user.is_first_login) {
        const Genre = require('../models/Genre');
        const hasCompleted = await Genre.hasCompletedGenreSelection(user.id);
        needsGenreSelection = !hasCompleted;
      }

      // Exclude password
      const { password_hash, ...userData } = user;

      res.json({
        ...userData,
        needs_genre_selection: needsGenreSelection
      });
    } catch (error) {
      console.error('Get user error:', error);
      res.status(500).json({ error: 'Failed to get user data' });
    }
  }

  // Change password (first login or regular)
  static async changePassword(req, res) {
    try {
      const { oldPassword, newPassword } = req.body;

      // Validate input
      if (!newPassword || newPassword.length < 6) {
        return res.status(400).json({ 
          error: 'New password must be at least 6 characters' 
        });
      }

      // Get user
      const user = await User.findById(req.user.id);
      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }

      // Verify old password (if not first login)
      if (!user.is_first_login) {
        if (!oldPassword) {
          return res.status(400).json({ error: 'Old password required' });
        }
        const validPassword = await bcrypt.compare(oldPassword, user.password_hash);
        if (!validPassword) {
          return res.status(401).json({ error: 'Old password is incorrect' });
        }
      }

      // Hash new password
      const hashedPassword = await bcrypt.hash(newPassword, 10);

      // Update password and clear first login flag
      await User.updatePassword(user.id, hashedPassword);

      res.json({ 
        message: 'Password changed successfully',
        is_first_login: false
      });
    } catch (error) {
      console.error('Change password error:', error);
      res.status(500).json({ error: 'Failed to change password' });
    }
  }

  // Register new user (admin only)
  static async register(req, res) {
    try {
      const { school_id, name, email, role, course, year_level } = req.body;

      // Validate required fields
      if (!school_id || !name || !email || !role) {
        return res.status(400).json({ 
          error: 'School ID, name, email, and role are required' 
        });
      }

      // Check if school_id already exists
      const existingUser = await User.findBySchoolId(school_id);
      if (existingUser) {
        return res.status(400).json({ error: 'School ID already exists' });
      }

      // Generate default password (first 6 chars of school_id + "123")
      const defaultPassword = `${school_id.substring(0, 6)}123`;
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
        const Subject = require('../models/Subject');
        try {
          assignedSubjectsCount = await Subject.assignSubjectsToUser(userId, course, year_level);
        } catch (error) {
          console.error('Failed to auto-assign subjects:', error);
        }
      }

      res.status(201).json({
        message: 'User created successfully',
        userId,
        tempPassword: defaultPassword,
        assignedSubjects: assignedSubjectsCount
      });
    } catch (error) {
      console.error('Register error:', error);
      res.status(500).json({ error: 'Registration failed' });
    }
  }
}

module.exports = AuthController;