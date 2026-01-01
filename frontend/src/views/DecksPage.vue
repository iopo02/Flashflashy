<template>
  <div class="decks-page">
    <div class="decks-container">
      <div class="page-header">
        <h1>My Decks</h1>
        <button @click="showCreateModal = true" class="create-btn">+ Create New Deck</button>
      </div>

      <!-- Loading State -->
      <div v-if="loading" class="loading">Loading decks...</div>

      <!-- Decks Grid -->
      <div v-else-if="decks.length > 0" class="decks-grid">
        <div
          v-for="deck in decks"
          :key="deck._id"
          class="deck-card"
        >
          <div class="deck-header">
            <h3>{{ deck.title }}</h3>
            <div class="deck-actions" @click.stop>
              <button @click="studyDeck(deck._id)" class="icon-btn study-btn" title="Study">
                <span class="icon">▶</span>
              </button>
              <button @click="editDeck(deck._id)" class="icon-btn" title="Edit">
                <span class="icon">✎</span>
              </button>
              <button @click="confirmDelete(deck)" class="icon-btn delete-btn" title="Delete">
                <span class="icon">×</span>
              </button>
            </div>
          </div>
          <p class="deck-description">{{ deck.description || 'No description' }}</p>
          <div class="deck-footer">
            <span class="deck-meta">{{ formatDate(deck.createdAt) }}</span>
            <span v-if="deck.isPublic" class="public-badge">Public</span>
            <span v-else class="private-badge">Private</span>
          </div>
        </div>
      </div>

      <!-- Empty State -->
      <div v-else class="empty-state">
        <p>You don't have any decks yet.</p>
        <button @click="showCreateModal = true" class="create-btn">Create Your First Deck</button>
      </div>
    </div>

    <!-- Create/Edit Deck Modal -->
    <div v-if="showCreateModal || editingDeck" class="modal-overlay" @click="closeModal">
      <div class="modal" @click.stop>
        <h2>{{ editingDeck ? 'Edit Deck' : 'Create New Deck' }}</h2>
        <form @submit.prevent="saveDeck" class="deck-form">
          <div class="form-group">
            <label for="title">Title *</label>
            <input
              id="title"
              v-model="deckForm.title"
              type="text"
              required
              maxlength="200"
              placeholder="Enter deck title"
            />
          </div>
          <div class="form-group">
            <label for="description">Description</label>
            <textarea
              id="description"
              v-model="deckForm.description"
              maxlength="1000"
              rows="3"
              placeholder="Enter deck description (optional)"
            ></textarea>
          </div>
          <div class="form-group">
            <label class="checkbox-label">
              <input
                v-model="deckForm.isPublic"
                type="checkbox"
              />
              Make this deck public
            </label>
          </div>
          <div class="modal-actions">
            <button type="button" @click="closeModal" class="cancel-btn">Cancel</button>
            <button type="submit" class="save-btn">Save</button>
          </div>
        </form>
      </div>
    </div>

    <!-- Delete Confirmation Modal -->
    <div v-if="deckToDelete" class="modal-overlay" @click="cancelDelete">
      <div class="modal" @click.stop>
        <h3>Delete Deck</h3>
        <p>Are you sure you want to delete <strong>{{ deckToDelete.title }}</strong>?</p>
        <p class="warning">This will permanently delete the deck and all its cards.</p>
        <div class="modal-actions">
          <button @click="deleteDeck" class="confirm-delete-btn">Delete</button>
          <button @click="cancelDelete" class="cancel-btn">Cancel</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import axios from 'axios';

