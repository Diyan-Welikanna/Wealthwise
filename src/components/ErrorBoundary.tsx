'use client'

import { Component, ReactNode } from 'react'

interface Props {
  children: ReactNode
  fallback?: ReactNode
}

interface State {
  hasError: boolean
  error?: Error
}

export default class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = { hasError: false }
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, errorInfo: any) {
    console.error('ErrorBoundary caught an error:', error, errorInfo)
  }

  render() {
    if (this.state.hasError) {
      return (
        this.props.fallback || (
          <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 p-4">
            <div className="max-w-md w-full bg-white dark:bg-dark-surface rounded-lg shadow-lg p-8 text-center">
              <div className="w-16 h-16 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-4xl">⚠️</span>
              </div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-dark-text mb-2">
                Oops! Something went wrong
              </h1>
              <p className="text-gray-600 dark:text-gray-400 mb-6">
                We encountered an unexpected error. Don't worry, your data is safe.
              </p>
              {this.state.error && (
                <details className="text-left mb-6 p-4 bg-gray-50 dark:bg-gray-800 rounded text-sm">
                  <summary className="cursor-pointer font-semibold text-gray-700 dark:text-gray-300 mb-2">
                    Error Details
                  </summary>
                  <code className="text-red-600 dark:text-red-400 block break-all">
                    {this.state.error.toString()}
                  </code>
                </details>
              )}
              <div className="flex gap-3">
                <button
                  onClick={() => this.setState({ hasError: false })}
                  className="flex-1 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-medium transition-colors"
                >
                  Try Again
                </button>
                <button
                  onClick={() => window.location.href = '/dashboard'}
                  className="flex-1 px-4 py-2 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-900 dark:text-dark-text rounded-lg font-medium transition-colors"
                >
                  Go to Dashboard
                </button>
              </div>
            </div>
          </div>
        )
      )
    }

    return this.props.children
  }
}
