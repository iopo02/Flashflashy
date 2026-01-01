/**
 * Script to ensure the admin user has admin status in the database
 * Run this script to set the admin user's isAdmin flag to true
 * 
 * Usage: node scripts/ensure-admin.js
 */

require('dotenv').config();
const mongoose = require('mongoose');
const User = require('../models/User');
const { ADMIN_USER_ID } = require('../config/admin');

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/flashflashy';

async function ensureAdmin() {
  try {
    // Connect to MongoDB
    await mongoose.connect(MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('Connected to MongoDB');

    // Find and update admin user
    const adminUser = await User.findById(ADMIN_USER_ID);

    if (!adminUser) {
      console.error(`Admin user with ID ${ADMIN_USER_ID} not found in database.`);
      process.exit(1);
    }

    if (adminUser.isAdmin) {
      console.log('Admin user already has admin status.');
    } else {
      adminUser.isAdmin = true;
      await adminUser.save();
      console.log('Admin user status updated successfully.');
    }

    console.log('Admin user details:');
    console.log(`  ID: ${adminUser._id}`);
    console.log(`  Username: ${adminUser.username}`);
    console.log(`  Email: ${adminUser.email}`);
    console.log(`  isAdmin: ${adminUser.isAdmin}`);

    await mongoose.connection.close();
    console.log('Database connection closed.');
    process.exit(0);
  } catch (error) {
    console.error('Error ensuring admin status:', error);
    await mongoose.connection.close();
    process.exit(1);
  }
}

ensureAdmin();

