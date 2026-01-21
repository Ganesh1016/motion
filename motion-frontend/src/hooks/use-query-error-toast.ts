import { useEffect, useRef } from 'react'
import { toast } from 'sonner'
import { getApiErrorMessage, isUnauthorizedError } from '../lib/api-error'

export function useQueryErrorToast(error: unknown, fallback?: string) {
  const lastMessage = useRef<string | null>(null)

  useEffect(() => {
    if (!error) {
      return
    }

    if (isUnauthorizedError(error)) {
      return
    }

    const message = getApiErrorMessage(error, fallback)
    if (lastMessage.current === message) {
      return
    }

    lastMessage.current = message
    toast.error(message)
  }, [error, fallback])
}