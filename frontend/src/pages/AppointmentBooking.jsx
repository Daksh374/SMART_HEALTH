import { useState, useEffect } from 'react'
import axios from 'axios'
import { useAuth } from '../context/AuthContext'
import { useToast } from '../context/ToastContext'
import { RiCalendarLine, RiStarFill, RiTimeLine, RiUserLine, RiCheckLine } from 'react-icons/ri'

const DOCTORS = [
  { name: 'Dr. Priya Sharma',   specialty: 'General Physician',   rating: 4.9, exp: '12 yrs', initials: 'PS', color: 'bg-brand-600'  },
  { name: 'Dr. Rahul Mehta',    specialty: 'Cardiologist',        rating: 4.8, exp: '15 yrs', initials: 'RM', color: 'bg-red-500'    },
  { name: 'Dr. Anita Verma',    specialty: 'Dermatologist',       rating: 4.7, exp: '8 yrs',  initials: 'AV', color: 'bg-purple-600' },
  { name: 'Dr. Suresh Kumar',   specialty: 'Neurologist',         rating: 4.9, exp: '18 yrs', initials: 'SK', color: 'bg-blue-600'   },
  { name: 'Dr. Kavita Joshi',   specialty: 'Orthopedic Surgeon',  rating: 4.6, exp: '10 yrs', initials: 'KJ', color: 'bg-amber-500'  },
  { name: 'Dr. Arjun Patel',    specialty: 'ENT Specialist',      rating: 4.8, exp: '11 yrs', initials: 'AP', color: 'bg-teal-600'   }
]

const TIME_SLOTS = [
  { label: '9:00 AM', group: 'Morning'   },
  { label: '10:00 AM', group: 'Morning'  },
  { label: '11:00 AM', group: 'Morning'  },
  { label: '2:00 PM', group: 'Afternoon' },
  { label: '3:00 PM', group: 'Afternoon' },
  { label: '4:00 PM', group: 'Afternoon' },
  { label: '5:00 PM', group: 'Evening'   },
  { label: '6:00 PM', group: 'Evening'   },
]

