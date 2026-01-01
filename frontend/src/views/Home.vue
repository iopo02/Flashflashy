<template>
  <div class="home">
    <div class="home-container">
      <h1>Your Decks</h1>
      
      <!-- Loading State -->
      <div v-if="loading" class="loading">Loading decks...</div>

      <!-- Decks Grid -->
      <div v-else-if="decks.length > 0" class="decks-grid">
        <div
          v-for="deck in decks"
          :key="deck._id"
          class="deck-card"
          @click="studyDeck(deck._id)"
        >
          <div class="deck-header">
            <h3>{{ deck.title }}</h3>
            <span v-if="deck.isPublic" class="public-badge">Public</span>
            <span v-else class="private-badge">Private</span>
          </div>
          <p class="deck-description">{{ deck.description || 'No description' }}</p>
          <div class="deck-footer">
            <span class="deck-meta">{{ formatDate(deck.createdAt) }}</span>
            <button @click.stop="studyDeck(deck._id)" class="study-btn">Study</button>
          </div>
        </div>
      </div>

      <!-- Empty State -->
      <div v-else class="empty-state">
        <p>You don't have any decks yet.</p>
        <router-link to="/decks" class="create-link">Create Your First Deck</router-link>
      </div>
    </div>
  </div>
</template>

<script>
import axios from 'axios';

export default {
  name: 'HomePage',
  data() {
    return {
      decks: [],
      loading: false,
    };
  },
  mounted() {
    this.fetchDecks();
  },
  methods: {
    async fetchDecks() {
      this.loading = true;
      try {
        const userId = localStorage.getItem('userId');
        if (!userId) {
          this.loading = false;
          return;
        }
        const response = await axios.get('/decks', {
          params: { userId },
        });
        this.decks = response.data.decks;
      } catch (error) {
        console.error('Error fetching decks:', error);
        if (error.response?.status === 401) {
          // Not logged in, that's okay
        }
      } finally {
        this.loading = false;
      }
    },
    studyDeck(deckId) {
      this.$router.push(`/decks/${deckId}/study`);
    },
    formatDate(dateString) {
      if (!dateString) return 'N/A';
      const date = new Date(dateString);
      return date.toLocaleDateString();
    },
  },
};
</script>

<style scoped>
.home {
  padding: 40px 20px;
  min-height: calc(100vh - 60px);
  background-color: #ffffff;
}

.home-container {
  max-width: 1200px;
  margin: 0 auto;
}

h1 {
  color: #1a237e;
  margin-bottom: 24px;
  font-size: 28px;
  font-weight: 400;
  text-align: left;
}

.loading {
  text-align: center;
  padding: 60px 20px;
  color: #666;
  font-size: 14px;
}

.decks-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
  gap: 20px;
}

.deck-card {
  background: #ffffff;
  border: 1px solid #e0e0e0;
  padding: 20px;
  cursor: pointer;
  transition: border-color 0.2s, box-shadow 0.2s;
}

.deck-card:hover {
  border-color: #5c6bc0;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
}

.deck-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 12px;
  gap: 12px;
}

.deck-header h3 {
  margin: 0;
  color: #1a237e;
  flex: 1;
  font-size: 18px;
  font-weight: 400;
  line-height: 1.4;
}

.public-badge {
  background-color: #5c6bc0;
  color: #ffffff;
  padding: 3px 8px;
  font-size: 11px;
  font-weight: 500;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.private-badge {
  background-color: #767676;
  color: #ffffff;
  padding: 3px 8px;
  font-size: 11px;
  font-weight: 500;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.deck-description {
  color: #666;
  margin: 12px 0;
  font-size: 14px;
  line-height: 1.5;
  min-height: 40px;
}

.deck-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 16px;
  padding-top: 16px;
  border-top: 1px solid #e0e0e0;
}

.deck-meta {
  color: #767676;
  font-size: 13px;
}

.study-btn {
  padding: 8px 16px;
  background-color: #5c6bc0;
  color: #ffffff;
  border: none;
  cursor: pointer;
  font-weight: 500;
  font-size: 14px;
  transition: background-color 0.2s;
}

.study-btn:hover {
  background-color: #4a56b2;
}

.empty-state {
  text-align: center;
  padding: 80px 20px;
  color: #666;
}

.empty-state p {
  font-size: 16px;
  margin-bottom: 24px;
}

.create-link {
  display: inline-block;
  padding: 10px 20px;
  background-color: #5c6bc0;
  color: #ffffff;
  text-decoration: none;
  font-weight: 500;
  font-size: 14px;
  transition: background-color 0.2s;
}

.create-link:hover {
  background-color: #4a56b2;
}
</style>
