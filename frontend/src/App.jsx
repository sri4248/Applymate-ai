import { useEffect } from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import Layout from './components/layout/Layout'
import ProtectedRoute from './components/auth/ProtectedRoute'
import LoginPage from './pages/LoginPage'
import Dashboard from './pages/Dashboard'
import JobTracker from './pages/JobTracker'
import JobMatcher from './pages/JobMatcher'
import PrepToolkit from './pages/PrepToolkit'
import EmailAnalyzer from './pages/EmailAnalyzer'
import ResumeUpdater from './pages/ResumeUpdater'
import AutoApply from './pages/AutoApply'
import { jobsAPI, authAPI } from './services/api'
import useAppStore from './store/useAppStore'

export default function App() {
  const { resumeFilename, setResumeText, setResumeFilename, token, setUser, logout } = useAppStore()

  // On first load, validate token and restore user from backend
  useEffect(() => {
    if (token) {
      authAPI.me()
        .then(user => setUser(user))
        .catch(() => logout()) // Token expired or invalid — clear auth
    }
  }, [])

  // On first load, silently restore the latest resume from the backend
  useEffect(() => {
    if (!resumeFilename && token) {
      jobsAPI.getLatestResume()
        .then(res => {
          if (res?.extracted_text) {
            setResumeText(res.extracted_text)
            setResumeFilename(res.filename)
          }
        })
        .catch(() => {}) // No resume uploaded yet — that's fine
    }
  }, [])

  return (
    <BrowserRouter>
      <Routes>
        {/* Public route */}
        <Route path="/login" element={<LoginPage />} />

        {/* Protected routes */}
        <Route element={<ProtectedRoute />}>
          <Route path="/" element={<Layout />}>
            <Route index element={<Dashboard />} />
            <Route path="tracker" element={<JobTracker />} />
            <Route path="matcher" element={<JobMatcher />} />
            <Route path="prep" element={<PrepToolkit />} />
            <Route path="email" element={<EmailAnalyzer />} />
            <Route path="resume" element={<ResumeUpdater />} />
            <Route path="auto-apply" element={<AutoApply />} />
          </Route>
        </Route>

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  )
}
