import { createContext, useState, useCallback } from 'react'
import { authService } from '@/services/authService'

export const AuthContext = createContext(null)

export default function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    const stored = localStorage.getItem('spyzer_user')
    return stored ? JSON.parse(stored) : null
  })
  const [token, setToken] = useState(() => localStorage.getItem('spyzer_token'))

  const isAuthenticated = !!user && !!token

  const login = useCallback(async (email, password) => {
    try {
      const data = await authService.login(email, password)
      const userData = { email, nombre: data.nombre, rol: data.rol }
      localStorage.setItem('spyzer_user', JSON.stringify(userData))
      localStorage.setItem('spyzer_token', data.token)
      setUser(userData)
      setToken(data.token)
      return { success: true }
    } catch (error) {
      return { success: false, error: error.message || 'Credenciales inválidas' }
    }
  }, [])

  const logout = useCallback(() => {
    localStorage.removeItem('spyzer_user')
    localStorage.removeItem('spyzer_token')
    setUser(null)
    setToken(null)
  }, [])

  return (
    <AuthContext.Provider value={{ user, token, isAuthenticated, login, logout }}>
      {children}
    </AuthContext.Provider>
  )
}
