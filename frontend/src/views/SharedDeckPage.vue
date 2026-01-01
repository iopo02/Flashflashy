<template>
  <div class="shared-deck-page">
    <div class="shared-container">
      <!-- Loading State -->
      <div v-if="loading" class="loading">Loading shared deck...</div>

      <!-- Shared Deck View -->
      <div v-else-if="deck" class="shared-content">
        <div class="deck-header">
          <h1>{{ deck.title }}</h1>
          <p v-if="deck.description" class="deck-description">{{ deck.description }}</p>
        </div>

        <div class="deck-info">
          <span class="info-item">{{ cards.length }} cards</span>
          <span class="info-item">Public Deck</span>
        </div>

        <!-- Cards Preview -->
        <div class="cards-preview">
          <h2>Cards</h2>
          <div v-if="cards.length > 0" class="cards-list">
            <div
              v-for="(card, index) in cards"
              :key="index"
              class="card-preview"
            >
              <div class="card-preview-number">{{ index + 1 }}</div>
              <div class="card-preview-content">
                <div class="card-preview-side">
                  <strong>Front:</strong> {{ card.front || '(Empty)' }}
                </div>
                <div class="card-preview-side">
                  <strong>Back:</strong> {{ card.back || '(Empty)' }}
                </div>
              </div>
            </div>
          </div>
          <div v-else class="no-cards">
            <p>This deck has no cards.</p>
          </div>
        </div>

        <!-- Action Buttons -->
        <div class="action-buttons">
          <button
            v-if="!isLoggedIn"
            @click="goToLogin"
            class="copy-btn"
          >
            Login to Copy Deck
          </button>
          <button
            v-else
            @click="copyDeck"
            :disabled="copying"
            class="copy-btn"
          >
            <span v-if="copying">Copying...</span>
            <span v-else>Copy to My Decks</span>
          </button>
          <button @click="goHome" class="back-btn">Go Home</button>
        </div>

        <!-- Success Message -->
        <div v-if="copySuccess" class="success-message">
          Deck copied successfully! <router-link to="/decks">View My Decks</router-link>
        </div>
      </div>

      <!-- Error State -->
      <div v-else class="error-state">
        <p>Shared deck not found</p>
        <button @click="goHome" class="back-btn">Go Home</button>
      </div>
    </div>
  </div>
</template>

<script>
import axios from 'axios';

export default {
  name: 'SharedDeckPage',
  data() {
    return {
      deck: null,
      cards: [],
      loading: false,
      copying: false,
      copySuccess: false,
    };
  },
  computed: {
    isLoggedIn() {
      const user = localStorage.getItem('user');
      return user !== null;
    },
  },
  mounted() {
    this.fetchSharedDeck();
  },
  methods: {
    async fetchSharedDeck() {
      this.loading = true;
      try {
        const shareId = this.$route.params.shareId;
        const response = await axios.get(`/shared/${shareId}`);
        this.deck = response.data.deck;
        this.cards = response.data.cards;
      } catch (error) {
        console.error('Error fetching shared deck:', error);
        if (error.response?.status === 404) {
          this.deck = null;
        }
      } finally {
        this.loading = false;
      }
    },
    async copyDeck() {
      if (!this.isLoggedIn) {
        this.goToLogin();
        return;
      }

      this.copying = true;
      try {
        const userId = localStorage.getItem('userId');
        const shareId = this.$route.params.shareId;
        await axios.post(`/shared/${shareId}/copy`, {}, {
          params: { userId },
        });
        this.copySuccess = true;
      } catch (error) {
        console.error('Error copying deck:', error);
        alert(error.response?.data?.message || 'Error copying deck');
      } finally {
        this.copying = false;
      }
    },
    goToLogin() {
      this.$router.push('/login');
    },
    goHome() {
      this.$router.push('/');
    },
  },
};
</script>

<style scoped>
.shared-deck-page {
  padding: 40px 20px;
  min-height: calc(100vh - 200px);
}

.shared-container {
  max-width: 800px;
  margin: 0 auto;
}

.loading {
  text-align: center;
  padding: 40px;
  color: #666;
}

.shared-content {
  background: white;
  border-radius: 8px;
  padding: 30px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
}

.deck-header {
  margin-bottom: 20px;
  padding-bottom: 20px;
  border-bottom: 2px solid #e0e0e0;
}

.deck-header h1 {
  margin: 0 0 10px 0;
  color: #2c3e50;
}

.deck-description {
  color: #666;
  margin: 10px 0 0 0;
}

.deck-info {
  display: flex;
  gap: 15px;
  margin-bottom: 30px;
  padding: 10px 0;
}

.info-item {
  padding: 6px 12px;
  background-color: #f5f5f5;
  border-radius: 4px;
  font-size: 14px;
  color: #666;
}

.cards-preview {
  margin-bottom: 30px;
}

.cards-preview h2 {
  color: #2c3e50;
  margin-bottom: 20px;
}

.cards-list {
  display: flex;
  flex-direction: column;
  gap: 15px;
  max-height: 500px;
  overflow-y: auto;
}

.card-preview {
  display: flex;
  gap: 15px;
  padding: 15px;
  background-color: #f9f9f9;
  border-radius: 8px;
  border: 1px solid #e0e0e0;
}

.card-preview-number {
  font-size: 20px;
  font-weight: bold;
  color: #42b983;
  min-width: 30px;
}

.card-preview-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.card-preview-side {
  color: #2c3e50;
  line-height: 1.6;
}

.card-preview-side strong {
  color: #666;
  margin-right: 8px;
}

.no-cards {
  text-align: center;
  padding: 40px;
  color: #666;
}

.action-buttons {
  display: flex;
  gap: 15px;
  justify-content: center;
  margin-top: 30px;
  padding-top: 30px;
  border-top: 2px solid #e0e0e0;
}

.copy-btn {
  padding: 12px 24px;
  background-color: #42b983;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-weight: 600;
  font-size: 16px;
}

.copy-btn:hover:not(:disabled) {
  background-color: #35a372;
}

.copy-btn:disabled {
  background-color: #ccc;
  cursor: not-allowed;
}

.back-btn {
  padding: 12px 24px;
  background-color: #95a5a6;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-weight: 600;
  font-size: 16px;
}

.back-btn:hover {
  background-color: #7f8c8d;
}

.success-message {
  margin-top: 20px;
  padding: 15px;
  background-color: #d4edda;
  color: #155724;
  border-radius: 4px;
  border: 1px solid #c3e6cb;
  text-align: center;
}

.success-message a {
  color: #155724;
  font-weight: 600;
  text-decoration: underline;
}

.error-state {
  text-align: center;
  padding: 60px 20px;
  color: #666;
}

.error-state p {
  font-size: 18px;
  margin-bottom: 20px;
}
</style>

