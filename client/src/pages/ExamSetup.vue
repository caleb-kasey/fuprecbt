<script setup>
import { ref, computed, watch } from 'vue';
import { useRouter } from 'vue-router';
import { useExamStore } from '../stores/exam';
import * as api from '../services/api';
import '../styles/examsetup.css';

const router = useRouter();
const examStore = useExamStore();

const optionalSubjects = ref([]);
const selectedYear = ref('');
const loading = ref(false);
const errorMsg = ref('');
const shakeId = ref(null);

const summaryLoaded = ref(false);
const subjectStats = ref([]);
const totalQuestionsCount = ref(0);
const totalTimeMinutes = ref(0);
let fetchedQuestions = [];

const optionalSubjectsList = [
  { id: 'physics', name: 'Physics', icon: '⚛️' },
  { id: 'biology', name: 'Biology', icon: '🔬' },
  { id: 'chemistry', name: 'Chemistry', icon: '⚗️' },
];

const yearsList = ['2023', '2024', '2025', 'Random Mix'];

const isSelected = (id) => optionalSubjects.value.includes(id);

const toggleSubject = (id) => {
  if (isSelected(id)) {
    optionalSubjects.value = optionalSubjects.value.filter((s) => s !== id);
  } else {
    if (optionalSubjects.value.length >= 2) {
      shakeId.value = id;
      setTimeout(() => {
        shakeId.value = null;
      }, 500);
      return;
    }
    optionalSubjects.value.push(id);
  }
};

const hasOptionalSubjects = computed(() => optionalSubjects.value.length === 2);

const statusMessage = computed(() => {
  if (optionalSubjects.value.length === 0) return '⚠️ Select 2 science subjects to continue';
  if (optionalSubjects.value.length === 1) return '⚠️ Select 1 more science subject';
  return '✅ All 4 subjects selected';
});

const statusClass = computed(() => {
  if (optionalSubjects.value.length === 2) return 'status-success';
  return 'status-warning';
});

const canStart = computed(() => hasOptionalSubjects.value && selectedYear.value);

const startButtonText = computed(() => {
  if (loading.value) return 'Loading questions...';
  if (!hasOptionalSubjects.value) return 'Select 2 science subjects to continue';
  if (!selectedYear.value) return 'Select an exam year to continue';
  if (!summaryLoaded.value) return 'Load Exam Summary';
  return 'Begin Exam Now';
});

const fetchSummary = async () => {
  loading.value = true;
  errorMsg.value = '';
  try {
    const subjectsToFetch = ['english', 'mathematics', ...optionalSubjects.value];
    const yearParam = selectedYear.value === 'Random Mix' ? 'random' : selectedYear.value;

    const promises = subjectsToFetch.map((sub) => api.getQuestions(sub, yearParam));
    const responses = await Promise.all(promises);

    let combined = [];
    subjectStats.value = [];

    responses.forEach((res, index) => {
      const payload = res.data;
      const qList = Array.isArray(payload) ? payload : payload.questions || payload.data || [];
      combined = combined.concat(qList);

      let icon = '📖';
      const subName = subjectsToFetch[index];
      if (subName === 'mathematics') icon = '➕';
      if (subName === 'physics') icon = '⚛️';
      if (subName === 'biology') icon = '🔬';
      if (subName === 'chemistry') icon = '⚗️';

      subjectStats.value.push({
        name: subName.charAt(0).toUpperCase() + subName.slice(1),
        icon,
        count: qList.length,
      });
    });

    fetchedQuestions = combined;
    totalQuestionsCount.value = combined.length;
    totalTimeMinutes.value = combined.length * 1.5;

    if (combined.length === 0) {
      errorMsg.value = 'No questions found for this selection.';
    } else {
      summaryLoaded.value = true;
    }
  } catch (err) {
    errorMsg.value = err.message || 'Failed to load questions. Please try again.';
    console.error(err);
  } finally {
    loading.value = false;
  }
};

// Automatically fetch summary when selections are valid
watch([hasOptionalSubjects, selectedYear], async ([validSubs, validYear]) => {
  summaryLoaded.value = false;
  errorMsg.value = '';
  if (validSubs && validYear) {
    await fetchSummary();
  }
});

const startExam = () => {
  if (!summaryLoaded.value) {
    fetchSummary();
    return;
  }

  examStore.resetExam();
  examStore.setSubjects(['english', 'mathematics', ...optionalSubjects.value]);
  examStore.setYear(selectedYear.value);
  examStore.setQuestions(fetchedQuestions);
  examStore.examStarted = true;

  router.push('/exam');
};
</script>

