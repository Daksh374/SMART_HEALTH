import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import axios from 'axios'
import { useAuth } from '../context/AuthContext'
import { useToast } from '../context/ToastContext'
import { RiEyeLine, RiEyeOffLine, RiHeartPulseLine } from 'react-icons/ri'

const Login = () => {
  const [form, setForm] = useState({ email: '', password: '' })
  const [error, setError]     = useState('')
  const [loading, setLoading] = useState(false)
  const [showPass, setShowPass] = useState(false)
  const { login } = useAuth()
  const { showToast } = useToast()
  const navigate = useNavigate()

  const handleChange = e => setForm({ ...form, [e.target.name]: e.target.value })

  const handleSubmit = async e => {
    e.preventDefault()
    setLoading(true); setError('')
    try {
      const res = await axios.post('/api/auth/login', form)
      login(res.data.token, res.data.user)
      showToast(`Welcome back, ${res.data.user.name}! 👋`, 'success')
      navigate('/dashboard')
    } catch (err) {
      setError(err.response?.data?.msg || 'Login failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex bg-gray-50 dark:bg-slate-900">
      {/* Left brand panel */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-brand-600 to-brand-800 flex-col items-center justify-center p-12 relative overflow-hidden">
        <div className="absolute -top-20 -left-20 w-80 h-80 rounded-full bg-white/5" />
        <div className="absolute -bottom-20 -right-20 w-96 h-96 rounded-full bg-white/5" />
        <div className="relative text-center text-white max-w-sm">
          <div className="w-20 h-20 rounded-2xl bg-white/20 backdrop-blur flex items-center justify-center mx-auto mb-6 text-4xl">
            ⚕️
          </div>
          <h1 className="text-4xl font-bold mb-3">SmartHealth AI</h1>
          <p className="text-brand-100 text-lg leading-relaxed">
            Your intelligent health companion. AI-powered disease prediction, medical chatbot,
            and smart report analysis — all in one place.
          </p>
          <div className="mt-8 grid grid-cols-2 gap-4">
            {[
              { icon: '🧬', label: 'Disease Prediction' },
              { icon: '💬', label: 'AI Chatbot'         },
              { icon: '📅', label: 'Appointments'       },
              { icon: '📋', label: 'Report Analyzer'    },
            ].map(f => (
              <div key={f.label} className="bg-white/10 rounded-xl p-3 text-left">
                <span className="text-xl">{f.icon}</span>
                <p className="text-sm font-medium mt-1">{f.label}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right form panel */}
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="w-full max-w-md space-y-6">
          {/* Mobile logo */}
          <div className="lg:hidden text-center mb-4">
            <div className="w-14 h-14 rounded-2xl bg-brand-600 flex items-center justify-center mx-auto mb-2 text-3xl">⚕️</div>
            <p className="font-bold text-gray-800 dark:text-white text-lg">SmartHealth AI</p>
          </div>

          <div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Welcome back</h2>
            <p className="text-gray-500 dark:text-slate-400 mt-1 text-sm">Sign in to your SmartHealth account</p>
          </div>

          {error && (
            <div className="flex items-center gap-2 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800/40 text-red-700 dark:text-red-400 rounded-xl px-4 py-3 text-sm">
              <span>❌</span> {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-gray-700 dark:text-slate-300">Email Address</label>
              <input
                id="login-email"
                name="email"
                type="email"
                className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-slate-700
                  bg-white dark:bg-slate-800 text-gray-900 dark:text-white placeholder-gray-400
                  focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent
                  transition-all text-sm"
                placeholder="you@example.com"
                value={form.email}
                onChange={handleChange}
                required
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-sm font-medium text-gray-700 dark:text-slate-300">Password</label>
              <div className="relative">
                <input
                  id="login-password"
                  name="password"
                  type={showPass ? 'text' : 'password'}
                  className="w-full px-4 py-3 pr-11 rounded-xl border border-gray-200 dark:border-slate-700
                    bg-white dark:bg-slate-800 text-gray-900 dark:text-white placeholder-gray-400
                    focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent
                    transition-all text-sm"
                  placeholder="••••••••"
                  value={form.password}
                  onChange={handleChange}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPass(s => !s)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-slate-300"
                >
                  {showPass ? <RiEyeOffLine /> : <RiEyeLine />}
                </button>
              </div>
            </div>

            <button
              id="login-btn"
              type="submit"
              disabled={loading}
              className="w-full py-3 px-4 bg-brand-600 hover:bg-brand-700 disabled:opacity-60
                text-white font-semibold rounded-xl transition-all duration-200
                hover:shadow-green active:scale-95 flex items-center justify-center gap-2"
            >
              {loading ? <><span className="spinner" /> Signing in...</> : 'Sign In'}
            </button>
          </form>

          <p className="text-center text-sm text-gray-500 dark:text-slate-400">
            Don&apos;t have an account?{' '}
            <Link to="/register" className="text-brand-600 dark:text-brand-400 font-semibold hover:underline">
              Create one free
            </Link>
          </p>

          <div className="flex items-center gap-2 bg-brand-50 dark:bg-brand-900/20 rounded-xl p-3">
            <RiHeartPulseLine className="text-brand-600 dark:text-brand-400 flex-shrink-0" />
            <p className="text-xs text-brand-700 dark:text-brand-300">
              For educational purposes only. Not a substitute for professional medical advice.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Login
