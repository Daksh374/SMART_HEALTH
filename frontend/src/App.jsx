import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import { ThemeProvider } from './context/ThemeContext'
import { ToastProvider } from './context/ToastContext'
import Layout from './components/Layout'
import ProtectedRoute from './components/ProtectedRoute'

import Login              from './pages/Login'
import Register           from './pages/Register'
import Dashboard          from './pages/Dashboard'
import DiseasePrediction  from './pages/DiseasePrediction'
import Chatbot            from './pages/Chatbot'
import AppointmentBooking from './pages/AppointmentBooking'
import ReportAnalyzer     from './pages/ReportAnalyzer'
import History            from './pages/History'

const ProtectedLayout = ({ children }) => (
  <ProtectedRoute>
    <Layout>{children}</Layout>
  </ProtectedRoute>
)

function App() {
  return (
    <ThemeProvider>
      <ToastProvider>
        <AuthProvider>
          <BrowserRouter>
            <Routes>
              <Route path="/"          element={<Navigate to="/dashboard" />} />
              <Route path="/login"     element={<Login />} />
              <Route path="/register"  element={<Register />} />
              <Route path="/dashboard"    element={<ProtectedLayout><Dashboard /></ProtectedLayout>} />
              <Route path="/predict"      element={<ProtectedLayout><DiseasePrediction /></ProtectedLayout>} />
              <Route path="/chatbot"      element={<ProtectedLayout><Chatbot /></ProtectedLayout>} />
              <Route path="/appointments" element={<ProtectedLayout><AppointmentBooking /></ProtectedLayout>} />
              <Route path="/report"       element={<ProtectedLayout><ReportAnalyzer /></ProtectedLayout>} />
              <Route path="/history"      element={<ProtectedLayout><History /></ProtectedLayout>} />
            </Routes>
          </BrowserRouter>
        </AuthProvider>
      </ToastProvider>
    </ThemeProvider>
  )
}

export default App
