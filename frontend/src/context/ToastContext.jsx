import { createContext, useContext, useState, useCallback } from 'react'

const ToastContext = createContext()

let idCounter = 0

export const ToastProvider = ({ children }) => {
  const [toasts, setToasts] = useState([])

  const showToast = useCallback((message, type = 'success') => {
    const id = ++idCounter
    setToasts(prev => [...prev, { id, message, type }])
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id))
    }, 4000)
  }, [])

  const dismiss = (id) => setToasts(prev => prev.filter(t => t.id !== id))

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      {/* Toast Container */}
      <div className="fixed top-4 right-4 z-[9999] flex flex-col gap-2 pointer-events-none">
        {toasts.map(toast => (
          <div
            key={toast.id}
            className={`
              pointer-events-auto flex items-start gap-3 px-4 py-3 rounded-xl shadow-lg
              min-w-[280px] max-w-sm animate-slide-in
              ${toast.type === 'success' ? 'bg-brand-600 text-white' : ''}
              ${toast.type === 'error'   ? 'bg-red-500 text-white'   : ''}
              ${toast.type === 'info'    ? 'bg-blue-500 text-white'  : ''}
              ${toast.type === 'warning' ? 'bg-amber-500 text-white' : ''}
            `}
          >
            <span className="text-lg flex-shrink-0">
              {toast.type === 'success' && '✅'}
              {toast.type === 'error'   && '❌'}
              {toast.type === 'info'    && 'ℹ️'}
              {toast.type === 'warning' && '⚠️'}
            </span>
            <p className="text-sm font-medium flex-1 leading-snug">{toast.message}</p>
            <button
              onClick={() => dismiss(toast.id)}
              className="text-white/70 hover:text-white ml-1 flex-shrink-0 text-lg leading-none"
            >×</button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  )
}

export const useToast = () => useContext(ToastContext)
