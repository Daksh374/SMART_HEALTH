import { useState } from 'react'
import axios from 'axios'
import { useAuth } from '../context/AuthContext'
import { useToast } from '../context/ToastContext'
import { RiMicroscopeLine, RiHeartPulseLine, RiUserHeartLine, RiCheckLine } from 'react-icons/ri'

const ALL_SYMPTOMS = [
  'fever','cough','headache','fatigue','nausea','vomiting',
  'chest_pain','shortness_of_breath','sore_throat','runny_nose',
  'body_ache','diarrhea','loss_of_appetite','skin_rash','joint_pain',
  'abdominal_pain','dizziness','chills','sweating','high_fever',
  'weight_loss','back_pain','neck_stiffness','blurred_vision','yellow_skin',
]

const DOCTOR_MAP = {
  fever: 'General Physician', cough: 'Pulmonologist', headache: 'Neurologist',
  chest_pain: 'Cardiologist', shortness_of_breath: 'Pulmonologist',
  skin_rash: 'Dermatologist', joint_pain: 'Orthopedic Specialist',
  abdominal_pain: 'Gastroenterologist', blurred_vision: 'Ophthalmologist',
  yellow_skin: 'Hepatologist',
}

const getDoctorType = (disease, symptoms) => {
  if (!disease) return null
  const d = disease.toLowerCase()
  if (d.includes('heart') || d.includes('cardiac')) return 'Cardiologist'
  if (d.includes('diabetes') || d.includes('thyroid')) return 'Endocrinologist'
  if (d.includes('liver') || d.includes('hepat')) return 'Hepatologist'
  if (d.includes('lung') || d.includes('pneumonia') || d.includes('asthma')) return 'Pulmonologist'
  if (d.includes('skin') || d.includes('derma')) return 'Dermatologist'
  if (d.includes('neuro') || d.includes('epilepsy') || d.includes('migraine')) return 'Neurologist'
  for (const s of symptoms) { if (DOCTOR_MAP[s]) return DOCTOR_MAP[s] }
  return 'General Physician'
}

