<script setup>
import { computed } from 'vue';

const props = defineProps({
  results: {
    type: Array,
    default: () => [],
  },
});

const botMessage = computed(() => {
  if (!props.results || props.results.length === 0) {
    return "Welcome! Take your first exam to begin your journey. 💪";
  }

  const totalScore = props.results.reduce(
    (acc, r) => acc + (r.passed / r.totalQuestions) * 100,
    0
  );
  const avg = totalScore / props.results.length;

  if (avg < 40) {
    return "Keep going! Every expert was once a beginner. Practice daily! 📖";
  } else if (avg >= 40 && avg < 60) {
    return "Good effort! Push a little harder and watch your scores rise! 🚀";
  } else if (avg >= 60 && avg < 80) {
    return "Great work! Stay consistent and you will master this! ⭐";
  } else {
    return "Outstanding! You are well prepared for your Post-UTME! 🏆";
  }
});
</script>

<template>
  <div class="study-bot card">
    <div class="bot-avatar">
      🤖
    </div>
    <div class="bot-bubble">
      <p>{{ botMessage }}</p>
      <button class="btn btn-primary btn-sm" @click="$router.push('/exam-setup')">
        Take an Exam
      </button>
    </div>
  </div>
</template>

<style scoped>
.study-bot {
  display: flex;
  align-items: center;
  gap: 20px;
  background: var(--primary-faint);
  border-color: var(--primary-light);
}

.bot-avatar {
  font-size: 3rem;
  animation: float 3s ease-in-out infinite;
}

.bot-bubble {
  background: var(--bg-card);
  padding: 15px 20px;
  border-radius: var(--radius-lg);
  border-bottom-left-radius: 0;
  box-shadow: var(--shadow-sm);
  position: relative;
  flex: 1;
}

.bot-bubble::before {
  content: '';
  position: absolute;
  left: -10px;
  bottom: 0;
  border-width: 0 10px 10px 0;
  border-style: solid;
  border-color: transparent var(--bg-card) transparent transparent;
}

.bot-bubble p {
  margin: 0 0 15px 0;
  color: var(--text);
  font-weight: 500;
  line-height: 1.4;
}

@keyframes float {
  0% { transform: translateY(0); }
  50% { transform: translateY(-10px); }
  100% { transform: translateY(0); }
}
</style>
