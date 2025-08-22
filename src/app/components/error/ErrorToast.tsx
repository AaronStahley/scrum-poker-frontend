'use client'

import { useEffect, useState } from 'react'

interface ErrorToastProps {
  error: string | null
  onDismiss: () => void
  duration?: number
}

const ErrorToast: React.FC<ErrorToastProps> = ({ 
  error, 
  onDismiss, 
  duration = 5000 
}) => {
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    if (error) {
      setIsVisible(true)
      const timer = setTimeout(() => {
        setIsVisible(false)
        setTimeout(onDismiss, 300) // Wait for fade out animation
      }, duration)

      return () => clearTimeout(timer)
    }
  }, [error, duration, onDismiss])

  if (!error) return null

  return (
    <div className={`toast toast-top toast-center z-50 transition-opacity duration-300 ${
      isVisible ? 'opacity-100' : 'opacity-0'
    }`}>
      <div className="alert alert-error">
        <div>
          <span>{error}</span>
          <button 
            className="btn btn-sm btn-circle btn-ghost ml-2"
            onClick={() => {
              setIsVisible(false)
              setTimeout(onDismiss, 300)
            }}
          >
            ✕
          </button>
        </div>
      </div>
    </div>
  )
}

export default ErrorToast