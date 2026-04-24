import { useState, useRef, useEffect } from 'react'
import axios from 'axios'
import { useAuth } from '../context/AuthContext'
import { RiRobot2Line, RiSendPlaneLine, RiUser3Line } from 'react-icons/ri'

const QUICK_REPLIES = [
  { label: '🔍 Check Symptoms',       text: 'How do I check my symptoms?' },
  { label: '📅 Book Appointment',     text: 'How do I book an appointment?' },
  { label: '🩺 Symptoms of diabetes', text: 'What are the symptoms of diabetes?' },
  { label: '❤️ Lower blood pressure', text: 'How to lower blood pressure naturally?' },
  { label: '💧 Daily water intake',   text: 'How much water should I drink daily?' },
  { label: '🤒 Frequent headaches',   text: 'What causes frequent headaches?' },
]

const formatTime = (d) => d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })

const Chatbot = () => {
  const { token } = useAuth()
  const [messages, setMessages] = useState([
    {
      role: 'bot',
      text: "Hi! I'm **HealthBot** \n\nI'm your AI-powered medical assistant. Ask me any health-related questions and I'll do my best to help!\n\n*Please note: I'm for educational purposes only — always consult a real doctor.*",
      time: new Date(),
    }
  ])
  const [input, setInput]     = useState('')
  const [loading, setLoading] = useState(false)
  const bottomRef = useRef(null)
  const inputRef  = useRef(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, loading])

  const parseText = (text) => {
    // Simple markdown-like bold/italic rendering
    return text
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/\*(.*?)\*/g, '<em>$1</em>')
      .replace(/\n/g, '<br/>')
  }

  const sendMessage = async (text) => {
    const question = text || input
    if (!question.trim()) return
    const userMsg = { role: 'user', text: question, time: new Date() }
    setMessages(prev => [...prev, userMsg])
    setInput('')
    setLoading(true)
    try {
      const res = await axios.post('/api/chat', { message: question }, {
        headers: { Authorization: `Bearer ${token}` }
      })
      setMessages(prev => [...prev, { role: 'bot', text: res.data.reply, time: new Date() }])
    } catch {
      setMessages(prev => [...prev, {
        role: 'bot',
        text: '⚠️ Chat service unavailable. Please ensure the ML service is running.',
        time: new Date(),
      }])
    } finally {
      setLoading(false)
      inputRef.current?.focus()
    }
  }

  return (
    <div className="flex flex-col h-[calc(100vh-7rem)] max-h-[800px] animate-fade-in-up">
      {/* Header */}
      <div className="flex items-center gap-3 mb-4">
        <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center">
          <RiRobot2Line className="text-white text-xl" />
        </div>
        <div>
          <h1 className="text-xl font-bold text-gray-900 dark:text-white">AI Medical Chatbot</h1>
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-brand-500 animate-pulse-soft" />
            <span className="text-xs text-gray-500 dark:text-slate-400">HealthBot • Online</span>
          </div>
        </div>
      </div>

      {/* Chat window */}
      <div className="flex-1 bg-white dark:bg-slate-800 rounded-2xl shadow-card flex flex-col overflow-hidden">

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-5 space-y-4">
          {messages.map((msg, i) => (
            <div key={i} className={`flex items-end gap-2.5 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}>
              {/* Avatar */}
              <div className={`w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 ${
                msg.role === 'bot'
                  ? 'bg-blue-100 dark:bg-blue-900/40'
                  : 'bg-brand-100 dark:bg-brand-900/40'
              }`}>
                {msg.role === 'bot'
                  ? <RiRobot2Line className="text-blue-600 dark:text-blue-400 text-sm" />
                  : <RiUser3Line  className="text-brand-600 dark:text-brand-400 text-sm" />
                }
              </div>

              {/* Bubble */}
              <div className={`max-w-[72%] ${msg.role === 'user' ? 'items-end' : 'items-start'} flex flex-col gap-1`}>
                <div className={`px-4 py-3 rounded-2xl text-sm leading-relaxed ${
                  msg.role === 'bot'
                    ? 'bg-gray-50 dark:bg-slate-700 text-gray-800 dark:text-slate-200 rounded-bl-sm'
                    : 'bg-brand-600 text-white rounded-br-sm'
                }`}>
                  <span dangerouslySetInnerHTML={{ __html: parseText(msg.text) }} />
                </div>
                <span className="text-[10px] text-gray-400 dark:text-slate-500 px-1">
                  {formatTime(msg.time)}
                </span>
              </div>
            </div>
          ))}

          {/* Typing indicator */}
          {loading && (
            <div className="flex items-end gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-blue-100 dark:bg-blue-900/40 flex items-center justify-center flex-shrink-0">
                <RiRobot2Line className="text-blue-600 dark:text-blue-400 text-sm" />
              </div>
              <div className="bg-gray-50 dark:bg-slate-700 px-4 py-3.5 rounded-2xl rounded-bl-sm flex items-center gap-1.5">
                <span className="typing-dot" />
                <span className="typing-dot" />
                <span className="typing-dot" />
              </div>
            </div>
          )}
          <div ref={bottomRef} />
        </div>

        {/* Quick replies */}
        <div className="px-4 pb-2 pt-3 border-t border-gray-100 dark:border-slate-700 flex flex-wrap gap-1.5">
          {QUICK_REPLIES.map((q, i) => (
            <button
              key={i}
              onClick={() => sendMessage(q.text)}
              disabled={loading}
              className="px-3 py-1.5 text-xs font-medium rounded-full border border-gray-200 dark:border-slate-600
                bg-white dark:bg-slate-700 text-gray-600 dark:text-slate-300
                hover:border-brand-400 hover:text-brand-600 dark:hover:text-brand-400
                disabled:opacity-50 transition-all duration-150 whitespace-nowrap"
            >
              {q.label}
            </button>
          ))}
        </div>
                        
        {/* Input row */}
        <div className="flex gap-2 p-4 pt-2 border-t border-gray-100 dark:border-slate-700">
          <input
            id="chat-input"
            ref={inputRef}
            className="flex-1 px-4 py-2.5 rounded-xl border border-gray-200 dark:border-slate-600
              bg-gray-50 dark:bg-slate-700 text-gray-900 dark:text-white text-sm placeholder-gray-400
              focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent transition-all"
            placeholder="Ask a health question..."
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && !e.shiftKey && sendMessage()}
            disabled={loading}
          />
          <button
            id="chat-send-btn"
            onClick={() => sendMessage()}
            disabled={loading || !input.trim()}
            className="w-11 h-11 rounded-xl bg-brand-600 hover:bg-brand-700 disabled:opacity-50 disabled:cursor-not-allowed
              flex items-center justify-center text-white transition-all hover:shadow-green active:scale-95"
          >
            {loading ? <span className="spinner" /> : <RiSendPlaneLine className="text-lg" />}
          </button>
        </div>
      </div>
    </div>
  )
}

export default Chatbot
