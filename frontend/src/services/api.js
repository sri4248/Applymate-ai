import axios from 'axios'

// When VITE_API_URL is not set, use '' (empty string = relative URL)
// This lets Vite's dev proxy forward /api/* requests to localhost:8000
// avoiding any CORS issues during development.
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '',
  timeout: 120000, // 120s — Gemini can take up to 90s, we add a buffer
  headers: {
    'Content-Type': 'application/json',
  },
})

// Request interceptor — attach JWT token if present
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('am_token')
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`
    }
    return config
  },
  (error) => Promise.reject(error)
)

// Response interceptor — unwrap data and normalize errors
api.interceptors.response.use(
  (response) => response.data,
  (error) => {
    const message = error.response?.data?.detail || error.message || 'Something went wrong'
    return Promise.reject(new Error(message))
  }
)

// Auth APIs
export const authAPI = {
  register: (data) => api.post('/api/auth/register', data),
  login: (data) => api.post('/api/auth/login', data),
  me: () => api.get('/api/auth/me'),
}

// Job Application APIs
export const jobsAPI = {
  getAll: () => api.get('/api/jobs/'),
  create: (data) => api.post('/api/jobs/', data),
  update: (id, data) => api.put(`/api/jobs/${id}`, data),
  delete: (id) => api.delete(`/api/jobs/${id}`),
  getStats: () => api.get('/api/jobs/stats'),
  uploadResume: (formData) => api.post('/api/jobs/upload-resume', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  }),
  uploadFromDrive: (data) => api.post('/api/jobs/upload-drive', data),
  getLatestResume: () => api.get('/api/jobs/resume/latest'),
}

// AI APIs
export const aiAPI = {
  matchAnalysis: (data) => api.post('/api/ai/match', data),
  prepToolkit: (data) => api.post('/api/ai/prep', data),
  analyzeEmail: (data) => api.post('/api/ai/email', data),
  resumeUpdate: (data) => api.post('/api/ai/resume-update', data),
  autoApplyAnalyze: (data) => api.post('/api/ai/auto-apply/analyze', data),
  autoApplySubmit: (data) => api.post('/api/ai/auto-apply/submit', data),
}

export default api
