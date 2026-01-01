const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Database connection
// Support both MONGODB_URI (preferred) and DATABASE_URI (alias) for backward compatibility
const MONGODB_URI = process.env.MONGODB_URI || process.env.DATABASE_URI || 'mongodb://localhost:27017/flashflashy';

mongoose.connect(MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => {
  console.log('Database connected successfully');
})
.catch((err) => {
  console.error('Database connection error:', err);
});

// Routes
app.get('/', (req, res) => {
  res.json({ message: 'Welcome to Flashflashy API' });
});

// API routes
app.use('/api', require('./routes/api'));

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Something went wrong!', error: err.message });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ message: 'Route not found' });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

