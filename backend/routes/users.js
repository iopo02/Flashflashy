const express = require('express');
const bcrypt = require('bcrypt');
const mongoose = require('mongoose');
const User = require('../models/User');
const { ADMIN_USER_ID } = require('../config/admin');
const router = express.Router();

/**
 * POST /api/users/check-username
 * Check if a username is available
 */
router.post('/check-username', async (req, res) => {
  try {
    const { username } = req.body;

    if (!username || username.trim().length < 3) {
      return res.status(400).json({ 
        available: false, 
        message: 'Username must be at least 3 characters long' 
      });
    }

    // Check if MongoDB is connected
    if (mongoose.connection.readyState !== 1) {
      console.error('MongoDB not connected. ReadyState:', mongoose.connection.readyState);
      return res.status(503).json({ 
        available: false, 
        message: 'Database connection error. Please try again later.' 
      });
    }

    const existingUser = await User.findOne({ 
      username: username.trim().toLowerCase() 
    });

    if (existingUser) {
      return res.json({ 
        available: false, 
        message: 'Username is already taken' 
      });
    }

    res.json({ 
      available: true, 
      message: 'Username is available' 
    });
  } catch (error) {
    console.error('Error checking username:', error);
    res.status(500).json({ 
      available: false, 
      message: error.message || 'Error checking username availability' 
    });
  }
});

/**
 * POST /api/users/register
 * Create a new user account
 */
router.post('/register', async (req, res) => {
  try {
    const { username, email, password } = req.body;

    // Validation
    if (!username || !email || !password) {
      return res.status(400).json({ 
        message: 'Username, email, and password are required' 
      });
    }

    if (username.trim().length < 3 || username.trim().length > 30) {
      return res.status(400).json({ 
        message: 'Username must be between 3 and 30 characters' 
      });
    }

    if (password.length < 6) {
      return res.status(400).json({ 
        message: 'Password must be at least 6 characters long' 
      });
    }

    // Check if username already exists
    const existingUsername = await User.findOne({ 
      username: username.trim().toLowerCase() 
    });
    
    if (existingUsername) {
      return res.status(400).json({ 
        message: 'Username is already taken' 
      });
    }

    // Check if email already exists
    const existingEmail = await User.findOne({ 
      email: email.trim().toLowerCase() 
    });
    
    if (existingEmail) {
      return res.status(400).json({ 
        message: 'Email is already registered' 
      });
    }

    // Hash password
    const saltRounds = 10;
    const passwordHash = await bcrypt.hash(password, saltRounds);

    // Create user
    const user = new User({
      username: username.trim().toLowerCase(),
      email: email.trim().toLowerCase(),
      passwordHash,
    });

    await user.save();

    // Check if user is the hardcoded admin (regardless of database isAdmin flag)
    const userIdStr = user._id.toString();
    const isHardcodedAdmin = userIdStr === ADMIN_USER_ID;
    const isAdmin = isHardcodedAdmin || user.isAdmin;

    // Return user data (excluding password hash)
    res.status(201).json({
      message: 'User created successfully',
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        isAdmin: isAdmin,
        profilePhotoUrl: user.profilePhotoUrl,
        createdAt: user.createdAt,
      },
    });
  } catch (error) {
    console.error('Error creating user:', error);
    
    // Handle duplicate key errors
    if (error.code === 11000) {
      const field = Object.keys(error.keyPattern)[0];
      return res.status(400).json({ 
        message: `${field} is already taken` 
      });
    }

    // Handle validation errors
    if (error.name === 'ValidationError') {
      return res.status(400).json({ 
        message: Object.values(error.errors)[0].message 
      });
    }

    res.status(500).json({ 
      message: 'Error creating user account' 
    });
  }
});

/**
 * POST /api/users/login
 * Login with email/username and password
 */
router.post('/login', async (req, res) => {
  try {
    const { emailOrUsername, password } = req.body;

    // Validation
    if (!emailOrUsername || !password) {
      return res.status(400).json({ 
        message: 'Email/username and password are required' 
      });
    }

    // Find user by email or username
    const user = await User.findOne({
      $or: [
        { email: emailOrUsername.trim().toLowerCase() },
        { username: emailOrUsername.trim().toLowerCase() }
      ]
    });

    if (!user) {
      return res.status(401).json({ 
        message: 'Invalid email/username or password' 
      });
    }

    // Verify password
    const isPasswordValid = await bcrypt.compare(password, user.passwordHash);

    if (!isPasswordValid) {
      return res.status(401).json({ 
        message: 'Invalid email/username or password' 
      });
    }

    // Check if user is the hardcoded admin (regardless of database isAdmin flag)
    const userIdStr = user._id.toString();
    const isHardcodedAdmin = userIdStr === ADMIN_USER_ID;
    const isAdmin = isHardcodedAdmin || user.isAdmin;

    // Return user data (excluding password hash)
    res.json({
      message: 'Login successful',
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        isAdmin: isAdmin,
        profilePhotoUrl: user.profilePhotoUrl,
        createdAt: user.createdAt,
      },
    });
  } catch (error) {
    console.error('Error during login:', error);
    res.status(500).json({ 
      message: 'Error during login' 
    });
  }
});

module.exports = router;

