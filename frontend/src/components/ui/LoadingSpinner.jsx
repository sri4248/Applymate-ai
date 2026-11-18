export default function LoadingSpinner({ size = 'md', text = 'AI is thinking...' }) {
  const sizes = {
    sm: 'w-5 h-5',
    md: 'w-8 h-8',
    lg: 'w-12 h-12',
  }

  return (
    <div className="flex flex-col items-center justify-center gap-3 py-8">
      <div className={`${sizes[size]} relative`}>
        <div className={`${sizes[size]} rounded-full border-2 border-blue-500/20 border-t-blue-500 animate-spin`} />
        <div className={`absolute inset-1 rounded-full border-2 border-purple-500/20 border-b-purple-500 animate-spin`}
          style={{ animationDirection: 'reverse', animationDuration: '0.8s' }} />
      </div>
      {text && <p className="text-gray-400 text-sm animate-pulse">{text}</p>}
    </div>
  )
}
