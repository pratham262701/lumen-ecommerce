import { createContext, useContext, useState, useCallback } from 'react'
import api from '../api/client'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    const raw = localStorage.getItem('user')
    return raw ? JSON.parse(raw) : null
  })

  const persist = (data) => {
    localStorage.setItem('token', data.token)
    const u = {
      id: data.userId,
      fullName: data.fullName,
      email: data.email,
      roles: data.roles,
    }
    localStorage.setItem('user', JSON.stringify(u))
    setUser(u)
  }

  const login = useCallback(async (email, password) => {
    const { data } = await api.post('/api/auth/login', { email, password })
    persist(data)
    return data
  }, [])

  const register = useCallback(async (fullName, email, password) => {
    const { data } = await api.post('/api/auth/register', { fullName, email, password })
    persist(data)
    return data
  }, [])

  const logout = useCallback(() => {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    setUser(null)
  }, [])

  const isAdmin = !!user?.roles?.includes('ROLE_ADMIN')

  return (
    <AuthContext.Provider value={{ user, isAdmin, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)
