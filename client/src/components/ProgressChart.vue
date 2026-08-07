<template>
  <div class="progress-chart card">
    <h3 class="chart-title">Your Progress Over Time</h3>
    
    <div v-if="!results || results.length === 0" class="empty-chart">
      No exam history yet
    </div>
    
    <div v-else class="chart-container">
      <div 
        v-for="(stat, index) in groupedStats" 
        :key="index" 
        class="bar-wrapper"
      >
        <div class="bar-label-top">{{ Math.round(stat.avgScore) }}%</div>
        <div class="bar-track">
          <div 
            class="bar-fill" 
            :style="{ height: stat.avgScore + '%', opacity: 0.5 + (stat.avgScore / 200) }"
          ></div>
        </div>
        <div class="bar-label-bottom">{{ stat.year }}</div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, ref, onMounted } from 'vue'

const props = defineProps({
  results: {
    type: Array,
    default: () => []
  }
})

const groupedStats = computed(() => {
  if (!props.results.length) return []
  
  const byYear = props.results.reduce((acc, r) => {
    if (!acc[r.year]) {
      acc[r.year] = { total: 0, count: 0 }
    }
    const percent = (r.passed / r.totalQuestions) * 100
    acc[r.year].total += percent
    acc[r.year].count += 1
    return acc
  }, {})

  return Object.keys(byYear).map(year => ({
    year,
    avgScore: byYear[year].total / byYear[year].count
  })).sort((a, b) => a.year.localeCompare(b.year))
})
</script>

<style scoped>
.progress-chart {
  display: flex;
  flex-direction: column;
}

.chart-title {
  margin: 0 0 20px 0;
  font-size: 1.1rem;
  color: var(--text);
}

.empty-chart {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--text-muted);
  font-style: italic;
  min-height: 200px;
}

.chart-container {
  display: flex;
  align-items: flex-end;
  justify-content: space-around;
  height: 200px;
  padding-top: 20px;
}

.bar-wrapper {
  display: flex;
  flex-direction: column;
  align-items: center;
  height: 100%;
  flex: 1;
}

.bar-label-top {
  font-size: 0.8rem;
  font-weight: 600;
  color: var(--primary);
  margin-bottom: 8px;
}

.bar-track {
  width: 40px;
  flex: 1;
  background: var(--bg-secondary);
  border-radius: var(--radius-sm);
  position: relative;
  overflow: hidden;
  display: flex;
  align-items: flex-end;
}

.bar-fill {
  width: 100%;
  background: var(--primary);
  border-radius: var(--radius-sm);
  transition: height 1s ease-out;
  animation: slideUp 1s ease-out forwards;
  transform-origin: bottom;
}

.bar-label-bottom {
  font-size: 0.85rem;
  color: var(--text-secondary);
  margin-top: 10px;
  font-weight: 500;
}

@keyframes slideUp {
  from { transform: scaleY(0); }
  to { transform: scaleY(1); }
}
</style>
