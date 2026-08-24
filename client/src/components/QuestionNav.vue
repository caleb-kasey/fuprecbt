<script setup>
const props = defineProps({
  questions: {
    type: Array,
    required: true,
  },
  answers: {
    type: Object,
    required: true,
  },
  currentIndex: {
    type: Number,
    required: true,
  },
});

defineEmits(['navigate']);

const getStatusClass = (index) => {
  const qId = props.questions[index]?._id;
  if (props.answers[qId]) return 'answered';
  if (index === props.currentIndex) return 'visited';
  return 'not-visited';
};
</script>

<template>
  <div class="question-nav">
    <div class="nav-header">
      <h3>Questions</h3>
    </div>

    <div class="nav-grid">
      <button
        v-for="(q, index) in questions"
        :key="q?._id || index"
        :class="['nav-btn', getStatusClass(index), { active: index === currentIndex }]"
        @click="$emit('navigate', index)"
      >
        {{ index + 1 }}
      </button>
    </div>

    <div class="nav-legend">
      <div class="legend-item">
        <span class="dot not-visited"></span> Not Visited
      </div>
      <div class="legend-item">
        <span class="dot visited"></span> Visited
      </div>
      <div class="legend-item">
        <span class="dot answered"></span> Answered
      </div>
    </div>
  </div>
</template>

<style scoped>
.question-nav {
  background: var(--bg-card);
  border: 1px solid var(--border);
  border-radius: var(--radius-lg);
  padding: 20px;
  display: flex;
  flex-direction: column;
  height: 100%;
}

.nav-header h3 {
  margin: 0 0 15px 0;
  font-size: 1.1rem;
  color: var(--text);
}

.nav-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(40px, 1fr));
  gap: 10px;
  overflow-y: auto;
  flex-grow: 1;
  padding-right: 5px;
}

.nav-btn {
  height: 40px;
  border-radius: var(--radius-sm);
  border: 1px solid var(--border);
  background: var(--bg-secondary);
  color: var(--text);
  font-weight: 600;
  cursor: pointer;
  transition: var(--transition);
  display: flex;
  align-items: center;
  justify-content: center;
}

.nav-btn.not-visited {
  background: var(--bg-secondary);
}

.nav-btn.visited {
  background: var(--primary-light);
  border-color: var(--primary-light);
  color: var(--primary);
}

.nav-btn.answered {
  background: var(--primary);
  border-color: var(--primary);
  color: #fff;
}

.nav-btn.active {
  border: 2px solid var(--primary);
  box-shadow: 0 0 0 3px var(--primary-faint);
  transform: scale(1.05);
}

.nav-legend {
  margin-top: 20px;
  padding-top: 15px;
  border-top: 1px solid var(--border);
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.legend-item {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 0.85rem;
  color: var(--text-secondary);
}

.dot {
  width: 12px;
  height: 12px;
  border-radius: 50%;
}

.dot.not-visited {
  background: var(--bg-secondary);
  border: 1px solid var(--border);
}
.dot.visited {
  background: var(--primary-light);
}
.dot.answered {
  background: var(--primary);
}
</style>
