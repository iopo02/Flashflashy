<template>
  <div class="home">
    <h1>Welcome to Flashflashy</h1>
    <p>MEVN Stack Application</p>
    <button @click="testAPI" class="test-btn">Test API Connection</button>
    <div v-if="apiMessage" class="api-message">
      {{ apiMessage }}
    </div>
  </div>
</template>

<script>
import axios from 'axios';

export default {
  name: 'HomePage',
  data() {
    return {
      apiMessage: '',
    };
  },
  methods: {
    async testAPI() {
      try {
        const response = await axios.get('/test');
        this.apiMessage = `API Response: ${response.data.message}`;
      } catch (error) {
        this.apiMessage = `Error: ${error.message}`;
      }
    },
  },
};
</script>

<style scoped>
.home {
  padding: 20px;
}

.test-btn {
  margin-top: 20px;
  padding: 10px 20px;
  background-color: #42b983;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 16px;
}

.test-btn:hover {
  background-color: #35a372;
}

.api-message {
  margin-top: 20px;
  padding: 10px;
  background-color: #f0f0f0;
  border-radius: 4px;
}
</style>

