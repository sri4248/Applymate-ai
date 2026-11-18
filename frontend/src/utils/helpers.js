export function formatDate(dateStr) {
  if (!dateStr) return 'N/A'
  return new Date(dateStr).toLocaleDateString('en-IN', {
    day: 'numeric', month: 'short', year: 'numeric'
  })
}

export function truncate(str, len = 100) {
  if (!str) return ''
  return str.length > len ? str.slice(0, len) + '...' : str
}

export function getScoreColor(score) {
  if (score >= 70) return 'text-green-400'
  if (score >= 45) return 'text-yellow-400'
  return 'text-red-400'
}
