'use client'

import React, { Component, ReactNode } from 'react'

interface Props {
  children: ReactNode
  fallback?: ReactNode
}

interface State {
  hasError: boolean
  error?: Error
}

class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = { hasError: false }
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo)
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback
      }

      return (
        <div className="alert alert-error max-w-md mx-auto mt-8">
          <div>
            <h3 className="font-bold">Something went wrong!</h3>
            <div className="text-sm opacity-75">
              {this.state.error?.message || 'An unexpected error occurred'}
            </div>
            <div className="mt-4">
              <button 
                className="btn btn-sm btn-outline"
                onClick={() => this.setState({ hasError: false, error: undefined })}
              >
                Try again
              </button>
              <button 
                className="btn btn-sm btn-primary ml-2"
                onClick={() => window.location.reload()}
              >
                Reload page
              </button>
            </div>
          </div>
        </div>
      )
    }

    return this.props.children
  }
}

export default ErrorBoundary