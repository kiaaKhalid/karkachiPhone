// This file can be used for centralized error logging and handling.
// For client-side errors, consider using React Error Boundaries.
// For server-side errors, Next.js provides a static 500 page by default.

export function handleError(error: unknown, context?: string) {
  console.error(`Error: ${context ? `[${context}] ` : ""}`, error)
  // In a real application, you would send this error to an error tracking service like Sentry, Bugsnag, or Datadog.
  // Example: Sentry.captureException(error);
}

// Example of a custom error class
export class CustomError extends Error {
  statusCode: number
  constructor(message: string, statusCode = 500) {
    super(message)
    this.name = "CustomError"
    this.statusCode = statusCode
  }
}
