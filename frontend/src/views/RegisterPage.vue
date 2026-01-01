<template>
  <div class="register-page">
    <div class="register-container">
      <h1>Create Account</h1>
      <form @submit.prevent="handleRegister" class="register-form">
        <!-- Username Field -->
        <div class="form-group">
          <label for="username">Username</label>
          <input
            id="username"
            v-model="formData.username"
            type="text"
            required
            minlength="3"
            maxlength="30"
            :class="{ 'error': usernameError }"
            @blur="checkUsername"
            @input="clearUsernameError"
            placeholder="Choose a username (3-30 characters)"
          />
          <div v-if="usernameError" class="error-message">{{ usernameError }}</div>
          <div v-if="usernameChecking" class="checking-message">Checking availability...</div>
          <div v-if="usernameAvailable && !usernameChecking && formData.username" class="success-message">
            ✓ Username is available
          </div>
        </div>

        <!-- Email Field -->
        <div class="form-group">
          <label for="email">Email</label>
          <input
            id="email"
            v-model="formData.email"
            type="email"
            required
            :class="{ 'error': emailError }"
            @input="clearEmailError"
            placeholder="Enter your email"
          />
          <div v-if="emailError" class="error-message">{{ emailError }}</div>
        </div>

        <!-- Password Field -->
        <div class="form-group">
          <label for="password">Password</label>
          <input
            id="password"
            v-model="formData.password"
            type="password"
            required
            minlength="6"
            :class="{ 'error': passwordError }"
            @input="clearPasswordError"
            placeholder="Enter a password (min 6 characters)"
          />
          <div v-if="passwordError" class="error-message">{{ passwordError }}</div>
        </div>

        <!-- Submit Button -->
        <button type="submit" :disabled="isSubmitting || !isFormValid" class="submit-btn">
          <span v-if="isSubmitting">Creating Account...</span>
          <span v-else>Create Account</span>
        </button>

        <!-- Success/Error Messages -->
        <div v-if="successMessage" class="success-message">{{ successMessage }}</div>
        <div v-if="errorMessage" class="error-message">{{ errorMessage }}</div>
      </form>

      <div class="login-link">
        <p>Already have an account? <router-link to="/login">Login</router-link></p>
      </div>
    </div>
  </div>
</template>

<script>
import axios from 'axios';

export default {
  name: 'RegisterPage',
  data() {
    return {
      formData: {
        username: '',
        email: '',
        password: '',
      },
      usernameError: '',
      emailError: '',
      passwordError: '',
      usernameChecking: false,
      usernameAvailable: false,
      isSubmitting: false,
      successMessage: '',
      errorMessage: '',
      usernameCheckTimeout: null,
    };
  },
  computed: {
    isFormValid() {
      return (
        this.formData.username.length >= 3 &&
        this.formData.email &&
        this.formData.password.length >= 6 &&
        !this.usernameError &&
        !this.emailError &&
        !this.passwordError &&
        this.usernameAvailable
      );
    },
  },
  methods: {
    clearUsernameError() {
      this.usernameError = '';
      this.usernameAvailable = false;
    },
    clearEmailError() {
      this.emailError = '';
    },
    clearPasswordError() {
      this.passwordError = '';
    },
    async checkUsername() {
      const username = this.formData.username.trim();
      
      if (username.length < 3) {
        this.usernameError = 'Username must be at least 3 characters';
        this.usernameAvailable = false;
        return;
      }

      // Debounce username check
      if (this.usernameCheckTimeout) {
        clearTimeout(this.usernameCheckTimeout);
      }

      this.usernameChecking = true;
      this.usernameError = '';

      this.usernameCheckTimeout = setTimeout(async () => {
        try {
          const response = await axios.post('/users/check-username', {
            username: username,
          });

          if (response.data.available) {
            this.usernameAvailable = true;
            this.usernameError = '';
          } else {
            this.usernameAvailable = false;
            this.usernameError = response.data.message || 'Username is not available';
          }
        } catch (error) {
          this.usernameAvailable = false;
          console.error('Username check error:', error);
          
          if (error.response) {
            // Server responded with error status
            this.usernameError = error.response.data?.message || 'Error checking username';
          } else if (error.request) {
            // Request was made but no response received
            this.usernameError = 'Cannot connect to server. Please make sure the backend is running.';
          } else {
            // Something else happened
            this.usernameError = 'Error checking username availability';
          }
        } finally {
          this.usernameChecking = false;
        }
      }, 500); // 500ms debounce
    },
    async handleRegister() {
      // Clear previous messages
      this.successMessage = '';
      this.errorMessage = '';
      this.usernameError = '';
      this.emailError = '';
      this.passwordError = '';

      // Validate form
      if (!this.isFormValid) {
        if (!this.usernameAvailable) {
          this.usernameError = 'Please choose an available username';
        }
        return;
      }

      this.isSubmitting = true;

      try {
        const response = await axios.post('/users/register', {
          username: this.formData.username.trim(),
          email: this.formData.email.trim(),
          password: this.formData.password,
        });

        // Automatically log in the user after registration
        localStorage.setItem('user', JSON.stringify(response.data.user));
        localStorage.setItem('userId', response.data.user.id);

        // Trigger custom event to update App.vue
        window.dispatchEvent(new CustomEvent('userLogin'));

        this.successMessage = 'Account created successfully! Logging you in...';
        
        // Redirect after a short delay
        setTimeout(() => {
          this.$router.push('/');
        }, 1500);
      } catch (error) {
        if (error.response && error.response.data) {
          const errorMsg = error.response.data.message || 'Error creating account';
          
          // Set specific field errors if possible
          if (errorMsg.toLowerCase().includes('username')) {
            this.usernameError = errorMsg;
          } else if (errorMsg.toLowerCase().includes('email')) {
            this.emailError = errorMsg;
          } else if (errorMsg.toLowerCase().includes('password')) {
            this.passwordError = errorMsg;
          } else {
            this.errorMessage = errorMsg;
          }
        } else {
          this.errorMessage = 'Error creating account. Please try again.';
        }
      } finally {
        this.isSubmitting = false;
      }
    },
  },
  beforeUnmount() {
    if (this.usernameCheckTimeout) {
      clearTimeout(this.usernameCheckTimeout);
    }
  },
};
</script>

<style scoped>
.register-page {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: calc(100vh - 200px);
  padding: 20px;
}

.register-container {
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

.register-form {
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
  margin-top: 5px;
}

.checking-message {
  color: #666;
  font-size: 14px;
  margin-top: 5px;
  font-style: italic;
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

.login-link {
  margin-top: 20px;
  text-align: center;
  color: #666;
}

.login-link a {
  color: #42b983;
  text-decoration: none;
  font-weight: 500;
}

.login-link a:hover {
  text-decoration: underline;
}
</style>

