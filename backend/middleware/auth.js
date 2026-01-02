const User = require('../models/User');
const { ADMIN_USER_ID } = require('../config/admin');

/**
 * Middleware to require authentication (any logged-in user)
 */
const requireAuth = async (req, res, next) => {
  try {
    const userId = req.body.userId || req.query.userId || req.headers['x-user-id'] || req.body.ownerId;

    if (!userId) {
      return res.status(401).json({ 
        message: 'Authentication required' 
      });
    }

    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({ 
        message: 'User not found' 
      });
    }

    // Attach user to request
    req.user = user;
    req.userId = userId;
    next();
  } catch (error) {
    console.error('Auth middleware error:', error);
    res.status(500).json({ 
      message: 'Authentication error' 
    });
  }
};

/**
 * Middleware to check if user is admin
 * For now, expects userId in request body or query
 * TODO: Replace with proper JWT authentication
 */
const requireAdmin = async (req, res, next) => {
  try {
    const userId = req.body.userId || req.query.userId || req.headers['x-user-id'];

    if (!userId) {
      return res.status(401).json({ 
        message: 'User ID is required' 
      });
    }

    // Check if user is the hardcoded admin user
    if (userId === ADMIN_USER_ID) {
      const user = await User.findById(userId);
      if (user) {
        req.adminUser = user;
        return next();
      }
    }

    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({ 
        message: 'User not found' 
      });
    }

    if (!user.isAdmin) {
      return res.status(403).json({ 
        message: 'Admin access required' 
      });
    }

    // Attach user to request for use in routes
    req.adminUser = user;
    next();
  } catch (error) {
    console.error('Auth middleware error:', error);
    res.status(500).json({ 
      message: 'Authentication error' 
    });
  }
};

module.exports = { requireAuth, requireAdmin };
