<template>
  <div class="page-pad dashboard-page">
    <div class="container">
      
      <!-- Welcome Banner -->
      <div class="welcome-banner">
        <div class="banner-content">
          <h1 class="banner-title">{{ greeting }}</h1>
          <p class="banner-subtitle">Ready to practice today?</p>
        </div>
        <div class="banner-action">
          <router-link to="/exam-setup" class="btn btn-primary btn-lg banner-btn">
            Start New Exam
          </router-link>
        </div>
      </div>

      <!-- Stats Row -->
      <div class="stats-grid">
        <div class="stat-card card">
          <div class="stat-icon">📝</div>
          <div class="stat-info">
            <div class="stat-value">{{ stats.totalExams }}</div>
            <div class="stat-label">Total Exams Taken</div>
          </div>
        </div>
        <div class="stat-card card">
          <div class="stat-icon">📈</div>
          <div class="stat-info">
            <div class="stat-value">{{ stats.averageScore }}%</div>
            <div class="stat-label">Average Score</div>
          </div>
        </div>
        <div class="stat-card card">
          <div class="stat-icon">🏆</div>
          <div class="stat-info">
            <div class="stat-value">{{ stats.bestScore }}%</div>
            <div class="stat-label">Best Score</div>
          </div>
        </div>
        <div class="stat-card card">
          <div class="stat-icon">📚</div>
          <div class="stat-info">
            <div class="stat-value">{{ stats.subjectsPracticed }}</div>
            <div class="stat-label">Subjects Practiced</div>
          </div>
        </div>
      </div>

      <div class="dashboard-grid">
        <!-- Progress Chart -->
        <div class="chart-section">
          <ProgressChart :results="results" />
        </div>
        
        <!-- Study Bot -->
        <div class="bot-section">
          <StudyBot :results="results" />
        </div>
      </div>

      <!-- Recent Exams -->
      <div class="recent-exams card">
        <h2 class="section-title">Recent Exams</h2>
        <div v-if="loading" class="loading-state">
          <span class="spinner"></span> Loading history...
        </div>
        <div v-else-if="results.length === 0" class="empty-state">
          No exams taken yet. Start practicing to see your history!
        </div>
        <div v-else class="table-responsive">
          <table class="exams-table">
            <thead>
              <tr>
                <th>Date</th>
                <th>Subjects</th>
                <th>Year</th>
                <th>Score</th>
                <th>%</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="exam in recentExams" :key="exam._id">
                <td>{{ formatDate(exam.createdAt) }}</td>
                <td>
                  <div class="subject-badges">
                    <span class="badge" v-for="s in exam.subjects" :key="s">
                      {{ s.charAt(0).toUpperCase() + s.slice(1) }}
                    </span>
                  </div>
                </td>
                <td>{{ exam.year }}</td>
                <td>{{ exam.passed }} / {{ exam.totalQuestions }}</td>
                <td>
                  <span :class="['score-percent', getScoreClass(exam.passed, exam.totalQuestions)]">
                    {{ Math.round((exam.passed / exam.totalQuestions) * 100) }}%
                  </span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useAuthStore } from '../stores/auth'
import * as api from '../services/api'
import ProgressChart from '../components/ProgressChart.vue'
import StudyBot from '../components/StudyBot.vue'
import '../styles/dashboard.css'

const authStore = useAuthStore()
const results = ref([])
const loading = ref(true)

const greeting = computed(() => {
  const hour = new Date().getHours()
  const name = authStore.currentUser?.name?.split(' ')[0] || 'User'
  if (hour >= 5 && hour < 12) return `Good morning, ${name}!`
  if (hour >= 12 && hour < 17) return `Good afternoon, ${name}!`
  return `Good evening, ${name}!`
})

const fetchResults = async () => {
  loading.value = true
  try {
    const res = await api.getUserResults(authStore.userId)
    results.value = res.data.results || []
  } catch (error) {
    console.error("Failed to fetch results", error)
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  fetchResults()
})

const stats = computed(() => {
  if (results.value.length === 0) {
    return { totalExams: 0, averageScore: 0, bestScore: 0, subjectsPracticed: 0 }
  }

  const totalExams = results.value.length
  
  let totalPercent = 0
  let best = 0
  const subjectsSet = new Set()

  results.value.forEach(r => {
    const pct = (r.passed / r.totalQuestions) * 100
    totalPercent += pct
    if (pct > best) best = pct
    r.subjects.forEach(s => subjectsSet.add(s))
  })

  return {
    totalExams,
    averageScore: Math.round(totalPercent / totalExams),
    bestScore: Math.round(best),
    subjectsPracticed: subjectsSet.size
  }
})

const recentExams = computed(() => {
  return [...results.value].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)).slice(0, 5)
})

const formatDate = (dateStr) => {
  return new Intl.DateTimeFormat('en-GB', {
    day: '2-digit', month: 'short', year: 'numeric'
  }).format(new Date(dateStr))
}

const getScoreClass = (passed, total) => {
  const pct = (passed / total) * 100
  return pct >= 50 ? 'text-green' : 'text-red'
}
</script>
