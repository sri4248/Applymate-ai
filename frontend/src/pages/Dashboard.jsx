import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  Briefcase, Zap, BookOpen, Mail, FileText, Bot,
  TrendingUp, Target, Award, Clock
} from 'lucide-react'
import {
  PieChart, Pie, Cell, Tooltip, ResponsiveContainer
} from 'recharts'
import { motion } from 'framer-motion'
import Header from '../components/layout/Header'
import StatCard from '../components/ui/StatCard'
import { jobsAPI } from '../services/api'
import useAppStore from '../store/useAppStore'
import toast from 'react-hot-toast'

const COLORS = ['#3b82f6', '#f59e0b', '#8b5cf6', '#ef4444', '#22c55e']

const featureCards = [
  { title: 'Job Tracker', desc: 'Track all your applications in one place', path: '/tracker', icon: Briefcase, color: 'from-blue-500 to-blue-600' },
  { title: 'AI Job Match', desc: 'Get instant match scores vs job descriptions', path: '/matcher', icon: Zap, color: 'from-purple-500 to-purple-600' },
  { title: 'Prep Toolkit', desc: 'AI-generated interview questions & tips', path: '/prep', icon: BookOpen, color: 'from-indigo-500 to-indigo-600' },
  { title: 'Email Analyzer', desc: 'Know if that email is an interview call', path: '/email', icon: Mail, color: 'from-pink-500 to-pink-600' },
  { title: 'Resume Updater', desc: 'Improve your resume for specific roles', path: '/resume', icon: FileText, color: 'from-orange-500 to-orange-600' },
  { title: 'Auto Apply', desc: 'Analyze jobs and apply with one click', path: '/auto-apply', icon: Bot, color: 'from-cyan-500 to-cyan-600' },
]

export default function Dashboard() {
  const { stats, setStats } = useAppStore()
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    jobsAPI.getStats()
      .then(setStats)
      .catch(() => toast.error('Could not load stats'))
      .finally(() => setLoading(false))
  }, [])

  const chartData = [
    { name: 'Applied', value: stats.applied },
    { name: 'Shortlisted', value: stats.shortlisted },
    { name: 'Interview', value: stats.interview },
    { name: 'Rejected', value: stats.rejected },
    { name: 'Offered', value: stats.offered },
  ].filter(d => d.value > 0)

  return (
    <div className="animate-fade-in">
      <Header
        title="Dashboard"
        subtitle="Welcome back! Here's your job application overview."
      />

      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-8">
        <StatCard title="Total" value={stats.total} icon={TrendingUp} color="blue" delay={0} />
        <StatCard title="Applied" value={stats.applied} icon={Briefcase} color="cyan" delay={0.05} />
        <StatCard title="Shortlisted" value={stats.shortlisted} icon={Clock} color="yellow" delay={0.1} />
        <StatCard title="Interview" value={stats.interview} icon={Target} color="purple" delay={0.15} />
        <StatCard title="Rejected" value={stats.rejected} icon={Clock} color="red" delay={0.2} />
        <StatCard title="Offered" value={stats.offered} icon={Award} color="green" delay={0.25} />
      </div>

      <div className="grid lg:grid-cols-3 gap-6 mb-8">
        {/* Chart */}
        <div className="glass-card p-6">
          <h3 className="text-gray-800 font-semibold mb-4">Application Status</h3>
          {chartData.length > 0 ? (
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie data={chartData} cx="50%" cy="50%" innerRadius={55} outerRadius={80}
                  paddingAngle={3} dataKey="value">
                  {chartData.map((_, i) => (
                    <Cell key={i} fill={COLORS[i % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    background: '#ffffff', border: '1px solid #e5e7eb',
                    borderRadius: '12px', color: '#1f2937',
                    boxShadow: '0 4px 16px rgba(0,0,0,0.08)'
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-48 flex items-center justify-center">
              <p className="text-gray-400 text-sm">No applications yet</p>
            </div>
          )}
          <div className="flex flex-wrap gap-2 mt-2">
            {['Applied','Shortlisted','Interview','Rejected','Offered'].map((label, i) => (
              <div key={label} className="flex items-center gap-1">
                <div className="w-2 h-2 rounded-full" style={{ background: COLORS[i] }} />
                <span className="text-xs text-gray-500">{label}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Quick Tips */}
        <div className="lg:col-span-2 glass-card p-6">
          <h3 className="text-gray-800 font-semibold mb-4">🚀 Quick Start Guide</h3>
          <div className="space-y-3">
            {[
              { step: '1', title: 'Upload your resume', desc: 'Go to Job Tracker → Upload Resume to get started' },
              { step: '2', title: 'Add job applications', desc: 'Track every job you apply to in the Job Tracker' },
              { step: '3', title: 'Check AI match score', desc: 'Paste a JD in AI Job Match to see how well you fit' },
              { step: '4', title: 'Prepare for interviews', desc: 'Use Prep Toolkit to generate practice questions' },
            ].map(item => (
              <div key={item.step} className="flex items-start gap-3 p-3 rounded-xl bg-gray-50 border border-gray-100">
                <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center flex-shrink-0">
                  <span className="text-white text-xs font-bold">{item.step}</span>
                </div>
                <div>
                  <p className="text-gray-800 text-sm font-medium">{item.title}</p>
                  <p className="text-gray-500 text-xs">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Feature Cards */}
      <h3 className="text-gray-800 font-semibold mb-4">All Features</h3>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {featureCards.map((card, i) => (
          <motion.div
            key={card.path}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.08 }}
          >
            <Link
              to={card.path}
              className="glass-card-hover p-5 flex items-start gap-4 block group"
            >
              <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${card.color} flex items-center justify-center flex-shrink-0 shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                <card.icon size={22} className="text-white" />
              </div>
              <div>
                <h4 className="text-gray-800 font-semibold text-sm">{card.title}</h4>
                <p className="text-gray-500 text-xs mt-1">{card.desc}</p>
              </div>
            </Link>
          </motion.div>
        ))}
      </div>
    </div>
  )
}
