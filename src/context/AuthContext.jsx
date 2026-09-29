import { createContext, useContext, useMemo, useState } from 'react'
import api from '../services/api'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    const raw = localStorage.getItem('mams_user')
    return raw ? JSON.parse(raw) : null
  })

  const login = async (email, password) => {
    const { data } = await api.post('/auth/login', { email, password })
    localStorage.setItem('mams_token', data.token)
    localStorage.setItem('mams_user', JSON.stringify(data))
    setUser(data)
    return data
  }

  const logout = () => {
    localStorage.removeItem('mams_token')
    localStorage.removeItem('mams_user')
    setUser(null)
  }

  const value = useMemo(() => ({ user, login, logout }), [user])
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  return useContext(AuthContext)
}

export function canAccess(role, path) {
  if (!role) return false
  if (role === 'ADMIN') return true
  if (role === 'BASE_COMMANDER') {
    return !['/users', '/audit-logs'].includes(path)
  }
  if (role === 'LOGISTICS_OFFICER') {
    return ['/dashboard', '/purchases', '/transfers'].includes(path)
  }
  return false
}
