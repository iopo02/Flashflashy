const express = require('express');
const User = require('../models/User');
const Deck = require('../models/Deck');
const Card = require('../models/Card');
const { requireAdmin } = require('../middleware/auth');
const { ADMIN_USER_ID } = require('../config/admin');
const router = express.Router();

// All admin routes require admin authentication
router.use(requireAdmin);

/**
 * GET /api/admin/users
 * Get all users (admin only)
 */
router.get('/users', async (req, res) => {
  try {
    const users = await User.find({})
      .select('-passwordHash') // Exclude password hash
      .sort({ createdAt: -1 });

    res.json({
      users,
      count: users.length,
    });
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({ 
      message: 'Error fetching users' 
    });
  }
});

/**
 * DELETE /api/admin/users/:userId
 * Delete a user account (admin only)
 */
router.delete('/users/:userId', async (req, res) => {
  try {
    const { userId } = req.params;

    // Prevent deletion of the hardcoded admin user
    if (userId === ADMIN_USER_ID) {
      return res.status(400).json({ 
        message: 'Cannot delete the primary admin account' 
      });
    }

    // Prevent admin from deleting themselves
    if (userId === req.adminUser._id.toString()) {
      return res.status(400).json({ 
        message: 'Cannot delete your own account' 
      });
    }

    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({ 
        message: 'User not found' 
      });
    }

    // Delete all decks owned by this user
    const decks = await Deck.find({ ownerId: userId });
    const deckIds = decks.map(deck => deck._id);

    // Delete all cards in those decks
    await Card.deleteMany({ deckId: { $in: deckIds } });

    // Delete all decks
    await Deck.deleteMany({ ownerId: userId });

    // Delete the user
    await User.findByIdAndDelete(userId);

    res.json({ 
      message: 'User and all associated data deleted successfully' 
    });
  } catch (error) {
    console.error('Error deleting user:', error);
    res.status(500).json({ 
      message: 'Error deleting user' 
    });
  }
});

/**
 * PATCH /api/admin/users/:userId/username
 * Update a user's username (admin only)
 */
router.patch('/users/:userId/username', async (req, res) => {
  try {
    const { userId } = req.params;
    const { username } = req.body;

    if (!username || username.trim().length < 3 || username.trim().length > 30) {
      return res.status(400).json({ 
        message: 'Username must be between 3 and 30 characters' 
      });
    }

    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({ 
        message: 'User not found' 
      });
    }

    // Check if new username is already taken
    const existingUser = await User.findOne({ 
      username: username.trim().toLowerCase(),
      _id: { $ne: userId } // Exclude current user
    });

    if (existingUser) {
      return res.status(400).json({ 
        message: 'Username is already taken' 
      });
    }

    // Update username
    user.username = username.trim().toLowerCase();
    await user.save();

    res.json({ 
      message: 'Username updated successfully',
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        isAdmin: user.isAdmin,
        createdAt: user.createdAt,
      },
    });
  } catch (error) {
    console.error('Error updating username:', error);
    
    if (error.code === 11000) {
      return res.status(400).json({ 
        message: 'Username is already taken' 
      });
    }

    res.status(500).json({ 
      message: 'Error updating username' 
    });
  }
});

/**
 * PATCH /api/admin/users/:userId/admin
 * Toggle admin status for a user (admin only)
 */
router.patch('/users/:userId/admin', async (req, res) => {
  try {
    const { userId } = req.params;
    const { isAdmin } = req.body;

    // Prevent modification of the hardcoded admin user's admin status
    if (userId === ADMIN_USER_ID) {
      return res.status(400).json({ 
        message: 'Cannot modify the primary admin account status' 
      });
    }

    // Prevent admin from removing their own admin status
    if (userId === req.adminUser._id.toString() && isAdmin === false) {
      return res.status(400).json({ 
        message: 'Cannot remove your own admin status' 
      });
    }

    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({ 
        message: 'User not found' 
      });
    }

    user.isAdmin = isAdmin === true;
    await user.save();

    res.json({ 
      message: `User ${isAdmin ? 'promoted to' : 'removed from'} admin successfully`,
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        isAdmin: user.isAdmin,
        createdAt: user.createdAt,
      },
    });
  } catch (error) {
    console.error('Error updating admin status:', error);
    res.status(500).json({ 
      message: 'Error updating admin status' 
    });
  }
});

module.exports = router;

