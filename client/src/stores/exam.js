import { defineStore } from 'pinia';

const getDefaultState = () => ({
  questions: [],
  currentIndex: 0,
  answers: {},
  selectedSubjects: ['english', 'mathematics'],
  selectedYear: '',
  timeRemaining: 0,
  examStarted: false,
  examSubmitted: false,
  result: null,
});

const loadInitialState = () => {
  try {
    const savedState = localStorage.getItem('examState');
    if (savedState) {
      return JSON.parse(savedState);
    }
  } catch (error) {
    console.error('Failed to load stored exam state:', error);
  }
  return getDefaultState();
};

export const useExamStore = defineStore('exam', {
  state: () => loadInitialState(),

  getters: {
    currentQuestion: (state) => state.questions[state.currentIndex] || null,
    totalQuestions: (state) => state.questions.length,
    answeredCount: (state) => Object.keys(state.answers).length,
    progressPercent: (state) => {
      if (state.questions.length === 0) return 0;
      return (Object.keys(state.answers).length / state.questions.length) * 100;
    },
    timeAllowed: (state) => state.questions.length * 1.5 * 60,
  },

  actions: {
    setQuestions(questions) {
      this.questions = questions || [];
      this.timeRemaining = this.timeAllowed;
    },

    setAnswer(questionId, answer) {
      this.answers[questionId] = answer;
    },

    nextQuestion() {
      if (this.currentIndex < this.questions.length - 1) {
        this.currentIndex++;
      }
    },

    prevQuestion() {
      if (this.currentIndex > 0) {
        this.currentIndex--;
      }
    },

    goToQuestion(index) {
      if (index >= 0 && index < this.questions.length) {
        this.currentIndex = index;
      }
    },

    setSubjects(subjects) {
      this.selectedSubjects = subjects;
    },

    setYear(year) {
      this.selectedYear = year;
    },

    setResult(result) {
      this.result = result;
    },

    resetExam() {
      const defaultState = getDefaultState();
      Object.assign(this, defaultState);
      localStorage.removeItem('examState');
    },
  },
});
