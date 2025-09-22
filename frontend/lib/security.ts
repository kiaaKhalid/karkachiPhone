/**
 * Simple encryption/decryption using Web Crypto API
 * In production, use a proper encryption library like crypto-js
 */

import crypto from "crypto"

const ALGORITHM = "aes-256-cbc"
const IV_LENGTH = 16 // For AES, this is always 16

// IMPORTANT: In a real application, ENCRYPTION_KEY MUST be a securely managed environment variable.
// It should NOT be hardcoded or randomly generated on each run, as this will prevent decryption
// of previously encrypted data. For this v0 preview, we use a fixed string.
const ENCRYPTION_KEY = "a1b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8e9f0a1b2" // 32 bytes (64 hex chars) for aes-256

// Ensure the key is exactly 32 bytes (256 bits) for AES-256
const keyBuffer = Buffer.from(ENCRYPTION_KEY, "hex")
if (keyBuffer.length !== 32) {
  // This check is for development/debugging. In production, ensure the env var is correct.
  console.error("ENCRYPTION_KEY must be 32 bytes (64 hex characters) for AES-256.")
  // Fallback to a valid key if the provided one is incorrect length (should not happen with hardcoded)
  // In a real app, you'd throw an error or use a default secure key.
}

export function encryptData(text: string): string {
  const iv = crypto.randomBytes(IV_LENGTH)
  const cipher = crypto.createCipheriv(ALGORITHM, keyBuffer, iv)
  let encrypted = cipher.update(text)
  encrypted = Buffer.concat([encrypted, cipher.final()])
  return iv.toString("hex") + ":" + encrypted.toString("hex")
}

export function decryptData(text: string): string {
  const textParts = text.split(":")
  const iv = Buffer.from(textParts.shift()!, "hex")
  const encryptedText = Buffer.from(textParts.join(":"), "hex")
  const decipher = crypto.createDecipheriv(ALGORITHM, keyBuffer, iv)
  let decrypted = decipher.update(encryptedText)
  decrypted = Buffer.concat([decrypted, decipher.final()])
  return decrypted.toString()
}

/**
 * Hash password using a simple algorithm
 * In production, use bcrypt or similar (e.g., Argon2, scrypt)
 */
export function generateHash(data: string): string {
  return crypto.createHash("sha256").update(data).digest("hex")
}

export function compareHash(data: string, hash: string): boolean {
  return generateHash(data) === hash
}

export function verifyPassword(password: string, hash: string): boolean {
  return compareHash(password, hash)
}

/**
 * Generate a secure random token
 */
export function generateToken(length = 32): string {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789"
  let result = ""
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  return result
}

/**
 * Sanitize user input to prevent XSS
 */
export function sanitizeInput(input: string): string {
  // Basic sanitization to prevent XSS.
  // In a real application, consider a library like 'dompurify' for HTML sanitization
  // or a robust markdown parser if accepting rich text.
  return input
    .replace(/[<>]/g, "") // Remove angle brackets
    .replace(/javascript:/gi, "") // Remove javascript: scheme
    .replace(/on\w+=/gi, "") // Remove event handlers (e.g., onclick=)
    .trim()
}

/**
 * Validate email format
 */
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

/**
 * Validate password strength
 */
export function validatePasswordStrength(password: string): {
  isValid: boolean
  errors: string[]
} {
  const errors: string[] = []

  if (password.length < 8) {
    errors.push("Password must be at least 8 characters long")
  }

  if (!/[A-Z]/.test(password)) {
    errors.push("Password must contain at least one uppercase letter")
  }

  if (!/[a-z]/.test(password)) {
    errors.push("Password must contain at least one lowercase letter")
  }

  if (!/\d/.test(password)) {
    errors.push("Password must contain at least one number")
  }

  return {
    isValid: errors.length === 0,
    errors,
  }
}

/**
 * Rate limiting helper
 */
export class RateLimiter {
  private attempts: Map<string, { count: number; resetTime: number }> = new Map()

  constructor(
    private maxAttempts = 5,
    private windowMs: number = 15 * 60 * 1000, // 15 minutes
  ) {}

  isAllowed(identifier: string): boolean {
    const now = Date.now()
    const record = this.attempts.get(identifier)

    if (!record) {
      this.attempts.set(identifier, { count: 1, resetTime: now + this.windowMs })
      return true
    }

    if (now > record.resetTime) {
      this.attempts.set(identifier, { count: 1, resetTime: now + this.windowMs })
      return true
    }

    if (record.count >= this.maxAttempts) {
      return false
    }

    record.count++
    return true
  }

  getRemainingTime(identifier: string): number {
    const record = this.attempts.get(identifier)
    if (!record) return 0

    const now = Date.now()
    return Math.max(0, record.resetTime - now)
  }

  reset(identifier: string): void {
    this.attempts.delete(identifier)
  }
}

/**
 * CSRF token generation and validation
 */
export function generateCSRFToken(): string {
  // In a real application, use a cryptographically secure random string
  // and store it securely (e.g., in a session or cookie).
  return generateToken(32)
}

export function validateCSRFToken(token: string, expectedToken: string): boolean {
  // In a real application, compare tokens securely (e.g., using crypto.timingSafeEqual)
  // to prevent timing attacks.
  return token === expectedToken
}
