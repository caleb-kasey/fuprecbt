<script setup>
import { ref, computed } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from '../stores/auth';
import { useThemeStore } from '../stores/theme';

const authStore = useAuthStore();
const themeStore = useThemeStore();
const router = useRouter();

const isDrawerOpen = ref(false);

const userInitials = computed(() => {
  const name = authStore.currentUser?.name || 'User';
  return name.charAt(0).toUpperCase();
});

const handleLogout = () => {
  isDrawerOpen.value = false;
  authStore.logout();
};
</script>

<template>
  <nav class="navbar">
    <div class="nav-container">
      <div class="nav-left">
        <router-link to="/dashboard" class="logo-link">
          <img src="https://fupre.edu.ng/wp-content/uploads/2023/04/FUPRELogo.png" alt="FUPRE Logo" class="nav-logo" />
          <span class="nav-brand">FUPRE CBT Portal</span>
        </router-link>
      </div>

      <!-- Desktop Nav -->
      <div class="nav-right desktop-only">
        <div class="user-info">
          <div class="avatar">{{ userInitials }}</div>
          <span class="user-name">{{ authStore.currentUser?.name }}</span>
        </div>
        <button class="icon-btn" @click="themeStore.toggleTheme" title="Toggle Theme">
          <span v-if="themeStore.isDark">☀️</span>
          <span v-else>🌙</span>
        </button>
        <button class="btn-ghost nav-logout" @click="handleLogout">Logout</button>
      </div>

      <!-- Mobile Hamburger -->
      <button class="hamburger mobile-only" @click="isDrawerOpen = true" aria-label="Open Menu">
        ☰
      </button>
    </div>

    <!-- Mobile Drawer -->
    <transition name="slide-fade">
      <div v-if="isDrawerOpen" class="drawer-overlay" @click="isDrawerOpen = false">
        <div class="drawer" @click.stop>
          <div class="drawer-header">
            <div class="user-info">
              <div class="avatar">{{ userInitials }}</div>
              <span class="user-name">{{ authStore.currentUser?.name }}</span>
            </div>
            <button class="close-btn" @click="isDrawerOpen = false" aria-label="Close Menu">✕</button>
          </div>
          <div class="drawer-links">
            <router-link to="/dashboard" class="drawer-link" @click="isDrawerOpen = false">Dashboard</router-link>
            <button class="drawer-link" @click="themeStore.toggleTheme">
              {{ themeStore.isDark ? '☀️ Light Mode' : '🌙 Dark Mode' }}
            </button>
            <button class="drawer-link logout-text" @click="handleLogout">Logout</button>
          </div>
        </div>
      </div>
    </transition>
  </nav>
</template>

<style scoped>
.navbar {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  height: 70px;
  background-color: var(--primary);
  z-index: 1000;
  box-shadow: 0 2px 10px rgba(0,0,0,0.1);
}

.nav-container {
  max-width: 1100px;
  margin: 0 auto;
  height: 100%;
  padding: 0 20px;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.nav-left {
  display: flex;
  align-items: center;
}

.logo-link {
  display: flex;
  align-items: center;
  gap: 12px;
  text-decoration: none;
}

.nav-logo {
  height: 40px;
  width: auto;
  object-fit: contain;
}

.nav-brand {
  color: #ffffff;
  font-size: 1.25rem;
  font-weight: 700;
}

.nav-right {
  display: flex;
  align-items: center;
  gap: 20px;
}

.user-info {
  display: flex;
  align-items: center;
  gap: 10px;
}

.avatar {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  background: #ffffff;
  color: var(--primary);
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 700;
  font-size: 1.1rem;
}

.user-name {
  color: #ffffff;
  font-weight: 500;
}

.icon-btn {
  background: none;
  border: none;
  font-size: 1.2rem;
  cursor: pointer;
  padding: 8px;
  border-radius: 50%;
  transition: var(--transition);
}

.icon-btn:hover {
  background: rgba(255,255,255,0.1);
}

.nav-logout {
  color: #ffffff !important;
  border: 1px solid rgba(255, 255, 255, 0.4);
  padding: 6px 16px;
  border-radius: 100px;
  font-weight: 500;
  transition: all 0.3s ease;
}

.nav-logout:hover {
  background: #ffffff !important;
  border-color: #ffffff;
  color: var(--primary) !important;
}

.mobile-only {
  display: none;
}

.hamburger {
  background: none;
  border: none;
  color: #ffffff;
  font-size: 1.8rem;
  cursor: pointer;
}

/* Drawer Styles */
.drawer-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0,0,0,0.5);
  z-index: 1001;
}

.drawer {
  position: absolute;
  top: 0;
  right: 0;
  bottom: 0;
  width: 280px;
  background: var(--bg-card);
  padding: 20px;
  box-shadow: -4px 0 16px rgba(0,0,0,0.2);
  display: flex;
  flex-direction: column;
}

.drawer-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 30px;
  padding-bottom: 20px;
  border-bottom: 1px solid var(--border);
}

.drawer-header .user-name {
  color: var(--text);
}

.close-btn {
  background: none;
  border: none;
  font-size: 1.5rem;
  color: var(--text-secondary);
  cursor: pointer;
}

.drawer-links {
  display: flex;
  flex-direction: column;
  gap: 15px;
}

.drawer-link {
  display: block;
  padding: 12px;
  text-decoration: none;
  color: var(--text);
  font-weight: 500;
  border-radius: var(--radius-sm);
  background: none;
  border: none;
  text-align: left;
  font-size: 1rem;
  cursor: pointer;
  transition: var(--transition);
}

.drawer-link:hover {
  background: var(--bg-secondary);
  color: var(--primary);
}

.logout-text {
  color: #e53e3e;
}

/* Animations */
.slide-fade-enter-active,
.slide-fade-leave-active {
  transition: opacity 0.3s ease;
}

.slide-fade-enter-active .drawer,
.slide-fade-leave-active .drawer {
  transition: transform 0.3s ease;
}

.slide-fade-enter-from,
.slide-fade-leave-to {
  opacity: 0;
}

.slide-fade-enter-from .drawer,
.slide-fade-leave-to .drawer {
  transform: translateX(100%);
}

@media (max-width: 768px) {
  .desktop-only { display: none; }
  .mobile-only { display: block; }
}
</style>
