<template>
  <div class="page-pad review-page">
    <div class="container">
      
      <div v-if="loading" class="text-center loading-state">
        <span class="spinner"></span> Loading review...
      </div>

      <div v-else-if="reviewData">
        <div class="review-header card">
          <div class="header-content">
            <h1>Exam Review</h1>
            <p class="review-stats">
              <span class="text-green">{{ reviewData.passed }} Correct</span> &middot; 
              <span class="text-red">{{ reviewData.failed }} Wrong</span>
            </p>
          </div>
          <div class="header-actions">
            <button class="btn btn-outline" @click="$router.push('/results')">Back to Results</button>
            <button class="btn btn-primary" @click="$router.push('/exam-setup')">New Exam</button>
          </div>
        </div>

        <div class="filter-bar card">
          <div class="filter-group">
            <span class="filter-label">Status:</span>
            <div class="filter-pills">
              <button :class="['pill', { active: statusFilter === 'all' }]" @click="statusFilter = 'all'">All</button>
              <button :class="['pill', { active: statusFilter === 'correct' }]" @click="statusFilter = 'correct'">Correct</button>
              <button :class="['pill', { active: statusFilter === 'wrong' }]" @click="statusFilter = 'wrong'">Wrong</button>
            </div>
          </div>
          <div class="divider"></div>
          <div class="filter-group">
            <span class="filter-label">Subject:</span>
            <div class="filter-pills">
              <button :class="['pill', { active: subjectFilter === 'all' }]" @click="subjectFilter = 'all'">All</button>
              <button 
                v-for="sub in reviewData.subjects" 
                :key="sub"
                :class="['pill', { active: subjectFilter === sub }]" 
                @click="subjectFilter = sub"
              >
                {{ sub.charAt(0).toUpperCase() + sub.slice(1) }}
              </button>
            </div>
          </div>
        </div>

        <div class="questions-list">
          <div 
            v-for="(q, index) in filteredQuestions" 
            :key="q.questionId"
            class="review-card card"
          >
            <div class="q-header">
              <span class="badge subject-badge">{{ q.subject.charAt(0).toUpperCase() + q.subject.slice(1) }}</span>
              <span class="q-num">Q{{ getOriginalIndex(q.questionId) + 1 }}</span>
              <span class="status-icon">
                <template v-if="q.isCorrect">✅</template>
                <template v-else-if="q.selectedAnswer">❌</template>
                <template v-else>⭕</template>
              </span>
            </div>

            <div v-if="q.passage" class="passage-box">
              <p>{{ q.passage }}</p>
            </div>

            <div v-if="q.questionImage" class="diagram-box">
              <img :src="`/assets/${q.questionImage}`" alt="Question Diagram" />
            </div>

            <div class="question-text">
              <MathText :text="q.questionText" :block="true" />
            </div>

            <div class="options-list">
              <div 
                v-for="(text, key) in q.options" 
                :key="key"
                :class="['review-option', getOptionClass(q, key)]"
              >
                <div class="option-letter">{{ key }}</div>
                <div class="option-text">
                  <MathText :text="text" :block="false" />
                </div>
              </div>
            </div>

            <div class="explanation-box" v-if="q.explanation">
              <strong>Explanation:</strong>
              <div class="mt-2">
                <MathText :text="q.explanation" :block="false" />
              </div>
            </div>
            
          </div>
          
          <div v-if="filteredQuestions.length === 0" class="empty-state card">
            No questions match the selected filters.
          </div>
        </div>
      </div>
      
      <div v-else-if="errorMsg" class="error-msg text-center mt-4">
        {{ errorMsg }}
        <br>
        <button class="btn btn-outline mt-4" @click="$router.push('/dashboard')">Go to Dashboard</button>
      </div>

    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import * as api from '../services/api'
import MathText from '../components/MathText.vue'

const route = useRoute()
const reviewData = ref(null)
const loading = ref(true)
const errorMsg = ref('')

const statusFilter = ref('all')
const subjectFilter = ref('all')

onMounted(async () => {
  const resultId = route.params.id
  try {
    const res = await api.getReview(resultId)
    reviewData.value = res.data
  } catch (err) {
    errorMsg.value = "Failed to load review data. " + err.message
  } finally {
    loading.value = false
  }
})

const getOriginalIndex = (qId) => {
  return reviewData.value.answers.findIndex(q => q.questionId === qId)
}

