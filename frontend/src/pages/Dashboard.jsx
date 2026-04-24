import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import StatCard from '../components/StatCard'
import {
  BarChart, Bar, XAxis, YAxis,
  CartesianGrid, Tooltip, ResponsiveContainer
} from 'recharts'
import {
  RiMicroscopeLine, RiRobot2Line, RiCalendarLine,
  RiFileTextLine, RiHeartPulseLine, RiArrowRightLine,
  RiPulseLine, RiShieldLine
} from 'react-icons/ri'

// Weekly activity data (dummy — would come from backend in production)
const weeklyData = [
  { day: 'Mon', checks: 1, score: 78 },
  { day: 'Tue', checks: 0, score: 80 },
  { day: 'Wed', checks: 2, score: 72 },
  { day: 'Thu', checks: 1, score: 75 },
  { day: 'Fri', checks: 3, score: 65 },
  { day: 'Sat', checks: 0, score: 70 },
  { day: 'Sun', checks: 1, score: 74 },
]

const quickActions = [
  { to: '/predict',      icon: RiMicroscopeLine,  label: 'Check Symptoms',   color: 'bg-brand-600'  },
  { to: '/chatbot',      icon: RiRobot2Line,      label: 'Ask AI',           color: 'bg-blue-600'   },
  { to: '/appointments', icon: RiCalendarLine,    label: 'Book Appointment', color: 'bg-purple-600' },
  { to: '/report',       icon: RiFileTextLine,    label: 'Analyze Report',   color: 'bg-amber-500'  },
]

