<script setup>
import { ref, reactive } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { useAuthStore } from '../stores/auth';
import * as api from '../services/api';
import '../styles/auth.css';

const router = useRouter();
const route = useRoute();
const authStore = useAuthStore();

const isLogin = ref(route.query.mode !== 'signup');
const showPassword = ref(false);
const loading = ref(false);
const errorMsg = ref('');

const loginForm = reactive({
  email: '',
  password: '',
});

const signupForm = reactive({
  name: '',
  email: '',
  password: '',
  confirmPassword: '',
});

const toggleMode = () => {
  isLogin.value = !isLogin.value;
  errorMsg.value = '';
  showPassword.value = false;
};

const handleLogin = async () => {
  loading.value = true;
  errorMsg.value = '';
  try {
    const res = await api.login(loginForm.email, loginForm.password);
    authStore.login(res.data.user, res.data.token);
    const redirectPath = route.query.redirect || '/dashboard';
    router.push(redirectPath);
  } catch (error) {
    errorMsg.value = error.message;
  } finally {
    loading.value = false;
  }
};

const handleSignup = async () => {
  if (signupForm.password !== signupForm.confirmPassword) {
    errorMsg.value = 'Passwords do not match';
    return;
  }
  loading.value = true;
  errorMsg.value = '';
  try {
    const res = await api.signup(signupForm.name, signupForm.email, signupForm.password);
    authStore.login(res.data.user, res.data.token);
    router.push('/dashboard');
  } catch (error) {
    errorMsg.value = error.message;
  } finally {
    loading.value = false;
  }
};
</script>

<template>
  <div class="auth-page">
    <div class="auth-split">
      <div class="auth-left desktop-only">
        <div class="auth-left-content">
          <svg class="auth-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M22 10v6M2 10l10-5 10 5-10 5z" />
            <path d="M6 12v5c3 3 9 3 12 0v-5" />
          </svg>
          <h2>FUPRE CBT Portal</h2>
          <p>Join thousands of students practicing for their Post-UTME. Experience real exam conditions and pass with flying colors.</p>
        </div>
      </div>

      <div class="auth-right">
        <div class="auth-form-container">
          <transition name="slide" mode="out-in">
            <div v-if="isLogin" key="login" class="auth-form-wrapper">
              <h2 class="auth-title">Welcome Back</h2>

              <div v-if="errorMsg" class="error-msg">{{ errorMsg }}</div>

              <form @submit.prevent="handleLogin" class="auth-form">
                <div class="form-group">
                  <label class="label">Email Address</label>
                  <input
                    type="email"
                    v-model="loginForm.email"
                    class="input"
                    required
                    placeholder="Enter your email"
                    autocomplete="email"
                  />
                </div>

                <div class="form-group">
                  <label class="label">Password</label>
                  <div class="password-input-wrapper">
                    <input
                      :type="showPassword ? 'text' : 'password'"
                      v-model="loginForm.password"
                      class="input"
                      required
                      placeholder="Enter your password"
                      autocomplete="current-password"
                    />
                    <button type="button" class="pwd-toggle" @click="showPassword = !showPassword">
                      {{ showPassword ? 'Hide' : 'Show' }}
                    </button>
                  </div>
                </div>

                <button type="submit" class="btn btn-primary full-width" :disabled="loading">
                  <span v-if="loading" class="spinner"></span>
                  <span v-else>Sign In</span>
                </button>
              </form>

              <div class="auth-toggle">
                <span class="text-muted">Don't have an account?</span>
                <button class="btn-ghost btn-sm" @click="toggleMode">Sign up</button>
              </div>
            </div>

            <div v-else key="signup" class="auth-form-wrapper">
              <h2 class="auth-title">Create Account</h2>

              <div v-if="errorMsg" class="error-msg">{{ errorMsg }}</div>

              <form @submit.prevent="handleSignup" class="auth-form">
                <div class="form-group">
                  <label class="label">Full Name</label>
                  <input
                    type="text"
                    v-model="signupForm.name"
                    class="input"
                    required
                    placeholder="John Doe"
                    autocomplete="name"
                  />
                </div>

                <div class="form-group">
                  <label class="label">Email Address</label>
                  <input
                    type="email"
                    v-model="signupForm.email"
                    class="input"
                    required
                    placeholder="Enter your email"
                    autocomplete="email"
                  />
                </div>

                <div class="form-group">
                  <label class="label">Password</label>
                  <div class="password-input-wrapper">
                    <input
                      :type="showPassword ? 'text' : 'password'"
                      v-model="signupForm.password"
                      class="input"
                      required
                      placeholder="Create a password"
                      autocomplete="new-password"
                    />
                    <button type="button" class="pwd-toggle" @click="showPassword = !showPassword">
                      {{ showPassword ? 'Hide' : 'Show' }}
                    </button>
                  </div>
                </div>

                <div class="form-group">
                  <label class="label">Confirm Password</label>
                  <input
                    :type="showPassword ? 'text' : 'password'"
                    v-model="signupForm.confirmPassword"
                    class="input"
                    required
                    placeholder="Confirm your password"
                    autocomplete="new-password"
                  />
                </div>

                <button type="submit" class="btn btn-primary full-width" :disabled="loading">
                  <span v-if="loading" class="spinner"></span>
                  <span v-else>Create Account</span>
                </button>
              </form>

              <div class="auth-toggle">
                <span class="text-muted">Already have an account?</span>
                <button class="btn-ghost btn-sm" @click="toggleMode">Sign in</button>
              </div>
            </div>
          </transition>
        </div>
      </div>
    </div>
  </div>
</template>
