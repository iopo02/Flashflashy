<template>
  <div id="app">
    <nav>
      <router-link to="/">Home</router-link> |
      <router-link to="/about">About</router-link> |
      <!-- Show login/register only when NOT logged in -->
      <template v-if="!isLoggedIn">
        <router-link to="/login">Login</router-link> |
        <router-link to="/register">Register</router-link>
      </template>
      <!-- Show user info and logout when logged in -->
      <template v-else>
        <span class="user-info">Welcome, {{ currentUser?.username }}</span> |
        <router-link to="/decks">My Decks</router-link> |
        <a href="#" @click.prevent="handleLogout" class="logout-link">Logout</a>
      </template>
      <!-- Show admin panel only if user is admin -->
      <template v-if="isLoggedIn && isAdmin">
        | <router-link to="/admin">Admin Panel</router-link>
      </template>
    </nav>
    <router-view />
  </div>
</template>

<script>
export default {
  name: 'App',
  data() {
    return {
      currentUser: null,
    };
  },
  computed: {
    isLoggedIn() {
      return this.currentUser !== null;
    },
    isAdmin() {
      return this.currentUser?.isAdmin === true;
    },
  },
  mounted() {
    this.loadUser();
    // Listen for storage changes (when user logs in from another tab)
    window.addEventListener('storage', this.handleStorageChange);
    // Listen for custom login event (same tab)
    window.addEventListener('userLogin', this.loadUser);
  },
  beforeUnmount() {
    window.removeEventListener('storage', this.handleStorageChange);
    window.removeEventListener('userLogin', this.loadUser);
  },
  methods: {
    loadUser() {
      const userStr = localStorage.getItem('user');
      if (userStr) {
        try {
          this.currentUser = JSON.parse(userStr);
        } catch (error) {
          console.error('Error parsing user data:', error);
          localStorage.removeItem('user');
          localStorage.removeItem('userId');
        }
      } else {
        this.currentUser = null;
      }
    },
    handleStorageChange(event) {
      if (event.key === 'user') {
        this.loadUser();
      }
    },
    handleLogout() {
      localStorage.removeItem('user');
      localStorage.removeItem('userId');
      localStorage.removeItem('adminUserId');
      this.currentUser = null;
      this.$router.push('/');
    },
  },
  watch: {
    // Watch for route changes to update user data
    $route() {
      this.loadUser();
    },
  },
};
</script>

<style>
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
  margin-top: 60px;
}

nav {
  padding: 30px;
}

nav a {
  font-weight: bold;
  color: #2c3e50;
  text-decoration: none;
  margin: 0 10px;
}

nav a.router-link-exact-active {
  color: #42b983;
}

.user-info {
  color: #2c3e50;
  font-weight: 500;
}

.logout-link {
  font-weight: bold;
  color: #e74c3c;
  text-decoration: none;
  margin: 0 10px;
  cursor: pointer;
}

.logout-link:hover {
  color: #c0392b;
  text-decoration: underline;
}
</style>