const Dashboard = () => {
  const { user } = useAuth()
  const [stats, setStats]   = useState({ predictions: 0, appointments: 0, reports: 0 })
  const [predictions, setPredictions] = useState([])
  const [now] = useState(new Date())

  useEffect(() => {
    const preds = JSON.parse(localStorage.getItem('sh-predictions')  || '[]')
    const apts  = JSON.parse(localStorage.getItem('sh-appointments') || '[]')
    const reps  = JSON.parse(localStorage.getItem('sh-reports')      || '[]')
    setPredictions(preds)
    setStats({ predictions: preds.length, appointments: apts.length, reports: reps.length })
  }, [])

  const firstName = user?.name?.split(' ')[0] || 'User'

  const greeting = () => {
    const h = now.getHours()
    if (h < 12) return 'Good morning'
    if (h < 17) return 'Good afternoon'
    return 'Good evening'
  }

  const dateStr = now.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })

  // Sparkline for prediction history score over last 7 entries
  const sparkData = predictions.slice(-7).map((p, i) => ({
    name: `#${i + 1}`,
    score: p.score || Math.floor(60 + Math.random() * 30),
  }))

  return (
    <div className="space-y-8 animate-fade-in-up">

      {/* ── Hero Welcome ───────────────────────── */}
      <div className="relative bg-gradient-to-br from-brand-600 via-brand-700 to-brand-800 rounded-3xl px-8 py-8 text-white overflow-hidden">
        {/* decorative circles */}
        <div className="absolute -top-8 -right-8 w-48 h-48 rounded-full bg-white/5" />
        <div className="absolute -bottom-12 -right-4 w-64 h-64 rounded-full bg-white/5" />
        <div className="absolute top-4 right-24 w-24 h-24 rounded-full bg-white/5" />

        <div className="relative flex items-start justify-between flex-wrap gap-4">
          <div>
            <p className="text-brand-200 text-sm font-medium mb-1">{dateStr}</p>
            <h1 className="text-3xl font-bold">{greeting()}, {firstName}! 👋</h1>
            <p className="text-brand-100 mt-2 max-w-sm text-sm leading-relaxed">
              Your AI-powered health companion is ready. Stay on top of your health today.
            </p>
          </div>
        </div>

        {/* Quick action pills */}
        <div className="relative mt-6 flex flex-wrap gap-2">
          {quickActions.map(({ to, icon: Icon, label, color }) => (
            <Link
              key={to}
              to={to}
              className="flex items-center gap-2 bg-white/15 hover:bg-white/25 transition-all
                border border-white/20 rounded-full px-4 py-1.5 text-sm font-medium"
            >
              <Icon className="text-base" />
              {label}
            </Link>
          ))}
        </div>
      </div>

      {/* ── Stat Cards ─────────────────────────── */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <StatCard
          icon={<RiMicroscopeLine />}
          label="Total Predictions"
          value={stats.predictions}
          color="green"
          sub="AI disease checks"
        />
        <StatCard
          icon={<RiCalendarLine />}
          label="Appointments"
          value={stats.appointments}
          color="purple"
          sub="Booked sessions"
        />
        <StatCard
          icon={<RiFileTextLine />}
          label="Reports Analyzed"
          value={stats.reports}
          color="blue"
          sub="Medical reports"
        />
      </div>

      {/* ── Charts Row ─────────────────────────── */}
      <div className="grid grid-cols-1 gap-6">
        {/* Bar chart — weekly activity */}
        <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 shadow-card">
          <div className="flex items-center justify-between mb-5">
            <div>
              <h3 className="font-semibold text-gray-800 dark:text-white">Weekly Health Activity</h3>
              <p className="text-xs text-gray-400 dark:text-slate-400 mt-0.5">Symptom checks per day</p>
            </div>
            <span className="w-9 h-9 rounded-xl bg-brand-50 dark:bg-brand-900/30 flex items-center justify-center">
              <RiPulseLine className="text-brand-600 dark:text-brand-400" />
            </span>
          </div>
          <ResponsiveContainer width="100%" height={180}>
            <BarChart data={weeklyData} barSize={28}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="day" tick={{ fontSize: 11, fill: '#9ca3af' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: '#9ca3af' }} axisLine={false} tickLine={false} allowDecimals={false} />
              <Tooltip
                contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 16px rgba(0,0,0,0.12)' }}
                cursor={{ fill: 'rgba(22,163,74,0.05)' }}
              />
              <Bar dataKey="checks" fill="#16a34a" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* ── Recent Activity + Feature Links ─────── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* Recent Predictions */}
        <div className="lg:col-span-2 bg-white dark:bg-slate-800 rounded-2xl p-6 shadow-card">
          <div className="flex items-center justify-between mb-5">
            <h3 className="font-semibold text-gray-800 dark:text-white">Recent Predictions</h3>
            <Link to="/history" className="text-xs text-brand-600 dark:text-brand-400 font-medium hover:underline flex items-center gap-1">
              View All <RiArrowRightLine />
            </Link>
          </div>
          {predictions.length === 0 ? (
            <div className="text-center py-10">
              <div className="w-14 h-14 rounded-2xl bg-gray-100 dark:bg-slate-700 flex items-center justify-center mx-auto mb-3">
                <RiMicroscopeLine className="text-2xl text-gray-400 dark:text-slate-500" />
              </div>
              <p className="text-sm text-gray-500 dark:text-slate-400">No predictions yet</p>
              <Link to="/predict" className="mt-3 inline-flex items-center gap-1 text-sm text-brand-600 dark:text-brand-400 font-medium hover:underline">
                Run your first check <RiArrowRightLine />
              </Link>
            </div>
          ) : (
            <div className="space-y-3">
              {predictions.slice(-4).reverse().map((p, i) => (
                <div key={i} className="flex items-center gap-4 p-3 rounded-xl hover:bg-gray-50 dark:hover:bg-slate-700/50 transition-all">
                  <div className="w-10 h-10 rounded-xl bg-brand-50 dark:bg-brand-900/30 flex items-center justify-center flex-shrink-0">
                    <RiMicroscopeLine className="text-brand-600 dark:text-brand-400" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-gray-800 dark:text-slate-200 truncate">{p.disease}</p>
                    <p className="text-xs text-gray-400 dark:text-slate-500">{p.date} · {p.symptoms?.length || 0} symptoms</p>
                  </div>
                  <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-brand-50 dark:bg-brand-900/30 text-brand-600 dark:text-brand-400">
                    {p.confidence}%
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Feature Cards */}
        <div className="space-y-3">
          {quickActions.map(({ to, icon: Icon, label, color }) => (
            <Link
              key={to}
              to={to}
              className="flex items-center gap-4 bg-white dark:bg-slate-800 rounded-2xl p-4 shadow-card
                hover:shadow-card-hover hover:-translate-y-0.5 transition-all duration-200 group"
            >
              <div className={`w-10 h-10 rounded-xl ${color} flex items-center justify-center text-white flex-shrink-0`}>
                <Icon className="text-lg" />
              </div>
              <span className="text-sm font-semibold text-gray-800 dark:text-slate-200">{label}</span>
              <RiArrowRightLine className="ml-auto text-gray-400 group-hover:text-brand-500 transition-colors" />
            </Link>
          ))}
        </div>
      </div>

      {/* ── Disclaimer ──────────────────────────── */}
      <div className="flex items-start gap-3 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800/40 rounded-2xl p-4">
        <span className="text-lg flex-shrink-0">⚠️</span>
        <p className="text-sm text-amber-800 dark:text-amber-300">
          <strong>Medical Disclaimer:</strong> This application is for educational and informational purposes only.
          Always consult a qualified healthcare professional for medical advice, diagnosis, or treatment.
        </p>
      </div>
    </div>
  )
}

export default Dashboard
