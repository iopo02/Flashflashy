<template>
  <div class="admin-panel">
    <div class="admin-container">
      <h1>Admin Panel</h1>
      
      <!-- Admin Authentication -->
      <div v-if="!currentUserId" class="auth-section">
        <h2>Admin Access Required</h2>
        <p class="help-text">You must be logged in as an admin to access this panel.</p>
        <div class="auth-form">
          <input
            v-model="userIdInput"
            type="text"
            placeholder="Enter your user ID (if not logged in)"
            class="user-id-input"
          />
          <button @click="authenticate" class="auth-btn">Access Panel</button>
        </div>
        <div v-if="authError" class="error-message">{{ authError }}</div>
        <div class="login-prompt">
          <p>Not logged in? <router-link to="/login">Login here</router-link></p>
        </div>
      </div>

      <!-- Admin Panel Content -->
      <div v-else>
        <div class="panel-header">
          <p class="welcome-text">Welcome, Admin! Managing users as: {{ currentUserId }}</p>
          <button @click="logout" class="logout-btn">Logout</button>
        </div>

        <!-- Loading State -->
        <div v-if="loading" class="loading">Loading users...</div>

        <!-- Users Table -->
        <div v-else class="users-table-container">
          <div class="table-header">
            <h2>All Users ({{ users.length }})</h2>
            <button @click="fetchUsers" class="refresh-btn">Refresh</button>
          </div>

          <table class="users-table">
            <thead>
              <tr>
                <th>Username</th>
                <th>Email</th>
                <th>Admin</th>
                <th>Created</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="user in users" :key="user._id" :class="{ 'admin-row': user.isAdmin }">
                <td>
                  <div v-if="editingUserId === user._id" class="edit-username">
                    <input
                      v-model="editUsernameValue"
                      type="text"
                      class="username-input"
                      @keyup.enter="saveUsername(user._id)"
                      @keyup.esc="cancelEdit"
                    />
                    <button @click="saveUsername(user._id)" class="save-btn">Save</button>
                    <button @click="cancelEdit" class="cancel-btn">Cancel</button>
                  </div>
                  <span v-else>{{ user.username }}</span>
                </td>
                <td>{{ user.email }}</td>
                <td>
                  <span v-if="user.isAdmin" class="admin-badge">Admin</span>
                  <span v-else class="user-badge">User</span>
                </td>
                <td>{{ formatDate(user.createdAt) }}</td>
                <td class="actions-cell">
                  <button
                    v-if="editingUserId !== user._id"
                    @click="startEditUsername(user)"
                    class="action-btn edit-btn"
                  >
                    Edit Username
                  </button>
                  <button
                    v-if="user._id !== currentUserId"
                    @click="confirmDelete(user)"
                    class="action-btn delete-btn"
                  >
                    Delete
                  </button>
                  <button
                    v-if="user._id !== currentUserId"
                    @click="toggleAdmin(user)"
                    class="action-btn admin-toggle-btn"
                  >
                    {{ user.isAdmin ? 'Remove Admin' : 'Make Admin' }}
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- Success/Error Messages -->
        <div v-if="successMessage" class="success-message">{{ successMessage }}</div>
        <div v-if="errorMessage" class="error-message">{{ errorMessage }}</div>
      </div>
    </div>

    <!-- Delete Confirmation Modal -->
    <div v-if="userToDelete" class="modal-overlay" @click="cancelDelete">
      <div class="modal" @click.stop>
        <h3>Confirm Delete</h3>
        <p>Are you sure you want to delete user <strong>{{ userToDelete.username }}</strong>?</p>
        <p class="warning">This will permanently delete the user and all their decks and cards.</p>
        <div class="modal-actions">
          <button @click="deleteUser" class="confirm-delete-btn">Delete</button>
          <button @click="cancelDelete" class="cancel-btn">Cancel</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import axios from 'axios';

