import { useState } from 'react'
import { RiHistoryLine, RiMicroscopeLine, RiCalendarLine, RiFileTextLine, RiDeleteBinLine } from 'react-icons/ri'

const TABS = [
  { key: 'predictions',  label: 'Predictions',  icon: RiMicroscopeLine, storageKey: 'sh-predictions'  },
  { key: 'appointments', label: 'Appointments',  icon: RiCalendarLine,   storageKey: 'sh-appointments' },
  { key: 'reports',      label: 'Reports',       icon: RiFileTextLine,   storageKey: 'sh-reports'      },
]

const History = () => {
  const [activeTab, setActiveTab] = useState('predictions')
  const [refresh, setRefresh] = useState(0)

  const currentTab = TABS.find(t => t.key === activeTab)
  const data = JSON.parse(localStorage.getItem(currentTab.storageKey) || '[]')

  const clearHistory = () => {
    localStorage.removeItem(currentTab.storageKey)
    setRefresh(r => r + 1)
  }

  const renderPredictions = (items) => (
    items.length === 0 ? (
      <Empty icon={<RiMicroscopeLine />} message="No prediction history yet" sub="Run a disease check to see results here" />
    ) : (
      [...items].reverse().map((p, i) => (
        <div key={i} className="bg-white dark:bg-slate-800 rounded-2xl p-5 shadow-card flex items-start gap-4">
          <div className="w-11 h-11 rounded-xl bg-brand-50 dark:bg-brand-900/30 flex items-center justify-center flex-shrink-0">
            <RiMicroscopeLine className="text-brand-600 dark:text-brand-400 text-xl" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2">
              <p className="font-bold text-gray-900 dark:text-white text-lg">{p.disease}</p>
              <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-brand-50 dark:bg-brand-900/30 text-brand-600 dark:text-brand-400 flex-shrink-0">
                {p.confidence}%
              </span>
            </div>
            <p className="text-xs text-gray-500 dark:text-slate-400 mt-0.5">📅 {p.date}</p>
            {p.symptoms?.length > 0 && (
              <div className="flex flex-wrap gap-1.5 mt-2">
                {p.symptoms.slice(0, 6).map(s => (
                  <span key={s} className="text-[10px] px-2 py-0.5 rounded-full bg-gray-100 dark:bg-slate-700 text-gray-600 dark:text-slate-300 capitalize">
                    {s.replace(/_/g,' ')}
                  </span>
                ))}
                {p.symptoms.length > 6 && (
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-gray-100 dark:bg-slate-700 text-gray-500">
                    +{p.symptoms.length - 6} more
                  </span>
                )}
              </div>
            )}
          </div>
        </div>
      ))
    )
  )

  const renderAppointments = (items) => {
    // items could be full appointment objects from backend or from localStorage
    const apts = Array.isArray(items) ? items : []
    return apts.length === 0 ? (
      <Empty icon={<RiCalendarLine />} message="No appointment history" sub="Book your first appointment to see it here" />
    ) : (
      [...apts].reverse().map((a, i) => (
        <div key={i} className="bg-white dark:bg-slate-800 rounded-2xl p-5 shadow-card">
          <div className="flex items-start justify-between gap-2">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center flex-shrink-0">
                <RiCalendarLine className="text-purple-600 dark:text-purple-400" />
              </div>
              <div>
                <p className="font-semibold text-gray-800 dark:text-slate-200 text-sm">{a.doctorName}</p>
                <p className="text-xs text-gray-500 dark:text-slate-400">{a.specialization}</p>
              </div>
            </div>
            <span className={`text-xs font-bold px-2 py-0.5 rounded-full flex-shrink-0 ${
              a.status === 'Confirmed'  ? 'bg-brand-50 dark:bg-brand-900/30 text-brand-600 dark:text-brand-400' :
              a.status === 'Cancelled' ? 'bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-400' :
              'bg-amber-50 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400'
            }`}>
              {a.status || 'Pending'}
            </span>
          </div>
          <div className="flex gap-4 mt-3 text-xs text-gray-500 dark:text-slate-400">
            <span>📅 {a.date}</span>
            <span>🕐 {a.time}</span>
            {a.reason && <span className="truncate">📝 {a.reason}</span>}
          </div>
        </div>
      ))
    )
  }

  const renderReports = (items) => (
    items.length === 0 ? (
      <Empty icon={<RiFileTextLine />} message="No report history" sub="Analyze a report to see summaries here" />
    ) : (
      [...items].reverse().map((r, i) => (
        <div key={i} className="bg-white dark:bg-slate-800 rounded-2xl p-5 shadow-card flex items-start gap-4">
          <div className="w-11 h-11 rounded-xl bg-amber-50 dark:bg-amber-900/30 flex items-center justify-center flex-shrink-0">
            <RiFileTextLine className="text-amber-600 dark:text-amber-400 text-xl" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2 mb-1">
              <p className="font-semibold text-gray-800 dark:text-slate-200 text-sm">Medical Report</p>
              <span className="text-xs text-gray-400 dark:text-slate-500 flex-shrink-0">📅 {r.date}</span>
            </div>
            {r.summary && (
              <p className="text-sm text-gray-500 dark:text-slate-400 leading-relaxed line-clamp-2">{r.summary}</p>
            )}
          </div>
        </div>
      ))
    )
  )

  return (
    <div className="space-y-6 animate-fade-in-up">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-indigo-600 flex items-center justify-center">
            <RiHistoryLine className="text-white text-xl" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Health History</h1>
            <p className="text-sm text-gray-500 dark:text-slate-400">All your past health activities</p>
          </div>
        </div>
        {data.length > 0 && (
          <button
            onClick={clearHistory}
            className="flex items-center gap-1.5 text-xs text-red-500 border border-red-200 dark:border-red-800/40
              px-3 py-1.5 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 transition-all"
          >
            <RiDeleteBinLine /> Clear {activeTab}
          </button>
        )}
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-gray-100 dark:bg-slate-800 p-1 rounded-xl w-fit">
        {TABS.map(tab => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              activeTab === tab.key
                ? 'bg-white dark:bg-slate-700 text-gray-800 dark:text-white shadow-sm'
                : 'text-gray-500 dark:text-slate-400 hover:text-gray-700 dark:hover:text-slate-200'
            }`}
          >
            <tab.icon className="text-base" />
            {tab.label}
            {JSON.parse(localStorage.getItem(tab.storageKey) || '[]').length > 0 && (
              <span className="w-5 h-5 rounded-full bg-brand-100 dark:bg-brand-900/40 text-brand-600 dark:text-brand-400 text-[10px] font-bold flex items-center justify-center">
                {JSON.parse(localStorage.getItem(tab.storageKey) || '[]').length}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Content */}
      <div className="space-y-3" key={`${activeTab}-${refresh}`}>
        {activeTab === 'predictions'  && renderPredictions(data)}
        {activeTab === 'appointments' && renderAppointments(data)}
        {activeTab === 'reports'      && renderReports(data)}
      </div>
    </div>
  )
}

const Empty = ({ icon, message, sub }) => (
  <div className="bg-white dark:bg-slate-800 rounded-2xl p-12 shadow-card text-center">
    <div className="w-14 h-14 rounded-2xl bg-gray-100 dark:bg-slate-700 flex items-center justify-center mx-auto mb-3 text-2xl text-gray-400">
      {icon}
    </div>
    <p className="font-medium text-gray-600 dark:text-slate-300">{message}</p>
    <p className="text-sm text-gray-400 dark:text-slate-500 mt-1">{sub}</p>
  </div>
)

export default History
