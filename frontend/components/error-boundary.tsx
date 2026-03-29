"use client"

import { Button } from "@/components/ui/button"

import React from "react"

interface ErrorBoundaryProps {
  children: React.ReactNode
  fallback?: React.ReactNode
}

interface ErrorBoundaryState {
  hasError: boolean
  error: Error | null
  errorInfo: React.ErrorInfo | null
}

class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props)
    this.state = { hasError: false, error: null, errorInfo: null }
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    // Update state so the next render will show the fallback UI.
    return { hasError: true, error, errorInfo: null }
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    // You can also log the error to an error reporting service
    console.error("Uncaught error:", error, errorInfo)
    this.setState({ errorInfo })
  }

  render() {
    if (this.state.hasError) {
      // You can render any custom fallback UI
      if (this.props.fallback) {
        return this.props.fallback
      }
      return (
        <div className="flex flex-col items-center justify-center min-h-[60vh] text-center p-4">
          <h2 className="text-2xl font-bold text-red-600 mb-4">Oops! Something went wrong.</h2>
          <p className="text-gray-700 dark:text-gray-300 mb-4">
            We're sorry, but an unexpected error occurred. Please try again later.
          </p>
          {process.env.NODE_ENV === "development" && this.state.error && (
            <details className="text-left bg-gray-100 dark:bg-gray-700 p-4 rounded-md max-w-lg overflow-auto">
              <summary className="font-semibold cursor-pointer text-gray-800 dark:text-gray-200">Error Details</summary>
              <pre className="mt-2 text-sm text-red-700 dark:text-red-300 whitespace-pre-wrap break-words">
                {this.state.error.toString()}
                <br />
                {this.state.errorInfo?.componentStack}
              </pre>
            </details>
          )}
          <Button onClick={() => window.location.reload()} className="mt-6">
            Reload Page
          </Button>
        </div>
      )
    }

    return this.props.children
  }
}

export default ErrorBoundary
