import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import axios from 'axios'
import { useAuth } from '../context/AuthContext'
import { useToast } from '../context/ToastContext'
import { RiEyeLine, RiEyeOffLine, RiHeartPulseLine } from 'react-icons/ri'

const Register = () => {
  const [form, setForm] = useState({ name: '', email: '', password: '', age: '', gender: 'Male' })
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
      const res = await axios.post('/api/auth/register', form)
      login(res.data.token, res.data.user)
      showToast(`Welcome to SmartHealth, ${res.data.user.name}! 🎉`, 'success')
      navigate('/dashboard')
    } catch (err) {
      setError(err.response?.data?.msg || 'Registration failed')
    } finally {
      setLoading(false)
    }
  }

  const inputClass = `w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-slate-700
    bg-white dark:bg-slate-800 text-gray-900 dark:text-white placeholder-gray-400
    focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent
    transition-all text-sm`

  return (
    <div className="min-h-screen flex bg-gray-50 dark:bg-slate-900">
      {/* Left brand panel */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-brand-700 to-brand-900 flex-col items-center justify-center p-12 relative overflow-hidden">
        <div className="absolute -top-20 -left-20 w-80 h-80 rounded-full bg-white/5" />
        <div className="absolute -bottom-20 -right-20 w-96 h-96 rounded-full bg-white/5" />
        <div className="relative text-white max-w-sm text-center">
          <div className="w-20 h-20 rounded-2xl bg-white/20 backdrop-blur flex items-center justify-center mx-auto mb-6 text-4xl">⚕️</div>
          <h1 className="text-4xl font-bold mb-3">Join SmartHealth</h1>
          <p className="text-brand-100 text-lg leading-relaxed">
            Create your free account and start monitoring your health with the power of AI.
          </p>
          <div className="mt-8 flex flex-col gap-3 text-left">
            {[
              '✅ AI-powered disease prediction',
              '✅ 24/7 Medical AI chatbot',
              '✅ Smart report analysis',
              '✅ Easy appointment booking',
              '✅ Complete health history',
            ].map(f => (
              <p key={f} className="text-sm text-brand-100">{f}</p>
            ))}
          </div>
        </div>
      </div>

      {/* Right form panel */}
      <div className="flex-1 flex items-center justify-center p-8 overflow-y-auto">
        <div className="w-full max-w-md space-y-5">
          <div className="lg:hidden text-center mb-2">
            <div className="w-14 h-14 rounded-2xl bg-brand-600 flex items-center justify-center mx-auto mb-2 text-3xl">⚕️</div>
            <p className="font-bold text-gray-800 dark:text-white text-lg">SmartHealth AI</p>
          </div>

          <div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Create Account</h2>
            <p className="text-gray-500 dark:text-slate-400 mt-1 text-sm">Join SmartHealth to get AI-powered health insights</p>
          </div>

          {error && (
            <div className="flex items-center gap-2 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800/40 text-red-700 dark:text-red-400 rounded-xl px-4 py-3 text-sm">
              <span>❌</span> {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-gray-700 dark:text-slate-300">Full Name</label>
              <input id="reg-name" name="name" className={inputClass}
                placeholder="John Doe" value={form.name} onChange={handleChange} required />
            </div>

            <div className="space-y-1.5">
              <label className="text-sm font-medium text-gray-700 dark:text-slate-300">Email Address</label>
              <input id="reg-email" name="email" type="email" className={inputClass}
                placeholder="you@example.com" value={form.email} onChange={handleChange} required />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-gray-700 dark:text-slate-300">Age</label>
                <input id="reg-age" name="age" type="number" className={inputClass}
                  placeholder="25" value={form.age} onChange={handleChange} />
              </div>
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-gray-700 dark:text-slate-300">Gender</label>
                <select id="reg-gender" name="gender" className={inputClass} value={form.gender} onChange={handleChange}>
                  <option>Male</option>
                  <option>Female</option>
                  <option>Other</option>
                </select>
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-sm font-medium text-gray-700 dark:text-slate-300">Password</label>
              <div className="relative">
                <input id="reg-password" name="password" type={showPass ? 'text' : 'password'}
                  className={`${inputClass} pr-11`}
                  placeholder="Minimum 6 characters"
                  value={form.password} onChange={handleChange} required minLength={6} />
                <button type="button" onClick={() => setShowPass(s => !s)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-slate-300">
                  {showPass ? <RiEyeOffLine /> : <RiEyeLine />}
                </button>
              </div>
            </div>

            <button
              id="reg-btn"
              type="submit"
              disabled={loading}
              className="w-full py-3 px-4 bg-brand-600 hover:bg-brand-700 disabled:opacity-60
                text-white font-semibold rounded-xl transition-all duration-200
                hover:shadow-green active:scale-95 flex items-center justify-center gap-2"
            >
              {loading ? <><span className="spinner" /> Creating account...</> : 'Create Account'}
            </button>
          </form>

          <p className="text-center text-sm text-gray-500 dark:text-slate-400">
            Already have an account?{' '}
            <Link to="/login" className="text-brand-600 dark:text-brand-400 font-semibold hover:underline">
              Sign in
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

export default Register
