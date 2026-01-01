const mongoose = require('mongoose');

/**
 * User Schema
 * Represents a user in the application
 */
const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true,
    minlength: 3,
    maxlength: 30,
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true,
    match: [/^\S+@\S+\.\S+$/, 'Please enter a valid email address'],
  },
  passwordHash: {
    type: String,
    required: true,
  },
  profilePhotoUrl: {
    type: String,
    default: null,
  },
  isAdmin: {
    type: Boolean,
    default: false,
  },
  createdAt: {
    type: Date,
    default: Date.now,
    immutable: true,
  },
}, {
  timestamps: false, // We're using createdAt manually
});

// Index for email (already unique, but explicit index for performance)
userSchema.index({ email: 1 });

// Index for username (already unique, but explicit index for performance)
userSchema.index({ username: 1 });

module.exports = mongoose.model('User', userSchema);

