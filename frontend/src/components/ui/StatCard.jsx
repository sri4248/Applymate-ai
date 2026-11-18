import { motion } from 'framer-motion'

export default function StatCard({ title, value, icon: Icon, color, subtitle, delay = 0 }) {
  const colorMap = {
    blue: {
      bg: 'from-blue-50 to-blue-100/50',
      border: 'border-blue-200',
      icon: 'bg-blue-100 text-blue-600',
      text: 'text-blue-600',
      glow: 'shadow-blue-100'
    },
    purple: {
      bg: 'from-purple-50 to-purple-100/50',
      border: 'border-purple-200',
      icon: 'bg-purple-100 text-purple-600',
      text: 'text-purple-600',
      glow: 'shadow-purple-100'
    },
    green: {
      bg: 'from-green-50 to-green-100/50',
      border: 'border-green-200',
      icon: 'bg-green-100 text-green-600',
      text: 'text-green-600',
      glow: 'shadow-green-100'
    },
    yellow: {
      bg: 'from-yellow-50 to-yellow-100/50',
      border: 'border-yellow-200',
      icon: 'bg-yellow-100 text-yellow-600',
      text: 'text-yellow-600',
      glow: 'shadow-yellow-100'
    },
    red: {
      bg: 'from-red-50 to-red-100/50',
      border: 'border-red-200',
      icon: 'bg-red-100 text-red-600',
      text: 'text-red-600',
      glow: 'shadow-red-100'
    },
    cyan: {
      bg: 'from-cyan-50 to-cyan-100/50',
      border: 'border-cyan-200',
      icon: 'bg-cyan-100 text-cyan-600',
      text: 'text-cyan-600',
      glow: 'shadow-cyan-100'
    },
  }

  const c = colorMap[color] || colorMap.blue

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.4 }}
      className={`bg-gradient-to-br ${c.bg} border ${c.border} rounded-2xl p-5 shadow-lg ${c.glow} hover:scale-105 transition-transform duration-300 cursor-default`}
    >
      <div className="flex items-start justify-between">
        <div>
          <p className="text-gray-500 text-xs font-medium uppercase tracking-wider">{title}</p>
          <p className={`text-3xl font-bold mt-2 ${c.text}`}>{value}</p>
          {subtitle && <p className="text-gray-500 text-xs mt-1">{subtitle}</p>}
        </div>
        <div className={`w-12 h-12 rounded-xl ${c.icon} flex items-center justify-center`}>
          <Icon size={22} />
        </div>
      </div>
    </motion.div>
  )
}
