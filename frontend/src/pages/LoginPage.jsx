import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { Eye, EyeOff, Mail, Lock, User, Zap, LogIn, UserPlus, CheckCircle, AlertTriangle } from 'lucide-react'
import { authAPI } from '../services/api'
import useAppStore from '../store/useAppStore'
import toast from 'react-hot-toast'
import api from '../services/api'

const features = [
  'AI-powered job match scoring',
  'Smart interview prep toolkit',
  'Resume tailoring suggestions',
  'Auto-apply with one click',
  'Email recruitment analyzer',
]

export default function LoginPage() {
  const navigate = useNavigate()
  const { setUser, setToken } = useAppStore()

  const [tab, setTab] = useState('login') // 'login' | 'register'
  const [loading, setLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [backendStatus, setBackendStatus] = useState('checking') // 'checking' | 'ok' | 'down'

  const [form, setForm] = useState({ name: '', email: '', password: '' })
  const [errors, setErrors] = useState({})

  // Ping backend health on mount
  useEffect(() => {
    api.get('/health')
      .then(() => setBackendStatus('ok'))
      .catch(() => setBackendStatus('down'))
  }, [])

  const handleChange = (e) => {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }))
    setErrors(prev => ({ ...prev, [e.target.name]: '' }))
  }

  const validate = () => {
    const errs = {}
    if (tab === 'register' && !form.name.trim()) errs.name = 'Name is required'
    if (!form.email.trim()) errs.email = 'Email is required'
    else if (!/\S+@\S+\.\S+/.test(form.email)) errs.email = 'Enter a valid email'
    if (!form.password) errs.password = 'Password is required'
    else if (form.password.length < 6) errs.password = 'At least 6 characters'
    return errs
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    const errs = validate()
    if (Object.keys(errs).length) { setErrors(errs); return }

    setLoading(true)
    try {
      const fn = tab === 'login' ? authAPI.login : authAPI.register
      const payload = tab === 'login'
        ? { email: form.email, password: form.password }
        : { name: form.name, email: form.email, password: form.password }

      const res = await fn(payload)
      setToken(res.access_token)
      setUser(res.user)
      toast.success(tab === 'login' ? `Welcome back, ${res.user.name}! 👋` : `Account created! Welcome, ${res.user.name}! 🎉`)
      navigate('/')
    } catch (err) {
      const msg = err.message || 'Something went wrong'
      // Network/CORS error — backend is likely not running
      if (msg === 'Network Error' || msg.includes('ERR_CONNECTION_REFUSED') || msg.includes('ERR_NETWORK')) {
        toast.error('⚠️ Cannot connect to server. Make sure the backend is running on port 8000.')
      } else {
        toast.error(msg)
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex" style={{ background: 'linear-gradient(135deg, #f8faff 0%, #f0f4ff 100%)' }}>

      {/* ── LEFT: Hero Panel ── */}
      <div
        className="hidden lg:flex flex-col justify-between w-[46%] p-12 relative overflow-hidden"
        style={{ background: 'linear-gradient(135deg, #2563eb 0%, #7c3aed 60%, #4f46e5 100%)' }}
      >
        {/* Background blobs */}
        <div className="absolute top-[-80px] left-[-80px] w-80 h-80 rounded-full opacity-20"
          style={{ background: 'radial-gradient(circle, #fff 0%, transparent 70%)' }} />
        <div className="absolute bottom-[-60px] right-[-60px] w-96 h-96 rounded-full opacity-10"
          style={{ background: 'radial-gradient(circle, #fff 0%, transparent 70%)' }} />

        {/* Logo */}
        <div className="flex items-center gap-3 relative z-10">
          <div className="w-11 h-11 rounded-2xl bg-white/20 backdrop-blur flex items-center justify-center shadow-lg">
            <span className="text-white font-black text-lg">AM</span>
          </div>
          <div>
            <h1 className="text-white font-black text-xl tracking-tight">ApplyMate AI</h1>
            <p className="text-blue-200 text-xs font-medium">Smart Job Assistant</p>
          </div>
        </div>

        {/* Hero content */}
        <div className="relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7 }}
          >
            <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur rounded-full px-4 py-2 mb-6">
              <Zap size={14} className="text-yellow-300" />
              <span className="text-white text-xs font-semibold">Powered by Gemini AI</span>
            </div>
            <h2 className="text-4xl font-black text-white leading-tight mb-4">
              Land your dream<br />
              <span className="text-transparent bg-clip-text" style={{ backgroundImage: 'linear-gradient(to right, #fde68a, #f9a8d4)' }}>
                job faster
              </span>
            </h2>
            <p className="text-blue-100 text-base leading-relaxed mb-8">
              Your AI-powered career companion that tracks applications, preps you for interviews, and tailors your resume automatically.
            </p>

            <div className="space-y-3">
              {features.map((f, i) => (
                <motion.div
                  key={f}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.3 + i * 0.1 }}
                  className="flex items-center gap-3"
                >
                  <CheckCircle size={16} className="text-green-300 flex-shrink-0" />
                  <span className="text-blue-100 text-sm">{f}</span>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>

        {/* Bottom quote */}
        <div className="relative z-10">
          <div className="bg-white/10 backdrop-blur rounded-2xl p-5">
            <p className="text-white/90 text-sm italic leading-relaxed">
              "ApplyMate helped me land 3 interviews in my first week. The AI match score alone saved me hours of guessing."
            </p>
            <div className="flex items-center gap-2 mt-3">
              <div className="w-7 h-7 rounded-full bg-gradient-to-br from-yellow-400 to-orange-500 flex items-center justify-center">
                <span className="text-white text-xs font-bold">S</span>
              </div>
              <div>
                <p className="text-white text-xs font-semibold">Srila K.</p>
                <p className="text-blue-200 text-xs">Software Engineer</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── RIGHT: Auth Form ── */}
      <div className="flex-1 flex items-center justify-center p-6 lg:p-12">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-md"
        >
          {/* Mobile logo */}
          <div className="flex items-center gap-3 mb-8 lg:hidden">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center shadow-lg">
              <span className="text-white font-black text-sm">AM</span>
            </div>
            <div>
              <h1 className="font-black text-gray-800 text-lg">ApplyMate AI</h1>
              <p className="text-gray-400 text-xs">Smart Job Assistant</p>
            </div>
          </div>

          {/* Tab switcher */}
          <div className="bg-gray-100 rounded-2xl p-1.5 flex mb-4 shadow-inner">
            {[
              { id: 'login', label: 'Sign In', icon: LogIn },
              { id: 'register', label: 'Sign Up', icon: UserPlus },
            ].map(({ id, label, icon: Icon }) => (
              <button
                key={id}
                onClick={() => { setTab(id); setErrors({}); setForm({ name: '', email: '', password: '' }) }}
                className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl font-semibold text-sm transition-all duration-300 ${
                  tab === id
                    ? 'bg-white text-gray-800 shadow-md'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                <Icon size={15} />
                {label}
              </button>
            ))}
          </div>

          {/* Backend status banner */}
          {backendStatus === 'down' && (
            <div className="mb-5 p-3 rounded-xl bg-red-50 border border-red-200 flex items-start gap-2">
              <AlertTriangle size={16} className="text-red-500 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-red-700 font-semibold text-xs">Backend server is not running</p>
                <p className="text-red-500 text-xs mt-0.5">
                  Start the backend: <code className="bg-red-100 px-1 rounded">cd backend &amp;&amp; start.bat</code>
                </p>
              </div>
            </div>
          )}
          {backendStatus === 'checking' && (
            <div className="mb-5 p-3 rounded-xl bg-blue-50 border border-blue-100 flex items-center gap-2">
              <svg className="animate-spin h-4 w-4 text-blue-400" viewBox="0 0 24 24" fill="none">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
              <p className="text-blue-500 text-xs font-medium">Connecting to server...</p>
            </div>
          )}

          {/* Heading */}
          <AnimatePresence mode="wait">
            <motion.div
              key={tab}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
              className="mb-7"
            >
              <h2 className="text-2xl font-black text-gray-800">
                {tab === 'login' ? 'Welcome back 👋' : 'Create your account ✨'}
              </h2>
              <p className="text-gray-500 text-sm mt-1">
                {tab === 'login'
                  ? 'Sign in to continue to your dashboard'
                  : 'Join thousands of job seekers using AI'}
              </p>
            </motion.div>
          </AnimatePresence>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-5">
            <AnimatePresence>
              {tab === 'register' && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.25 }}
                >
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">Full Name</label>
                  <div className="relative">
                    <User size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input
                      type="text"
                      name="name"
                      value={form.name}
                      onChange={handleChange}
                      placeholder="John Doe"
                      className={`w-full pl-10 pr-4 py-3 rounded-xl border text-sm font-medium text-gray-800 placeholder-gray-400 bg-white shadow-sm transition-all duration-200
                        focus:outline-none focus:ring-2 focus:ring-blue-500/40 focus:border-blue-500
                        ${errors.name ? 'border-red-400 ring-2 ring-red-400/20' : 'border-gray-200'}`}
                    />
                  </div>
                  {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name}</p>}
                </motion.div>
              )}
            </AnimatePresence>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">Email Address</label>
              <div className="relative">
                <Mail size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="email"
                  name="email"
                  value={form.email}
                  onChange={handleChange}
                  placeholder="you@example.com"
                  className={`w-full pl-10 pr-4 py-3 rounded-xl border text-sm font-medium text-gray-800 placeholder-gray-400 bg-white shadow-sm transition-all duration-200
                    focus:outline-none focus:ring-2 focus:ring-blue-500/40 focus:border-blue-500
                    ${errors.email ? 'border-red-400 ring-2 ring-red-400/20' : 'border-gray-200'}`}
                />
              </div>
              {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email}</p>}
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">Password</label>
              <div className="relative">
                <Lock size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  value={form.password}
                  onChange={handleChange}
                  placeholder={tab === 'register' ? 'Min 6 characters' : '••••••••'}
                  className={`w-full pl-10 pr-11 py-3 rounded-xl border text-sm font-medium text-gray-800 placeholder-gray-400 bg-white shadow-sm transition-all duration-200
                    focus:outline-none focus:ring-2 focus:ring-blue-500/40 focus:border-blue-500
                    ${errors.password ? 'border-red-400 ring-2 ring-red-400/20' : 'border-gray-200'}`}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(p => !p)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
              {errors.password && <p className="text-red-500 text-xs mt-1">{errors.password}</p>}
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 rounded-xl font-bold text-white text-sm shadow-lg transition-all duration-300 hover:scale-[1.02] active:scale-95 disabled:opacity-60 disabled:cursor-not-allowed disabled:hover:scale-100"
              style={{ background: loading ? '#94a3b8' : 'linear-gradient(135deg, #2563eb, #7c3aed)' }}
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  {tab === 'login' ? 'Signing in…' : 'Creating account…'}
                </span>
              ) : (
                tab === 'login' ? 'Sign In to Dashboard →' : 'Create Account →'
              )}
            </button>
          </form>

          <p className="text-center text-gray-400 text-sm mt-6">
            {tab === 'login' ? "Don't have an account?" : 'Already have an account?'}{' '}
            <button
              onClick={() => { setTab(tab === 'login' ? 'register' : 'login'); setErrors({}); setForm({ name: '', email: '', password: '' }) }}
              className="text-blue-600 font-semibold hover:text-purple-600 transition-colors"
            >
              {tab === 'login' ? 'Sign up for free' : 'Sign in'}
            </button>
          </p>
        </motion.div>
      </div>
    </div>
  )
}
