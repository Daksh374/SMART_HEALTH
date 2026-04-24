import { createContext, useContext, useState, useEffect } from 'react'
import axios from 'axios'

const AuthContext = createContext()

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [token, setToken] = useState(null)

  const fetchUserData = async (authToken) => {
    try {
      const pRes = await axios.get('/api/predictions', { headers: { Authorization: `Bearer ${authToken}` } })
      if (pRes.data) localStorage.setItem('sh-predictions', JSON.stringify(pRes.data))

      const rRes = await axios.get('/api/reports', { headers: { Authorization: `Bearer ${authToken}` } })
      if (rRes.data) localStorage.setItem('sh-reports', JSON.stringify(rRes.data))

      const aRes = await axios.get('/api/appointments', { headers: { Authorization: `Bearer ${authToken}` } })
      if (aRes.data) localStorage.setItem('sh-appointments', JSON.stringify(aRes.data))
    } catch (err) {
      console.error('Failed to fetch user data', err)
    }
  }

  useEffect(() => {
    const storedToken = localStorage.getItem('token')
    const storedUser = localStorage.getItem('user')
    if (storedToken && storedUser) {
      setToken(storedToken)
      setUser(JSON.parse(storedUser))
      fetchUserData(storedToken)
    }
  }, [])

  const login = async (token, user) => {
    localStorage.setItem('token', token)
    localStorage.setItem('user', JSON.stringify(user))
    setToken(token)
    setUser(user)
    await fetchUserData(token)
  }

  const logout = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    setToken(null)
    setUser(null)
  }

  return (
    <AuthContext.Provider value={{ user, token, login, logout, isLoggedIn: !!token }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)
