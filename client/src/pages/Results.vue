<template>
  <div class="page-pad results-page">
    <div class="container" v-if="result">
      
      <!-- Confetti container (only shown if passed >= 70%) -->
      <div v-if="percentage >= 70" class="confetti-container">
        <div v-for="n in 50" :key="n" class="confetti"></div>
      </div>

      <div class="results-header text-center">
        <h1 class="results-title">{{ headerEmoji }} {{ headerMessage }}</h1>
      </div>

      <div class="results-main">
        <div class="score-card card">
          <div class="score-circle-wrapper">
            <svg class="score-svg" viewBox="0 0 100 100">
              <circle class="score-bg" cx="50" cy="50" r="45" />
              <circle 
                class="score-progress" 
                cx="50" cy="50" r="45" 
                :style="{ strokeDashoffset: dashOffset, stroke: scoreColor }"
              />
            </svg>
            <div class="score-text" :style="{ color: scoreColor }">
              {{ percentage }}%
            </div>
          </div>
          <div class="score-actions">
            <router-link :to="`/review/${result._id}`" class="btn btn-primary">
              📝 Review Answers
            </router-link>
            <router-link to="/exam-setup" class="btn btn-outline">
              🔄 Try Again
            </router-link>
            <router-link to="/dashboard" class="btn btn-ghost">
              🏠 Dashboard
            </router-link>
          </div>
        </div>

        <div class="stats-row">
          <div class="stat-box card">
            <div class="stat-icon text-primary">🎯</div>
            <div class="stat-info">
              <span class="stat-val">{{ result.passed }} / {{ result.totalQuestions }}</span>
              <span class="stat-label">Total Score</span>
            </div>
          </div>
          <div class="stat-box card">
            <div class="stat-icon text-blue">✍️</div>
            <div class="stat-info">
              <span class="stat-val">{{ result.attempted }}</span>
              <span class="stat-label">Attempted</span>
            </div>
          </div>
          <div class="stat-box card">
            <div class="stat-icon text-green">✅</div>
            <div class="stat-info">
              <span class="stat-val text-green">{{ result.passed }}</span>
              <span class="stat-label">Correct</span>
            </div>
          </div>
          <div class="stat-box card">
            <div class="stat-icon text-red">❌</div>
            <div class="stat-info">
              <span class="stat-val text-red">{{ result.failed }}</span>
              <span class="stat-label">Incorrect</span>
            </div>
          </div>
        </div>

        <div class="subject-breakdown card">
          <h2 class="section-title">Subject Breakdown</h2>
          <div class="table-responsive">
            <table class="breakdown-table">
              <thead>
                <tr>
                  <th>Subject</th>
                  <th>Score</th>
                  <th>Total</th>
                  <th>%</th>
                  <th>Grade</th>
                </tr>
              </thead>
              <tbody>
                <tr 
                  v-for="sub in result.subjectBreakdown" 
                  :key="sub.subject"
                  :class="getSubjectRowClass(sub.score, sub.total)"
                >
                  <td class="capitalize">{{ sub.subject }}</td>
                  <td><strong>{{ sub.score }}</strong></td>
                  <td>{{ sub.total }}</td>
                  <td>{{ Math.round((sub.score / sub.total) * 100) }}%</td>
                  <td><strong>{{ getGrade(sub.score, sub.total) }}</strong></td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
    
    <div v-else class="container text-center loading-state">
      <span class="spinner"></span> Loading results...
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useExamStore } from '../stores/exam'
import '../styles/results.css'

const router = useRouter()
const examStore = useExamStore()

const result = computed(() => examStore.result)

onMounted(() => {
  if (!result.value) {
    router.push('/dashboard')
  }
})

const percentage = computed(() => {
  if (!result.value) return 0
  return Math.round((result.value.passed / result.value.totalQuestions) * 100)
})

const headerEmoji = computed(() => {
  if (percentage.value >= 70) return '🎉'
  if (percentage.value >= 50) return '💪'
  return '📚'
})

const headerMessage = computed(() => {
  if (percentage.value >= 70) return 'Excellent Performance!'
  if (percentage.value >= 50) return 'Good Effort!'
  return 'Keep Practicing!'
})

const dashOffset = computed(() => {
  const fraction = percentage.value / 100
  const circumference = 2 * Math.PI * 45
  return circumference * (1 - fraction)
})

const scoreColor = computed(() => {
  if (percentage.value >= 70) return '#27ae60' // green
  if (percentage.value >= 50) return '#f39c12' // orange
  return '#e74c3c' // red
})

const getGrade = (score, total) => {
  const pct = (score / total) * 100
  if (pct >= 70) return 'A'
  if (pct >= 60) return 'B'
  if (pct >= 50) return 'C'
  return 'F'
}

const getSubjectRowClass = (score, total) => {
  const pct = (score / total) * 100
  return pct >= 50 ? 'row-pass' : 'row-fail'
}
</script>
