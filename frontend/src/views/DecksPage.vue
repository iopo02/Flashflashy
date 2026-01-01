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
          @click="editDeck(deck._id)"
        >
          <div class="deck-header">
            <h3>{{ deck.title }}</h3>
            <div class="deck-actions" @click.stop>
              <button @click="editDeck(deck._id)" class="icon-btn" title="Edit">
                ✏️
              </button>
              <button @click="confirmDelete(deck)" class="icon-btn delete-btn" title="Delete">
                🗑️
              </button>
            </div>
          </div>
          <p class="deck-description">{{ deck.description || 'No description' }}</p>
          <div class="deck-footer">
            <span class="deck-meta">{{ formatDate(deck.createdAt) }}</span>
            <span v-if="deck.isPublic" class="public-badge">Public</span>
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
  padding: 20px;
  min-height: calc(100vh - 200px);
}

.decks-container {
  max-width: 1200px;
  margin: 0 auto;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 30px;
}

.page-header h1 {
  color: #2c3e50;
  margin: 0;
}

.create-btn {
  padding: 12px 24px;
  background-color: #42b983;
  color: white;
  border: none;
  border-radius: 4px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: background-color 0.3s;
}

.create-btn:hover {
  background-color: #35a372;
}

.loading {
  text-align: center;
  padding: 40px;
  color: #666;
}

.decks-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 20px;
}

.deck-card {
  background: white;
  border-radius: 8px;
  padding: 20px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  cursor: pointer;
  transition: transform 0.2s, box-shadow 0.2s;
}

.deck-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.deck-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 10px;
}

.deck-header h3 {
  margin: 0;
  color: #2c3e50;
  flex: 1;
}

.deck-actions {
  display: flex;
  gap: 8px;
}

.icon-btn {
  background: none;
  border: none;
  font-size: 18px;
  cursor: pointer;
  padding: 4px;
  opacity: 0.7;
  transition: opacity 0.2s;
}

.icon-btn:hover {
  opacity: 1;
}

.delete-btn {
  opacity: 0.6;
}

.deck-description {
  color: #666;
  margin: 10px 0;
  min-height: 40px;
}

.deck-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 15px;
  padding-top: 15px;
  border-top: 1px solid #e0e0e0;
}

.deck-meta {
  color: #999;
  font-size: 14px;
}

.public-badge {
  background-color: #42b983;
  color: white;
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 12px;
  font-weight: 600;
}

.empty-state {
  text-align: center;
  padding: 60px 20px;
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
  max-width: 500px;
  width: 90%;
  max-height: 90vh;
  overflow-y: auto;
}

.modal h2,
.modal h3 {
  margin-top: 0;
  color: #2c3e50;
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
  color: #2c3e50;
  font-weight: 500;
}

.form-group input[type="text"],
.form-group textarea {
  width: 100%;
  padding: 10px;
  border: 2px solid #e0e0e0;
  border-radius: 4px;
  font-size: 16px;
  box-sizing: border-box;
}

.form-group input:focus,
.form-group textarea:focus {
  outline: none;
  border-color: #42b983;
}

.checkbox-label {
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
}

.checkbox-label input[type="checkbox"] {
  width: auto;
}

.modal-actions {
  display: flex;
  gap: 10px;
  justify-content: flex-end;
  margin-top: 20px;
}

.save-btn {
  padding: 10px 20px;
  background-color: #42b983;
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

.confirm-delete-btn {
  padding: 10px 20px;
  background-color: #e74c3c;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-weight: 600;
}

.warning {
  color: #e74c3c;
  font-weight: 500;
}
</style>

