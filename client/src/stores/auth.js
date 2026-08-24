import { defineStore } from 'pinia';
import router from '../router';

/**
 * Authentication Store
 */
export const useAuthStore = defineStore('auth', {
  state: () => ({
    user: null,
    token: null,
  }),

  getters: {
    isLoggedIn: (state) => !!state.token,
    currentUser: (state) => state.user,
    userId: (state) => state.user?.id || state.user?._id,
  },

  actions: {
    login(userData, token) {
      this.user = userData;
      this.token = token;
      localStorage.setItem('user', JSON.stringify(userData));
      localStorage.setItem('token', token);
    },

    logout() {
      this.user = null;
      this.token = null;
      localStorage.removeItem('user');
      localStorage.removeItem('token');
      router.push('/');
    },

    initAuth() {
      const storedUser = localStorage.getItem('user');
      const storedToken = localStorage.getItem('token');

      if (storedUser && storedToken) {
        try {
          this.user = JSON.parse(storedUser);
          this.token = storedToken;
        } catch (error) {
          console.error('Failed to parse stored user authentication state:', error);
          this.logout();
        }
      }
    },
  },
});
