<template>
  <div class="deck-editor-page">
    <div class="editor-container">
      <!-- Loading State -->
      <div v-if="loading" class="loading">Loading deck...</div>

      <!-- Deck Editor -->
      <div v-else-if="deck" class="editor-content">
        <!-- Deck Header -->
        <div class="deck-header-section">
          <div class="header-actions">
            <button @click="goBack" class="back-btn">← Back to Decks</button>
            <button @click="showDeleteModal = true" class="delete-deck-btn">Delete Deck</button>
          </div>
          <div class="deck-info">
            <input
              v-model="deckTitle"
              type="text"
              class="deck-title-input"
              placeholder="Deck Title"
              @blur="saveDeckTitle"
              @keyup.enter="$event.target.blur()"
            />
            <textarea
              v-model="deckDescription"
              class="deck-description-input"
              placeholder="Deck description (optional)"
              @blur="saveDeckDescription"
            ></textarea>
          </div>
        </div>

        <!-- Cards Section -->
        <div class="cards-section">
          <div class="cards-header">
            <h2>Cards ({{ cards.length }})</h2>
            <button @click="addNewCard" class="add-card-btn">+ Add Card</button>
          </div>

          <!-- Cards List -->
          <div v-if="cards.length > 0" class="cards-list">
            <div
              v-for="(card, index) in cards"
              :key="card._id"
              class="card-item"
            >
              <div class="card-number">{{ index + 1 }}</div>
              <div class="card-content">
                <div class="card-side">
                  <label>Front</label>
                  <textarea
                    v-model="card.front"
                    class="card-textarea"
                    placeholder="Front of card"
                    @blur="saveCard(card)"
                  ></textarea>
                </div>
                <div class="card-side">
                  <label>Back</label>
                  <textarea
                    v-model="card.back"
                    class="card-textarea"
                    placeholder="Back of card"
                    @blur="saveCard(card)"
                  ></textarea>
                </div>
              </div>
              <button @click="deleteCard(card)" class="delete-card-btn" title="Delete card">
                🗑️
              </button>
            </div>
          </div>

          <!-- Empty State -->
          <div v-else class="empty-cards">
            <p>No cards yet. Click "Add Card" to create your first card!</p>
          </div>
        </div>
      </div>

      <!-- Error State -->
      <div v-else class="error-state">
        <p>Deck not found</p>
        <button @click="goBack" class="back-btn">Back to Decks</button>
      </div>
    </div>

    <!-- Delete Deck Confirmation Modal -->
    <div v-if="showDeleteModal" class="modal-overlay" @click="showDeleteModal = false">
      <div class="modal" @click.stop>
        <h3>Delete Deck</h3>
        <p>Are you sure you want to delete <strong>{{ deck?.title }}</strong>?</p>
        <p class="warning">This will permanently delete the deck and all {{ cards.length }} card(s).</p>
        <div class="modal-actions">
          <button @click="deleteDeck" class="confirm-delete-btn">Delete</button>
          <button @click="showDeleteModal = false" class="cancel-btn">Cancel</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import axios from 'axios';

export default {
  name: 'DeckEditorPage',
  data() {
    return {
      deck: null,
      cards: [],
      loading: false,
      deckTitle: '',
      deckDescription: '',
      showDeleteModal: false,
      savingCard: new Set(),
    };
  },
  mounted() {
    this.fetchDeck();
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
        this.cards = response.data.cards;
        this.deckTitle = this.deck.title;
        this.deckDescription = this.deck.description || '';
      } catch (error) {
        console.error('Error fetching deck:', error);
        if (error.response?.status === 404) {
          this.deck = null;
        } else if (error.response?.status === 401) {
          this.$router.push('/login');
        }
      } finally {
        this.loading = false;
      }
    },
    goBack() {
      this.$router.push('/decks');
    },
    async saveDeckTitle() {
      if (this.deckTitle.trim() === this.deck.title) return;
      
      try {
        const userId = localStorage.getItem('userId');
        await axios.patch(`/decks/${this.deck._id}`, {
          title: this.deckTitle.trim(),
          userId,
        }, {
          params: { userId },
        });
        this.deck.title = this.deckTitle.trim();
      } catch (error) {
        console.error('Error saving deck title:', error);
        this.deckTitle = this.deck.title; // Revert on error
      }
    },
    async saveDeckDescription() {
      if ((this.deckDescription || '') === (this.deck.description || '')) return;
      
      try {
        const userId = localStorage.getItem('userId');
        await axios.patch(`/decks/${this.deck._id}`, {
          description: this.deckDescription.trim(),
          userId,
        }, {
          params: { userId },
        });
        this.deck.description = this.deckDescription.trim();
      } catch (error) {
        console.error('Error saving deck description:', error);
        this.deckDescription = this.deck.description || ''; // Revert on error
      }
    },
    async addNewCard() {
      try {
        const userId = localStorage.getItem('userId');
        
        if (!userId) {
          alert('You must be logged in to create cards');
          this.$router.push('/login');
          return;
        }

        if (!this.deck || !this.deck._id) {
          alert('Deck information is missing');
          return;
        }

        const response = await axios.post('/cards', {
          deckId: String(this.deck._id),
          front: '',
          back: '',
          userId,
        }, {
          params: { userId },
        });
        
        this.cards.push(response.data.card);
      } catch (error) {
        console.error('Error creating card:', error);
        const errorMessage = error.response?.data?.message || 
                            error.message || 
                            'Error creating card';
        alert(errorMessage);
      }
    },
    async saveCard(card) {
      // Prevent duplicate saves
      if (this.savingCard.has(card._id)) return;
      this.savingCard.add(card._id);

      try {
        const userId = localStorage.getItem('userId');
        await axios.patch(`/cards/${card._id}`, {
          front: card.front.trim(),
          back: card.back.trim(),
          userId,
        }, {
          params: { userId },
        });
      } catch (error) {
        console.error('Error saving card:', error);
        alert(error.response?.data?.message || 'Error saving card');
      } finally {
        this.savingCard.delete(card._id);
      }
    },
    async deleteCard(card) {
      if (!confirm('Are you sure you want to delete this card?')) return;

      try {
        const userId = localStorage.getItem('userId');
        await axios.delete(`/cards/${card._id}`, {
          params: { userId },
        });
        this.cards = this.cards.filter(c => c._id !== card._id);
      } catch (error) {
        console.error('Error deleting card:', error);
        alert(error.response?.data?.message || 'Error deleting card');
      }
    },
    async deleteDeck() {
      try {
        const userId = localStorage.getItem('userId');
        await axios.delete(`/decks/${this.deck._id}`, {
          params: { userId },
        });
        this.goBack();
      } catch (error) {
        console.error('Error deleting deck:', error);
        alert(error.response?.data?.message || 'Error deleting deck');
      }
    },
  },
};
</script>

