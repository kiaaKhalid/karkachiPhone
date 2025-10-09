// @/lib/security.ts - Version Compatible Browser (Web Crypto API)
// Utilise AES-GCM pour le chiffrement (sécurisé, asynchrone).
// Note : Web Crypto n'est pas disponible en SSR ; utilisez seulement en client ("use client").

const ALGORITHM_ENCRYPT = "AES-GCM";
const HASH_ALGORITHM = "SHA-256";
const ENCRYPTION_KEY_HEX = "a1b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8e9f0a1b2"; // 32 bytes (64 hex chars)

// Cache pour la clé CryptoKey (évite de l'importer à chaque appel)
let cryptoKey: CryptoKey | null = null;

/**
 * Importe la clé de chiffrement (une seule fois).
 */
async function getCryptoKey(): Promise<CryptoKey> {
  if (cryptoKey) return cryptoKey;
  
  if (typeof window === 'undefined' || !window.crypto) {
    throw new Error('Web Crypto API non disponible (utilisez en client-side seulement)');
  }
  
  const keyBuffer = Uint8Array.from(
    ENCRYPTION_KEY_HEX.match(/.{2}/g)!.map(byte => parseInt(byte, 16))
  );
  
  cryptoKey = await window.crypto.subtle.importKey(
    "raw",
    keyBuffer,
    ALGORITHM_ENCRYPT,
    false,
    ["encrypt", "decrypt"]
  );
  
  return cryptoKey;
}

/**
 * Chiffre des données (async).
 */
export async function encryptData(text: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(text);
  const iv = window.crypto.getRandomValues(new Uint8Array(12)); // 12 bytes pour GCM
  const key = await getCryptoKey();

  const encryptedBuffer = await window.crypto.subtle.encrypt(
    { name: ALGORITHM_ENCRYPT, iv },
    key,
    data
  );

  // Conversion en Base64 pour stockage (compact)
  const ivB64 = btoa(String.fromCharCode(...iv));
  const encryptedB64 = btoa(String.fromCharCode(...new Uint8Array(encryptedBuffer)));
  return `${ivB64}:${encryptedB64}`;
}

/**
 * Décrypte des données (async).
 */
export async function decryptData(encryptedText: string): Promise<string> {
  const [ivB64, encryptedB64] = encryptedText.split(":");
  if (!ivB64 || !encryptedB64) {
    throw new Error("Format de données chiffrées invalide");
  }
  
  const iv = Uint8Array.from(atob(ivB64), c => c.charCodeAt(0));
  const encrypted = Uint8Array.from(atob(encryptedB64), c => c.charCodeAt(0));
  const key = await getCryptoKey();

  const decryptedBuffer = await window.crypto.subtle.decrypt(
    { name: ALGORITHM_ENCRYPT, iv },
    key,
    encrypted
  );

  const decoder = new TextDecoder();
  return decoder.decode(decryptedBuffer);
}

/**
 * Hash simple (SHA-256, async pour compatibilité).
 */
export async function generateHash(data: string): Promise<string> {
  const encoder = new TextEncoder();
  const dataBuffer = encoder.encode(data);
  const hashBuffer = await window.crypto.subtle.digest(HASH_ALGORITHM, dataBuffer);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

/**
 * Compare un hash (async).
 */
export async function compareHash(data: string, hash: string): Promise<boolean> {
  const generated = await generateHash(data);
  return generated === hash;
}

/**
 * Vérifie un mot de passe (utilise compareHash).
 */
export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return await compareHash(password, hash);
}

/**
 * Génère un token aléatoire sécurisé.
 */
export function generateToken(length = 32): string {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  let result = "";
  const array = new Uint8Array(length);
  window.crypto.getRandomValues(array);
  for (let i = 0; i < length; i++) {
    result += chars.charAt(array[i] % chars.length);
  }
  return result;
}

/**
 * Sanitise l'input pour éviter XSS.
 */
export function sanitizeInput(input: string): string {
  return input
    .replace(/[<>]/g, "") // Supprime les balises
    .replace(/javascript:/gi, "") // Supprime les schémas JS
    .replace(/on\w+=/gi, "") // Supprime les handlers d'événements
    .trim();
}

/**
 * Valide un email.
 */
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * Valide la force d'un mot de passe.
 */
export function validatePasswordStrength(password: string): {
  isValid: boolean;
  errors: string[];
} {
  const errors: string[] = [];

  if (password.length < 8) {
    errors.push("Le mot de passe doit faire au moins 8 caractères");
  }

  if (!/[A-Z]/.test(password)) {
    errors.push("Le mot de passe doit contenir au moins une majuscule");
  }

  if (!/[a-z]/.test(password)) {
    errors.push("Le mot de passe doit contenir au moins une minuscule");
  }

  if (!/\d/.test(password)) {
    errors.push("Le mot de passe doit contenir au moins un chiffre");
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
}

/**
 * Rate Limiter simple (inchangé).
 */
export class RateLimiter {
  private attempts: Map<string, { count: number; resetTime: number }> = new Map();

  constructor(
    private maxAttempts = 5,
    private windowMs: number = 15 * 60 * 1000, // 15 minutes
  ) {}

  isAllowed(identifier: string): boolean {
    const now = Date.now();
    const record = this.attempts.get(identifier);

    if (!record) {
      this.attempts.set(identifier, { count: 1, resetTime: now + this.windowMs });
      return true;
    }

    if (now > record.resetTime) {
      this.attempts.set(identifier, { count: 1, resetTime: now + this.windowMs });
      return true;
    }

    if (record.count >= this.maxAttempts) {
      return false;
    }

    record.count++;
    return true;
  }

  getRemainingTime(identifier: string): number {
    const record = this.attempts.get(identifier);
    if (!record) return 0;

    const now = Date.now();
    return Math.max(0, record.resetTime - now);
  }

  reset(identifier: string): void {
    this.attempts.delete(identifier);
  }
}

/**
 * Génère un token CSRF (inchangé).
 */
export function generateCSRFToken(): string {
  return generateToken(32);
}

/**
 * Valide un token CSRF (inchangé, mais timing-safe en prod).
 */
export function validateCSRFToken(token: string, expectedToken: string): boolean {
  return token === expectedToken;
}