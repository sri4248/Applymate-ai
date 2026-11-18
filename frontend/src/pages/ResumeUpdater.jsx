import { useState } from 'react'
import { FileText, Lightbulb, Tag, Layers, ArrowRight } from 'lucide-react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import toast from 'react-hot-toast'
import Header from '../components/layout/Header'
import LoadingSpinner from '../components/ui/LoadingSpinner'
import { aiAPI } from '../services/api'
import useAppStore from '../store/useAppStore'

export default function ResumeUpdater() {
  const { resumeText, resumeFilename } = useAppStore()
  const [jd, setJd] = useState('')
  const [result, setResult] = useState(null)
  const [loading, setLoading] = useState(false)

  const handleAnalyze = async () => {
    if (!resumeText.trim()) return toast.error('Please upload your resume in Job Tracker first')
    if (!jd.trim()) return toast.error('Please paste the job description')
    setLoading(true)
    setResult(null)
    try {
      const res = await aiAPI.resumeUpdate({ resume_text: resumeText, job_description: jd })
      setResult(res)
      toast.success('Resume analysis complete!')
    } catch (e) {
      toast.error(e.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="animate-fade-in">
      <Header title="AI Resume Updater" subtitle="Get smart suggestions to tailor your resume for a specific job description" />

      <div className="grid lg:grid-cols-2 gap-6 mb-6">
        {/* Resume panel */}
        <div className="glass-card p-6 flex flex-col">
          <div className="flex items-center gap-2 mb-3">
            <FileText size={16} className="text-blue-400" />
            <span className="text-white font-semibold text-sm">Your Resume</span>
          </div>

          {resumeText ? (
            <div className="flex-1 flex flex-col">
              <div className="p-3 bg-green-500/10 border border-green-500/30 rounded-xl mb-3">
                <p className="text-green-400 text-sm font-medium">✅ Resume loaded</p>
                {resumeFilename && <p className="text-green-300/70 text-xs mt-0.5">{resumeFilename}</p>}
              </div>
              <textarea
                id="resume-updater-text"
                value={resumeText}
                readOnly
                className="textarea-field flex-1 opacity-60 cursor-default text-xs"
                rows={9}
              />
            </div>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-center p-6 border-2 border-dashed border-white/10 rounded-xl">
              <FileText size={36} className="text-gray-500 mb-3" />
              <p className="text-gray-300 text-sm font-medium mb-1">No resume uploaded yet</p>
              <p className="text-gray-500 text-xs mb-4">
                Upload your resume in the Job Tracker to get tailored suggestions.
              </p>
              <Link
                to="/tracker"
                id="go-to-tracker-resume-btn"
                className="flex items-center gap-2 px-4 py-2 bg-blue-500/15 hover:bg-blue-500/25 border border-blue-500/30 rounded-lg text-blue-400 text-sm font-medium transition-all"
              >
                Go to Job Tracker <ArrowRight size={15} />
              </Link>
            </div>
          )}
        </div>

        {/* Job Description */}
        <div className="glass-card p-6">
          <label className="text-white font-semibold text-sm mb-3 block">Target Job Description</label>
          <textarea
            id="resume-updater-jd"
            value={jd}
            onChange={e => setJd(e.target.value)}
            placeholder="Paste the job description you're targeting..."
            className="textarea-field"
            rows={12}
          />
        </div>
      </div>

      <div className="flex justify-center mb-8">
        <button
          id="update-resume-btn"
          onClick={handleAnalyze}
          disabled={loading || !resumeText}
          className="btn-primary flex items-center gap-3 text-base px-10 py-4 disabled:opacity-50"
        >
          <FileText size={20} />
          {loading ? 'Analyzing...' : 'Get Resume Suggestions'}
        </button>
      </div>

      {loading && <LoadingSpinner size="lg" text="Gemini AI is reviewing your resume..." />}

      {result && (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
          {/* Overall Feedback */}
          <div className="glass-card p-5 border border-blue-500/20">
            <h3 className="text-blue-400 font-semibold mb-2 flex items-center gap-2"><Layers size={16} /> Overall Feedback</h3>
            <p className="text-gray-300 text-sm leading-relaxed">{result.overall_feedback}</p>
          </div>

          <div className="grid md:grid-cols-3 gap-4">
            {/* Suggestions */}
            <div className="glass-card p-5">
              <h3 className="text-yellow-400 font-semibold mb-3 flex items-center gap-2"><Lightbulb size={15} /> Improvement Suggestions</h3>
              <ul className="space-y-2">
                {result.suggestions?.map((s, i) => (
                  <li key={i} className="text-gray-300 text-xs flex items-start gap-2">
                    <span className="text-yellow-400 mt-0.5">→</span> {s}
                  </li>
                ))}
              </ul>
            </div>

            {/* Keywords */}
            <div className="glass-card p-5">
              <h3 className="text-green-400 font-semibold mb-3 flex items-center gap-2"><Tag size={15} /> Keywords to Add</h3>
              <div className="flex flex-wrap gap-2">
                {result.keywords_to_add?.map((kw, i) => (
                  <span key={i} className="px-2 py-1 bg-green-500/10 border border-green-500/20 text-green-400 text-xs rounded-lg">{kw}</span>
                ))}
              </div>
            </div>

            {/* Sections */}
            <div className="glass-card p-5">
              <h3 className="text-purple-400 font-semibold mb-3 flex items-center gap-2"><FileText size={15} /> Sections to Improve</h3>
              <ul className="space-y-2">
                {result.sections_to_improve?.map((s, i) => (
                  <li key={i} className="text-gray-300 text-xs flex items-start gap-2">
                    <span className="text-purple-400 mt-0.5">▸</span> {s}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </motion.div>
      )}
    </div>
  )
}
