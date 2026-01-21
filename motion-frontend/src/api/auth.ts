import { apiRequest } from './client'
import type { User } from '../types/api'

type AuthResponse = {
  user: User
  accessToken: string
  refreshToken: string
}

export const authApi = {
  register: (email: string, password: string) =>
    apiRequest<AuthResponse>('/auth/register', {
      method: 'POST',
      auth: false,
      body: { email, password },
    }),
  login: (email: string, password: string) =>
    apiRequest<AuthResponse>('/auth/login', {
      method: 'POST',
      auth: false,
      body: { email, password },
    }),
  logout: (refreshToken: string) =>
    apiRequest<{ message: string }>('/auth/logout', {
      method: 'POST',
      body: { refreshToken },
    }),
  me: () => apiRequest<User>('/auth/me'),
}