const statusConfig = {
  applied: { label: 'Applied', className: 'bg-blue-500/20 text-blue-400 border-blue-500/30' },
  shortlisted: { label: 'Shortlisted', className: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30' },
  interview: { label: 'Interview', className: 'bg-purple-500/20 text-purple-400 border-purple-500/30' },
  rejected: { label: 'Rejected', className: 'bg-red-500/20 text-red-400 border-red-500/30' },
  offered: { label: 'Offered', className: 'bg-green-500/20 text-green-400 border-green-500/30' },
}

export default function Badge({ status }) {
  const config = statusConfig[status] || statusConfig.applied
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold border ${config.className}`}>
      {config.label}
    </span>
  )
}
