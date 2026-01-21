import { ApiError } from '../api/client'

function extractValidationMessage(errors: unknown) {
  if (!errors || typeof errors !== 'object') {
    return null
  }

  const record = errors as Record<string, unknown>
  const firstKey = Object.keys(record)[0]
  if (!firstKey) {
    return null
  }

  const value = record[firstKey]
  if (Array.isArray(value) && value.length > 0) {
    return String(value[0])
  }

  return typeof value === 'string' ? value : null
}

export function getApiErrorMessage(error: unknown, fallback = 'Something went wrong') {
  if (error instanceof ApiError) {
    if (error.isNetworkError) {
      return 'Network error. Please retry.'
    }

    if (error.statusCode === 401) {
      return 'Session expired. Please log in again.'
    }

    if (error.statusCode === 403) {
      return 'No access.'
    }

    if (error.statusCode === 404) {
      return 'Not found.'
    }

    if (error.statusCode === 400 || error.statusCode === 422) {
      return extractValidationMessage(error.errors) || error.message || fallback
    }

    return error.message || fallback
  }

  if (error instanceof Error) {
    return error.message || fallback
  }

  return fallback
}

export function isUnauthorizedError(error: unknown) {
  return error instanceof ApiError && error.statusCode === 401
}