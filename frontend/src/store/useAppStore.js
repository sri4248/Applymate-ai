import { create } from 'zustand'

const useAppStore = create((set, get) => ({
  // Auth state
  user: JSON.parse(localStorage.getItem('am_user') || 'null'),
  token: localStorage.getItem('am_token') || null,
  setUser: (user) => {
    localStorage.setItem('am_user', JSON.stringify(user))
    set({ user })
  },
  setToken: (token) => {
    localStorage.setItem('am_token', token)
    set({ token })
  },
  logout: () => {
    localStorage.removeItem('am_token')
    localStorage.removeItem('am_user')
    set({ user: null, token: null })
  },

  // Resume state
  resumeText: '',
  resumeFilename: '',
  setResumeText: (text) => set({ resumeText: text }),
  setResumeFilename: (name) => set({ resumeFilename: name }),

  // Jobs state
  jobs: [],
  setJobs: (jobs) => set({ jobs }),
  addJob: (job) => set((state) => ({ jobs: [job, ...state.jobs] })),
  updateJob: (id, updated) => set((state) => ({
    jobs: state.jobs.map(j => j.id === id ? { ...j, ...updated } : j)
  })),
  removeJob: (id) => set((state) => ({ jobs: state.jobs.filter(j => j.id !== id) })),

  // Stats state
  stats: { total: 0, applied: 0, shortlisted: 0, interview: 0, rejected: 0, offered: 0 },
  setStats: (stats) => set({ stats }),

  // UI state
  sidebarOpen: true,
  toggleSidebar: () => set((state) => ({ sidebarOpen: !state.sidebarOpen })),
  currentPage: 'dashboard',
  setCurrentPage: (page) => set({ currentPage: page }),
}))

export default useAppStore
