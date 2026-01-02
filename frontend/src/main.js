import { createApp } from 'vue';
import App from './App.vue';
import router from './router';
import axios from 'axios';

// Configure axios base URL
axios.defaults.baseURL = process.env.VUE_APP_API_URL || 'http://localhost:5000/api';

const app = createApp(App);

app.use(router);
app.config.globalProperties.$http = axios;

app.mount('#app');

