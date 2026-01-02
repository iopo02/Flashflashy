const express = require('express');
const router = express.Router();

// Example route
router.get('/test', (req, res) => {
  res.json({ message: 'API is working!' });
});

// API routes
router.use('/users', require('./users'));
router.use('/admin', require('./admin'));
router.use('/decks', require('./decks'));
router.use('/cards', require('./cards'));
router.use('/shared', require('./shared'));

module.exports = router;

