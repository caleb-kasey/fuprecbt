<script setup>
import { useRoute } from 'vue-router';
import { useAuthStore } from './stores/auth';
import Navbar from './components/Navbar.vue';

const authStore = useAuthStore();
const route = useRoute();
</script>

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

<style>
/* Root styles managed in main.css */
</style>
