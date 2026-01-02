const mongoose = require('mongoose');

/**
 * Deck Schema
 * Represents a flashcard deck owned by a user
 */
const deckSchema = new mongoose.Schema({
  ownerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true, // Index for efficient queries by owner
  },
  title: {
    type: String,
    required: true,
    trim: true,
    maxlength: 200,
  },
  description: {
    type: String,
    trim: true,
    maxlength: 1000,
    default: '',
  },
  isPublic: {
    type: Boolean,
    default: false,
  },
  shareId: {
    type: String,
    unique: true,
    sparse: true, // Allows null values but enforces uniqueness when present
    trim: true,
    index: true, // Index for efficient share link lookups
  },
  createdAt: {
    type: Date,
    default: Date.now,
    immutable: true,
  },
}, {
  timestamps: false, // We're using createdAt manually
});

// Compound index for finding public decks by owner
deckSchema.index({ ownerId: 1, isPublic: 1 });

module.exports = mongoose.model('Deck', deckSchema);

