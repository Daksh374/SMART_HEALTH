import { useState, useRef, useCallback } from 'react'
import axios from 'axios'
import { useAuth } from '../context/AuthContext'
import { useToast } from '../context/ToastContext'
import {
  RiFileLine, RiFileTextLine, RiAlertLine, RiLightbulbLine,
  RiSearchLine, RiUploadCloud2Line, RiFileUploadLine, RiCloseLine,
  RiCheckboxCircleLine, RiFilePdfLine, RiFileList2Line
} from 'react-icons/ri'

const SAMPLE_REPORT = `Patient: Shobhit Mathur, Age: 20, Gender: Male
Date: 2026-01-01

Chief Complaint: Chest pain and shortness of breath for 3 days.
Blood Pressure: 145/90 mmHg (High)
Heart Rate: 88 bpm
Temperature: 98.9°F
SpO2: 96%

CBC Results:
- Hemoglobin: 11.2 g/dL (Low)
- WBC: 11,500/μL (Slightly elevated)
- Platelets: 180,000/μL (Normal)

Lipid Profile:
- Total Cholesterol: 240 mg/dL (High)
- LDL: 165 mg/dL (High)
- HDL: 38 mg/dL (Low)
- Triglycerides: 210 mg/dL (High)

Blood Sugar (Fasting): 118 mg/dL (Pre-diabetic range)
Creatinine: 1.3 mg/dL (Slightly elevated)

Diagnosis: Hypertension with dyslipidemia. Rule out early coronary artery disease.
Medications prescribed: Amlodipine 5mg, Atorvastatin 20mg.
Follow-up in 2 weeks.`

const KEYWORDS = [
  'high','low','elevated','abnormal','critical','normal','pre-diabetic',
  'hypertension','dyslipidemia','coronary artery','chest pain','blood pressure',
  'cholesterol','hemoglobin','diabetes','creatinine','triglycerides',
]

const highlightKeywords = (text) => {
  if (!text) return ''
  const pattern = new RegExp(`\\b(${KEYWORDS.join('|')})\\b`, 'gi')
  return text.replace(pattern, '<strong class="text-amber-600 dark:text-amber-400">$1</strong>')
}

