import axios from 'axios'
import { useAuthStore } from '../stores/auth'
import router from '../router'

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000',
  timeout: 10000
})

api.interceptors.request.use(config => {
  const token = localStorage.getItem('token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

api.interceptors.response.use(
  response => response,
  error => {
    if (error.response && error.response.status === 401) {
      const authStore = useAuthStore()
      authStore.logout()
    }
    const message = error.response?.data?.message || 'A network error occurred. Please try again.'
    return Promise.reject(new Error(message))
  }
)

export const signup = async (name, email, password) => {
  return api.post('/api/auth/signup', { name, email, password })
}

export const login = async (email, password) => {
  return api.post('/api/auth/login', { email, password })
}

export const getQuestions = async (subject, year) => {
  return api.get('/api/questions', { params: { subject, year } })
}

export const submitExam = async (answers, subjects, year) => {
  return api.post('/api/results/submit', { answers, subjects, year })
}

export const getUserResults = async (userId) => {
  return api.get(`/api/results/${userId}`)
}

export const getReview = async (resultId) => {
  return api.get(`/api/results/review/${resultId}`)
}
