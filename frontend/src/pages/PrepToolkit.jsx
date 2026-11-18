import { useState } from 'react'
import { BookOpen, ChevronDown, ChevronUp } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import toast from 'react-hot-toast'
import Header from '../components/layout/Header'
import LoadingSpinner from '../components/ui/LoadingSpinner'
import { aiAPI } from '../services/api'
import useAppStore from '../store/useAppStore'

function Section({ title, items, color, expanded, onToggle, id }) {
  return (
    <div className="glass-card overflow-hidden">
      <button
        id={id}
        onClick={onToggle}
        className={`w-full flex items-center justify-between p-5 text-left hover:bg-white/3 transition-colors`}
      >
        <h3 className={`font-semibold text-sm ${color}`}>{title} ({items.length})</h3>
        {expanded ? <ChevronUp size={16} className="text-gray-400" /> : <ChevronDown size={16} className="text-gray-400" />}
      </button>
      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0 }}
            animate={{ height: 'auto' }}
            exit={{ height: 0 }}
            className="overflow-hidden"
          >
            <div className="px-5 pb-5 space-y-2">
              {items.map((item, i) => (
                <div key={i} className="flex items-start gap-3 p-3 bg-white/3 rounded-xl">
                  <span className="w-6 h-6 rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center flex-shrink-0 text-white text-xs font-bold">{i + 1}</span>
                  <p className="text-gray-300 text-sm leading-relaxed">{item}</p>
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

export default function PrepToolkit() {
  const { resumeText } = useAppStore()
  const [jd, setJd] = useState('')
  const [result, setResult] = useState(null)
  const [loading, setLoading] = useState(false)
  const [expanded, setExpanded] = useState({ tech: true, aptitude: false, tips: false })

  const handleGenerate = async () => {
    if (!jd.trim()) return toast.error('Please paste a job description')
    setLoading(true)
    setResult(null)
    try {
      const res = await aiAPI.prepToolkit({ job_description: jd, resume_text: resumeText })
      setResult(res)
      toast.success('Prep material generated!')
    } catch (e) {
      toast.error(e.message)
    } finally {
      setLoading(false)
    }
  }

  const toggle = (key) => setExpanded(prev => ({ ...prev, [key]: !prev[key] }))

  return (
    <div className="animate-fade-in">
      <Header title="Interview Prep Toolkit" subtitle="Get AI-generated questions, topics and tips based on the job description" />

      <div className="glass-card p-6 mb-6">
        <label className="text-white font-semibold text-sm mb-3 block">Job Description</label>
        <textarea
          id="prep-jd-input"
          value={jd}
          onChange={e => setJd(e.target.value)}
          placeholder="Paste the job description here..."
          className="textarea-field mb-4"
          rows={8}
        />
        <button id="generate-prep-btn" onClick={handleGenerate} disabled={loading} className="btn-primary flex items-center gap-2">
          <BookOpen size={18} />
          {loading ? 'Generating...' : 'Generate Prep Material'}
        </button>
      </div>

      {loading && <LoadingSpinner size="lg" text="Gemini AI is preparing your interview kit..." />}

      {result && (
        <div className="space-y-4">
          {result.estimated_difficulty && (
            <div className="flex items-center gap-3 glass-card p-4">
              <span className="text-gray-400 text-sm">Estimated Difficulty:</span>
              <span className={`font-semibold text-sm
                ${ result.estimated_difficulty === 'Hard' ? 'text-red-400' :
                   result.estimated_difficulty === 'Medium' ? 'text-yellow-400' : 'text-green-400'}`}>
                {result.estimated_difficulty}
              </span>
            </div>
          )}
          <Section title="Technical Questions" items={result.technical_questions || []} color="text-blue-400"
            expanded={expanded.tech} onToggle={() => toggle('tech')} id="section-tech" />
          <Section title="Aptitude Topics to Study" items={result.aptitude_topics || []} color="text-purple-400"
            expanded={expanded.aptitude} onToggle={() => toggle('aptitude')} id="section-aptitude" />
          <Section title="Preparation Tips" items={result.preparation_tips || []} color="text-green-400"
            expanded={expanded.tips} onToggle={() => toggle('tips')} id="section-tips" />
        </div>
      )}
    </div>
  )
}
