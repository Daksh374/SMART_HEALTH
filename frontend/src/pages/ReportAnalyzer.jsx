import { useState } from 'react'
import axios from 'axios'
import { useAuth } from '../context/AuthContext'
import { useToast } from '../context/ToastContext'
import { RiFileLine, RiFileTextLine, RiAlertLine, RiLightbulbLine, RiSearchLine } from 'react-icons/ri'

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

// Bold-highlight medical keywords
const KEYWORDS = [
  'high','low','elevated','abnormal','critical','normal','pre-diabetic',
  'hypertension','dyslipidemia','coronary artery','chest pain','blood pressure',
  'cholesterol','hemoglobin','diabetes','creatinine','triglycerides',
]

const highlightKeywords = (text) => {
  if (!text) return ''
  const pattern = new RegExp(`\\b(${KEYWORDS.join('|')})\\b`, 'gi')
  return text.replace(pattern, '<strong class="text-brand-700 dark:text-brand-400">$1</strong>')
}

const ReportAnalyzer = () => {
  const { token } = useAuth()
  const { showToast } = useToast()
  const [reportText, setReportText] = useState('')
  const [result, setResult]         = useState(null)
  const [loading, setLoading]       = useState(false)
  const [error, setError]           = useState('')

  const handleAnalyze = async () => {
    if (!reportText.trim()) { setError('Please enter or paste a medical report.'); return }
    setLoading(true); setError(''); setResult(null)
    try {
      const res = await axios.post('/api/analyze', { report: reportText }, {
        headers: { Authorization: `Bearer ${token}` }
      })
      setResult(res.data)
      
      const entry = { summary: res.data.summary, date: new Date().toLocaleDateString() }
      try {
        const savedRes = await axios.post('/api/reports', entry, {
          headers: { Authorization: `Bearer ${token}` }
        })
        const hist = JSON.parse(localStorage.getItem('sh-reports') || '[]')
        hist.push(savedRes.data)
        localStorage.setItem('sh-reports', JSON.stringify(hist))
      } catch (err) {
        console.error('Failed to save report to DB:', err)
      }
      showToast('Report analyzed successfully!', 'success')
    } catch (err) {
      setError(err.response?.data?.msg || 'Report analyzer service unavailable. Make sure ML service is running.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-6 animate-fade-in-up">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-amber-500 flex items-center justify-center">
          <RiFileTextLine className="text-white text-xl" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Health Report Analyzer</h1>
          <p className="text-sm text-gray-500 dark:text-slate-400">AI-powered medical report summarization</p>
        </div>
      </div>

      {/* Upload / Input area */}
      <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 shadow-card">

        {/* Textarea */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label className="text-sm font-medium text-gray-700 dark:text-slate-300 flex items-center gap-1.5">
              <RiFileLine className="text-gray-400" /> Medical Report Text
            </label>
            <button
              onClick={() => setReportText(SAMPLE_REPORT)}
              className="text-xs text-brand-600 dark:text-brand-400 font-medium hover:underline"
            >
              Load sample →
            </button>
          </div>
          <textarea
            id="report-input"
            rows={10}
            className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-slate-700
              bg-gray-50 dark:bg-slate-700 text-gray-900 dark:text-white placeholder-gray-400
              focus:outline-none focus:ring-2 focus:ring-brand-500 transition-all text-sm resize-none font-mono"
            placeholder="Paste your medical report, lab results, or discharge summary here..."
            value={reportText}
            onChange={e => setReportText(e.target.value)}
          />
        </div>

        {error && (
          <div className="mt-3 flex items-center gap-2 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800/40 text-red-700 dark:text-red-400 rounded-xl px-4 py-3 text-sm">
            ❌ {error}
          </div>
        )}

        <button
          id="analyze-btn"
          onClick={handleAnalyze}
          disabled={loading || !reportText.trim()}
          className="mt-4 w-full py-3 bg-amber-500 hover:bg-amber-600 disabled:opacity-50 disabled:cursor-not-allowed
            text-white font-semibold rounded-xl transition-all duration-200
            flex items-center justify-center gap-2 hover:shadow-md"
        >
          {loading
            ? <><span className="spinner" /> Analyzing Report...</>
            : <><RiSearchLine /> Analyze Report</>
          }
        </button>
      </div>

      {/* Results */}
      {result && (
        <div className="space-y-4 animate-fade-in-up">

          {/* Summary card */}
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
                        v.status === 'high' ? 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400'    :
                        v.status === 'low'  ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400' :
                        'bg-brand-100 dark:bg-brand-900/30 text-brand-700 dark:text-brand-400'
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
                    <span className="text-brand-500 font-bold flex-shrink-0">→</span>
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
