import { useDropzone } from 'react-dropzone'
import { Upload, FileText, X } from 'lucide-react'

export default function FileUpload({ onFileAccepted, label = 'Upload Resume', accept = { 'application/pdf': ['.pdf'], 'text/plain': ['.txt'] }, maxSize = 5 * 1024 * 1024 }) {
  const { getRootProps, getInputProps, isDragActive, acceptedFiles } = useDropzone({
    accept,
    maxSize,
    maxFiles: 1,
    onDrop: (accepted) => {
      if (accepted[0]) onFileAccepted(accepted[0])
    }
  })

  return (
    <div>
      <div
        {...getRootProps()}
        className={`border-2 border-dashed rounded-2xl p-8 text-center cursor-pointer transition-all duration-300
          ${isDragActive ? 'border-blue-500 bg-blue-500/10 scale-105' : 'border-white/20 hover:border-blue-500/50 hover:bg-white/3'}`}
      >
        <input {...getInputProps()} />
        <Upload className="mx-auto text-gray-400 mb-3" size={32} />
        <p className="text-gray-300 font-medium">{isDragActive ? 'Drop it here!' : label}</p>
        <p className="text-gray-500 text-xs mt-1">PDF or TXT, max 5MB</p>
      </div>
      {acceptedFiles.length > 0 && (
        <div className="mt-3 flex items-center gap-2 p-3 bg-green-500/10 border border-green-500/30 rounded-xl">
          <FileText size={16} className="text-green-400" />
          <span className="text-green-400 text-sm flex-1">{acceptedFiles[0].name}</span>
        </div>
      )}
    </div>
  )
}
