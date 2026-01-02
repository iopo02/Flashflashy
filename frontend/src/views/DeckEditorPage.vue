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
            <button @click="startStudy" class="study-btn">▶ Study Deck</button>
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
            <div class="deck-settings">
              <label class="public-toggle">
                <input
                  v-model="deckIsPublic"
                  type="checkbox"
                  @change="saveDeckPublic"
                />
                <span>Make this deck public</span>
              </label>
              <div v-if="deckIsPublic && shareLink" class="share-link-section">
                <label>Share Link</label>
                <div class="share-link-container">
                  <input
                    :value="shareLink"
                    type="text"
                    readonly
                    class="share-link-input"
                    @click="$event.target.select()"
                  />
                  <button @click="copyShareLink" class="copy-btn">
                    {{ shareLinkCopied ? 'Copied!' : 'Copy' }}
                  </button>
                </div>
                <p class="share-hint">Anyone with this link can view and copy this deck</p>
              </div>
            </div>
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
                <span class="icon">×</span>
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
      deckIsPublic: false,
      showDeleteModal: false,
      savingCard: new Set(),
      shareLinkCopied: false,
    };
  },
  computed: {
    shareLink() {
      if (this.deck && this.deck.shareId) {
        return `${window.location.origin}/shared/${this.deck.shareId}`;
      }
      return '';
    },
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
        this.deckIsPublic = this.deck.isPublic || false;
        this.shareLinkCopied = false;
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
    startStudy() {
      if (this.deck && this.deck._id) {
        this.$router.push(`/decks/${this.deck._id}/study`);
      }
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
    generateShareId() {
      // Generate a random shareId similar to backend (12 characters base64url)
      const array = new Uint8Array(8);
      crypto.getRandomValues(array);
      return btoa(String.fromCharCode(...array))
        .replace(/\+/g, '-')
        .replace(/\//g, '_')
        .replace(/=/g, '')
        .substring(0, 12);
    },
    async saveDeckPublic() {
      if (this.deckIsPublic === (this.deck.isPublic || false)) return;
      
      // Optimistically generate shareId immediately if making public
      let optimisticShareId = null;
      if (this.deckIsPublic && !this.deck.shareId) {
        optimisticShareId = this.generateShareId();
        this.deck.shareId = optimisticShareId;
      }
      
      try {
        const userId = localStorage.getItem('userId');
        const response = await axios.patch(`/decks/${this.deck._id}`, {
          isPublic: this.deckIsPublic,
          shareId: optimisticShareId, // Send the optimistically generated shareId
          userId,
        }, {
          params: { userId },
        });
        // Update deck object with response data (backend will generate its own shareId)
        if (response.data.deck) {
          this.deck = response.data.deck;
          this.deckIsPublic = this.deck.isPublic || false;
        } else {
          // Fallback: refresh deck to get updated shareId
          await this.fetchDeck();
        }
      } catch (error) {
        console.error('Error saving deck public status:', error);
        this.deckIsPublic = this.deck.isPublic || false; // Revert on error
        // Revert shareId if error
        if (!this.deck.isPublic) {
          this.deck.shareId = null;
        }
        alert(error.response?.data?.message || 'Error updating deck visibility');
      }
    },
    copyShareLink() {
      if (this.shareLink) {
        navigator.clipboard.writeText(this.shareLink).then(() => {
          this.shareLinkCopied = true;
          setTimeout(() => {
            this.shareLinkCopied = false;
          }, 2000);
        }).catch(() => {
          // Fallback for older browsers
          const input = document.createElement('input');
          input.value = this.shareLink;
          document.body.appendChild(input);
          input.select();
          document.execCommand('copy');
          document.body.removeChild(input);
          this.shareLinkCopied = true;
          setTimeout(() => {
            this.shareLinkCopied = false;
          }, 2000);
        });
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
  padding: 40px 20px;
  min-height: calc(100vh - 60px);
  background-color: #ffffff;
}

.editor-container {
  max-width: 1200px;
  margin: 0 auto;
}

.loading {
  text-align: center;
  padding: 60px 20px;
  color: #666;
  font-size: 14px;
}

.editor-content {
  background: #ffffff;
  padding: 0;
}

.deck-header-section {
  margin-bottom: 32px;
  padding-bottom: 24px;
  border-bottom: 1px solid #e0e0e0;
}

.header-actions {
  display: flex;
  justify-content: space-between;
  gap: 12px;
  margin-bottom: 24px;
  flex-wrap: wrap;
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

.delete-deck-btn {
  padding: 8px 16px;
  background-color: #d13212;
  color: #ffffff;
  border: none;
  cursor: pointer;
  font-weight: 500;
  font-size: 14px;
  transition: background-color 0.2s;
}

.delete-deck-btn:hover {
  background-color: #b8280f;
}

.deck-title-input {
  width: 100%;
  padding: 8px 12px;
  border: 1px solid #767676;
  font-size: 20px;
  font-weight: 400;
  margin-bottom: 12px;
  box-sizing: border-box;
  font-family: inherit;
}

.deck-title-input:focus {
  outline: none;
  border-color: #5c6bc0;
  box-shadow: 0 0 0 3px rgba(255, 153, 0, 0.1);
}

.deck-description-input {
  width: 100%;
  padding: 8px 12px;
  border: 1px solid #767676;
  font-size: 14px;
  min-height: 60px;
  box-sizing: border-box;
  resize: vertical;
  font-family: inherit;
}

.deck-description-input:focus {
  outline: none;
  border-color: #5c6bc0;
  box-shadow: 0 0 0 3px rgba(255, 153, 0, 0.1);
}

.deck-settings {
  margin-top: 20px;
}

.public-toggle {
  display: flex;
  align-items: center;
  gap: 10px;
  cursor: pointer;
  user-select: none;
  font-size: 14px;
}

.public-toggle input[type="checkbox"] {
  width: 18px;
  height: 18px;
  cursor: pointer;
}

.public-toggle span {
  color: #1a237e;
  font-weight: 400;
}

.share-link-section {
  margin-top: 20px;
  padding-top: 20px;
  border-top: 1px solid #e0e0e0;
}

.share-link-section label {
  display: block;
  margin-bottom: 8px;
  color: #1a237e;
  font-weight: 500;
  font-size: 14px;
}

.share-link-container {
  display: flex;
  gap: 10px;
  margin-bottom: 8px;
}

.share-link-input {
  flex: 1;
  padding: 8px 12px;
  border: 1px solid #767676;
  font-size: 14px;
  background-color: #f5f5f5;
  cursor: text;
  font-family: inherit;
}

.share-link-input:focus {
  outline: none;
  border-color: #5c6bc0;
  background-color: #ffffff;
  box-shadow: 0 0 0 3px rgba(255, 153, 0, 0.1);
}

.copy-btn {
  padding: 8px 16px;
  background-color: #5c6bc0;
  color: #ffffff;
  border: none;
  cursor: pointer;
  font-weight: 500;
  white-space: nowrap;
  font-size: 14px;
  transition: background-color 0.2s;
}

.copy-btn:hover {
  background-color: #4a56b2;
}

.share-hint {
  font-size: 12px;
  color: #666;
  margin: 0;
}

.share-link-loading {
  padding: 10px;
  color: #666;
  font-style: italic;
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
  color: #1a237e;
  font-size: 20px;
  font-weight: 400;
}

.add-card-btn {
  padding: 8px 16px;
  background-color: #5c6bc0;
  color: #ffffff;
  border: none;
  cursor: pointer;
  font-weight: 500;
  font-size: 14px;
  transition: background-color 0.2s;
}

.add-card-btn:hover {
  background-color: #4a56b2;
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
  background-color: #ffffff;
  border: 1px solid #e0e0e0;
  transition: border-color 0.2s;
}

.card-item:hover {
  border-color: #5c6bc0;
}

.card-number {
  font-size: 18px;
  font-weight: 500;
  color: #5c6bc0;
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
  font-weight: 500;
  color: #1a237e;
  margin-bottom: 8px;
  font-size: 14px;
}

.card-textarea {
  width: 100%;
  padding: 8px 12px;
  border: 1px solid #767676;
  font-size: 14px;
  min-height: 100px;
  resize: vertical;
  box-sizing: border-box;
  font-family: inherit;
}

.card-textarea:focus {
  outline: none;
  border-color: #5c6bc0;
  box-shadow: 0 0 0 3px rgba(255, 153, 0, 0.1);
}

.delete-card-btn {
  background: none;
  border: none;
  font-size: 20px;
  cursor: pointer;
  opacity: 0.5;
  transition: opacity 0.2s, background-color 0.2s;
  align-self: flex-start;
  padding: 8px;
  color: #d13212;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 36px;
}

.delete-card-btn:hover {
  opacity: 1;
  background-color: #fef0ef;
}

.delete-card-btn .icon {
  font-weight: bold;
  line-height: 1;
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
  padding: 8px 16px;
  background-color: #d13212;
  color: #ffffff;
  border: none;
  cursor: pointer;
  font-weight: 500;
  font-size: 14px;
  transition: background-color 0.2s;
}

.confirm-delete-btn:hover {
  background-color: #b8280f;
}

.cancel-btn {
  padding: 8px 16px;
  background-color: #ffffff;
  color: #1a237e;
  border: 1px solid #767676;
  cursor: pointer;
  font-weight: 500;
  font-size: 14px;
  transition: background-color 0.2s;
}

.cancel-btn:hover {
  background-color: #f5f5f5;
}
</style>

