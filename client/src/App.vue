<template>
  <div id="app">
    <Navbar v-if="authStore.isLoggedIn && route.path !== '/exam'" />
    <router-view v-slot="{ Component }">
      <transition name="fade" mode="out-in">
        <component :is="Component" />
      </transition>
    </router-view>
  </div>
</template>

<script setup>
import { onMounted } from 'vue'
import Navbar from './components/Navbar.vue'
import { useAuthStore } from './stores/auth'
import { useThemeStore } from './stores/theme'
import { useRoute } from 'vue-router'

const authStore = useAuthStore()
const themeStore = useThemeStore()
const route = useRoute()

onMounted(() => {
  // Theme and Auth are initialized in main.js
})
</script>

<style>
/* Root app styles handled in main.css */
</style>
