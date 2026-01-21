import type { ApiErrorResponse, ApiSuccessResponse } from '../types/api'
import { getAccessToken } from '../store/auth-storage'

export class ApiError extends Error {
  statusCode: number
  errors?: unknown
  isNetworkError: boolean

  constructor(
    message: string,
    statusCode: number,
    errors?: unknown,
    isNetworkError = false
  ) {
    super(message)
    this.name = 'ApiError'
    this.statusCode = statusCode
    this.errors = errors
    this.isNetworkError = isNetworkError
  }
}

type RequestOptions = {
  method?: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE'
  body?: unknown
  auth?: boolean
  query?: Record<string, string | number | undefined>
  signal?: AbortSignal
}

type UnauthorizedHandler = () => void

let unauthorizedHandler: UnauthorizedHandler | null = null

export function setUnauthorizedHandler(handler: UnauthorizedHandler) {
  unauthorizedHandler = handler
}

const envBaseUrl = import.meta.env.VITE_API_BASE_URL
const baseUrl = (envBaseUrl && envBaseUrl.length > 0 ? envBaseUrl : '/api').replace(
  /\/$/,
  ''
)

function buildUrl(path: string, query?: RequestOptions['query']) {
  const normalizedPath = path.startsWith('/') ? path : `/${path}`
  const url = baseUrl ? `${baseUrl}${normalizedPath}` : normalizedPath

  if (!query) {
    return url
  }

  const searchParams = new URLSearchParams()
  Object.entries(query).forEach(([key, value]) => {
    if (value === undefined || value === null || value === '') {
      return
    }
    searchParams.set(key, String(value))
  })

  const queryString = searchParams.toString()
  return queryString ? `${url}?${queryString}` : url
}

export async function apiRequest<T>(path: string, options: RequestOptions = {}) {
  const { method = 'GET', body, auth = true, query, signal } = options
  const headers: HeadersInit = {
    Accept: 'application/json',
  }

  if (auth) {
    const token = getAccessToken()
    if (token) {
      headers.Authorization = `Bearer ${token}`
    }
  }

  const isFormData = typeof FormData !== 'undefined' && body instanceof FormData
  if (body && !isFormData) {
    headers['Content-Type'] = 'application/json'
  }

  const response = await fetch(buildUrl(path, query), {
    method,
    headers,
    body: body ? (isFormData ? body : JSON.stringify(body)) : undefined,
    credentials: 'include',
    signal,
  }).catch(() => {
    throw new ApiError('Network error. Please retry.', 0, undefined, true)
  })

  const contentType = response.headers.get('content-type') ?? ''
  const isJson = contentType.includes('application/json')
  const payload = isJson ? await response.json().catch(() => null) : null

  if (!response.ok) {
    const errorPayload = payload as ApiErrorResponse | null
    const message = errorPayload?.error?.message || response.statusText || 'Request failed'
    const statusCode = errorPayload?.error?.statusCode ?? response.status
    const errors = errorPayload?.error?.errors

    if (statusCode === 401 && auth && unauthorizedHandler) {
      unauthorizedHandler()
    }

    throw new ApiError(message, statusCode, errors)
  }

  const successPayload = payload as ApiSuccessResponse<T> | null
  if (successPayload && typeof successPayload === 'object' && 'data' in successPayload) {
    return successPayload.data
  }

  return payload as T
}
