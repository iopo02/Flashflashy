<template>
  <div class="login-page">
    <div class="login-container">
      <h1>Login</h1>
      <form @submit.prevent="handleLogin" class="login-form">
        <!-- Email/Username Field -->
        <div class="form-group">
          <label for="emailOrUsername">Email or Username</label>
          <input
            id="emailOrUsername"
            v-model="formData.emailOrUsername"
            type="text"
            required
            :class="{ 'error': emailOrUsernameError }"
            @input="clearEmailOrUsernameError"
            placeholder="Enter your email or username"
          />
          <div v-if="emailOrUsernameError" class="error-message">{{ emailOrUsernameError }}</div>
        </div>

        <!-- Password Field -->
        <div class="form-group">
          <label for="password">Password</label>
          <input
            id="password"
            v-model="formData.password"
            type="password"
            required
            :class="{ 'error': passwordError }"
            @input="clearPasswordError"
            placeholder="Enter your password"
          />
          <div v-if="passwordError" class="error-message">{{ passwordError }}</div>
        </div>

        <!-- Submit Button -->
        <button type="submit" :disabled="isSubmitting" class="submit-btn">
          <span v-if="isSubmitting">Logging in...</span>
          <span v-else>Login</span>
        </button>

        <!-- Success/Error Messages -->
        <div v-if="successMessage" class="success-message">{{ successMessage }}</div>
        <div v-if="errorMessage" class="error-message">{{ errorMessage }}</div>
      </form>

      <div class="register-link">
        <p>Don't have an account? <router-link to="/register">Register</router-link></p>
      </div>
    </div>
  </div>
</template>

<script>
import axios from 'axios';

export default {
  name: 'LoginPage',
  data() {
    return {
      formData: {
        emailOrUsername: '',
        password: '',
      },
      emailOrUsernameError: '',
      passwordError: '',
      isSubmitting: false,
      successMessage: '',
      errorMessage: '',
    };
  },
  methods: {
    clearEmailOrUsernameError() {
      this.emailOrUsernameError = '';
      this.errorMessage = '';
    },
    clearPasswordError() {
      this.passwordError = '';
      this.errorMessage = '';
    },
    async handleLogin() {
      // Clear previous messages
      this.successMessage = '';
      this.errorMessage = '';
      this.emailOrUsernameError = '';
      this.passwordError = '';

      // Validation
      if (!this.formData.emailOrUsername.trim()) {
        this.emailOrUsernameError = 'Email or username is required';
        return;
      }

      if (!this.formData.password) {
        this.passwordError = 'Password is required';
        return;
      }

      this.isSubmitting = true;

      try {
        const response = await axios.post('/users/login', {
          emailOrUsername: this.formData.emailOrUsername.trim(),
          password: this.formData.password,
        });

        // Store user data in localStorage
        localStorage.setItem('user', JSON.stringify(response.data.user));
        localStorage.setItem('userId', response.data.user.id);

        // Trigger custom event to update App.vue (storage event doesn't fire in same tab)
        window.dispatchEvent(new CustomEvent('userLogin'));

        this.successMessage = 'Login successful! Redirecting...';

        // Redirect to home page after a short delay
        setTimeout(() => {
          this.$router.push('/');
        }, 1000);
      } catch (error) {
        if (error.response?.status === 401) {
          this.errorMessage = error.response.data?.message || 'Invalid email/username or password';
        } else if (error.response?.status === 400) {
          this.errorMessage = error.response.data?.message || 'Please fill in all fields';
        } else if (error.request) {
          this.errorMessage = 'Cannot connect to server. Please make sure the backend is running.';
        } else {
          this.errorMessage = 'Error during login. Please try again.';
        }
      } finally {
        this.isSubmitting = false;
      }
    },
  },
};
</script>

<style scoped>
.login-page {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: calc(100vh - 200px);
  padding: 20px;
}

.login-container {
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  padding: 40px;
  width: 100%;
  max-width: 450px;
}

h1 {
  text-align: center;
  color: #2c3e50;
  margin-bottom: 30px;
}

.login-form {
  display: flex;
  flex-direction: column;
}

.form-group {
  margin-bottom: 20px;
  text-align: left;
}

label {
  display: block;
  margin-bottom: 8px;
  color: #2c3e50;
  font-weight: 500;
}

input {
  width: 100%;
  padding: 12px;
  border: 2px solid #e0e0e0;
  border-radius: 4px;
  font-size: 16px;
  transition: border-color 0.3s;
  box-sizing: border-box;
}

input:focus {
  outline: none;
  border-color: #42b983;
}

input.error {
  border-color: #e74c3c;
}

.error-message {
  color: #e74c3c;
  font-size: 14px;
  margin-top: 5px;
}

.success-message {
  color: #42b983;
  font-size: 14px;
  margin-top: 15px;
  padding: 10px;
  background-color: #d4edda;
  border-radius: 4px;
  border: 1px solid #c3e6cb;
}

.submit-btn {
  width: 100%;
  padding: 12px;
  background-color: #42b983;
  color: white;
  border: none;
  border-radius: 4px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: background-color 0.3s;
  margin-top: 10px;
}

.submit-btn:hover:not(:disabled) {
  background-color: #35a372;
}

.submit-btn:disabled {
  background-color: #ccc;
  cursor: not-allowed;
}

.register-link {
  margin-top: 20px;
  text-align: center;
  color: #666;
}

.register-link a {
  color: #42b983;
  text-decoration: none;
  font-weight: 500;
}

.register-link a:hover {
  text-decoration: underline;
}
</style>

