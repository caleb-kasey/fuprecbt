import { defineStore } from 'pinia';

export const useThemeStore = defineStore('theme', {
  state: () => ({
    isDark: false,
  }),

  actions: {
    toggleTheme() {
      this.isDark = !this.isDark;
      if (this.isDark) {
        document.documentElement.setAttribute('data-theme', 'dark');
      } else {
        document.documentElement.removeAttribute('data-theme');
      }
      localStorage.setItem('theme', this.isDark ? 'dark' : 'light');
    },

    initTheme() {
      const savedTheme = localStorage.getItem('theme');
      if (savedTheme === 'dark') {
        this.isDark = true;
        document.documentElement.setAttribute('data-theme', 'dark');
      } else {
        this.isDark = false;
        document.documentElement.removeAttribute('data-theme');
      }
    },
  },
});
