<script setup>
import { ref, computed, onMounted, onUnmounted, watch } from 'vue';
import { useExamStore } from '../stores/exam';

const props = defineProps({
  totalSeconds: {
    type: Number,
    required: true,
  },
});

const emit = defineEmits(['timeout']);

const examStore = useExamStore();
const timeLeft = ref(examStore.timeRemaining > 0 ? examStore.timeRemaining : props.totalSeconds);
let timerInterval = null;

const startTimer = () => {
  if (timerInterval) clearInterval(timerInterval);
  timerInterval = setInterval(() => {
    if (timeLeft.value > 0) {
      timeLeft.value--;
      examStore.timeRemaining = timeLeft.value;
    } else {
      clearInterval(timerInterval);
      emit('timeout');
    }
  }, 1000);
};

onMounted(() => {
  startTimer();
});

onUnmounted(() => {
  if (timerInterval) clearInterval(timerInterval);
});

watch(
  () => props.totalSeconds,
  (newVal) => {
    if (examStore.timeRemaining === 0 || examStore.timeRemaining === newVal) {
      timeLeft.value = newVal;
      startTimer();
    }
  }
);

const formattedTime = computed(() => {
  const m = Math.floor(timeLeft.value / 60);
  const s = timeLeft.value % 60;
  return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
});

const dashOffset = computed(() => {
  const fraction = timeLeft.value / props.totalSeconds;
  const circumference = 2 * Math.PI * 45;
  return circumference * (1 - fraction);
});

const currentColor = computed(() => {
  if (timeLeft.value > 600) return 'var(--primary)';
  if (timeLeft.value > 300) return '#f59e0b';
  return '#ef4444';
});
</script>

<template>
  <div class="timer-container">
    <svg class="timer-svg" viewBox="0 0 100 100">
      <circle class="timer-bg" cx="50" cy="50" r="45" />
      <circle
        class="timer-progress"
        cx="50"
        cy="50"
        r="45"
        :style="{ strokeDashoffset: dashOffset, stroke: currentColor }"
      />
    </svg>
    <div class="timer-text" :style="{ color: currentColor }">
      {{ formattedTime }}
    </div>
  </div>
</template>

<style scoped>
.timer-container {
  position: relative;
  width: 60px;
  height: 60px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.timer-svg {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  transform: rotate(-90deg);
}

.timer-bg {
  fill: none;
  stroke: var(--border);
  stroke-width: 8;
}

.timer-progress {
  fill: none;
  stroke-width: 8;
  stroke-linecap: round;
  stroke-dasharray: 283;
  transition: stroke-dashoffset 1s linear, stroke 0.5s ease;
}

.timer-text {
  font-weight: 700;
  font-size: 0.9rem;
  z-index: 2;
}
</style>
