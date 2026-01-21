const STORAGE_KEY = 'motion.auth'

type AuthSession = {
  accessToken: string
  refreshToken: string
}

let memorySession: AuthSession | null = null

export function getStoredSession(): AuthSession | null {
  if (memorySession) {
    return memorySession
  }

  if (typeof window === 'undefined') {
    return null
  }

  const raw = window.localStorage.getItem(STORAGE_KEY)
  if (!raw) {
    return null
  }

  try {
    const parsed = JSON.parse(raw) as AuthSession
    if (!parsed?.accessToken || !parsed?.refreshToken) {
      return null
    }
    memorySession = parsed
    return parsed
  } catch {
    return null
  }
}

export function setStoredSession(session: AuthSession) {
  memorySession = session
  if (typeof window !== 'undefined') {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(session))
  }
}

export function clearStoredSession() {
  memorySession = null
  if (typeof window !== 'undefined') {
    window.localStorage.removeItem(STORAGE_KEY)
  }
}

export function getAccessToken() {
  return getStoredSession()?.accessToken ?? null
}

export function getRefreshToken() {
  return getStoredSession()?.refreshToken ?? null
}