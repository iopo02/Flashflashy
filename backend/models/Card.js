const mongoose = require('mongoose');

/**
 * Card Schema
 * Represents a flashcard within a deck
 */
const cardSchema = new mongoose.Schema({
  deckId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Deck',
    required: true,
    index: true, // Index for efficient queries by deck
  },
  front: {
    type: String,
    required: false, // Allow empty for initial creation, validate in routes
    trim: true,
    maxlength: 5000,
    default: '',
  },
  back: {
    type: String,
    required: false, // Allow empty for initial creation, validate in routes
    trim: true,
    maxlength: 5000,
    default: '',
  },
  createdAt: {
    type: Date,
    default: Date.now,
    immutable: true,
  },
  // Spaced repetition fields (optional)
  easeFactor: {
    type: Number,
    default: 2.5, // Default ease factor for spaced repetition
    min: 1.3,
    max: 2.5,
  },
  interval: {
    type: Number, // Days until next review
    default: 0,
    min: 0,
  },
  nextReview: {
    type: Date,
    default: null,
    index: true, // Index for efficient queries of cards due for review
  },
}, {
  timestamps: false, // We're using createdAt manually
});

// Compound index for finding cards due for review in a specific deck
cardSchema.index({ deckId: 1, nextReview: 1 });

// Compound index for finding all cards in a deck (ordered by creation)
cardSchema.index({ deckId: 1, createdAt: 1 });

module.exports = mongoose.model('Card', cardSchema);