const filteredQuestions = computed(() => {
  if (!reviewData.value) return []
  return reviewData.value.answers.filter(q => {
    const qStatus = q.isCorrect ? 'correct' : 'wrong'
    const matchStatus = statusFilter.value === 'all' || qStatus === statusFilter.value
    const matchSubject = subjectFilter.value === 'all' || q.subject === subjectFilter.value
    return matchStatus && matchSubject
  })
})

const getOptionClass = (q, key) => {
  if (key === q.correctAnswer) return 'correct-ans'
  if (key === q.selectedAnswer && !q.isCorrect) return 'wrong-ans'
  return ''
}
</script>

<style scoped>
.review-page {
  background-color: var(--bg-secondary);
  min-height: 100vh;
  padding-bottom: 60px;
}

.review-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.review-header h1 {
  font-size: 1.8rem;
  color: var(--text);
  margin-bottom: 5px;
}

.review-stats {
  font-size: 1.1rem;
  font-weight: 600;
}

.text-green { color: #27ae60; }
.text-red { color: #c0392b; }

.header-actions {
  display: flex;
  gap: 15px;
}

.filter-bar {
  margin-bottom: 30px;
}

.filter-group {
  display: flex;
  align-items: center;
  gap: 15px;
}

.filter-label {
  font-weight: 600;
  color: var(--text-secondary);
  width: 70px;
}

.filter-pills {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
}

.pill {
  padding: 6px 16px;
  border-radius: 100px;
  background: var(--bg-secondary);
  border: 1px solid var(--border);
  color: var(--text);
  font-weight: 500;
  cursor: pointer;
  transition: var(--transition);
}

.pill:hover:not(.active) {
  border-color: var(--primary);
  color: var(--primary);
}

.pill.active {
  background: var(--primary);
  border-color: var(--primary);
  color: #fff;
}

.questions-list {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.review-card {
  padding: 30px;
}

.q-header {
  display: flex;
  align-items: center;
  margin-bottom: 20px;
  border-bottom: 1px solid var(--border);
  padding-bottom: 15px;
}

.subject-badge {
  margin-right: 15px;
}

.q-num {
  font-weight: 700;
  font-size: 1.1rem;
  color: var(--text);
  flex: 1;
}

.status-icon {
  font-size: 1.5rem;
}

.passage-box {
  background: var(--primary-faint);
  padding: 15px;
  border-radius: var(--radius);
  margin-bottom: 20px;
  border: 1px solid var(--primary-light);
  color: var(--text);
}

.diagram-box {
  margin-bottom: 20px;
}

.diagram-box img {
  max-width: 100%;
  border-radius: var(--radius);
  border: 1px solid var(--border);
}

.question-text {
  font-size: 1.1rem;
  font-weight: 500;
  margin-bottom: 20px;
  color: var(--text);
}

.options-list {
  display: flex;
  flex-direction: column;
  gap: 10px;
  margin-bottom: 20px;
}

.review-option {
  display: flex;
  align-items: center;
  padding: 15px;
  border-radius: var(--radius);
  border: 2px solid var(--border);
  background: var(--bg-card);
}

.option-letter {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background: var(--bg-secondary);
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 700;
  margin-right: 15px;
  color: var(--text-secondary);
}

.option-text {
  color: var(--text);
}

.correct-ans {
  background: rgba(39, 174, 96, 0.1);
  border-color: #27ae60;
}
.correct-ans .option-letter {
  background: #27ae60;
  color: #fff;
}

.wrong-ans {
  background: rgba(231, 76, 60, 0.1);
  border-color: #e74c3c;
}
.wrong-ans .option-letter {
  background: #e74c3c;
  color: #fff;
}

.explanation-box {
  background: #fffbeb;
  border-left: 4px solid #f59e0b;
  padding: 15px;
  border-radius: 0 var(--radius) var(--radius) 0;
  color: var(--text);
}
[data-theme="dark"] .explanation-box {
  background: rgba(245, 158, 11, 0.1);
}

.empty-state {
  text-align: center;
  padding: 40px;
  color: var(--text-muted);
}

.mt-4 { margin-top: 1rem; }

@media (max-width: 768px) {
  .review-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 15px;
  }
  .header-actions {
    width: 100%;
    justify-content: space-between;
  }
  .filter-group {
    flex-direction: column;
    align-items: flex-start;
  }
}
</style>
