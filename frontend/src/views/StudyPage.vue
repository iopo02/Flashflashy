<template>
  <div class="study-page">
    <div class="study-container">
      <!-- Header -->
      <div class="study-header">
        <button @click="goBack" class="back-btn">← Back to Deck</button>
        <div class="progress-info">
          <span>Card {{ currentCardIndex + 1 }} of {{ totalCards }}</span>
        </div>
      </div>

      <!-- Loading State -->
      <div v-if="loading" class="loading">Loading deck...</div>

      <!-- No Cards State -->
      <div v-else-if="cards.length === 0" class="no-cards">
        <p>This deck has no cards to study.</p>
        <button @click="goBack" class="back-btn">Go Back</button>
      </div>

      <!-- Study Interface -->
      <div v-else class="study-interface">
        <!-- Card Display -->
        <div class="card-display" :class="{ 'flipped': isFlipped }">
          <div class="card-inner">
            <div class="card-front">
              <div class="card-content">
                <div class="card-label">Question</div>
                <div class="card-text">{{ currentCard.front || '(Empty)' }}</div>
              </div>
            </div>
            <div class="card-back">
              <div class="card-content">
                <div class="card-label">Answer</div>
                <div class="card-text">{{ currentCard.back || '(Empty)' }}</div>
              </div>
            </div>
          </div>
        </div>

        <!-- Flip Button (shown when not flipped) -->
        <div v-if="!isFlipped" class="action-section">
          <button @click="flipCard" class="flip-btn" @keydown.space.prevent="flipCard">
            <span>Show Answer</span>
            <span class="keyboard-hint">(Space)</span>
          </button>
        </div>

        <!-- Rating Buttons (shown when flipped) -->
        <div v-else class="rating-section">
          <p class="rating-prompt">How well did you know this?</p>
          <div class="rating-buttons">
            <button
              @click="rateCard(1)"
              class="rating-btn again"
              :class="{ 'active': selectedRating === 1 }"
            >
              <span class="rating-number">1</span>
              <span class="rating-label">Again</span>
              <span class="keyboard-hint">(1)</span>
            </button>
            <button
              @click="rateCard(2)"
              class="rating-btn hard"
              :class="{ 'active': selectedRating === 2 }"
            >
              <span class="rating-number">2</span>
              <span class="rating-label">Hard</span>
              <span class="keyboard-hint">(2)</span>
            </button>
            <button
              @click="rateCard(3)"
              class="rating-btn good"
              :class="{ 'active': selectedRating === 3 }"
            >
              <span class="rating-number">3</span>
              <span class="rating-label">Good</span>
              <span class="keyboard-hint">(3)</span>
            </button>
            <button
              @click="rateCard(4)"
              class="rating-btn easy"
              :class="{ 'active': selectedRating === 4 }"
            >
              <span class="rating-number">4</span>
              <span class="rating-label">Easy</span>
              <span class="keyboard-hint">(4)</span>
            </button>
          </div>
        </div>

        <!-- Keyboard Shortcuts Help -->
        <div class="keyboard-help">
          <p><strong>Keyboard Shortcuts:</strong></p>
          <p v-if="!isFlipped">Press <kbd>Space</kbd> to flip the card</p>
          <p v-else>Press <kbd>1</kbd> Again | <kbd>2</kbd> Hard | <kbd>3</kbd> Good | <kbd>4</kbd> Easy</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import axios from 'axios';

