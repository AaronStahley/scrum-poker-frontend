import { useState, useCallback } from 'react'

interface UseErrorHandlerReturn {
  error: string | null
  showError: (error: string | Error) => void
  clearError: () => void
  withErrorHandling: <T extends (...args: never[]) => Promise<unknown>>(
    fn: T
  ) => (...args: Parameters<T>) => Promise<ReturnType<T> | void>
}

export const useErrorHandler = (): UseErrorHandlerReturn => {
  const [error, setError] = useState<string | null>(null)

  const showError = useCallback((error: string | Error) => {
    const message = error instanceof Error ? error.message : error
    setError(message)
    console.error('Error occurred:', error)
  }, [])

  const clearError = useCallback(() => {
    setError(null)
  }, [])

  const withErrorHandling = useCallback(
    <T extends (...args: never[]) => Promise<unknown>>(fn: T) => {
      return async (...args: Parameters<T>): Promise<ReturnType<T> | void> => {
        try {
          return await fn(...args)
        } catch (error) {
          showError(error instanceof Error ? error : new Error(String(error)))
        }
      }
    },
    [showError]
  )

  return {
    error,
    showError,
    clearError,
    withErrorHandling,
  }
}

// Common error messages for Firebase errors
export const getFirebaseErrorMessage = (error: unknown): string => {
  const err = error as { code?: string; message?: string }
  if (!err?.code) return 'An unexpected error occurred'

  switch (err.code) {
    case 'permission-denied':
      return 'You do not have permission to perform this action'
    case 'not-found':
      return 'The requested resource was not found'
    case 'already-exists':
      return 'This resource already exists'
    case 'failed-precondition':
      return 'The operation was rejected due to invalid state'
    case 'aborted':
      return 'The operation was aborted due to a conflict'
    case 'out-of-range':
      return 'The request was outside the valid range'
    case 'unimplemented':
      return 'This feature is not yet implemented'
    case 'internal':
      return 'An internal server error occurred'
    case 'unavailable':
      return 'The service is currently unavailable. Please try again.'
    case 'deadline-exceeded':
      return 'The operation timed out. Please try again.'
    default:
      return err.message || 'An unexpected error occurred'
  }
}