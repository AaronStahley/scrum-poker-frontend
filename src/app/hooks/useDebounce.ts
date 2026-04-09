import { useRef, useCallback } from 'react'

export function useDebounce<T extends (...args: never[]) => unknown>(
  func: T,
  delay: number
): (...args: Parameters<T>) => void {
  const timeoutRef = useRef<NodeJS.Timeout | null>(null)

  return useCallback(
    (...args: Parameters<T>) => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
      }

      timeoutRef.current = setTimeout(() => {
        func(...args)
      }, delay)
    },
    [func, delay]
  )
}

export function useDebouncedCallback<T extends (...args: never[]) => Promise<unknown>>(
  func: T,
  delay: number
): {
  debouncedCallback: (...args: Parameters<T>) => void
  cancel: () => void
  pending: boolean
} {
  const timeoutRef = useRef<NodeJS.Timeout | null>(null)
  const pendingRef = useRef(false)

  const cancel = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current)
      timeoutRef.current = null
      pendingRef.current = false
    }
  }, [])

  const debouncedCallback = useCallback(
    (...args: Parameters<T>) => {
      cancel()
      pendingRef.current = true

      timeoutRef.current = setTimeout(async () => {
        try {
          await func(...args)
        } finally {
          pendingRef.current = false
          timeoutRef.current = null
        }
      }, delay)
    },
    [func, delay, cancel]
  )

  return {
    debouncedCallback,
    cancel,
    pending: pendingRef.current,
  }
}