export default {
  name: 'StudyPage',
  data() {
    return {
      deck: null,
      cards: [],
      currentCardIndex: 0,
      isFlipped: false,
      loading: false,
      selectedRating: null,
      ratingInProgress: false,
    };
  },
  computed: {
    currentCard() {
      return this.cards[this.currentCardIndex] || null;
    },
    totalCards() {
      return this.cards.length;
    },
  },
  mounted() {
    this.fetchDeck();
    // Add keyboard event listeners
    window.addEventListener('keydown', this.handleKeyPress);
  },
  beforeUnmount() {
    // Remove keyboard event listeners
    window.removeEventListener('keydown', this.handleKeyPress);
  },
  methods: {
    async fetchDeck() {
      this.loading = true;
      try {
        const userId = localStorage.getItem('userId');
        const deckId = this.$route.params.deckId;
        const response = await axios.get(`/decks/${deckId}`, {
          params: { userId },
        });
        this.deck = response.data.deck;
        this.cards = this.shuffleArray([...response.data.cards]);
        
        if (this.cards.length === 0) {
          return;
        }
        
        this.currentCardIndex = 0;
      } catch (error) {
        console.error('Error fetching deck:', error);
        if (error.response?.status === 404) {
          this.$router.push('/decks');
        } else if (error.response?.status === 401) {
          this.$router.push('/login');
        }
      } finally {
        this.loading = false;
      }
    },
    shuffleArray(array) {
      // Fisher-Yates shuffle algorithm
      const shuffled = [...array];
      for (let i = shuffled.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
      }
      return shuffled;
    },
    flipCard() {
      if (!this.isFlipped) {
        this.isFlipped = true;
        this.selectedRating = null;
      }
    },
    async rateCard(rating) {
      if (this.ratingInProgress || !this.currentCard) return;
      
      this.selectedRating = rating;
      this.ratingInProgress = true;

      try {
        const userId = localStorage.getItem('userId');
        await axios.patch(`/cards/${this.currentCard._id}/rate`, {
          rating,
          userId,
        }, {
          params: { userId },
        });

        // Move to next card after a short delay
        setTimeout(() => {
          this.nextCard();
        }, 300);
      } catch (error) {
        console.error('Error rating card:', error);
        alert(error.response?.data?.message || 'Error rating card');
        this.ratingInProgress = false;
        this.selectedRating = null;
      }
    },
    nextCard() {
      this.ratingInProgress = false;
      this.selectedRating = null;
      this.isFlipped = false;

      // Move to next card
      if (this.currentCardIndex < this.cards.length - 1) {
        this.currentCardIndex++;
      } else {
        // All cards reviewed, shuffle and start over
        this.cards = this.shuffleArray([...this.cards]);
        this.currentCardIndex = 0;
      }
    },
    handleKeyPress(event) {
      // Don't handle if typing in an input field
      if (event.target.tagName === 'INPUT' || event.target.tagName === 'TEXTAREA') {
        return;
      }

      // Space to flip card
      if (event.key === ' ' && !this.isFlipped) {
        event.preventDefault();
        this.flipCard();
        return;
      }

      // Number keys 1-4 to rate card (only when flipped)
      if (this.isFlipped && !this.ratingInProgress) {
        if (event.key === '1') {
          event.preventDefault();
          this.rateCard(1);
        } else if (event.key === '2') {
          event.preventDefault();
          this.rateCard(2);
        } else if (event.key === '3') {
          event.preventDefault();
          this.rateCard(3);
        } else if (event.key === '4') {
          event.preventDefault();
          this.rateCard(4);
        }
      }
    },
    goBack() {
      this.$router.push(`/decks/${this.$route.params.deckId}/edit`);
    },
  },
};
</script>

<style scoped>
.study-page {
  padding: 40px 20px;
  min-height: calc(100vh - 60px);
  display: flex;
  justify-content: center;
  align-items: center;
  background-color: #ffffff;
}

.study-container {
  max-width: 800px;
  width: 100%;
}

.study-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 30px;
}

.back-btn {
  padding: 8px 16px;
  background-color: #ffffff;
  color: #1a237e;
  border: 1px solid #767676;
  cursor: pointer;
  font-weight: 500;
  font-size: 14px;
  transition: background-color 0.2s;
}

.back-btn:hover {
  background-color: #f5f5f5;
}

.progress-info {
  color: #767676;
  font-weight: 400;
  font-size: 14px;
}

