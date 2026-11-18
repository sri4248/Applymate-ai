import { useEffect, useState } from 'react'
import { Plus, Trash2, Edit3, Upload, X, Check, ExternalLink, Briefcase, Link2 } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { useDropzone } from 'react-dropzone'
import toast from 'react-hot-toast'
import Header from '../components/layout/Header'
import Badge from '../components/ui/Badge'
import LoadingSpinner from '../components/ui/LoadingSpinner'
import { jobsAPI } from '../services/api'
import useAppStore from '../store/useAppStore'
import { formatDate } from '../utils/helpers'

const STATUS_OPTIONS = ['applied', 'shortlisted', 'interview', 'rejected', 'offered']

const EMPTY_FORM = {
  company_name: '', job_title: '', job_url: '',
  status: 'applied', location: '', salary_range: '', notes: ''
}

export default function JobTracker() {
  const { jobs, setJobs, addJob, updateJob, removeJob, setResumeText, setResumeFilename, resumeFilename } = useAppStore()
  const [showForm, setShowForm] = useState(false)
  const [formData, setFormData] = useState(EMPTY_FORM)
  const [editId, setEditId] = useState(null)
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [filterStatus, setFilterStatus] = useState('all')
  const [uploadTab, setUploadTab] = useState('file') // 'file' | 'drive'
  const [driveUrl, setDriveUrl] = useState('')

  useEffect(() => {
    // Load all jobs
    jobsAPI.getAll()
      .then(setJobs)
      .catch(() => toast.error('Failed to load jobs'))
      .finally(() => setLoading(false))
  }, [])

  // ── File upload dropzone (PDF / DOCX / DOC) ───────────────────────────────
  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    accept: {
      'application/pdf': ['.pdf'],
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
      'application/msword': ['.doc'],
    },
    maxSize: 10 * 1024 * 1024,
    onDrop: async (files) => {
      if (!files[0]) return
      setUploading(true)
      const fd = new FormData()
      fd.append('file', files[0])
      try {
        const res = await jobsAPI.uploadResume(fd)
        setResumeText(res.extracted_text || '')
        setResumeFilename(res.filename)
        toast.success(`Resume "${res.filename}" uploaded!`)
      } catch (e) {
        toast.error(e.message)
      } finally {
        setUploading(false)
      }
    },
    onDropRejected: () => toast.error('Invalid file. Use PDF, DOCX, or DOC — max 10 MB.')
  })

  // ── Google Drive import ───────────────────────────────────────────────────
  const handleDriveImport = async () => {
    if (!driveUrl.trim()) return toast.error('Please enter a Google Drive link')
    setUploading(true)
    try {
      const res = await jobsAPI.uploadFromDrive({ drive_url: driveUrl.trim() })
      setResumeText(res.extracted_text || '')
      setResumeFilename(res.filename)
      setDriveUrl('')
      toast.success('Resume imported from Google Drive!')
    } catch (e) {
      toast.error(e.message)
    } finally {
      setUploading(false)
    }
  }

  // ── Job CRUD ──────────────────────────────────────────────────────────────
  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!formData.company_name || !formData.job_title) {
      toast.error('Company name and job title are required')
      return
    }
    setSubmitting(true)
    try {
      if (editId) {
        const updated = await jobsAPI.update(editId, formData)
        updateJob(editId, updated)
        toast.success('Job updated!')
      } else {
        const created = await jobsAPI.create(formData)
        addJob(created)
        toast.success('Job added!')
      }
      setShowForm(false)
      setFormData(EMPTY_FORM)
      setEditId(null)
    } catch (e) {
      toast.error(e.message)
    } finally {
      setSubmitting(false)
    }
  }

  const handleDelete = async (id) => {
    try {
      await jobsAPI.delete(id)
      removeJob(id)
      toast.success('Deleted!')
    } catch (e) {
      toast.error(e.message)
    }
  }

  const handleEdit = (job) => {
    setFormData({
      company_name: job.company_name,
      job_title: job.job_title,
      job_url: job.job_url || '',
      status: job.status,
      location: job.location || '',
      salary_range: job.salary_range || '',
      notes: job.notes || ''
    })
    setEditId(job.id)
    setShowForm(true)
  }

  const filteredJobs = filterStatus === 'all' ? jobs : jobs.filter(j => j.status === filterStatus)

  return (
    <div className="animate-fade-in">
      <Header title="Job Tracker" subtitle="Track all your job applications" />

      {/* ── Resume Upload Widget ── */}
      <div className="mb-6 glass-card overflow-hidden">
        {/* Tab Headers */}
        <div className="flex border-b border-white/10">
          <button
            id="upload-tab-file"
            onClick={() => setUploadTab('file')}
            className={`flex items-center gap-2 px-5 py-3 text-sm font-medium transition-all ${
              uploadTab === 'file'
                ? 'text-blue-400 border-b-2 border-blue-500 bg-blue-500/5'
                : 'text-gray-400 hover:text-gray-200'
            }`}
          >
            <Upload size={15} /> Upload File
          </button>
          <button
            id="upload-tab-drive"
            onClick={() => setUploadTab('drive')}
            className={`flex items-center gap-2 px-5 py-3 text-sm font-medium transition-all ${
              uploadTab === 'drive'
                ? 'text-blue-400 border-b-2 border-blue-500 bg-blue-500/5'
                : 'text-gray-400 hover:text-gray-200'
            }`}
          >
            <Link2 size={15} /> Google Drive
          </button>

          {/* Uploaded indicator */}
          {resumeFilename && (
            <div className="ml-auto flex items-center gap-2 px-4 py-3">
              <span className="text-green-400 text-xs font-medium">✅ {resumeFilename}</span>
              <button
                id="clear-resume-btn"
                onClick={() => { setResumeText(''); setResumeFilename('') }}
                className="text-gray-500 hover:text-red-400 transition-colors"
                title="Clear resume"
              >
                <X size={14} />
              </button>
            </div>
          )}
        </div>

        {/* Tab: File Upload */}
        {uploadTab === 'file' && (
          <div className="p-5">
            {uploading ? (
              <LoadingSpinner size="sm" text="Uploading and parsing resume..." />
            ) : (
              <div
                {...getRootProps()}
                id="resume-dropzone"
                className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all duration-300 ${
                  isDragActive
                    ? 'border-blue-500 bg-blue-500/10'
                    : 'border-white/15 hover:border-blue-500/50 hover:bg-white/3'
                }`}
              >
                <input {...getInputProps()} />
                <Upload className="mx-auto text-gray-400 mb-3" size={32} />
                <p className="text-gray-200 text-sm font-medium mb-1">
                  {isDragActive ? 'Drop your resume here…' : 'Drag & drop your resume here'}
                </p>
                <p className="text-gray-500 text-xs">PDF, DOCX, or DOC · Max 10 MB</p>
                <button
                  type="button"
                  className="mt-4 px-4 py-2 bg-blue-500/15 hover:bg-blue-500/25 border border-blue-500/30 rounded-lg text-blue-400 text-xs font-medium transition-all"
                >
                  Browse file
                </button>
              </div>
            )}
          </div>
        )}

        {/* Tab: Google Drive */}
        {uploadTab === 'drive' && (
          <div className="p-5">
            <p className="text-gray-400 text-xs mb-3">
              Paste a <strong className="text-gray-200">shareable Google Drive link</strong> to your resume PDF or DOCX.
              The file must be set to <em>&quot;Anyone with the link can view&quot;</em>.
            </p>
            <div className="flex gap-3">
              <input
                id="drive-url-input"
                type="url"
                value={driveUrl}
                onChange={e => setDriveUrl(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleDriveImport()}
                placeholder="https://drive.google.com/file/d/…/view?usp=sharing"
                className="input-field flex-1"
                disabled={uploading}
              />
              <button
                id="drive-import-btn"
                onClick={handleDriveImport}
                disabled={uploading || !driveUrl.trim()}
                className="btn-primary text-sm py-2 px-5 whitespace-nowrap"
              >
                {uploading ? 'Importing…' : 'Import'}
              </button>
            </div>
          </div>
        )}
      </div>

      {/* ── Controls ── */}
      <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
        <div className="flex gap-2 flex-wrap">
          {['all', ...STATUS_OPTIONS].map(s => (
            <button
              key={s}
              id={`filter-${s}`}
              onClick={() => setFilterStatus(s)}
              className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-all
                ${filterStatus === s
                  ? 'bg-blue-500 text-white'
                  : 'bg-white/5 text-gray-400 hover:bg-white/10'}`}
            >
              {s.charAt(0).toUpperCase() + s.slice(1)}
            </button>
          ))}
        </div>
        <button
          id="add-job-btn"
          onClick={() => { setShowForm(true); setEditId(null); setFormData(EMPTY_FORM) }}
          className="btn-primary flex items-center gap-2 text-sm py-2"
        >
          <Plus size={16} /> Add Job
        </button>
      </div>

      {/* ── Add / Edit Form ── */}
      <AnimatePresence>
        {showForm && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="glass-card p-6 mb-6"
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-white font-semibold">{editId ? 'Edit Job' : 'Add New Job'}</h3>
              <button onClick={() => setShowForm(false)} className="text-gray-400 hover:text-white">
                <X size={18} />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <input id="form-company" placeholder="Company Name *" value={formData.company_name}
                onChange={e => setFormData({...formData, company_name: e.target.value})} className="input-field" />
              <input id="form-title" placeholder="Job Title *" value={formData.job_title}
                onChange={e => setFormData({...formData, job_title: e.target.value})} className="input-field" />
              <input id="form-url" placeholder="Job URL" value={formData.job_url}
                onChange={e => setFormData({...formData, job_url: e.target.value})} className="input-field" />
              <input id="form-location" placeholder="Location" value={formData.location}
                onChange={e => setFormData({...formData, location: e.target.value})} className="input-field" />
              <input id="form-salary" placeholder="Salary Range" value={formData.salary_range}
                onChange={e => setFormData({...formData, salary_range: e.target.value})} className="input-field" />
              <select id="form-status" value={formData.status}
                onChange={e => setFormData({...formData, status: e.target.value})}
                className="input-field bg-dark-100">
                {STATUS_OPTIONS.map(s => (
                  <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>
                ))}
              </select>
              <textarea id="form-notes" placeholder="Notes" value={formData.notes}
                onChange={e => setFormData({...formData, notes: e.target.value})}
                className="textarea-field md:col-span-2" rows={2} />
              <div className="md:col-span-2 flex gap-3">
                <button type="submit" id="form-submit" disabled={submitting} className="btn-primary flex items-center gap-2 text-sm py-2">
                  <Check size={16} /> {submitting ? 'Saving...' : editId ? 'Update' : 'Add Job'}
                </button>
                <button type="button" onClick={() => setShowForm(false)} className="btn-secondary text-sm py-2">Cancel</button>
              </div>
            </form>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Jobs Table ── */}
      {loading ? (
        <LoadingSpinner text="Loading applications..." />
      ) : filteredJobs.length === 0 ? (
        <div className="glass-card p-12 text-center">
          <Briefcase size={48} className="mx-auto text-gray-600 mb-4" />
          <p className="text-gray-400">No applications found. Add your first job!</p>
        </div>
      ) : (
        <div className="space-y-3">
          <AnimatePresence>
            {filteredJobs.map((job, i) => (
              <motion.div
                key={job.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={{ delay: i * 0.03 }}
                className="glass-card-hover p-4 flex flex-wrap items-center gap-4"
              >
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h4 className="text-white font-semibold text-sm">{job.job_title}</h4>
                    <Badge status={job.status} />
                    {job.match_score && (
                      <span className="text-xs text-blue-400 bg-blue-500/10 px-2 py-0.5 rounded-full border border-blue-500/20">
                        {Math.round(job.match_score)}% match
                      </span>
                    )}
                  </div>
                  <p className="text-gray-400 text-xs mt-0.5">
                    {job.company_name} {job.location && `· ${job.location}`} {job.salary_range && `· ${job.salary_range}`}
                  </p>
                  <p className="text-gray-600 text-xs mt-0.5">{formatDate(job.applied_date)}</p>
                </div>
                <div className="flex items-center gap-2">
                  {job.job_url && (
                    <a href={job.job_url} target="_blank" rel="noreferrer"
                      className="text-gray-400 hover:text-blue-400 transition-colors">
                      <ExternalLink size={16} />
                    </a>
                  )}
                  <button onClick={() => handleEdit(job)} id={`edit-job-${job.id}`}
                    className="text-gray-400 hover:text-blue-400 transition-colors p-1">
                    <Edit3 size={16} />
                  </button>
                  <button onClick={() => handleDelete(job.id)} id={`delete-job-${job.id}`}
                    className="text-gray-400 hover:text-red-400 transition-colors p-1">
                    <Trash2 size={16} />
                  </button>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}
    </div>
  )
}