<template>
  <div class="page-pad setup-page">
    <div class="container setup-container">
      <div class="setup-header">
        <h1 class="setup-title">Set Up Your Exam</h1>
        <p class="setup-subtitle">Choose your 4 subjects and a year</p>

        <button class="btn btn-outline mb-4" @click="$router.push('/dashboard')" style="margin-bottom: 20px;">
          ← Back to Dashboard
        </button>

        <div class="stepper">
          <div :class="['step-item', { active: true }]">
            <div class="step-circle">1</div>
            <span>Subjects</span>
          </div>
          <div class="step-connector"></div>
          <div :class="['step-item', { active: hasOptionalSubjects }]">
            <div class="step-circle">2</div>
            <span>Year</span>
          </div>
        </div>
      </div>

      <div class="setup-content">
        <!-- Subjects Section -->
        <section class="setup-section">
          <div class="section-header">
            <h2>Select Your Subjects</h2>
            <p>English and Mathematics are compulsory. Pick exactly 2 from Physics, Biology and Chemistry.</p>
          </div>

          <div class="subjects-grid">
            <!-- Compulsory -->
            <div class="subject-card compulsory">
              <div class="card-icon">📖</div>
              <div class="card-info">
                <h3>English</h3>
                <span class="q-label">Questions vary by year</span>
              </div>
              <div class="card-status">
                <span class="badge"><span class="lock">🔒</span> Compulsory</span>
              </div>
            </div>

            <div class="subject-card compulsory">
              <div class="card-icon">➕</div>
              <div class="card-info">
                <h3>Mathematics</h3>
                <span class="q-label">Questions vary by year</span>
              </div>
              <div class="card-status">
                <span class="badge"><span class="lock">🔒</span> Compulsory</span>
              </div>
            </div>

            <!-- Optional -->
            <div
              v-for="sub in optionalSubjectsList"
              :key="sub.id"
              :class="['subject-card selectable', { selected: isSelected(sub.id), shaking: shakeId === sub.id }]"
              @click="toggleSubject(sub.id)"
            >
              <div class="card-icon">{{ sub.icon }}</div>
              <div class="card-info">
                <h3>{{ sub.name }}</h3>
                <span class="q-label">Questions vary by year</span>
              </div>
              <div class="card-status">
                <div v-if="isSelected(sub.id)" class="check-circle">✓</div>
                <div v-else class="empty-circle"></div>
              </div>
            </div>
          </div>

          <div class="selection-status" :class="statusClass">
            {{ statusMessage }}
          </div>
        </section>

        <!-- Year Section -->
        <section class="setup-section">
          <div class="section-header">
            <h2>Select Exam Year</h2>
          </div>
          <div class="year-pills">
            <button
              v-for="year in yearsList"
              :key="year"
              :class="['year-pill', { selected: selectedYear === year }]"
              @click="selectedYear = year"
            >
              {{ year === 'Random Mix' ? '🔀 ' : '' }}{{ year }}
            </button>
          </div>
        </section>

        <!-- Summary Card -->
        <transition name="slide-down">
          <div v-if="canStart && summaryLoaded" class="summary-card card">
            <h3>Exam Summary</h3>
            <div class="summary-list">
              <div v-for="stat in subjectStats" :key="stat.name" class="summary-item">
                <span>{{ stat.icon }} {{ stat.name }}</span>
                <strong>{{ stat.count }} questions</strong>
              </div>
            </div>
            <div class="divider"></div>
            <div class="summary-totals">
              <div class="total-item">
                <span>Total Questions:</span>
                <strong>{{ totalQuestionsCount }}</strong>
              </div>
              <div class="total-item">
                <span>Time Allowed:</span>
                <strong>{{ totalTimeMinutes }} minutes</strong>
              </div>
              <div class="total-item">
                <span>Selected Year:</span>
                <strong>{{ selectedYear }}</strong>
              </div>
            </div>
          </div>
        </transition>

        <div v-if="errorMsg" class="error-msg mt-4">{{ errorMsg }}</div>

        <button
          class="btn btn-primary btn-lg full-width start-btn"
          :disabled="!canStart || loading"
          @click="startExam"
        >
          <span v-if="loading" class="spinner"></span>
          <span v-else>{{ startButtonText }}</span>
        </button>
      </div>
    </div>
  </div>
</template>
