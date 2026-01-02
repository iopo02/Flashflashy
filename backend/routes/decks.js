const express = require('express');
const crypto = require('crypto');
const Deck = require('../models/Deck');
const Card = require('../models/Card');
const { requireAuth } = require('../middleware/auth');
const router = express.Router();

/**
 * Generate a unique share ID for deck sharing
 */
function generateShareId() {
  return crypto.randomBytes(8).toString('base64url').substring(0, 12);
}

// All deck routes require authentication
router.use(requireAuth);

/**
 * GET /api/decks
 * Get all decks for the authenticated user
 */
router.get('/', async (req, res) => {
  try {
    const decks = await Deck.find({ ownerId: req.userId })
      .sort({ createdAt: -1 });

    res.json({
      decks,
      count: decks.length,
    });
  } catch (error) {
    console.error('Error fetching decks:', error);
    res.status(500).json({ 
      message: 'Error fetching decks' 
    });
  }
});

/**
 * GET /api/decks/:deckId
 * Get a specific deck with its cards
 */
router.get('/:deckId', async (req, res) => {
  try {
    const { deckId } = req.params;

    const deck = await Deck.findOne({ 
      _id: deckId, 
      ownerId: req.userId 
    });

    if (!deck) {
      return res.status(404).json({ 
        message: 'Deck not found' 
      });
    }

    // Get all cards for this deck
    const cards = await Card.find({ deckId })
      .sort({ createdAt: 1 });

    res.json({
      deck,
      cards,
      cardCount: cards.length,
    });
  } catch (error) {
    console.error('Error fetching deck:', error);
    res.status(500).json({ 
      message: 'Error fetching deck' 
    });
  }
});

/**
 * POST /api/decks
 * Create a new deck
 */
router.post('/', async (req, res) => {
  try {
    const { title, description, isPublic } = req.body;

    if (!title || title.trim().length === 0) {
      return res.status(400).json({ 
        message: 'Deck title is required' 
      });
    }

    if (title.trim().length > 200) {
      return res.status(400).json({ 
        message: 'Deck title must be 200 characters or less' 
      });
    }

    const deck = new Deck({
      ownerId: req.userId,
      title: title.trim(),
      description: description ? description.trim() : '',
      isPublic: isPublic === true,
      shareId: isPublic === true ? generateShareId() : null,
    });

    await deck.save();

    res.status(201).json({
      message: 'Deck created successfully',
      deck,
    });
  } catch (error) {
    console.error('Error creating deck:', error);
    res.status(500).json({ 
      message: 'Error creating deck' 
    });
  }
});

/**
 * PATCH /api/decks/:deckId
 * Update a deck
 */
router.patch('/:deckId', async (req, res) => {
  try {
    const { deckId } = req.params;
    const { title, description, isPublic } = req.body;

    const deck = await Deck.findOne({ 
      _id: deckId, 
      ownerId: req.userId 
    });

    if (!deck) {
      return res.status(404).json({ 
        message: 'Deck not found' 
      });
    }

    if (title !== undefined) {
      if (title.trim().length === 0) {
        return res.status(400).json({ 
          message: 'Deck title cannot be empty' 
        });
      }
      if (title.trim().length > 200) {
        return res.status(400).json({ 
          message: 'Deck title must be 200 characters or less' 
        });
      }
      deck.title = title.trim();
    }

    if (description !== undefined) {
      deck.description = description.trim();
    }

    if (isPublic !== undefined) {
      deck.isPublic = isPublic === true;
      // Use provided shareId or generate one if making public and doesn't have one
      if (isPublic === true) {
        if (req.body.shareId && typeof req.body.shareId === 'string' && req.body.shareId.trim().length > 0) {
          // Use the provided shareId (from frontend optimistic update)
          deck.shareId = req.body.shareId.trim();
        } else if (!deck.shareId) {
          // Generate new shareId if none provided and deck doesn't have one
          deck.shareId = generateShareId();
        }
      } else {
        // Remove shareId if making private
        deck.shareId = null;
      }
    }

    await deck.save();

    // Reload deck to ensure we have the latest data including shareId
    const updatedDeck = await Deck.findById(deckId);

    res.json({
      message: 'Deck updated successfully',
      deck: updatedDeck,
    });
  } catch (error) {
    console.error('Error updating deck:', error);
    res.status(500).json({ 
      message: 'Error updating deck' 
    });
  }
});

/**
 * DELETE /api/decks/:deckId
 * Delete a deck and all its cards
 */
router.delete('/:deckId', async (req, res) => {
  try {
    const { deckId } = req.params;

    const deck = await Deck.findOne({ 
      _id: deckId, 
      ownerId: req.userId 
    });

    if (!deck) {
      return res.status(404).json({ 
        message: 'Deck not found' 
      });
    }

    // Delete all cards in this deck
    await Card.deleteMany({ deckId });

    // Delete the deck
    await Deck.findByIdAndDelete(deckId);

    res.json({ 
      message: 'Deck and all cards deleted successfully' 
    });
  } catch (error) {
    console.error('Error deleting deck:', error);
    res.status(500).json({ 
      message: 'Error deleting deck' 
    });
  }
});

module.exports = router;

