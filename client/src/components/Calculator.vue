<template>
  <div class="calculator-wrapper">
    <button class="calc-fab" @click="isOpen = !isOpen" title="Calculator">
      🖩
    </button>
    
    <transition name="slide-up">
      <div v-if="isOpen" class="calc-overlay">
        <div class="calc-header">
          <span>Calculator</span>
          <button @click="isOpen = false" class="close-btn">✕</button>
        </div>
        <div class="calc-display">
          <div class="calc-expression">{{ expression }}</div>
          <div class="calc-result">{{ result }}</div>
        </div>
        <div class="calc-keys">
          <button @click="clear" class="btn-action">C</button>
          <button @click="toggleSign" class="btn-action">±</button>
          <button @click="percent" class="btn-action">%</button>
          <button @click="inputOperator('÷')" class="btn-op">÷</button>
          
          <button @click="inputDigit(7)">7</button>
          <button @click="inputDigit(8)">8</button>
          <button @click="inputDigit(9)">9</button>
          <button @click="inputOperator('×')" class="btn-op">×</button>
          
          <button @click="inputDigit(4)">4</button>
          <button @click="inputDigit(5)">5</button>
          <button @click="inputDigit(6)">6</button>
          <button @click="inputOperator('−')" class="btn-op">−</button>
          
          <button @click="inputDigit(1)">1</button>
          <button @click="inputDigit(2)">2</button>
          <button @click="inputDigit(3)">3</button>
          <button @click="inputOperator('+')" class="btn-op">+</button>
          
          <button @click="inputDigit(0)" class="wide">0</button>
          <button @click="inputDot">.</button>
          <button @click="calculate" class="btn-equals">=</button>
        </div>
      </div>
    </transition>
  </div>
</template>

<script setup>
import { ref } from 'vue'

const isOpen = ref(false)
const expression = ref('')
const result = ref('0')
let currentOperand = ''
let previousOperand = ''
let operation = undefined

const updateDisplay = () => {
  if (operation) {
    expression.value = `${previousOperand} ${operation} ${currentOperand}`
  } else {
    expression.value = currentOperand
  }
}

const inputDigit = (digit) => {
  if (result.value === 'Error') clear()
  if (currentOperand.includes('.') && digit === '.') return
  currentOperand = currentOperand.toString() + digit.toString()
  result.value = currentOperand || '0'
  updateDisplay()
}

const inputDot = () => {
  if (currentOperand === '') {
    currentOperand = '0.'
  } else if (!currentOperand.includes('.')) {
    currentOperand += '.'
  }
  result.value = currentOperand
  updateDisplay()
}

const inputOperator = (op) => {
  if (result.value === 'Error') clear()
  if (currentOperand === '' && previousOperand === '') return
  if (currentOperand !== '') {
    if (previousOperand !== '') {
      calculate(false)
    } else {
      previousOperand = currentOperand
      currentOperand = ''
    }
  }
  operation = op
  updateDisplay()
}

const calculate = (final = true) => {
  let computation
  const prev = parseFloat(previousOperand)
  const current = parseFloat(currentOperand)
  if (isNaN(prev) || isNaN(current)) return
  
  switch (operation) {
    case '+':
      computation = prev + current
      break
    case '−':
      computation = prev - current
      break
    case '×':
      computation = prev * current
      break
    case '÷':
      if (current === 0) {
        computation = 'Error'
      } else {
        computation = prev / current
      }
      break
    default:
      return
  }
  
  currentOperand = computation.toString()
  operation = undefined
  previousOperand = ''
  result.value = currentOperand
  if (final) {
    expression.value = ''
  } else {
    previousOperand = currentOperand
    currentOperand = ''
    updateDisplay()
  }
}

const clear = () => {
  currentOperand = ''
  previousOperand = ''
  operation = undefined
  expression.value = ''
  result.value = '0'
}

const toggleSign = () => {
  if (currentOperand === '') return
  currentOperand = (parseFloat(currentOperand) * -1).toString()
  result.value = currentOperand
  updateDisplay()
}

const percent = () => {
  if (currentOperand === '') return
  currentOperand = (parseFloat(currentOperand) / 100).toString()
  result.value = currentOperand
  updateDisplay()
}
</script>

<style scoped>
.calculator-wrapper {
  position: fixed;
  bottom: 20px;
  right: 20px;
  z-index: 1000;
}

.calc-fab {
  width: 56px;
  height: 56px;
  border-radius: 50%;
  background: var(--primary);
  color: white;
  border: none;
  font-size: 24px;
  cursor: pointer;
  box-shadow: var(--shadow-md);
  transition: var(--transition);
}

.calc-fab:hover {
  transform: scale(1.05);
  background: var(--primary-hover);
}

.calc-overlay {
  position: absolute;
  bottom: 70px;
  right: 0;
  width: 260px;
  background: var(--bg-card);
  border: 1px solid var(--border);
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-lg);
  overflow: hidden;
  display: flex;
  flex-direction: column;
}

.calc-header {
  background: var(--primary-faint);
  padding: 10px 15px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-weight: 600;
  color: var(--primary);
}

.close-btn {
  background: none;
  border: none;
  color: var(--primary);
  font-size: 16px;
  cursor: pointer;
}

.calc-display {
  padding: 15px;
  text-align: right;
  background: var(--bg);
  border-bottom: 1px solid var(--border);
}

.calc-expression {
  height: 20px;
  font-size: 12px;
  color: var(--text-muted);
}

.calc-result {
  font-size: 28px;
  font-weight: 700;
  color: var(--text);
  margin-top: 5px;
  overflow: hidden;
  text-overflow: ellipsis;
}

.calc-keys {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 1px;
  background: var(--border);
}

.calc-keys button {
  background: var(--bg-card);
  border: none;
  padding: 15px 0;
  font-size: 18px;
  color: var(--text);
  cursor: pointer;
  transition: var(--transition);
}

.calc-keys button:hover {
  background: var(--bg-secondary);
}

.calc-keys .wide {
  grid-column: span 2;
}

.calc-keys .btn-action {
  color: var(--primary);
  background: var(--primary-faint);
}

.calc-keys .btn-op {
  color: white;
  background: var(--primary);
}

.calc-keys .btn-equals {
  color: white;
  background: var(--primary);
}

.slide-up-enter-active,
.slide-up-leave-active {
  transition: all 0.3s ease;
  transform-origin: bottom right;
}

.slide-up-enter-from,
.slide-up-leave-to {
  opacity: 0;
  transform: scale(0.8) translateY(20px);
}
</style>
