import { useState } from 'react'
import { Zap, Clipboard, FileText, ArrowRight } from 'lucide-react'
import { Link } from 'react-router-dom'
import toast from 'react-hot-toast'
import Header from '../components/layout/Header'
import MatchScoreCard from '../components/ui/MatchScoreCard'
import LoadingSpinner from '../components/ui/LoadingSpinner'
import { aiAPI } from '../services/api'
import useAppStore from '../store/useAppStore'

export default function JobMatcher() {
  const { resumeText, resumeFilename } = useAppStore()
  const [jd, setJd] = useState('')
  const [result, setResult] = useState(null)
  const [loading, setLoading] = useState(false)

  const handleAnalyze = async () => {
    if (!resumeText.trim()) return toast.error('Please upload your resume in Job Tracker first')
    if (!jd.trim()) return toast.error('Please paste a job description')
    setLoading(true)
    setResult(null)
    try {
      const res = await aiAPI.matchAnalysis({ resume_text: resumeText, job_description: jd })
      setResult(res)
      toast.success('Analysis complete!')
    } catch (e) {
      toast.error(e.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="animate-fade-in">
      <Header
        title="AI Job Match Analyzer"
        subtitle="Compare your resume with a job description and get an instant match score"
      />

      <div className="grid lg:grid-cols-2 gap-6 mb-6">
        {/* Job Description */}
        <div className="glass-card p-6">
          <div className="flex items-center gap-2 mb-3">
            <Clipboard size={16} className="text-blue-400" />
            <label htmlFor="jd-input" className="text-white font-semibold text-sm">Job Description</label>
          </div>
          <textarea
            id="jd-input"
            value={jd}
            onChange={e => setJd(e.target.value)}
            placeholder="Paste the full job description here..."
            className="textarea-field"
            rows={12}
          />
        </div>

        {/* Resume Status */}
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
                id="resume-preview"
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
                Upload your resume in the Job Tracker to unlock AI matching.
              </p>
              <Link
                to="/tracker"
                id="go-to-tracker-btn"
                className="flex items-center gap-2 px-4 py-2 bg-blue-500/15 hover:bg-blue-500/25 border border-blue-500/30 rounded-lg text-blue-400 text-sm font-medium transition-all"
              >
                Go to Job Tracker <ArrowRight size={15} />
              </Link>
            </div>
          )}
        </div>
      </div>

      <div className="flex justify-center mb-8">
        <button
          id="analyze-match-btn"
          onClick={handleAnalyze}
          disabled={loading || !resumeText}
          className="btn-primary flex items-center gap-3 text-base px-10 py-4 disabled:opacity-50"
        >
          <Zap size={20} />
          {loading ? 'Analyzing...' : 'Analyze Match'}
        </button>
      </div>

      {loading && <LoadingSpinner size="lg" text="Gemini AI is analyzing your match..." />}

      {result && <MatchScoreCard result={result} />}
    </div>
  )
}
