<template>
  <div class="exam-room">
    <!-- Top Bar -->
    <header class="exam-header">
      <div class="header-left">
        <span class="subject-badge">{{ currentSubjectName }}</span>
        <div class="question-counter">
          Question {{ examStore.currentIndex + 1 }} of {{ totalQuestions }}
        </div>
      </div>
      <div class="header-right">
        <Timer 
          v-if="examStore.timeAllowed" 
          :totalSeconds="examStore.timeAllowed" 
          @timeout="autoSubmit" 
        />
      </div>
      
      <!-- Progress Bar -->
      <div class="progress-bar-container">
        <div class="progress-bar-fill" :style="{ width: progressPercent + '%' }"></div>
      </div>
    </header>

    <div class="exam-content container">
      <!-- Left: Navigation (Desktop) -->
      <aside class="exam-nav desktop-only">
        <QuestionNav 
          :questions="examStore.questions" 
          :answers="examStore.answers" 
          :currentIndex="examStore.currentIndex"
          @navigate="examStore.goToQuestion"
        />
      </aside>

      <!-- Center: Question -->
      <main class="exam-main">
        <!-- Mobile Nav Strip -->
        <div class="mobile-nav mobile-only">
          <button class="btn btn-outline btn-sm" @click="showMobileNav = true">
            ☰ Questions Grid
          </button>
        </div>

        <div v-if="currentQuestion" class="question-container">
          <!-- Passage -->
          <div v-if="currentQuestion.passage" class="passage-box">
            <div class="passage-header" @click="isPassageOpen = !isPassageOpen">
              <h4>📖 Read the Passage</h4>
              <span>{{ isPassageOpen ? '▼' : '▶' }}</span>
            </div>
            <div v-show="isPassageOpen" class="passage-content">
              {{ currentQuestion.passage }}
            </div>
          </div>

          <!-- Diagram -->
          <div v-if="currentQuestion.questionImage" class="diagram-box">
            <img :src="`/assets/${currentQuestion.questionImage}`" alt="Question Diagram" />
          </div>

          <!-- Question Text -->
          <div class="question-text">
            <MathText :text="currentQuestion.questionText" :block="true" />
          </div>

          <!-- Options -->
          <div class="options-list">
            <button 
              v-for="(text, key) in currentQuestion.options" 
              :key="key"
              :class="['option-btn', { selected: examStore.answers[currentQuestion._id] === key }]"
              @click="selectOption(key)"
            >
              <div class="option-letter">{{ key }}</div>
              <div class="option-text">
                <MathText :text="text" :block="false" />
              </div>
            </button>
          </div>
        </div>

        <!-- Controls -->
        <div class="exam-controls">
          <div class="nav-controls">
            <button 
              class="btn btn-outline" 
              :disabled="examStore.currentIndex === 0"
              @click="examStore.prevQuestion"
            >
              &larr; Previous
            </button>
            <button 
              class="btn btn-outline" 
              :disabled="examStore.currentIndex === totalQuestions - 1"
              @click="examStore.nextQuestion"
            >
              Next &rarr;
            </button>
          </div>
          <button class="btn btn-primary submit-btn" @click="confirmSubmit">
            Submit Exam
          </button>
        </div>
      </main>

      <!-- Right Column (Placeholder for layout balance on desktop) -->
      <div class="exam-right desktop-only"></div>
    </div>

    <Calculator />

    <!-- Mobile Nav Modal -->
    <transition name="fade">
      <div v-if="showMobileNav" class="modal-overlay" @click="showMobileNav = false">
        <div class="modal-content" @click.stop>
          <div class="modal-header">
            <h3>Question Navigator</h3>
            <button class="close-btn" @click="showMobileNav = false">✕</button>
          </div>
          <QuestionNav 
            :questions="examStore.questions" 
            :answers="examStore.answers" 
            :currentIndex="examStore.currentIndex"
            @navigate="handleMobileNavigate"
          />
        </div>
      </div>
    </transition>

    <!-- Submit Modal -->
    <transition name="fade">
      <div v-if="showSubmitModal" class="modal-overlay">
        <div class="modal-content text-center">
          <h2>Submit Exam?</h2>
          <p class="submit-stats">
            You have answered <strong>{{ examStore.answeredCount }}</strong> out of <strong>{{ totalQuestions }}</strong> questions.
          </p>
          <p class="text-muted">Once submitted, you cannot change your answers.</p>
          
          <div v-if="submitting" class="submitting-state">
            <span class="spinner"></span> Grading exam...
          </div>
          <div v-else class="modal-actions">
            <button class="btn btn-outline" @click="showSubmitModal = false">Cancel</button>
            <button class="btn btn-primary" @click="submitExam">Yes, Submit</button>
          </div>
        </div>
      </div>
    </transition>

  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useExamStore } from '../stores/exam'
import { useAuthStore } from '../stores/auth'
import * as api from '../services/api'
import Timer from '../components/Timer.vue'
import QuestionNav from '../components/QuestionNav.vue'
import Calculator from '../components/Calculator.vue'
import MathText from '../components/MathText.vue'
import '../styles/examroom.css'

const router = useRouter()
const examStore = useExamStore()
const authStore = useAuthStore()

const showMobileNav = ref(false)
const showSubmitModal = ref(false)
const isPassageOpen = ref(true)
const submitting = ref(false)

onMounted(() => {
  if (!examStore.examStarted || examStore.questions.length === 0) {
    router.push('/exam-setup')
  }
})

const currentQuestion = computed(() => examStore.currentQuestion)
const totalQuestions = computed(() => examStore.totalQuestions)
const progressPercent = computed(() => examStore.progressPercent)

const currentSubjectName = computed(() => {
  if (!currentQuestion.value || !currentQuestion.value.subject) return ''
  const sub = currentQuestion.value.subject
  return sub.charAt(0).toUpperCase() + sub.slice(1)
})

const selectOption = (key) => {
  examStore.setAnswer(currentQuestion.value._id, key)
}

const handleMobileNavigate = (index) => {
  examStore.goToQuestion(index)
  showMobileNav.value = false
}

const confirmSubmit = () => {
  showSubmitModal.value = true
}

const autoSubmit = () => {
  if (!examStore.examSubmitted) {
    submitExam()
  }
}

const submitExam = async () => {
  submitting.value = true
  try {
    // Format answers from object to array of { questionId, selectedAnswer }
    // including unanswered questions as null
    const formattedAnswers = examStore.questions.map(q => ({
      questionId: q._id,
      selectedAnswer: examStore.answers[q._id] || null
    }))

    const res = await api.submitExam(
      formattedAnswers, 
      examStore.selectedSubjects, 
      examStore.selectedYear
    )
    examStore.setResult(res.data.result)
    examStore.examSubmitted = true
    router.push('/results')
  } catch (error) {
    console.error("Submit failed", error)
    alert("Failed to submit exam. Please try again.")
    submitting.value = false
    showSubmitModal.value = false
  }
}
</script>
