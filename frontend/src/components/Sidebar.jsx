import { NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useTheme } from '../context/ThemeContext'
import {
  RiDashboardLine, RiMicroscopeLine, RiRobot2Line,
  RiCalendarLine, RiFileTextLine, RiHistoryLine,
  RiMoonLine, RiSunLine, RiLogoutBoxLine
} from 'react-icons/ri'

const navItems = [
  { to: '/dashboard',    icon: RiDashboardLine,  label: 'Dashboard'       },
  { to: '/predict',      icon: RiMicroscopeLine,  label: 'Disease Check'   },
  { to: '/chatbot',      icon: RiRobot2Line,      label: 'AI Chatbot'      },
  { to: '/appointments', icon: RiCalendarLine,    label: 'Appointments'    },
  { to: '/report',       icon: RiFileTextLine,    label: 'Report Analyzer' },
  { to: '/history',      icon: RiHistoryLine,     label: 'History'         },
]

const Sidebar = () => {
  const { user, logout } = useAuth()
  const { theme, toggleTheme } = useTheme()
  const navigate = useNavigate()

  const handleLogout = () => { logout(); navigate('/login') }

  const initials = user?.name
    ? user.name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase()
    : 'U'

  return (
    <aside className="
      fixed inset-y-0 left-0 z-40
      flex flex-col w-64
      bg-white dark:bg-slate-900
      border-r border-gray-100 dark:border-slate-800
      shadow-[2px_0_12px_rgba(0,0,0,0.04)]
    ">
      {/* Logo */}
      <div className="flex items-center gap-3 px-6 py-5 border-b border-gray-100 dark:border-slate-800">
        <div className="w-9 h-9 rounded-xl bg-brand-600 flex items-center justify-center flex-shrink-0">
          <span className="text-white text-lg">⚕</span>
        </div>
        <div className="leading-tight">
          <span className="font-bold text-gray-900 dark:text-white text-base">SmartHealth</span>
          <span className="block text-[10px] font-medium text-brand-600 uppercase tracking-widest">AI Platform</span>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto py-4 px-3">
        <p className="text-[10px] font-semibold text-gray-400 dark:text-slate-500 uppercase tracking-widest px-3 mb-2">Navigation</p>
        <ul className="space-y-0.5">
          {navItems.map(({ to, icon: Icon, label }) => (
            <li key={to}>
              <NavLink
                to={to}
                className={({ isActive }) => `
                  flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium
                  transition-all duration-150
                  ${isActive
                    ? 'bg-brand-50 dark:bg-brand-900/30 text-brand-700 dark:text-brand-400'
                    : 'text-gray-500 dark:text-slate-400 hover:bg-gray-50 dark:hover:bg-slate-800 hover:text-gray-800 dark:hover:text-slate-200'
                  }
                `}
              >
                {({ isActive }) => (
                  <>
                    <span className={`
                      w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 transition-all
                      ${isActive
                        ? 'bg-brand-600 text-white shadow-green'
                        : 'bg-gray-100 dark:bg-slate-800 text-gray-500 dark:text-slate-400'
                      }
                    `}>
                      <Icon className="text-base" />
                    </span>
                    <span>{label}</span>
                    {isActive && (
                      <span className="ml-auto w-1.5 h-1.5 rounded-full bg-brand-500" />
                    )}
                  </>
                )}
              </NavLink>
            </li>
          ))}
        </ul>
      </nav>

      {/* Bottom: theme + user + logout */}
      <div className="border-t border-gray-100 dark:border-slate-800 p-3 space-y-2">
        {/* Theme toggle */}
        <button
          onClick={toggleTheme}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium
            text-gray-500 dark:text-slate-400 hover:bg-gray-50 dark:hover:bg-slate-800
            hover:text-gray-800 dark:hover:text-slate-200 transition-all"
        >
          <span className="w-8 h-8 rounded-lg flex items-center justify-center bg-gray-100 dark:bg-slate-800">
            {theme === 'dark' ? <RiSunLine className="text-amber-400" /> : <RiMoonLine className="text-slate-500" />}
          </span>
          <span>{theme === 'dark' ? 'Light Mode' : 'Dark Mode'}</span>
        </button>

        {/* User + logout */}
        <div className="flex items-center gap-3 px-3 py-2.5 rounded-xl bg-gray-50 dark:bg-slate-800">
          <div className="w-8 h-8 rounded-lg bg-brand-600 flex items-center justify-center flex-shrink-0">
            <span className="text-white text-xs font-bold">{initials}</span>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-semibold text-gray-800 dark:text-slate-200 truncate">{user?.name}</p>
            <p className="text-[10px] text-gray-400 dark:text-slate-500 truncate">{user?.email}</p>
          </div>
          <button
            onClick={handleLogout}
            title="Logout"
            className="w-7 h-7 rounded-lg flex items-center justify-center
              text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/30
              transition-all flex-shrink-0"
          >
            <RiLogoutBoxLine className="text-sm" />
          </button>
        </div>
      </div>
    </aside>
  )
}

export default Sidebar
