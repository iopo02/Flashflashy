const express = require('express');
const Deck = require('../models/Deck');
const Card = require('../models/Card');
const { requireAuth } = require('../middleware/auth');
const router = express.Router();

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
    }

    await deck.save();

    res.json({
      message: 'Deck updated successfully',
      deck,
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

