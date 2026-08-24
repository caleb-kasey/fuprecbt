import axios from 'axios';
import { useAuthStore } from '../stores/auth';

/**
 * Clean Base URL by trimming trailing slashes
 */
const rawBaseURL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
const baseURL = rawBaseURL.replace(/\/+$/, '');

/**
 * Centralized Axios instance with timeout configuration
 */
const api = axios.create({
  baseURL,
  timeout: 60000, // 60s to accommodate Render free-tier cold starts
  headers: {
    'Content-Type': 'application/json',
  },
});

/**
 * Request interceptor to attach JWT Bearer token
 */
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

/**
 * Response interceptor for unified error parsing and auth management
 */
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      const authStore = useAuthStore();
      authStore.logout();
    }

    let message = 'A network error occurred. Please try again.';
    if (error.response?.data?.message) {
      message = error.response.data.message;
    } else if (error.code === 'ECONNABORTED' || error.message?.includes('timeout')) {
      message = 'Server is waking up (cold start) or request timed out. Please try again in a few seconds.';
    }

    return Promise.reject(new Error(message));
  }
);

/**
 * Register a new user
 * @param {string} name
 * @param {string} email
 * @param {string} password
 */
export const signup = async (name, email, password) => {
  return api.post('/api/auth/signup', { name, email, password });
};

/**
 * Authenticate existing user
 * @param {string} email
 * @param {string} password
 */
export const login = async (email, password) => {
  return api.post('/api/auth/login', { email, password });
};

/**
 * Fetch questions for selected subject and year
 * @param {string} subject
 * @param {string|number} year
 * @param {number} [limit=20]
 */
export const getQuestions = async (subject, year, limit = 20) => {
  return api.get('/api/questions', { params: { subject, year, limit } });
};

/**
 * Submit answers for exam grading
 * @param {Array<{ questionId: string, selectedAnswer: string|null }>} answers
 * @param {string[]} subjects
 * @param {string|number} year
 */
export const submitExam = async (answers, subjects, year) => {
  return api.post('/api/results/submit', { answers, subjects, year });
};

/**
 * Get all historical results for a user
 * @param {string} userId
 */
export const getUserResults = async (userId) => {
  return api.get(`/api/results/${userId}`);
};

/**
 * Get detailed result breakdown for review
 * @param {string} resultId
 */
export const getReview = async (resultId) => {
  return api.get(`/api/results/review/${resultId}`);
};

export default api;