<style scoped>
.deck-editor-page {
  padding: 20px;
  min-height: calc(100vh - 200px);
}

.editor-container {
  max-width: 1200px;
  margin: 0 auto;
}

.loading {
  text-align: center;
  padding: 40px;
  color: #666;
}

.editor-content {
  background: white;
  border-radius: 8px;
  padding: 30px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
}

.deck-header-section {
  margin-bottom: 30px;
  padding-bottom: 20px;
  border-bottom: 2px solid #e0e0e0;
}

.header-actions {
  display: flex;
  justify-content: space-between;
  margin-bottom: 20px;
}

.back-btn {
  padding: 8px 16px;
  background-color: #95a5a6;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-weight: 500;
}

.delete-deck-btn {
  padding: 8px 16px;
  background-color: #e74c3c;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-weight: 500;
}

.deck-title-input {
  width: 100%;
  padding: 12px;
  border: 2px solid #e0e0e0;
  border-radius: 4px;
  font-size: 24px;
  font-weight: 600;
  margin-bottom: 10px;
  box-sizing: border-box;
}

.deck-title-input:focus {
  outline: none;
  border-color: #42b983;
}

.deck-description-input {
  width: 100%;
  padding: 10px;
  border: 2px solid #e0e0e0;
  border-radius: 4px;
  font-size: 16px;
  min-height: 60px;
  box-sizing: border-box;
  resize: vertical;
}

.deck-description-input:focus {
  outline: none;
  border-color: #42b983;
}

.cards-section {
  margin-top: 30px;
}

.cards-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.cards-header h2 {
  margin: 0;
  color: #2c3e50;
}

.add-card-btn {
  padding: 10px 20px;
  background-color: #42b983;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-weight: 600;
}

.cards-list {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.card-item {
  display: flex;
  gap: 15px;
  padding: 20px;
  background-color: #f9f9f9;
  border-radius: 8px;
  border: 2px solid #e0e0e0;
  transition: border-color 0.2s;
}

.card-item:hover {
  border-color: #42b983;
}

.card-number {
  font-size: 24px;
  font-weight: bold;
  color: #42b983;
  min-width: 40px;
  display: flex;
  align-items: flex-start;
  padding-top: 5px;
}

.card-content {
  flex: 1;
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 15px;
}

.card-side {
  display: flex;
  flex-direction: column;
}

.card-side label {
  font-weight: 600;
  color: #2c3e50;
  margin-bottom: 8px;
  font-size: 14px;
}

.card-textarea {
  width: 100%;
  padding: 10px;
  border: 2px solid #e0e0e0;
  border-radius: 4px;
  font-size: 16px;
  min-height: 100px;
  resize: vertical;
  box-sizing: border-box;
  font-family: inherit;
}

.card-textarea:focus {
  outline: none;
  border-color: #42b983;
}

.delete-card-btn {
  background: none;
  border: none;
  font-size: 20px;
  cursor: pointer;
  opacity: 0.6;
  transition: opacity 0.2s;
  align-self: flex-start;
  padding: 5px;
}

.delete-card-btn:hover {
  opacity: 1;
}

.empty-cards {
  text-align: center;
  padding: 40px;
  color: #666;
}

.error-state {
  text-align: center;
  padding: 40px;
  color: #666;
}

.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}

.modal {
  background: white;
  padding: 30px;
  border-radius: 8px;
  max-width: 400px;
  width: 90%;
}

.modal h3 {
  margin-top: 0;
  color: #2c3e50;
}

.warning {
  color: #e74c3c;
  font-weight: 500;
}

.modal-actions {
  display: flex;
  gap: 10px;
  margin-top: 20px;
  justify-content: flex-end;
}

.confirm-delete-btn {
  padding: 10px 20px;
  background-color: #e74c3c;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-weight: 600;
}

.cancel-btn {
  padding: 10px 20px;
  background-color: #95a5a6;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-weight: 600;
}
</style>

