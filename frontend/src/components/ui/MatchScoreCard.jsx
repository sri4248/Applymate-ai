import { motion } from 'framer-motion'

function ScoreRing({ score }) {
  const radius = 45
  const circumference = 2 * Math.PI * radius
  const strokeDashoffset = circumference - (score / 100) * circumference

  const color = score >= 70 ? '#22c55e' : score >= 45 ? '#f59e0b' : '#ef4444'
  const label = score >= 70 ? 'Great Match!' : score >= 45 ? 'Moderate Match' : 'Low Match'

  return (
    <div className="flex flex-col items-center gap-3">
      <div className="relative w-32 h-32">
        <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
          <circle cx="50" cy="50" r={radius} fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="8" />
          <motion.circle
            cx="50" cy="50" r={radius}
            fill="none"
            stroke={color}
            strokeWidth="8"
            strokeLinecap="round"
            strokeDasharray={circumference}
            initial={{ strokeDashoffset: circumference }}
            animate={{ strokeDashoffset }}
            transition={{ duration: 1.5, ease: 'easeOut' }}
            style={{ filter: `drop-shadow(0 0 8px ${color})` }}
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <motion.span
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="text-3xl font-bold text-white"
          >
            {score}%
          </motion.span>
        </div>
      </div>
      <span className="text-sm font-semibold" style={{ color }}>{label}</span>
    </div>
  )
}

export default function MatchScoreCard({ result }) {
  if (!result) return null

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="glass-card p-6"
    >
      <div className="grid md:grid-cols-3 gap-6 items-start">
        {/* Score Ring */}
        <div className="flex justify-center">
          <ScoreRing score={Math.round(result.match_score)} />
        </div>

        {/* Matching Skills */}
        <div>
          <h4 className="text-green-400 font-semibold text-sm mb-3 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-green-400" /> Matching Skills
          </h4>
          <div className="flex flex-wrap gap-2">
            {result.matching_skills?.map((skill, i) => (
              <span key={i} className="px-2 py-1 bg-green-500/10 border border-green-500/20 text-green-400 text-xs rounded-lg">
                {skill}
              </span>
            ))}
          </div>
        </div>

        {/* Missing Skills */}
        <div>
          <h4 className="text-red-400 font-semibold text-sm mb-3 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-red-400" /> Missing Skills
          </h4>
          <div className="flex flex-wrap gap-2">
            {result.missing_skills?.map((skill, i) => (
              <span key={i} className="px-2 py-1 bg-red-500/10 border border-red-500/20 text-red-400 text-xs rounded-lg">
                {skill}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Summary */}
      <div className="mt-5 pt-5 border-t border-white/10">
        <p className="text-gray-300 text-sm leading-relaxed">{result.summary}</p>
        <div className="mt-3 flex items-center gap-2">
          <span className="text-xs text-gray-500">Recommendation:</span>
          <span className={`text-xs font-semibold uppercase tracking-wide
            ${result.recommendation === 'apply' ? 'text-green-400' :
              result.recommendation === 'consider' ? 'text-yellow-400' : 'text-red-400'}`}>
            {result.recommendation}
          </span>
        </div>
      </div>
    </motion.div>
  )
}