export default {
  name: 'DecksPage',
  data() {
    return {
      decks: [],
      loading: false,
      showCreateModal: false,
      editingDeck: null,
      deckToDelete: null,
      deckForm: {
        title: '',
        description: '',
        isPublic: false,
      },
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
        const response = await axios.get('/decks', {
          params: { userId },
        });
        this.decks = response.data.decks;
      } catch (error) {
        console.error('Error fetching decks:', error);
        if (error.response?.status === 401) {
          this.$router.push('/login');
        }
      } finally {
        this.loading = false;
      }
    },
    editDeck(deckId) {
      this.$router.push(`/decks/${deckId}/edit`);
    },
    studyDeck(deckId) {
      this.$router.push(`/decks/${deckId}/study`);
    },
    openCreateModal() {
      this.deckForm = {
        title: '',
        description: '',
        isPublic: false,
      };
      this.showCreateModal = true;
    },
    openEditModal(deck) {
      this.editingDeck = deck;
      this.deckForm = {
        title: deck.title,
        description: deck.description || '',
        isPublic: deck.isPublic || false,
      };
    },
    closeModal() {
      this.showCreateModal = false;
      this.editingDeck = null;
      this.deckForm = {
        title: '',
        description: '',
        isPublic: false,
      };
    },
    async saveDeck() {
      try {
        const userId = localStorage.getItem('userId');
        const payload = {
          ...this.deckForm,
          userId,
        };

        if (this.editingDeck) {
          await axios.patch(`/decks/${this.editingDeck._id}`, payload, {
            params: { userId },
          });
        } else {
          await axios.post('/decks', payload, {
            params: { userId },
          });
        }

        this.closeModal();
        await this.fetchDecks();
      } catch (error) {
        console.error('Error saving deck:', error);
        alert(error.response?.data?.message || 'Error saving deck');
      }
    },
    confirmDelete(deck) {
      this.deckToDelete = deck;
    },
    cancelDelete() {
      this.deckToDelete = null;
    },
    async deleteDeck() {
      try {
        const userId = localStorage.getItem('userId');
        await axios.delete(`/decks/${this.deckToDelete._id}`, {
          params: { userId },
        });
        this.cancelDelete();
        await this.fetchDecks();
      } catch (error) {
        console.error('Error deleting deck:', error);
        alert(error.response?.data?.message || 'Error deleting deck');
      }
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
.decks-page {
  padding: 40px 20px;
  min-height: calc(100vh - 60px);
  background-color: #ffffff;
}

.decks-container {
  max-width: 1200px;
  margin: 0 auto;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
}

.page-header h1 {
  color: #1a237e;
  margin: 0;
  font-size: 28px;
  font-weight: 400;
}

.create-btn {
  padding: 10px 20px;
  background-color: #5c6bc0;
  color: #ffffff;
  border: none;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: background-color 0.2s;
}

.create-btn:hover {
  background-color: #4a56b2;
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
  cursor: pointer;
}

.deck-actions {
  display: flex;
  gap: 4px;
}

.icon-btn {
  background: none;
  border: none;
  font-size: 18px;
  cursor: pointer;
  padding: 6px 8px;
  opacity: 0.6;
  transition: opacity 0.2s, background-color 0.2s;
  display: flex;
  align-items: center;
  justify-content: center;
}

.icon-btn:hover {
  opacity: 1;
  background-color: #f5f5f5;
}

.icon-btn .icon {
  font-weight: bold;
  line-height: 1;
}

.icon-btn.study-btn .icon {
  color: #5c6bc0;
}

.icon-btn.delete-btn .icon {
  color: #d13212;
}

.delete-btn {
  opacity: 0.5;
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

.empty-state {
  text-align: center;
  padding: 80px 20px;
  color: #666;
}

.empty-state p {
  font-size: 16px;
  margin-bottom: 24px;
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
  background: #ffffff;
  padding: 24px;
  max-width: 500px;
  width: 90%;
  max-height: 90vh;
  overflow-y: auto;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.2);
}

.modal h2,
.modal h3 {
  margin-top: 0;
  margin-bottom: 20px;
  color: #1a237e;
  font-size: 20px;
  font-weight: 400;
}

.deck-form {
  display: flex;
  flex-direction: column;
}

.form-group {
  margin-bottom: 20px;
}

.form-group label {
  display: block;
  margin-bottom: 8px;
  color: #1a237e;
  font-weight: 500;
  font-size: 14px;
}

.form-group input[type="text"],
.form-group textarea {
  width: 100%;
  padding: 8px 12px;
  border: 1px solid #767676;
  font-size: 14px;
  box-sizing: border-box;
  font-family: inherit;
}

.form-group input:focus,
.form-group textarea:focus {
  outline: none;
  border-color: #5c6bc0;
  box-shadow: 0 0 0 3px rgba(92, 107, 192, 0.1);
}

.checkbox-label {
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
  font-size: 14px;
}

.checkbox-label input[type="checkbox"] {
  width: auto;
}

.modal-actions {
  display: flex;
  gap: 10px;
  justify-content: flex-end;
  margin-top: 24px;
}

.save-btn {
  padding: 8px 16px;
  background-color: #5c6bc0;
  color: #ffffff;
  border: none;
  cursor: pointer;
  font-weight: 500;
  font-size: 14px;
  transition: background-color 0.2s;
}

.save-btn:hover {
  background-color: #4a56b2;
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

.warning {
  color: #d13212;
  font-weight: 500;
  font-size: 14px;
}
</style>

