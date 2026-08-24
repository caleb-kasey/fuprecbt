import { createApp } from 'vue';
import { createPinia } from 'pinia';

import App from './App.vue';
import router from './router';
import { useAuthStore } from './stores/auth';
import { useThemeStore } from './stores/theme';

import 'katex/dist/katex.min.css';
import './styles/main.css';

const app = createApp(App);
const pinia = createPinia();

// Subscribe to exam store mutations for local persistence
pinia.use(({ store }) => {
  if (store.$id === 'exam') {
    store.$subscribe((_, state) => {
      localStorage.setItem('examState', JSON.stringify(state));
    });
  }
});

app.use(pinia);
app.use(router);

// Initialize Stores
const authStore = useAuthStore();
authStore.initAuth();

const themeStore = useThemeStore();
themeStore.initTheme();

app.mount('#app');
