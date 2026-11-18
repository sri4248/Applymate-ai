import { useState } from 'react'
import { Bot, Link, AlertTriangle, CheckCircle, Send, FileText, ArrowRight } from 'lucide-react'
import { Link as RouterLink } from 'react-router-dom'
import { motion } from 'framer-motion'
import toast from 'react-hot-toast'
import Header from '../components/layout/Header'
import LoadingSpinner from '../components/ui/LoadingSpinner'
import { aiAPI } from '../services/api'
import useAppStore from '../store/useAppStore'

export default function AutoApply() {
  const { resumeText, resumeFilename } = useAppStore()
  const [jobUrl, setJobUrl] = useState('')
  const [analysis, setAnalysis] = useState(null)
  const [loading, setLoading] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)

  const handleAnalyze = async () => {
    if (!jobUrl.trim()) return toast.error('Please enter a job URL')
    if (!resumeText.trim()) return toast.error('Please upload your resume in Job Tracker first')
    setLoading(true)
    setAnalysis(null)
    setSubmitted(false)
    try {
      const res = await aiAPI.autoApplyAnalyze({ job_url: jobUrl, resume_text: resumeText })
      setAnalysis(res)
      toast.success('Job analyzed!')
    } catch (e) {
      toast.error(e.message)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async () => {
    setSubmitting(true)
    try {
      await aiAPI.autoApplySubmit({ job_url: jobUrl, resume_text: resumeText })
      setSubmitted(true)
      toast.success('Application submitted successfully!')
    } catch (e) {
      toast.error(e.message)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="animate-fade-in">
      <Header title="Auto Job Apply" subtitle="AI analyzes the job, checks your eligibility, and applies — only after your approval" />

      {/* Warning Banner */}
      <div className="mb-6 p-4 bg-yellow-500/10 border border-yellow-500/30 rounded-2xl flex items-start gap-3">
        <AlertTriangle size={20} className="text-yellow-400 flex-shrink-0 mt-0.5" />
        <div>
          <p className="text-yellow-400 font-semibold text-sm">Important: User Approval Required</p>
          <p className="text-gray-400 text-xs mt-1">
            ApplyMate AI will NEVER submit an application without your explicit approval.
            Review the analysis before confirming.
          </p>
        </div>
      </div>

      {/* Input Section */}
      <div className="glass-card p-6 mb-6">
        <div className="space-y-4">
          {/* Job URL */}
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Link size={16} className="text-blue-400" />
              <label htmlFor="auto-apply-url" className="text-white font-semibold text-sm">Job URL</label>
            </div>
            <input
              id="auto-apply-url"
              type="url"
              value={jobUrl}
              onChange={e => setJobUrl(e.target.value)}
              placeholder="https://company.com/jobs/software-engineer"
              className="input-field"
            />
          </div>

          {/* Resume status */}
          {resumeText ? (
            <div className="p-3 bg-green-500/10 border border-green-500/30 rounded-xl">
              <p className="text-green-400 text-sm font-medium">✅ Resume loaded</p>
              {resumeFilename && <p className="text-green-300/70 text-xs mt-0.5">{resumeFilename}</p>}
              <p className="text-green-300/50 text-xs mt-1 line-clamp-2">{resumeText.slice(0, 100)}…</p>
            </div>
          ) : (
            <div className="p-4 border-2 border-dashed border-white/10 rounded-xl flex items-center justify-between gap-4">
              <div>
                <p className="text-gray-300 text-sm font-medium">No resume uploaded</p>
                <p className="text-gray-500 text-xs mt-0.5">Upload your resume in Job Tracker to enable auto-apply.</p>
              </div>
              <RouterLink
                to="/tracker"
                id="auto-apply-go-tracker-btn"
                className="flex items-center gap-2 px-3 py-2 bg-blue-500/15 hover:bg-blue-500/25 border border-blue-500/30 rounded-lg text-blue-400 text-xs font-medium transition-all whitespace-nowrap"
              >
                <FileText size={14} /> Job Tracker <ArrowRight size={13} />
              </RouterLink>
            </div>
          )}

          <button
            id="auto-apply-analyze-btn"
            onClick={handleAnalyze}
            disabled={loading || !resumeText}
            className="btn-primary flex items-center gap-2 disabled:opacity-50"
          >
            <Bot size={18} />
            {loading ? 'Applying job...' : 'Apply Job'}
          </button>
        </div>
      </div>

      {loading && <LoadingSpinner size="lg" text="AI is analyzing the job posting..." />}

      {/* Analysis Result */}
      {analysis && !submitted && (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
          <div className="glass-card p-6">
            <h3 className="text-white font-bold text-lg mb-4">📊 Job Analysis Report</h3>
            <div className="grid md:grid-cols-2 gap-4 mb-5">
              <div>
                <p className="text-gray-400 text-xs">Job Title</p>
                <p className="text-white font-semibold">{analysis.job_title}</p>
              </div>
              <div>
                <p className="text-gray-400 text-xs">Company</p>
                <p className="text-white font-semibold">{analysis.company_name}</p>
              </div>
              <div>
                <p className="text-gray-400 text-xs">Match Score</p>
                <p className={`font-bold text-xl ${analysis.match_score >= 70 ? 'text-green-400' : analysis.match_score >= 45 ? 'text-yellow-400' : 'text-red-400'}`}>
                  {Math.round(analysis.match_score)}%
                </p>
              </div>
              <div>
                <p className="text-gray-400 text-xs">Eligibility</p>
                <p className={`font-semibold ${analysis.is_eligible ? 'text-green-400' : 'text-red-400'}`}>
                  {analysis.is_eligible ? '✅ Eligible' : '❌ Not Eligible'}
                </p>
              </div>
            </div>
            <div className="p-4 bg-white/3 rounded-xl mb-4">
              <p className="text-gray-400 text-xs mb-1">Eligibility Reason</p>
              <p className="text-gray-300 text-sm">{analysis.eligibility_reason}</p>
            </div>

            {/* Approval CTA */}
            {analysis.is_eligible && (
              <div className="border border-blue-500/30 bg-blue-500/5 rounded-2xl p-5">
                <div className="flex items-center gap-3 mb-3">
                  <AlertTriangle size={20} className="text-yellow-400" />
                  <p className="text-white font-semibold">Confirm Application Submission</p>
                </div>
                <p className="text-gray-400 text-sm mb-4">
                  By clicking Submit, you authorize ApplyMate AI to submit your application for{' '}
                  <strong className="text-white">{analysis.job_title}</strong> at{' '}
                  <strong className="text-white">{analysis.company_name}</strong>.
                </p>
                <button
                  id="confirm-apply-btn"
                  onClick={handleSubmit}
                  disabled={submitting}
                  className="btn-primary flex items-center gap-2"
                >
                  <Send size={16} />
                  {submitting ? 'Submitting...' : '✅ I Approve — Submit Application'}
                </button>
              </div>
            )}
          </div>
        </motion.div>
      )}

      {/* Success State */}
      {submitted && (
        <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="glass-card p-10 text-center">
          <CheckCircle size={56} className="mx-auto text-green-400 mb-4" />
          <h3 className="text-white text-2xl font-bold mb-2">Application Submitted!</h3>
          <p className="text-gray-400">Your application has been submitted successfully.</p>
          <button
            id="apply-another-btn"
            onClick={() => { setAnalysis(null); setJobUrl(''); setSubmitted(false) }}
            className="btn-secondary mt-6"
          >
            Apply to Another Job
          </button>
        </motion.div>
      )}
    </div>
  )
}