const formatFileSize = (bytes) => {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

const ReportAnalyzer = () => {
  const { token } = useAuth()
  const { showToast } = useToast()

  /* ── tab: 'upload' | 'paste' ── */
  const [tab, setTab]           = useState('upload')

  /* ── shared state ── */
  const [result, setResult]     = useState(null)
  const [loading, setLoading]   = useState(false)
  const [error, setError]       = useState('')

  /* ── upload tab ── */
  const [dragOver, setDragOver] = useState(false)
  const [file, setFile]         = useState(null)
  const fileInputRef            = useRef(null)

  /* ── paste tab ── */
  const [reportText, setReportText] = useState('')

  // ── File validation ─────────────────────────────────────────────────────
  const validateFile = (f) => {
    if (!f) return 'No file selected.'
    const allowedTypes = ['application/pdf', 'text/plain']
    if (!allowedTypes.includes(f.type)) return 'Only PDF and TXT files are supported.'
    if (f.size > 10 * 1024 * 1024) return 'File size must be under 10 MB.'
    return null
  }

  const handleFileDrop = useCallback((e) => {
    e.preventDefault()
    setDragOver(false)
    const dropped = e.dataTransfer.files[0]
    const err = validateFile(dropped)
    if (err) { setError(err); return }
    setError('')
    setFile(dropped)
    setResult(null)
  }, [])

  const handleFileSelect = (e) => {
    const selected = e.target.files[0]
    const err = validateFile(selected)
    if (err) { setError(err); return }
    setError('')
    setFile(selected)
    setResult(null)
  }

  const clearFile = () => {
    setFile(null)
    setResult(null)
    setError('')
    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  // ── Handle file upload & analyze ────────────────────────────────────────
  const handleUploadAnalyze = async () => {
    if (!file) { setError('Please select a file first.'); return }
    setLoading(true); setError(''); setResult(null)
    try {
      const formData = new FormData()
      formData.append('report', file)

      const res = await axios.post('/api/reports/upload', formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'multipart/form-data'
        }
      })
      setResult(res.data)
      showToast(`"${file.name}" analyzed successfully!`, 'success')
    } catch (err) {
      setError(err.response?.data?.msg || 'Upload failed. Please check the file and try again.')
    } finally {
      setLoading(false)
    }
  }

  // ── Handle text paste & analyze ─────────────────────────────────────────
  const handleAnalyze = async () => {
    if (!reportText.trim()) { setError('Please enter or paste a medical report.'); return }
    setLoading(true); setError(''); setResult(null)
    try {
      const res = await axios.post('/api/analyze', { report: reportText }, {
        headers: { Authorization: `Bearer ${token}` }
      })
      setResult(res.data)

      try {
        const savedRes = await axios.post('/api/reports',
          { summary: res.data.summary, date: new Date().toLocaleDateString(), reportText },
          { headers: { Authorization: `Bearer ${token}` } }
        )
        const hist = JSON.parse(localStorage.getItem('sh-reports') || '[]')
        hist.push(savedRes.data)
        localStorage.setItem('sh-reports', JSON.stringify(hist))
      } catch (e) {
        console.error('Failed to save report to DB:', e)
      }
      showToast('Report analyzed successfully!', 'success')
    } catch (err) {
      setError(err.response?.data?.msg || 'Report analyzer service unavailable. Make sure ML service is running.')
    } finally {
      setLoading(false)
    }
  }

  const switchTab = (t) => {
    setTab(t); setError(''); setResult(null)
  }

  // ── File icon helper ────────────────────────────────────────────────────
  const FileIcon = ({ mime }) =>
    mime === 'application/pdf'
      ? <RiFilePdfLine className="text-red-500 text-3xl" />
      : <RiFileList2Line className="text-blue-500 text-3xl" />

  return (
    <div className="space-y-6 animate-fade-in-up">

      {/* ── Header ─────────────────────────────────────────────────────── */}
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-amber-500 flex items-center justify-center shadow-lg">
          <RiFileTextLine className="text-white text-xl" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Health Report Analyzer</h1>
          <p className="text-sm text-gray-500 dark:text-slate-400">AI-powered medical report summarization · PDF &amp; TXT supported</p>
        </div>
      </div>

      {/* ── Input Card ─────────────────────────────────────────────────── */}
      <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-card overflow-hidden">

        {/* Tab switcher */}
        <div className="flex border-b border-gray-100 dark:border-slate-700">
          {[
            { id: 'upload', label: 'Upload File', icon: <RiUploadCloud2Line /> },
            { id: 'paste',  label: 'Paste Text',  icon: <RiFileTextLine /> },
          ].map(({ id, label, icon }) => (
            <button
              key={id}
              onClick={() => switchTab(id)}
              className={`flex-1 flex items-center justify-center gap-2 py-3.5 text-sm font-medium transition-all duration-200
                ${tab === id
                  ? 'text-amber-600 dark:text-amber-400 border-b-2 border-amber-500 bg-amber-50/60 dark:bg-amber-900/10'
                  : 'text-gray-500 dark:text-slate-400 hover:text-gray-700 dark:hover:text-slate-200 hover:bg-gray-50 dark:hover:bg-slate-700/40'
                }`}
            >
              {icon} {label}
            </button>
          ))}
        </div>

        <div className="p-6 space-y-4">

          {/* ── Upload tab ───────────────────────────────────────────── */}
          {tab === 'upload' && (
            <div className="space-y-4">
              {!file ? (
                /* Drop zone */
                <div
                  onDragOver={(e) => { e.preventDefault(); setDragOver(true) }}
                  onDragLeave={() => setDragOver(false)}
                  onDrop={handleFileDrop}
                  onClick={() => fileInputRef.current?.click()}
                  className={`relative flex flex-col items-center justify-center gap-3 rounded-2xl border-2 border-dashed
                    cursor-pointer transition-all duration-200 p-10 group
                    ${dragOver
                      ? 'border-amber-400 bg-amber-50 dark:bg-amber-900/20 scale-[1.01]'
                      : 'border-gray-200 dark:border-slate-600 hover:border-amber-400 hover:bg-amber-50/40 dark:hover:bg-amber-900/10 bg-gray-50 dark:bg-slate-700/30'
                    }`}
                >
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept=".pdf,.txt,application/pdf,text/plain"
                    onChange={handleFileSelect}
                    className="hidden"
                    id="file-input"
                  />

                  {/* Animated icon wrapper */}
                  <div className={`w-16 h-16 rounded-2xl flex items-center justify-center transition-all duration-200
                    ${dragOver ? 'bg-amber-100 dark:bg-amber-800/40 scale-110' : 'bg-amber-50 dark:bg-slate-700 group-hover:scale-105 group-hover:bg-amber-100 dark:group-hover:bg-amber-900/30'}`}
                  >
                    <RiFileUploadLine className={`text-3xl transition-colors duration-200
                      ${dragOver ? 'text-amber-500' : 'text-amber-400 group-hover:text-amber-500'}`}
                    />
                  </div>

                  <div className="text-center">
                    <p className={`font-semibold text-base transition-colors duration-200
                      ${dragOver ? 'text-amber-600 dark:text-amber-400' : 'text-gray-700 dark:text-slate-200'}`}
                    >
                      {dragOver ? 'Drop your file here' : 'Drag & drop your report'}
                    </p>
                    <p className="text-sm text-gray-400 dark:text-slate-500 mt-1">
                      or <span className="text-amber-500 font-medium underline underline-offset-2">browse to upload</span>
                    </p>
                  </div>

                  <div className="flex items-center gap-3 text-xs text-gray-400 dark:text-slate-500">
                    <span className="flex items-center gap-1">
                      <RiFilePdfLine className="text-red-400" /> PDF
                    </span>
                    <span className="w-1 h-1 rounded-full bg-gray-300 dark:bg-slate-600" />
                    <span className="flex items-center gap-1">
                      <RiFileList2Line className="text-blue-400" /> TXT
                    </span>
                    <span className="w-1 h-1 rounded-full bg-gray-300 dark:bg-slate-600" />
                    <span>Max 10 MB</span>
                  </div>
                </div>
              ) : (
                /* File preview card */
                <div className="flex items-center gap-4 p-4 rounded-2xl border border-gray-100 dark:border-slate-700 bg-gray-50 dark:bg-slate-700/50">
                  <div className="w-12 h-12 rounded-xl bg-white dark:bg-slate-800 flex items-center justify-center shadow-sm flex-shrink-0">
                    <FileIcon mime={file.type} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-gray-800 dark:text-white truncate">{file.name}</p>
                    <p className="text-xs text-gray-400 dark:text-slate-500 mt-0.5">
                      {file.type === 'application/pdf' ? 'PDF Document' : 'Text File'} · {formatFileSize(file.size)}
                    </p>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <span className="text-xs bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 px-2 py-1 rounded-full flex items-center gap-1">
                      <RiCheckboxCircleLine /> Ready
                    </span>
                    <button
                      onClick={clearFile}
                      className="w-8 h-8 rounded-lg flex items-center justify-center text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-all"
                      title="Remove file"
                    >
                      <RiCloseLine className="text-lg" />
                    </button>
                  </div>
                </div>
              )}

              {/* Upload supported formats note */}
              {!file && (
                <p className="text-center text-xs text-gray-400 dark:text-slate-500">
                  Supports lab reports, discharge summaries, and prescriptions in PDF or plain text format
                </p>
              )}
            </div>
          )}

          {/* ── Paste tab ────────────────────────────────────────────── */}
          {tab === 'paste' && (
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium text-gray-700 dark:text-slate-300 flex items-center gap-1.5">
                  <RiFileLine className="text-gray-400" /> Medical Report Text
                </label>
                <button
                  onClick={() => setReportText(SAMPLE_REPORT)}
                  className="text-xs text-amber-600 dark:text-amber-400 font-medium hover:underline transition-all"
                >
                  Load sample →
                </button>
              </div>
              <textarea
                id="report-input"
                rows={10}
                className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-slate-700
                  bg-gray-50 dark:bg-slate-700 text-gray-900 dark:text-white placeholder-gray-400
                  focus:outline-none focus:ring-2 focus:ring-amber-400 transition-all text-sm resize-none font-mono"
                placeholder="Paste your medical report, lab results, or discharge summary here..."
                value={reportText}
                onChange={e => setReportText(e.target.value)}
              />
            </div>
          )}

          {/* Error banner */}
          {error && (
            <div className="flex items-center gap-2 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800/40 text-red-700 dark:text-red-400 rounded-xl px-4 py-3 text-sm">
              ❌ {error}
            </div>
          )}

          {/* Analyze button */}
          <button
            id="analyze-btn"
            onClick={tab === 'upload' ? handleUploadAnalyze : handleAnalyze}
            disabled={loading || (tab === 'upload' ? !file : !reportText.trim())}
            className="w-full py-3.5 bg-amber-500 hover:bg-amber-600 active:bg-amber-700
              disabled:opacity-50 disabled:cursor-not-allowed
              text-white font-semibold rounded-xl transition-all duration-200
              flex items-center justify-center gap-2 hover:shadow-md shadow-amber-200 dark:shadow-none"
          >
            {loading ? (
              <><span className="spinner" /> Analyzing Report...</>
            ) : (
              <><RiSearchLine /> {tab === 'upload' ? 'Upload & Analyze' : 'Analyze Report'}</>
            )}
          </button>
        </div>
      </div>

      {/* ── Results ────────────────────────────────────────────────────── */}
      {result && (
        <div className="space-y-4 animate-fade-in-up">

          {/* File badge (upload mode) */}
          {result.fileName && (
            <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-slate-400">
              <RiFilePdfLine className="text-red-400" />
              Analyzed: <span className="font-medium text-gray-700 dark:text-slate-200">{result.fileName}</span>
            </div>
          )}

          {/* Summary */}
          {result.summary && (
            <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 shadow-card">
              <h3 className="font-semibold text-gray-800 dark:text-white flex items-center gap-2 mb-3">
                <RiFileTextLine className="text-amber-500" /> Summary
              </h3>
              <p
                className="text-sm text-gray-600 dark:text-slate-300 leading-relaxed"
                dangerouslySetInnerHTML={{ __html: highlightKeywords(result.summary) }}
              />
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {/* Key findings */}
            {result.key_findings?.length > 0 && (
              <div className="bg-white dark:bg-slate-800 rounded-2xl p-5 shadow-card">
                <h3 className="font-semibold text-gray-800 dark:text-white flex items-center gap-2 mb-3">
                  <RiSearchLine className="text-blue-500" /> Key Findings
                </h3>
                <ul className="space-y-2">
                  {result.key_findings.map((f, i) => (
                    <li key={i}
                      className="text-sm text-gray-600 dark:text-slate-300 pl-3 border-l-2 border-blue-400 leading-snug"
                      dangerouslySetInnerHTML={{ __html: highlightKeywords(f) }}
                    />
                  ))}
                </ul>
              </div>
            )}

            {/* Abnormal values */}
            {result.abnormal_values?.length > 0 && (
              <div className="bg-white dark:bg-slate-800 rounded-2xl p-5 shadow-card">
                <h3 className="font-semibold text-gray-800 dark:text-white flex items-center gap-2 mb-3">
                  <RiAlertLine className="text-red-500" /> Abnormal Values
                </h3>
                <div className="space-y-2">
                  {result.abnormal_values.map((v, i) => (
                    <div key={i} className="flex items-center justify-between p-2.5 rounded-xl bg-gray-50 dark:bg-slate-700">
                      <div>
                        <p className="text-xs font-semibold text-gray-700 dark:text-slate-200">{v.name}</p>
                        <p className="text-xs text-gray-400 dark:text-slate-500">{v.value}</p>
                      </div>
                      <span className={`text-xs font-bold px-2 py-1 rounded-full ${
                        v.status === 'high' ? 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400'
                        : v.status === 'low' ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400'
                        : 'bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400'
                      }`}>
                        {v.status?.toUpperCase()}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Recommendations */}
          {result.recommendations?.length > 0 && (
            <div className="bg-white dark:bg-slate-800 rounded-2xl p-5 shadow-card">
              <h3 className="font-semibold text-gray-800 dark:text-white flex items-center gap-2 mb-3">
                <RiLightbulbLine className="text-amber-500" /> Recommendations
              </h3>
              <ul className="space-y-2">
                {result.recommendations.map((r, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm text-gray-600 dark:text-slate-300">
                    <span className="text-amber-500 font-bold flex-shrink-0">→</span>
                    {r}
                  </li>
                ))}
              </ul>
            </div>
          )}

          <div className="flex items-center gap-2 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800/40 rounded-xl p-3 text-xs text-amber-700 dark:text-amber-300">
            ⚠️ This AI analysis is for informational purposes only. Always review with your healthcare provider.
          </div>
        </div>
      )}
    </div>
  )
}

export default ReportAnalyzer
