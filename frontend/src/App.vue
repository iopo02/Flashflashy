<template>
  <div id="app">
    <header class="app-header">
      <div class="header-container">
        <div class="header-left">
          <router-link to="/" class="logo">Flashflashy</router-link>
        </div>
        <nav class="header-nav">
          <template v-if="!isLoggedIn">
            <router-link to="/login" class="nav-link">Sign In</router-link>
            <router-link to="/register" class="nav-link">Register</router-link>
          </template>
          <template v-else>
            <router-link to="/decks" class="nav-link">My Decks</router-link>
            <span class="user-info">{{ currentUser?.username }}</span>
            <template v-if="isAdmin">
              <router-link to="/admin" class="nav-link">Admin</router-link>
            </template>
            <a href="#" @click.prevent="handleLogout" class="nav-link logout-link">Sign Out</a>
          </template>
        </nav>
      </div>
    </header>
    <main class="app-main">
      <router-view />
    </main>
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
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

#app {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen', 'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue', sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  min-height: 100vh;
  background-color: #ffffff;
}

.app-header {
  background-color: #1a237e;
  color: #ffffff;
  padding: 0;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  position: sticky;
  top: 0;
  z-index: 1000;
}

.header-container {
  max-width: 1400px;
  margin: 0 auto;
  padding: 12px 20px;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.header-left {
  display: flex;
  align-items: center;
}

.logo {
  font-size: 20px;
  font-weight: 600;
  color: #ffffff;
  text-decoration: none;
  letter-spacing: -0.5px;
}

.header-nav {
  display: flex;
  align-items: center;
  gap: 20px;
}

.nav-link {
  color: #ffffff;
  text-decoration: none;
  font-size: 14px;
  font-weight: 400;
  padding: 6px 0;
  transition: opacity 0.2s;
}

.nav-link:hover {
  opacity: 0.8;
}

.nav-link.router-link-exact-active {
  font-weight: 600;
}

.user-info {
  color: #ffffff;
  font-size: 14px;
  font-weight: 500;
  padding: 0 8px;
}

.logout-link {
  cursor: pointer;
}

.app-main {
  min-height: calc(100vh - 60px);
  background-color: #ffffff;
}
</style>

