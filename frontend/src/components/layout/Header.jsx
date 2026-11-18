import { Bell } from 'lucide-react'
import useAppStore from '../../store/useAppStore'

function getInitials(name = '') {
  return name
    .split(' ')
    .map(w => w[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)
}

export default function Header({ title, subtitle }) {
  const { resumeFilename, user } = useAppStore()

  return (
    <header className="flex items-center justify-between mb-8">
      <div>
        <h2 className="text-2xl font-bold text-gray-800">{title}</h2>
        {subtitle && <p className="text-gray-500 text-sm mt-1">{subtitle}</p>}
      </div>

      <div className="flex items-center gap-3">
        {resumeFilename && (
          <div className="hidden md:flex items-center gap-2 bg-green-500/10 border border-green-500/30 rounded-xl px-3 py-2">
            <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
            <span className="text-green-600 text-xs font-medium truncate max-w-[8rem]">{resumeFilename}</span>
          </div>
        )}

        <button
          id="header-notifications"
          className="w-9 h-9 rounded-xl bg-gray-100 border border-gray-200 flex items-center justify-center text-gray-500 hover:text-gray-800 hover:bg-gray-200 transition-all"
        >
          <Bell size={16} />
        </button>

        {/* User avatar with name */}
        {user ? (
          <div className="flex items-center gap-2">
            <div
              id="header-user-avatar"
              className="w-9 h-9 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center cursor-pointer shadow-sm"
              title={user.name}
            >
              <span className="text-white text-xs font-bold">{getInitials(user.name)}</span>
            </div>
            <div className="hidden sm:block">
              <p className="text-gray-800 text-xs font-semibold leading-tight">{user.name}</p>
              <p className="text-gray-400 text-xs leading-tight">{user.email}</p>
            </div>
          </div>
        ) : (
          <div
            id="header-user-avatar"
            className="w-9 h-9 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center cursor-pointer"
          >
            <span className="text-white text-xs font-bold">?</span>
          </div>
        )}
      </div>
    </header>
  )
}