const AppointmentBooking = () => {
  const { token } = useAuth()
  const { showToast } = useToast()
  const [selectedDoc, setSelectedDoc]   = useState(null)
  const [selectedSlot, setSelectedSlot] = useState('')
  const [form, setForm] = useState({ date: '', reason: '' })
  const [appointments, setAppointments] = useState([])
  const [loading, setLoading]           = useState(false)
  const [fetchLoading, setFetchLoading] = useState(true)

  const headers = { Authorization: `Bearer ${token}` }

  const fetchAppointments = async () => {
    try {
      const res = await axios.get('/api/appointments', { headers })
      setAppointments(res.data)
      // Sync to localStorage for dashboard stat
      localStorage.setItem('sh-appointments', JSON.stringify(res.data))
    } catch { /* silent */ } finally { setFetchLoading(false) }
  }

  useEffect(() => { fetchAppointments() }, [])

  const handleSubmit = async e => {
    e.preventDefault()
    if (!selectedDoc) { showToast('Please select a doctor', 'error'); return }
    if (!selectedSlot) { showToast('Please select a time slot', 'error'); return }
    setLoading(true)
    try {
      await axios.post('/api/appointments', {
        doctorName: selectedDoc.name,
        specialization: selectedDoc.specialty,
        date: form.date,
        time: selectedSlot,
        reason: form.reason,
      }, { headers })
      showToast(`Appointment booked with ${selectedDoc.name}! ✅`, 'success')
      setSelectedDoc(null); setSelectedSlot(''); setForm({ date: '', reason: '' })
      fetchAppointments()
    } catch (err) {
      showToast(err.response?.data?.msg || 'Failed to book appointment', 'error')
    } finally {
      setLoading(false)
    }
  }

  const handleCancel = async id => {
    try {
      await axios.delete(`/api/appointments/${id}`, { headers })
      setAppointments(prev => prev.filter(a => a._id !== id))
      showToast('Appointment cancelled', 'info')
    } catch { showToast('Failed to cancel', 'error') }
  }

  const slotGroups = ['Morning', 'Afternoon', 'Evening']

  return (
    <div className="space-y-6 animate-fade-in-up">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-purple-600 flex items-center justify-center">
          <RiCalendarLine className="text-white text-xl" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Book Appointment</h1>
          <p className="text-sm text-gray-500 dark:text-slate-400">Schedule with specialist doctors</p>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">

        {/* Left: doctor grid + form */}
        <div className="xl:col-span-2 space-y-5">

          {/* Doctor cards */}
          <div className="bg-white dark:bg-slate-800 rounded-2xl p-5 shadow-card">
            <h3 className="font-semibold text-gray-800 dark:text-white mb-4">Choose a Doctor</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {DOCTORS.map(doc => (
                <button
                  key={doc.name}
                  onClick={() => setSelectedDoc(doc)}
                  className={`text-left p-4 rounded-xl border-2 transition-all duration-150 ${
                    selectedDoc?.name === doc.name
                      ? 'border-brand-500 bg-brand-50 dark:bg-brand-900/20'
                      : 'border-gray-100 dark:border-slate-700 hover:border-brand-200 dark:hover:border-brand-700'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-11 h-11 rounded-xl ${doc.color} flex items-center justify-center flex-shrink-0`}>
                      <span className="text-white text-sm font-bold">{doc.initials}</span>
                    </div>
                    <div className="min-w-0">
                      <p className="font-semibold text-gray-800 dark:text-slate-200 text-sm truncate">{doc.name}</p>
                      <p className="text-xs text-gray-500 dark:text-slate-400 truncate">{doc.specialty}</p>
                    </div>
                    {selectedDoc?.name === doc.name && (
                      <div className="ml-auto w-6 h-6 rounded-full bg-brand-600 flex items-center justify-center flex-shrink-0">
                        <RiCheckLine className="text-white text-xs" />
                      </div>
                    )}
                  </div>
                  <div className="flex items-center gap-3 mt-2.5">
                    <div className="flex items-center gap-1">
                      <RiStarFill className="text-amber-400 text-xs" />
                      <span className="text-xs font-semibold text-gray-700 dark:text-slate-300">{doc.rating}</span>
                    </div>
                    <span className="text-gray-300 dark:text-slate-600">·</span>
                    <div className="flex items-center gap-1 text-xs text-gray-500 dark:text-slate-400">
                      <RiUserLine className="text-xs" />
                      {doc.exp} experience
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Booking form */}
          {selectedDoc && (
            <div className="bg-white dark:bg-slate-800 rounded-2xl p-5 shadow-card animate-fade-in-up">
              <h3 className="font-semibold text-gray-800 dark:text-white mb-4">
                Book with <span className="text-brand-600 dark:text-brand-400">{selectedDoc.name}</span>
              </h3>

              <form onSubmit={handleSubmit} className="space-y-4">
                {/* Date */}
                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-gray-700 dark:text-slate-300">Appointment Date</label>
                  <input
                    id="app-date" type="date"
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-slate-700
                      bg-white dark:bg-slate-700 text-gray-900 dark:text-white
                      focus:outline-none focus:ring-2 focus:ring-brand-500 transition-all text-sm"
                    min={new Date().toISOString().split('T')[0]}
                    value={form.date}
                    onChange={e => setForm({...form, date: e.target.value})}
                    required
                  />
                </div>

                {/* Time slots */}
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700 dark:text-slate-300">
                    <RiTimeLine className="inline mr-1" />Time Slot
                  </label>
                  {slotGroups.map(group => (
                    <div key={group}>
                      <p className="text-xs text-gray-400 dark:text-slate-500 font-medium mb-1.5">{group}</p>
                      <div className="flex flex-wrap gap-2">
                        {TIME_SLOTS.filter(s => s.group === group).map(slot => (
                          <button
                            key={slot.label}
                            type="button"
                            onClick={() => setSelectedSlot(slot.label)}
                            className={`px-3 py-1.5 text-xs font-medium rounded-lg border transition-all ${
                              selectedSlot === slot.label
                                ? 'bg-brand-600 border-brand-600 text-white'
                                : 'border-gray-200 dark:border-slate-600 text-gray-600 dark:text-slate-300 hover:border-brand-400 hover:text-brand-600 dark:hover:text-brand-400'
                            }`}
                          >
                            {slot.label}
                          </button>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>

                {/* Reason */}
                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-gray-700 dark:text-slate-300">Reason / Symptoms <span className="text-gray-400 font-normal">(optional)</span></label>
                  <textarea
                    id="app-reason" rows={3}
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-slate-700
                      bg-white dark:bg-slate-700 text-gray-900 dark:text-white placeholder-gray-400
                      focus:outline-none focus:ring-2 focus:ring-brand-500 transition-all text-sm resize-none"
                    placeholder="Brief description of your condition..."
                    value={form.reason}
                    onChange={e => setForm({...form, reason: e.target.value})}
                  />
                </div>

                <button
                  id="book-btn" type="submit" disabled={loading}
                  className="w-full py-3 bg-brand-600 hover:bg-brand-700 disabled:opacity-50
                    text-white font-semibold rounded-xl transition-all hover:shadow-green
                    flex items-center justify-center gap-2"
                >
                  {loading ? <><span className="spinner" /> Booking...</> : <><RiCalendarLine /> Confirm Appointment</>}
                </button>
              </form>
            </div>
          )}
        </div>

        {/* Right: My appointments */}
        <div className="space-y-3">
          <h3 className="font-semibold text-gray-800 dark:text-white">My Appointments</h3>
          {fetchLoading ? (
            <div className="bg-white dark:bg-slate-800 rounded-2xl p-8 text-center shadow-card">
              <span className="spinner-green" />
            </div>
          ) : appointments.length === 0 ? (
            <div className="bg-white dark:bg-slate-800 rounded-2xl p-8 shadow-card text-center">
              <div className="w-12 h-12 rounded-2xl bg-gray-100 dark:bg-slate-700 flex items-center justify-center mx-auto mb-3">
                <RiCalendarLine className="text-xl text-gray-400" />
              </div>
              <p className="text-sm text-gray-500 dark:text-slate-400">No appointments yet</p>
            </div>
          ) : (
            appointments.map(a => (
              <div key={a._id} className="bg-white dark:bg-slate-800 rounded-2xl p-4 shadow-card">
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <p className="font-semibold text-gray-800 dark:text-slate-200 text-sm">{a.doctorName}</p>
                    <p className="text-xs text-gray-500 dark:text-slate-400">{a.specialization}</p>
                  </div>
                  <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${
                    a.status === 'Confirmed'  ? 'bg-brand-50 dark:bg-brand-900/30 text-brand-600 dark:text-brand-400' :
                    a.status === 'Cancelled' ? 'bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-400' :
                    'bg-amber-50 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400'
                  }`}>
                    {a.status}
                  </span>
                </div>
                <div className="flex items-center gap-3 text-xs text-gray-400 dark:text-slate-500 mb-3">
                  <span>📅 {a.date}</span>
                  <span>🕐 {a.time}</span>
                </div>
                {a.status !== 'Cancelled' && (
                  <button
                    onClick={() => handleCancel(a._id)}
                    className="w-full py-1.5 text-xs font-medium text-red-500 border border-red-200 dark:border-red-800/40
                      rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 transition-all"
                  >
                    Cancel
                  </button>
                )}
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  )
}

export default AppointmentBooking
