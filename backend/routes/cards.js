const express = require('express');
const Card = require('../models/Card');
const Deck = require('../models/Deck');
const { requireAuth } = require('../middleware/auth');
const router = express.Router();

// All card routes require authentication
router.use(requireAuth);

/**
 * POST /api/cards
 * Create a new card in a deck
 */
router.post('/', async (req, res) => {
  try {
    const { deckId, front, back } = req.body;

    if (!deckId) {
      return res.status(400).json({ 
        message: 'Deck ID is required' 
      });
    }

    // Verify deck exists and belongs to user
    const deck = await Deck.findOne({ 
      _id: deckId, 
      ownerId: req.userId 
    });

    if (!deck) {
      return res.status(404).json({ 
        message: 'Deck not found' 
      });
    }

    // Allow empty front/back for initial card creation (user will fill it in)
    // Use empty string as default if not provided
    const frontText = (front !== undefined && front !== null) ? String(front).trim() : '';
    const backText = (back !== undefined && back !== null) ? String(back).trim() : '';

    if (frontText.length > 5000 || backText.length > 5000) {
      return res.status(400).json({ 
        message: 'Front and back must be 5000 characters or less' 
      });
    }

    const card = new Card({
      deckId,
      front: frontText || '', // Ensure it's at least an empty string
      back: backText || '', // Ensure it's at least an empty string
    });

    await card.save();

    res.status(201).json({
      message: 'Card created successfully',
      card,
    });
  } catch (error) {
    console.error('Error creating card:', error);
    res.status(500).json({ 
      message: error.message || 'Error creating card' 
    });
  }
});

/**
 * PATCH /api/cards/:cardId
 * Update a card
 */
router.patch('/:cardId', async (req, res) => {
  try {
    const { cardId } = req.params;
    const { front, back } = req.body;

    // Find card and verify it belongs to user's deck
    const card = await Card.findById(cardId);
    
    if (!card) {
      return res.status(404).json({ 
        message: 'Card not found' 
      });
    }

    // Verify deck belongs to user
    const deck = await Deck.findOne({ 
      _id: card.deckId, 
      ownerId: req.userId 
    });

    if (!deck) {
      return res.status(403).json({ 
        message: 'You do not have permission to edit this card' 
      });
    }

    if (front !== undefined) {
      const frontText = front.trim();
      if (frontText.length > 5000) {
        return res.status(400).json({ 
          message: 'Front must be 5000 characters or less' 
        });
      }
      card.front = frontText;
    }

    if (back !== undefined) {
      const backText = back.trim();
      if (backText.length > 5000) {
        return res.status(400).json({ 
          message: 'Back must be 5000 characters or less' 
        });
      }
      card.back = backText;
    }

    await card.save();

    res.json({
      message: 'Card updated successfully',
      card,
    });
  } catch (error) {
    console.error('Error updating card:', error);
    res.status(500).json({ 
      message: 'Error updating card' 
    });
  }
});

/**
 * DELETE /api/cards/:cardId
 * Delete a card
 */
router.delete('/:cardId', async (req, res) => {
  try {
    const { cardId } = req.params;

    // Find card and verify it belongs to user's deck
    const card = await Card.findById(cardId);
    
    if (!card) {
      return res.status(404).json({ 
        message: 'Card not found' 
      });
    }

    // Verify deck belongs to user
    const deck = await Deck.findOne({ 
      _id: card.deckId, 
      ownerId: req.userId 
    });

    if (!deck) {
      return res.status(403).json({ 
        message: 'You do not have permission to delete this card' 
      });
    }

    await Card.findByIdAndDelete(cardId);

    res.json({ 
      message: 'Card deleted successfully' 
    });
  } catch (error) {
    console.error('Error deleting card:', error);
    res.status(500).json({ 
      message: 'Error deleting card' 
    });
  }
});

module.exports = router;

