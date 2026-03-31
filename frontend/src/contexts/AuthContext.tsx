import React, { createContext, useContext, useEffect, useState } from 'react'
import api from '../services/api'
import * as authService from '../services/auth'

type User = { id: number; username: string; display_name: string }

type AuthContextType = {
  user: User | null
  token: string | null
  isAuthenticated: boolean
  login: (username: string, password: string) => Promise<void>
  signup: (username: string, password: string, displayName?: string) => Promise<void>
  logout: () => void
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export const useAuth = () => {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null)
  const [token, setToken] = useState<string | null>(() => authService.getToken())

  const isAuthenticated = !!token

  useEffect(() => {
    async function restore() {
      const t = authService.getToken()
      if (!t) return
      try {
        const res = await api.get('/api/auth/me')
        setUser(res.data)
        setToken(t)
      } catch (err) {
        authService.logout()
        setUser(null)
        setToken(null)
      }
    }
    restore()
  }, [])

  async function login(username: string, password: string) {
    const res = await authService.login(username, password)
    // login stored token already; fetch user
    const r = await api.get('/api/auth/me')
    setUser(r.data)
    setToken(authService.getToken())
  }

  async function signup(username: string, password: string, displayName?: string) {
    const res = await authService.signup(username, password, displayName)
    // signup stored token already; fetch user
    const r = await api.get('/api/auth/me')
    setUser(r.data)
    setToken(authService.getToken())
  }

  function logout() {
    authService.logout()
    setUser(null)
    setToken(null)
  }

  return (
    <AuthContext.Provider value={{ user, token, isAuthenticated, login, signup, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export default AuthContext
