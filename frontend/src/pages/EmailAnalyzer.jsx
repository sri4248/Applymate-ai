import { useState } from 'react'
import { Mail, AlertCircle, CheckCircle, XCircle, Info } from 'lucide-react'
import { motion } from 'framer-motion'
import toast from 'react-hot-toast'
import Header from '../components/layout/Header'
import LoadingSpinner from '../components/ui/LoadingSpinner'
import { aiAPI } from '../services/api'

const EMAIL_TYPE_CONFIG = {
  interview_call: { label: 'Interview Call! 🎉', color: 'text-green-400', bg: 'bg-green-500/10 border-green-500/30', icon: CheckCircle },
  assessment: { label: 'Assessment Invitation', color: 'text-yellow-400', bg: 'bg-yellow-500/10 border-yellow-500/30', icon: AlertCircle },
  rejection: { label: 'Rejection Email', color: 'text-red-400', bg: 'bg-red-500/10 border-red-500/30', icon: XCircle },
  offer: { label: 'Job Offer! 🏆', color: 'text-green-400', bg: 'bg-green-500/10 border-green-500/30', icon: CheckCircle },
  follow_up: { label: 'Follow-up Required', color: 'text-blue-400', bg: 'bg-blue-500/10 border-blue-500/30', icon: Info },
  other: { label: 'Other Email', color: 'text-gray-400', bg: 'bg-gray-500/10 border-gray-500/30', icon: Mail },
}

export default function EmailAnalyzer() {
  const [emailText, setEmailText] = useState('')
  const [result, setResult] = useState(null)
  const [loading, setLoading] = useState(false)

  const handleAnalyze = async () => {
    if (!emailText.trim()) return toast.error('Please paste the email content')
    setLoading(true)
    setResult(null)
    try {
      const res = await aiAPI.analyzeEmail({ email_content: emailText })
      setResult(res)
      toast.success('Email analyzed!')
    } catch (e) {
      toast.error(e.message)
    } finally {
      setLoading(false)
    }
  }

  const config = result ? (EMAIL_TYPE_CONFIG[result.email_type] || EMAIL_TYPE_CONFIG.other) : null

  return (
    <div className="animate-fade-in">
      <Header title="AI Email Analyzer" subtitle="Paste any recruitment email to instantly know if it's an interview, assessment, rejection or offer" />

      <div className="glass-card p-6 mb-6">
        <label className="text-white font-semibold text-sm mb-3 block">Email Content</label>
        <textarea
          id="email-input"
          value={emailText}
          onChange={e => setEmailText(e.target.value)}
          placeholder="Paste the recruitment email content here..."
          className="textarea-field mb-4"
          rows={12}
        />
        <button id="analyze-email-btn" onClick={handleAnalyze} disabled={loading} className="btn-primary flex items-center gap-2">
          <Mail size={18} />
          {loading ? 'Analyzing...' : 'Analyze Email'}
        </button>
      </div>

      {loading && <LoadingSpinner size="lg" text="Gemini AI is reading your email..." />}

      {result && config && (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
          {/* Email Type Banner */}
          <div className={`border rounded-2xl p-5 ${config.bg} flex items-center gap-4`}>
            <config.icon size={32} className={config.color} />
            <div>
              <h3 className={`text-xl font-bold ${config.color}`}>{config.label}</h3>
              {result.company_name && <p className="text-gray-300 text-sm mt-1">From: {result.company_name}</p>}
            </div>
            <div className="ml-auto">
              <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${config.bg} ${config.color}`}>
                {result.sentiment}
              </span>
            </div>
          </div>

          {/* Details */}
          <div className="grid md:grid-cols-2 gap-4">
            <div className="glass-card p-5">
              <h4 className="text-white font-semibold text-sm mb-3">📋 Summary</h4>
              <p className="text-gray-300 text-sm leading-relaxed">{result.summary}</p>
            </div>
            <div className="glass-card p-5">
              <h4 className="text-white font-semibold text-sm mb-3">✅ Action Required</h4>
              <p className="text-gray-300 text-sm leading-relaxed">{result.action_required}</p>
              {result.deadline && (
                <div className="mt-3 p-3 bg-yellow-500/10 border border-yellow-500/30 rounded-xl">
                  <p className="text-yellow-400 text-xs font-semibold">⏰ Deadline: {result.deadline}</p>
                </div>
              )}
            </div>
          </div>
        </motion.div>
      )}
    </div>
  )
}
