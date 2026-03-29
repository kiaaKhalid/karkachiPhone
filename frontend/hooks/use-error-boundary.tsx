"use client"

import type React from "react"

import { useState, useCallback } from "react"

interface ErrorBoundaryState {
  hasError: boolean
  error: Error | null
  errorInfo: React.ErrorInfo | null
}

// This hook is a simplified example. For a full Error Boundary,
// a class component is typically used as per React documentation.
// This hook can be used to manage error state within a functional component
// that acts as an error boundary.
export function useErrorBoundary(): [
  ErrorBoundaryState,
  (error: Error, errorInfo: React.ErrorInfo) => void,
  () => void,
] {
  const [state, setState] = useState<ErrorBoundaryState>({
    hasError: false,
    error: null,
    errorInfo: null,
  })

  const setError = useCallback((error: Error, errorInfo: React.ErrorInfo) => {
    setState({ hasError: true, error, errorInfo })
    // You can log the error here to a service like Sentry
    console.error("Caught error by useErrorBoundary:", error, errorInfo)
  }, [])

  const resetError = useCallback(() => {
    setState({ hasError: false, error: null, errorInfo: null })
  }, [])

  return [state, setError, resetError]
}
