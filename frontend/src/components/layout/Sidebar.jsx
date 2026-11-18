import { NavLink, useNavigate } from 'react-router-dom'
import {
  LayoutDashboard, Briefcase, Zap, BookOpen,
  Mail, FileText, Bot, ChevronLeft, ChevronRight, LogOut
} from 'lucide-react'
import useAppStore from '../../store/useAppStore'

const navItems = [
  { path: '/', icon: LayoutDashboard, label: 'Dashboard', id: 'nav-dashboard' },
  { path: '/tracker', icon: Briefcase, label: 'Job Tracker', id: 'nav-tracker' },
  { path: '/matcher', icon: Zap, label: 'AI Job Match', id: 'nav-matcher' },
  { path: '/prep', icon: BookOpen, label: 'Prep Toolkit', id: 'nav-prep' },
  { path: '/email', icon: Mail, label: 'Email Analyzer', id: 'nav-email' },
  { path: '/resume', icon: FileText, label: 'Resume Updater', id: 'nav-resume' },
  { path: '/auto-apply', icon: Bot, label: 'Auto Apply', id: 'nav-auto-apply' },
]

function getInitials(name = '') {
  return name
    .split(' ')
    .map(w => w[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)
}

export default function Sidebar() {
  const { sidebarOpen, toggleSidebar, user, logout } = useAppStore()
  const navigate = useNavigate()

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  return (
    <aside
      className={`fixed left-0 top-0 h-full z-50 transition-all duration-300 ease-in-out
        ${ sidebarOpen ? 'w-60' : 'w-16'}
        border-r border-gray-200 flex flex-col`}
      style={{ background: 'rgba(255, 255, 255, 0.97)', backdropFilter: 'blur(20px)' }}
    >
      {/* Logo */}
      <div className={`flex items-center gap-3 p-5 border-b border-gray-200 ${ !sidebarOpen && 'justify-center px-3'}`}>
        <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center flex-shrink-0 shadow-lg shadow-blue-500/30">
          <span className="text-white font-bold text-sm">AM</span>
        </div>
        {sidebarOpen && (
          <div>
            <h1 className="font-bold text-gray-800 text-sm leading-tight">ApplyMate AI</h1>
            <p className="text-xs text-gray-400">Job Assistant</p>
          </div>
        )}
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        {navItems.map(({ path, icon: Icon, label, id }) => (
          <NavLink
            key={path}
            to={path}
            id={id}
            end={path === '/'}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 group
               ${ !sidebarOpen && 'justify-center px-2'}
               ${isActive
                 ? 'bg-gradient-to-r from-blue-500/10 to-purple-600/10 border border-blue-500/20 text-blue-600'
                 : 'text-gray-500 hover:text-gray-800 hover:bg-gray-100'}`
            }
            title={!sidebarOpen ? label : ''}
          >
            <Icon size={18} className="flex-shrink-0" />
            {sidebarOpen && <span className="font-medium text-sm">{label}</span>}
          </NavLink>
        ))}
      </nav>

      {/* User info + Logout */}
      {user && (
        <div className="border-t border-gray-200">
          <div className={`flex items-center gap-3 px-4 py-3 ${!sidebarOpen && 'justify-center px-3'}`}>
            {/* Avatar */}
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center flex-shrink-0 shadow">
              <span className="text-white text-xs font-bold">{getInitials(user.name)}</span>
            </div>
            {sidebarOpen && (
              <div className="flex-1 min-w-0">
                <p className="text-gray-800 text-xs font-semibold truncate">{user.name}</p>
                <p className="text-gray-400 text-xs truncate">{user.email}</p>
              </div>
            )}
            {sidebarOpen && (
              <button
                onClick={handleLogout}
                id="sidebar-logout"
                title="Sign out"
                className="p-1.5 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 transition-all duration-200"
              >
                <LogOut size={15} />
              </button>
            )}
          </div>
          {/* Logout button when collapsed */}
          {!sidebarOpen && (
            <div className="px-3 pb-3">
              <button
                onClick={handleLogout}
                id="sidebar-logout-collapsed"
                title="Sign out"
                className="w-full flex items-center justify-center p-2 rounded-xl text-gray-400 hover:text-red-500 hover:bg-red-50 transition-all duration-200"
              >
                <LogOut size={16} />
              </button>
            </div>
          )}
        </div>
      )}

      {/* Toggle button */}
      <div className="p-3 border-t border-gray-200">
        <button
          onClick={toggleSidebar}
          id="sidebar-toggle"
          className="w-full flex items-center justify-center p-2 rounded-xl text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-all duration-200"
        >
          {sidebarOpen ? <ChevronLeft size={16} /> : <ChevronRight size={16} />}
        </button>
      </div>
    </aside>
  )
}
