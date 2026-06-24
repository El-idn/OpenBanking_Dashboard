import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react'
import { api } from '@/lib/api'
import type { User, UserRole } from '@/types'

interface AuthState {
  user: User | null
  token: string | null
  isAuthenticated: boolean
  mfaPending: boolean
  activeRole: UserRole | null
}

interface AuthContextValue extends AuthState {
  login: (email: string, password: string) => Promise<void>
  verifyMfa: (code: string) => Promise<void>
  logout: () => void
  switchRole: (role: UserRole) => void
}

const AuthContext = createContext<AuthContextValue | null>(null)

const STORAGE_KEY = 'openbank_auth'

function loadAuth(): Partial<AuthState> {
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY)
    return raw ? JSON.parse(raw) : {}
  } catch {
    return {}
  }
}

function saveAuth(state: Partial<AuthState>) {
  sessionStorage.setItem(STORAGE_KEY, JSON.stringify(state))
  if (state.user?.id) {
    sessionStorage.setItem('msw_current_user_id', state.user.id)
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const saved = loadAuth()
  const [user, setUser] = useState<User | null>(saved.user ?? null)
  const [token, setToken] = useState<string | null>(saved.token ?? null)
  const [mfaPending, setMfaPending] = useState(false)
  const [activeRole, setActiveRole] = useState<UserRole | null>(saved.activeRole ?? saved.user?.role ?? null)

  const isAuthenticated = !!token && !!user && !mfaPending

  useEffect(() => {
    if (user && token && activeRole) {
      saveAuth({ user, token, activeRole })
    }
  }, [user, token, activeRole])

  const login = useCallback(async (email: string, password: string) => {
    const res = await api.login(email, password)
    setUser(res.user)
    setMfaPending(res.requiresMfa)
    if (!res.requiresMfa) {
      setToken(res.token)
      setActiveRole(res.user.role)
    }
  }, [])

  const verifyMfa = useCallback(async (code: string) => {
    const res = await api.verifyMfa(code)
    setToken(res.token)
    setUser(res.user)
    setActiveRole(res.user.role)
    setMfaPending(false)
    sessionStorage.setItem('openbank_token', res.token)
    sessionStorage.setItem('msw_current_user_id', res.user.id)
  }, [])

  const logout = useCallback(() => {
    setUser(null)
    setToken(null)
    setMfaPending(false)
    setActiveRole(null)
    sessionStorage.removeItem(STORAGE_KEY)
    sessionStorage.removeItem('openbank_token')
    sessionStorage.removeItem('msw_current_user_id')
  }, [])

  const switchRole = useCallback((role: UserRole) => {
    setActiveRole(role)
  }, [])

  const value = useMemo(
    () => ({
      user,
      token,
      isAuthenticated,
      mfaPending,
      activeRole,
      login,
      verifyMfa,
      logout,
      switchRole,
    }),
    [user, token, isAuthenticated, mfaPending, activeRole, login, verifyMfa, logout, switchRole],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