export default {
  name: 'AdminPanel',
  data() {
    return {
      userIdInput: '',
      currentUserId: null,
      users: [],
      loading: false,
      editingUserId: null,
      editUsernameValue: '',
      userToDelete: null,
      successMessage: '',
      errorMessage: '',
      authError: '',
    };
  },
  mounted() {
    // First try to use logged-in user if they're admin
    if (!this.checkLoggedInUser()) {
      // Fallback to adminUserId if available (for backward compatibility)
      const storedUserId = localStorage.getItem('adminUserId');
      if (storedUserId) {
        this.currentUserId = storedUserId;
        this.fetchUsers();
      }
    }
  },
  methods: {
    async authenticate() {
      if (!this.userIdInput.trim()) {
        this.authError = 'Please enter a user ID';
        return;
      }

      try {
        // Try to fetch users to verify admin status
        await axios.get('/admin/users', {
          params: { userId: this.userIdInput.trim() },
        });

        this.currentUserId = this.userIdInput.trim();
        localStorage.setItem('adminUserId', this.currentUserId);
        this.authError = '';
        this.fetchUsers();
      } catch (error) {
        if (error.response?.status === 403) {
          this.authError = 'Access denied. You must be an admin.';
        } else if (error.response?.status === 404) {
          this.authError = 'User not found.';
        } else {
          this.authError = 'Error authenticating. Please check your user ID.';
        }
      }
    },
    checkLoggedInUser() {
      // Check if user is logged in and is admin
      const userStr = localStorage.getItem('user');
      if (userStr) {
        try {
          const user = JSON.parse(userStr);
          if (user.isAdmin && user.id) {
            this.currentUserId = user.id;
            this.fetchUsers();
            return true;
          }
        } catch (error) {
          console.error('Error parsing user data:', error);
        }
      }
      return false;
    },
    logout() {
      this.currentUserId = null;
      this.userIdInput = '';
      localStorage.removeItem('adminUserId');
      this.users = [];
    },
    async fetchUsers() {
      this.loading = true;
      this.errorMessage = '';
      this.successMessage = '';

      try {
        const response = await axios.get('/admin/users', {
          params: { userId: this.currentUserId },
        });
        this.users = response.data.users;
      } catch (error) {
        if (error.response?.status === 403) {
          this.errorMessage = 'Access denied. Admin privileges required.';
          this.logout();
        } else {
          this.errorMessage = 'Error fetching users. Please try again.';
        }
      } finally {
        this.loading = false;
      }
    },
    startEditUsername(user) {
      this.editingUserId = user._id;
      this.editUsernameValue = user.username;
    },
    cancelEdit() {
      this.editingUserId = null;
      this.editUsernameValue = '';
    },
    async saveUsername(userId) {
      if (!this.editUsernameValue.trim() || this.editUsernameValue.trim().length < 3) {
        this.errorMessage = 'Username must be at least 3 characters';
        return;
      }

      try {
        await axios.patch(
          `/admin/users/${userId}/username`,
          { username: this.editUsernameValue.trim() },
          { params: { userId: this.currentUserId } }
        );

        this.successMessage = 'Username updated successfully';
        this.cancelEdit();
        await this.fetchUsers();
        setTimeout(() => {
          this.successMessage = '';
        }, 3000);
      } catch (error) {
        this.errorMessage = error.response?.data?.message || 'Error updating username';
        setTimeout(() => {
          this.errorMessage = '';
        }, 3000);
      }
    },
    confirmDelete(user) {
      this.userToDelete = user;
    },
    cancelDelete() {
      this.userToDelete = null;
    },
    async deleteUser() {
      if (!this.userToDelete) return;

      try {
        await axios.delete(`/admin/users/${this.userToDelete._id}`, {
          params: { userId: this.currentUserId },
        });

        this.successMessage = 'User deleted successfully';
        this.userToDelete = null;
        await this.fetchUsers();
        setTimeout(() => {
          this.successMessage = '';
        }, 3000);
      } catch (error) {
        this.errorMessage = error.response?.data?.message || 'Error deleting user';
        this.userToDelete = null;
        setTimeout(() => {
          this.errorMessage = '';
        }, 3000);
      }
    },
    async toggleAdmin(user) {
      try {
        await axios.patch(
          `/admin/users/${user._id}/admin`,
          { isAdmin: !user.isAdmin },
          { params: { userId: this.currentUserId } }
        );

        this.successMessage = `User ${!user.isAdmin ? 'promoted to' : 'removed from'} admin`;
        await this.fetchUsers();
        setTimeout(() => {
          this.successMessage = '';
        }, 3000);
      } catch (error) {
        this.errorMessage = error.response?.data?.message || 'Error updating admin status';
        setTimeout(() => {
          this.errorMessage = '';
        }, 3000);
      }
    },
    formatDate(dateString) {
      if (!dateString) return 'N/A';
      const date = new Date(dateString);
      return date.toLocaleDateString() + ' ' + date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    },
  },
};
</script>

