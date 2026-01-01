/**
 * Admin Configuration
 * 
 * This file contains the hardcoded admin user information.
 * DO NOT commit this file to version control - it contains sensitive information.
 * 
 * This file is gitignored. Use admin.js.example as a template.
 * 
 * Admin User:
 * - _id: 6956cebaa0f178eb4a2ed947
 * - username: iopo
 * - email: david.belykh@gmail.com
 */

// Read from environment variable first, then fallback to hardcoded value
const ADMIN_USER_ID = process.env.ADMIN_USER_ID || '6956cebaa0f178eb4a2ed947';

module.exports = {
  ADMIN_USER_ID,
};

