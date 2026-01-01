import { createRouter, createWebHistory } from 'vue-router';
import Home from '../views/Home.vue';

const routes = [
  {
    path: '/',
    name: 'Home',
    component: Home,
  },
  {
    path: '/about',
    name: 'About',
    component: () => import('../views/About.vue'),
  },
  {
    path: '/register',
    name: 'Register',
    component: () => import('../views/RegisterPage.vue'),
  },
  {
    path: '/login',
    name: 'Login',
    component: () => import('../views/LoginPage.vue'),
  },
  {
    path: '/admin',
    name: 'Admin',
    component: () => import('../views/AdminPanel.vue'),
  },
  {
    path: '/decks',
    name: 'Decks',
    component: () => import('../views/DecksPage.vue'),
  },
  {
    path: '/decks/:deckId/edit',
    name: 'DeckEditor',
    component: () => import('../views/DeckEditorPage.vue'),
  },
];

const router = createRouter({
  history: createWebHistory(process.env.BASE_URL),
  routes,
});

export default router;