<style scoped>
.admin-panel {
  padding: 20px;
  min-height: calc(100vh - 200px);
}

.admin-container {
  max-width: 1200px;
  margin: 0 auto;
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  padding: 30px;
}

h1 {
  color: #2c3e50;
  margin-bottom: 20px;
}

.auth-section {
  text-align: center;
  padding: 40px 20px;
}

.auth-section h2 {
  margin-bottom: 10px;
}

.help-text {
  color: #666;
  margin-bottom: 20px;
}

.auth-form {
  display: flex;
  gap: 10px;
  max-width: 400px;
  margin: 0 auto;
}

.user-id-input {
  flex: 1;
  padding: 12px;
  border: 2px solid #e0e0e0;
  border-radius: 4px;
  font-size: 16px;
}

.auth-btn,
.logout-btn,
.refresh-btn {
  padding: 12px 24px;
  background-color: #42b983;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 16px;
  font-weight: 600;
}

.auth-btn:hover,
.refresh-btn:hover {
  background-color: #35a372;
}

.logout-btn {
  background-color: #e74c3c;
}

.logout-btn:hover {
  background-color: #c0392b;
}

.panel-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  padding-bottom: 15px;
  border-bottom: 2px solid #e0e0e0;
}

.welcome-text {
  color: #666;
  font-weight: 500;
}

.loading {
  text-align: center;
  padding: 40px;
  color: #666;
}

.table-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 15px;
}

.table-header h2 {
  margin: 0;
  color: #2c3e50;
}

.users-table-container {
  overflow-x: auto;
}

.users-table {
  width: 100%;
  border-collapse: collapse;
  margin-top: 10px;
}

.users-table th {
  background-color: #f5f5f5;
  padding: 12px;
  text-align: left;
  font-weight: 600;
  color: #2c3e50;
  border-bottom: 2px solid #e0e0e0;
}

.users-table td {
  padding: 12px;
  border-bottom: 1px solid #e0e0e0;
}

.users-table tr:hover {
  background-color: #f9f9f9;
}

.admin-row {
  background-color: #fff9e6;
}

.admin-badge {
  display: inline-block;
  padding: 4px 8px;
  background-color: #f39c12;
  color: white;
  border-radius: 4px;
  font-size: 12px;
  font-weight: 600;
}

.user-badge {
  display: inline-block;
  padding: 4px 8px;
  background-color: #95a5a6;
  color: white;
  border-radius: 4px;
  font-size: 12px;
}

.actions-cell {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}

.action-btn {
  padding: 6px 12px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;
  font-weight: 500;
}

.edit-btn {
  background-color: #3498db;
  color: white;
}

.edit-btn:hover {
  background-color: #2980b9;
}

.delete-btn {
  background-color: #e74c3c;
  color: white;
}

.delete-btn:hover {
  background-color: #c0392b;
}

.admin-toggle-btn {
  background-color: #9b59b6;
  color: white;
}

.admin-toggle-btn:hover {
  background-color: #8e44ad;
}

.edit-username {
  display: flex;
  gap: 8px;
  align-items: center;
}

.username-input {
  padding: 6px;
  border: 2px solid #3498db;
  border-radius: 4px;
  font-size: 14px;
}

.save-btn {
  padding: 6px 12px;
  background-color: #42b983;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;
}

.cancel-btn {
  padding: 6px 12px;
  background-color: #95a5a6;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;
}

.success-message {
  margin-top: 15px;
  padding: 12px;
  background-color: #d4edda;
  color: #155724;
  border-radius: 4px;
  border: 1px solid #c3e6cb;
}

.error-message {
  margin-top: 15px;
  padding: 12px;
  background-color: #f8d7da;
  color: #721c24;
  border-radius: 4px;
  border: 1px solid #f5c6cb;
}

.login-prompt {
  margin-top: 20px;
  text-align: center;
  color: #666;
}

.login-prompt a {
  color: #42b983;
  text-decoration: none;
  font-weight: 500;
}

.login-prompt a:hover {
  text-decoration: underline;
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

.confirm-delete-btn:hover {
  background-color: #c0392b;
}
</style>

