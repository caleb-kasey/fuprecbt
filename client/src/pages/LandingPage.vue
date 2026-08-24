<script setup>
import '../styles/landing.css';
</script>

<template>
  <div class="landing-page">
    <section class="hero">
      <div class="container hero-content">
        <div class="hero-icon">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M22 10v6M2 10l10-5 10 5-10 5z" />
            <path d="M6 12v5c3 3 9 3 12 0v-5" />
          </svg>
        </div>
        <h1 class="hero-title">FUPRE CBT Portal</h1>
        <p class="hero-subtitle">Your Post-UTME Success Starts Here</p>
        <p class="hero-desc">
          Practice real past questions, track your progress, and walk into your exam with total confidence.
        </p>
        <div class="hero-actions">
          <router-link to="/auth?mode=signup" class="btn btn-primary btn-lg">Sign Up &rarr;</router-link>
          <router-link to="/auth?mode=login" class="btn btn-outline btn-lg">Login</router-link>
        </div>
      </div>
    </section>

    <section class="features">
      <div class="container">
        <h2 class="section-title">Everything You Need to Pass</h2>
        <div class="feature-grid">
          <div class="card feature-card">
            <div class="feature-icon">📚</div>
            <h3>Real Past Questions</h3>
            <p>Practice questions from 2023, 2024 and 2025 across all your subjects. Questions vary per subject as in the real exam.</p>
          </div>
          <div class="card feature-card">
            <div class="feature-icon">⏱️</div>
            <h3>Real Exam Conditions</h3>
            <p>Timed sessions based on your actual question count. 1.5 minutes per question, just like the real thing.</p>
          </div>
          <div class="card feature-card">
            <div class="feature-icon">📊</div>
            <h3>Track Your Progress</h3>
            <p>See your scores over time and know exactly where to improve.</p>
          </div>
        </div>
      </div>
    </section>

    <section class="how-it-works">
      <div class="container">
        <h2 class="section-title">How It Works</h2>
        <div class="steps-row">
          <div class="step">
            <div class="step-num">1</div>
            <p>Create your account</p>
          </div>
          <div class="step-line"></div>
          <div class="step">
            <div class="step-num">2</div>
            <p>Choose 4 subjects and a year</p>
          </div>
          <div class="step-line"></div>
          <div class="step">
            <div class="step-num">3</div>
            <p>Practice and track your scores</p>
          </div>
        </div>
      </div>
    </section>

    <footer class="footer">
      <div class="container">
        <p>FUPRE CBT Portal &copy; 2025</p>
      </div>
    </footer>
  </div>
</template>