.loading,
.no-cards {
  text-align: center;
  padding: 40px;
  color: #666;
}

.study-interface {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 30px;
}

/* Card Display */
.card-display {
  width: 100%;
  max-width: 600px;
  height: 400px;
  perspective: 1000px;
}

.card-inner {
  position: relative;
  width: 100%;
  height: 100%;
  transition: transform 0.6s;
  transform-style: preserve-3d;
}

.card-display.flipped .card-inner {
  transform: rotateY(180deg);
}

.card-front,
.card-back {
  position: absolute;
  width: 100%;
  height: 100%;
  backface-visibility: hidden;
  border-radius: 12px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 40px;
  box-sizing: border-box;
}

.card-front {
  background: linear-gradient(135deg, #5c6bc0 0%, #7986cb 100%);
  color: white;
}

.card-back {
  background: linear-gradient(135deg, #1a237e 0%, #283593 100%);
  color: white;
  transform: rotateY(180deg);
}

.card-content {
  text-align: center;
  width: 100%;
}

.card-label {
  font-size: 14px;
  opacity: 0.9;
  margin-bottom: 15px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 1px;
}

.card-text {
  font-size: 24px;
  line-height: 1.6;
  word-wrap: break-word;
  white-space: pre-wrap;
}

/* Action Section */
.action-section {
  display: flex;
  justify-content: center;
}

.flip-btn {
  padding: 12px 32px;
  background-color: #5c6bc0;
  color: #ffffff;
  border: none;
  font-size: 16px;
  font-weight: 500;
  cursor: pointer;
  transition: background-color 0.2s;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 5px;
}

.flip-btn:hover {
  background-color: #4a56b2;
}

.keyboard-hint {
  font-size: 12px;
  opacity: 0.8;
  font-weight: normal;
}

/* Rating Section */
.rating-section {
  width: 100%;
  max-width: 600px;
}

.rating-prompt {
  text-align: center;
  font-size: 16px;
  font-weight: 400;
  color: #1a237e;
  margin-bottom: 20px;
}

.rating-buttons {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 15px;
}

.rating-btn {
  padding: 16px 12px;
  border: 1px solid #767676;
  background: #ffffff;
  cursor: pointer;
  transition: all 0.2s;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  font-weight: 500;
  font-size: 14px;
}

.rating-btn:hover {
  border-color: #5c6bc0;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
}

.rating-btn.again {
  border-color: #d13212;
  color: #d13212;
}

.rating-btn.again:hover,
.rating-btn.again.active {
  background-color: #e74c3c;
  color: white;
}

.rating-btn.hard {
  border-color: #f39c12;
  color: #f39c12;
}

.rating-btn.hard:hover,
.rating-btn.hard.active {
  background-color: #f39c12;
  color: white;
}

.rating-btn.good {
  border-color: #42b983;
  color: #42b983;
}

.rating-btn.good:hover,
.rating-btn.good.active {
  background-color: #42b983;
  color: white;
}

.rating-btn.easy {
  border-color: #3498db;
  color: #3498db;
}

.rating-btn.easy:hover,
.rating-btn.easy.active {
  background-color: #3498db;
  color: white;
}

.rating-number {
  font-size: 24px;
  font-weight: bold;
}

.rating-label {
  font-size: 14px;
}

/* Keyboard Help */
.keyboard-help {
  margin-top: 20px;
  padding: 15px;
  background-color: #f5f5f5;
  border-radius: 8px;
  text-align: center;
  font-size: 14px;
  color: #666;
}

.keyboard-help p {
  margin: 5px 0;
}

keyboard-help kbd {
  background-color: #fff;
  border: 1px solid #ccc;
  border-radius: 3px;
  padding: 2px 6px;
  font-family: monospace;
  font-size: 12px;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.1);
}

kbd {
  background-color: #fff;
  border: 1px solid #ccc;
  border-radius: 3px;
  padding: 2px 6px;
  font-family: monospace;
  font-size: 12px;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.1);
}
</style>