const DiseasePrediction = () => {
  const { token } = useAuth()
  const { showToast } = useToast()
  const [selected, setSelected]     = useState([])
  const [severities, setSeverities] = useState({})
  const [result, setResult]         = useState(null)
  const [loading, setLoading]       = useState(false)
  const [error, setError]           = useState('')

  const toggle = s => {
    setSelected(prev => prev.includes(s) ? prev.filter(x => x !== s) : [...prev, s])
    if (!severities[s]) setSeverities(prev => ({ ...prev, [s]: 3 }))
  }

  const handlePredict = async () => {
    if (selected.length < 1) { setError('Please select at least 1 symptom.'); return }
    setLoading(true); setError(''); setResult(null)
    try {
      const res = await axios.post('/api/predict', { symptoms: selected }, {
        headers: { Authorization: `Bearer ${token}` }
      })
      const avgSev = selected.reduce((sum, s) => sum + (severities[s] || 3), 0) / selected.length
      const entry = {
        disease: res.data.disease,
        confidence: Math.round((res.data.confidence || 0.8) * 100),
        symptoms: selected,
        avgSeverity: avgSev,
        date: new Date().toLocaleDateString()
      }
      
      try {
        const savedRes = await axios.post('/api/predictions', entry, {
          headers: { Authorization: `Bearer ${token}` }
        })
        const hist = JSON.parse(localStorage.getItem('sh-predictions') || '[]')
        hist.push(savedRes.data)
        localStorage.setItem('sh-predictions', JSON.stringify(hist))
      } catch (err) {
        console.error('Failed to save prediction to DB:', err)
      }

      setResult(res.data)
      showToast(`Prediction complete: ${res.data.disease}`, 'success')
    } catch (err) {
      setError(err.response?.data?.msg || 'Prediction service unavailable. Make sure the ML service is running.')
    } finally {
      setLoading(false)
    }
  }

  const doctorType = result ? getDoctorType(result.disease, selected) : null

  return (
    <div className="space-y-6 animate-fade-in-up">
      {/* Header */}
      <div>
        <div className="flex items-center gap-3 mb-1">
          <div className="w-10 h-10 rounded-xl bg-brand-600 flex items-center justify-center">
            <RiMicroscopeLine className="text-white text-xl" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Disease Prediction</h1>
        </div>
        <p className="text-gray-500 dark:text-slate-400 text-sm ml-13">
          Select your symptoms and set severity to get an AI-powered prediction
        </p>
      </div>

      {/* Symptom selector */}
      <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 shadow-card">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold text-gray-800 dark:text-white">
            Select Symptoms
            {selected.length > 0 && (
              <span className="ml-2 text-xs font-medium bg-brand-100 dark:bg-brand-900/40 text-brand-700 dark:text-brand-300 px-2 py-0.5 rounded-full">
                {selected.length} selected
              </span>
            )}
          </h3>
          {selected.length > 0 && (
            <button onClick={() => { setSelected([]); setSeverities({}) }}
              className="text-xs text-gray-400 hover:text-red-500 transition-colors">
              Clear all
            </button>
          )}
        </div>

        <div className="flex flex-wrap gap-2">
          {ALL_SYMPTOMS.map(s => (
            <button
              key={s}
              id={`sym-${s}`}
              onClick={() => toggle(s)}
              className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-all duration-150 capitalize
                ${selected.includes(s)
                  ? 'bg-brand-600 border-brand-600 text-white shadow-sm'
                  : 'bg-gray-50 dark:bg-slate-700 border-gray-200 dark:border-slate-600 text-gray-600 dark:text-slate-300 hover:border-brand-400 hover:text-brand-600 dark:hover:text-brand-400'
                }`}
            >
              {selected.includes(s) && <RiCheckLine className="inline text-xs mr-1" />}
              {s.replace(/_/g, ' ')}
            </button>
          ))}
        </div>

        {/* Severity sliders - shown for selected symptoms */}
        {selected.length > 0 && (
          <div className="mt-5 pt-5 border-t border-gray-100 dark:border-slate-700">
            <h4 className="text-sm font-semibold text-gray-700 dark:text-slate-300 mb-3">
              Set Symptom Severity (1 = Mild, 5 = Severe)
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {selected.map(s => (
                <div key={s} className="flex items-center gap-3 bg-gray-50 dark:bg-slate-700/50 rounded-xl px-3 py-2">
                  <span className="text-xs font-medium text-gray-600 dark:text-slate-300 capitalize flex-1 truncate">
                    {s.replace(/_/g, ' ')}
                  </span>
                  <input
                    type="range" min={1} max={5} step={1}
                    value={severities[s] || 3}
                    onChange={e => setSeverities(prev => ({ ...prev, [s]: +e.target.value }))}
                    className="w-20 accent-brand-600"
                  />
                  <span className={`text-xs font-bold w-4 ${
                    (severities[s] || 3) >= 4 ? 'text-red-500' :
                    (severities[s] || 3) >= 3 ? 'text-amber-500' : 'text-brand-600'
                  }`}>{severities[s] || 3}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {error && (
          <div className="mt-4 flex items-center gap-2 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800/40 text-red-700 dark:text-red-400 rounded-xl px-4 py-3 text-sm">
            ❌ {error}
          </div>
        )}

        <button
          id="predict-btn"
          onClick={handlePredict}
          disabled={loading || selected.length === 0}
          className="mt-5 w-full py-3 bg-brand-600 hover:bg-brand-700 disabled:opacity-50 disabled:cursor-not-allowed
            text-white font-semibold rounded-xl transition-all duration-200 hover:shadow-green
            flex items-center justify-center gap-2"
        >
          {loading
            ? <><span className="spinner" /> Analyzing symptoms...</>
            : <><RiMicroscopeLine /> Predict Disease</>
          }
        </button>
      </div>

      {/* Result */}
      {result && (
        <div className="space-y-4 animate-fade-in-up">
          {/* Main result card */}
          <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 shadow-card border border-brand-100 dark:border-brand-900/30">
            <div className="flex items-start justify-between mb-4">
              <div>
                <p className="text-xs font-semibold text-gray-400 dark:text-slate-500 uppercase tracking-wider mb-1">Prediction Result</p>
                <h2 className="text-3xl font-bold text-gray-900 dark:text-white">{result.disease}</h2>
              </div>
              <div className="w-14 h-14 rounded-2xl bg-brand-50 dark:bg-brand-900/30 flex items-center justify-center">
                <RiHeartPulseLine className="text-2xl text-brand-600 dark:text-brand-400" />
              </div>
            </div>

            {/* Confidence bar */}
            <div className="mb-4">
              <div className="flex items-center justify-between text-sm mb-1.5">
                <span className="text-gray-500 dark:text-slate-400 font-medium">Confidence</span>
                <span className="font-bold text-brand-600 dark:text-brand-400">
                  {(result.confidence * 100).toFixed(1)}%
                </span>
              </div>
              <div className="h-2.5 bg-gray-100 dark:bg-slate-700 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-brand-500 to-brand-600 rounded-full transition-all duration-700"
                  style={{ width: `${result.confidence * 100}%` }}
                />
              </div>
            </div>

            {result.description && (
              <p className="text-sm text-gray-600 dark:text-slate-300 leading-relaxed mb-4">{result.description}</p>
            )}

            {result.precautions?.length > 0 && (
              <div>
                <h4 className="text-xs font-semibold text-gray-500 dark:text-slate-400 uppercase tracking-wider mb-2">Recommended Precautions</h4>
                <ul className="space-y-1.5">
                  {result.precautions.map((p, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm text-gray-600 dark:text-slate-300">
                      <RiCheckLine className="text-brand-600 dark:text-brand-400 mt-0.5 flex-shrink-0" />
                      {p}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          {/* Doctor suggestion */}
          {doctorType && (
            <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-800/30 rounded-2xl p-5 flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-blue-600 flex items-center justify-center flex-shrink-0">
                <RiUserHeartLine className="text-white text-xl" />
              </div>
              <div>
                <p className="text-xs font-semibold text-blue-500 dark:text-blue-400 uppercase tracking-wider mb-0.5">Recommended Specialist</p>
                <p className="font-bold text-blue-800 dark:text-blue-200 text-lg">{doctorType}</p>
                <p className="text-xs text-blue-600 dark:text-blue-400 mt-0.5">Based on your prediction — always consult a professional</p>
              </div>
            </div>
          )}

          <div className="flex items-center gap-2 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800/40 rounded-xl p-3 text-xs text-amber-700 dark:text-amber-300">
            ⚠️ This is an AI prediction. Please consult a doctor for a proper diagnosis.
          </div>
        </div>
      )}
    </div>
  )
}

export default DiseasePrediction
