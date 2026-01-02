const express = require('express');
const Deck = require('../models/Deck');
const Card = require('../models/Card');
const { requireAuth } = require('../middleware/auth');
const router = express.Router();

/**
 * GET /api/shared/:shareId
 * Get a shared deck by shareId (public, no auth required)
 */
router.get('/:shareId', async (req, res) => {
  try {
    const { shareId } = req.params;

    const deck = await Deck.findOne({ 
      shareId,
      isPublic: true,
    });

    if (!deck) {
      return res.status(404).json({ 
        message: 'Shared deck not found' 
      });
    }

    // Get all cards for this deck
    const cards = await Card.find({ deckId: deck._id })
      .select('front back') // Only return front and back, not spaced repetition data
      .sort({ createdAt: 1 });

    res.json({
      deck: {
        _id: deck._id,
        title: deck.title,
        description: deck.description,
        isPublic: deck.isPublic,
        shareId: deck.shareId,
        createdAt: deck.createdAt,
      },
      cards,
      cardCount: cards.length,
    });
  } catch (error) {
    console.error('Error fetching shared deck:', error);
    res.status(500).json({ 
      message: 'Error fetching shared deck' 
    });
  }
});

/**
 * POST /api/shared/:shareId/copy
 * Copy a shared deck to user's own decks (requires auth)
 */
router.post('/:shareId/copy', requireAuth, async (req, res) => {
  try {
    const { shareId } = req.params;

    // Find the shared deck
    const sharedDeck = await Deck.findOne({ 
      shareId,
      isPublic: true,
    });

    if (!sharedDeck) {
      return res.status(404).json({ 
        message: 'Shared deck not found' 
      });
    }

    // Get all cards from the shared deck
    const sharedCards = await Card.find({ deckId: sharedDeck._id });

    // Create a new deck for the user
    const newDeck = new Deck({
      ownerId: req.userId,
      title: `${sharedDeck.title} (Copy)`,
      description: sharedDeck.description || '',
      isPublic: false, // Copied decks are private by default
      shareId: null, // No shareId for copied decks initially
    });

    await newDeck.save();

    // Copy all cards to the new deck
    const cardPromises = sharedCards.map(card => {
      const newCard = new Card({
        deckId: newDeck._id,
        front: card.front,
        back: card.back,
        // Reset spaced repetition data for copied cards
        easeFactor: 2.5,
        interval: 0,
        nextReview: null,
      });
      return newCard.save();
    });

    await Promise.all(cardPromises);

    res.status(201).json({
      message: 'Deck copied successfully',
      deck: newDeck,
    });
  } catch (error) {
    console.error('Error copying shared deck:', error);
    res.status(500).json({ 
      message: 'Error copying shared deck' 
    });
  }
});

module.exports = router;

