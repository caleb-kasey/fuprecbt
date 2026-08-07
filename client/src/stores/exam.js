import { defineStore } from 'pinia'

const defaultState = {
  questions: [],
  currentIndex: 0,
  answers: {},
  selectedSubjects: ['english', 'mathematics'],
  selectedYear: '',
  timeRemaining: 0,
  examStarted: false,
  examSubmitted: false,
  result: null
}

const savedState = localStorage.getItem('examState')
const initialState = savedState ? JSON.parse(savedState) : defaultState

export const useExamStore = defineStore('exam', {
  state: () => initialState,
  getters: {
    currentQuestion: (state) => state.questions[state.currentIndex],
    totalQuestions: (state) => state.questions.length,
    answeredCount: (state) => Object.keys(state.answers).length,
    progressPercent: (state) => {
      if (state.questions.length === 0) return 0
      return (Object.keys(state.answers).length / state.questions.length) * 100
    },
    timeAllowed: (state) => state.questions.length * 1.5 * 60
  },
  actions: {
    setQuestions(q) {
      this.questions = q
      this.timeRemaining = this.timeAllowed
    },
    setAnswer(questionId, answer) {
      this.answers[questionId] = answer
    },
    nextQuestion() {
      if (this.currentIndex < this.questions.length - 1) {
        this.currentIndex++
      }
    },
    prevQuestion() {
      if (this.currentIndex > 0) {
        this.currentIndex--
      }
    },
    goToQuestion(index) {
      if (index >= 0 && index < this.questions.length) {
        this.currentIndex = index
      }
    },
    setSubjects(subjects) {
      this.selectedSubjects = subjects
    },
    setYear(year) {
      this.selectedYear = year
    },
    setResult(result) {
      this.result = result
    },
    resetExam() {
      this.questions = []
      this.currentIndex = 0
      this.answers = {}
      this.timeRemaining = 0
      this.examStarted = false
      this.examSubmitted = false
      this.result = null
      localStorage.removeItem('examState')
    }
  }
})
