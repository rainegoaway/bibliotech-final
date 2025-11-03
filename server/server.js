require('dotenv').config();
const express = require('express');
const cors = require('cors');
const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// ============================================
// ROUTES - Make sure all these are present!
const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/users');
const bookRoutes = require('./routes/books');
const borrowRoutes = require('./routes/borrows');
const subjectRoutes = require('./routes/subjects');
const genreRoutes = require('./routes/genres');

// Register routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);     
app.use('/api/books', bookRoutes);
app.use('/api/borrows', borrowRoutes);
app.use('/api/subjects', subjectRoutes);
app.use('/api/genres', genreRoutes);

// Test endpoint
app.get('/api/test', (req, res) => {
  res.json({ message: '🚀 BiblioTech API is running!' });
});

// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`✅ Server running on port ${PORT}`);
});