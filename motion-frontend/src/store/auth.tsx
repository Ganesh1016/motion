import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from 'react'
import { toast } from 'sonner'
import { authApi } from '../api/auth'
import { setUnauthorizedHandler } from '../api/client'
import { getApiErrorMessage, isUnauthorizedError } from '../lib/api-error'
import type { User } from '../types/api'
import {
  clearStoredSession,
  getRefreshToken,
  getStoredSession,
  setStoredSession,
} from './auth-storage'

type AuthContextValue = {
  user: User | null
  isAuthenticated: boolean
  isLoading: boolean
  login: (email: string, password: string) => Promise<User>
  register: (email: string, password: string) => Promise<User>
  logout: () => Promise<void>
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [hasSession, setHasSession] = useState(Boolean(getStoredSession()))

  useEffect(() => {
    setUnauthorizedHandler(() => {
      clearStoredSession()
      setHasSession(false)
      setUser(null)
      toast.error('Session expired. Please log in again.')
    })
  }, [])

  useEffect(() => {
    const session = getStoredSession()
    if (!session) {
      setIsLoading(false)
      return
    }

    setHasSession(true)

    authApi
      .me()
      .then((currentUser) => {
        setUser(currentUser)
      })
      .catch((error) => {
        if (!isUnauthorizedError(error)) {
          toast.error(getApiErrorMessage(error, 'Unable to verify session'))
          clearStoredSession()
          setHasSession(false)
          setUser(null)
        }
      })
      .finally(() => {
        setIsLoading(false)
      })
  }, [])

  const login = async (email: string, password: string) => {
    const response = await authApi.login(email, password)
    setStoredSession({
      accessToken: response.accessToken,
      refreshToken: response.refreshToken,
    })
    setHasSession(true)
    setUser(response.user)
    return response.user
  }

  const register = async (email: string, password: string) => {
    const response = await authApi.register(email, password)
    setStoredSession({
      accessToken: response.accessToken,
      refreshToken: response.refreshToken,
    })
    setHasSession(true)
    setUser(response.user)
    return response.user
  }

  const logout = async () => {
    let error: unknown = null
    const refreshToken = getRefreshToken()
    if (refreshToken) {
      try {
        await authApi.logout(refreshToken)
      } catch (err) {
        error = err
      }
    }
    clearStoredSession()
    setHasSession(false)
    setUser(null)
    if (error) {
      throw error
    }
  }

  const value = useMemo(
    () => ({
      user,
      isAuthenticated: hasSession,
      isLoading,
      login,
      register,
      logout,
    }),
    [user, hasSession, isLoading]
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider')
  }
  return context
}
