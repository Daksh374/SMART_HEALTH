import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import './Navbar.css'

const navLinks = [
  { to: '/dashboard',    label: '🏠 Dashboard'   },
  { to: '/predict',      label: '🧬 Disease Check' },
  { to: '/chatbot',      label: '💬 Chatbot'       },
  { to: '/appointments', label: '📅 Appointments'  },
  { to: '/report',       label: '📋 Reports'       },
]

const Navbar = () => {
  const { isLoggedIn, user, logout } = useAuth()
  const location = useLocation()
  const navigate = useNavigate()

  const handleLogout = () => { logout(); navigate('/login') }

  return (
    <nav className="navbar">
      <div className="nav-brand">
        <span className="brand-icon">⚕️</span>
        <span className="brand-text">SmartHealth<span className="brand-ai"> AI</span></span>
      </div>

      {isLoggedIn && (
        <div className="nav-links">
          {navLinks.map(link => (
            <Link
              key={link.to}
              to={link.to}
              className={`nav-link ${location.pathname === link.to ? 'active' : ''}`}
            >
              {link.label}
            </Link>
          ))}
        </div>
      )}

      <div className="nav-right">
        {isLoggedIn ? (
          <>
            <span className="nav-user">Welcome {user?.name}</span>
            <button className="btn btn-outline btn-sm" onClick={handleLogout}>Logout</button>
          </>
        ) : (
          <>
            <Link to="/login" className="btn btn-outline btn-sm">Login</Link>
            <Link to="/register" className="btn btn-primary btn-sm">Register</Link>
          </>
        )}
      </div>
    </nav>
  )
}

export default Navbar
