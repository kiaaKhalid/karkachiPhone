export const RATE_LIMIT_OPTIONS = 'RATE_LIMIT_OPTIONS';
export const RATE_LIMIT_METADATA = 'RATE_LIMIT_METADATA';
export const RATE_LIMIT_STORE = 'RATE_LIMIT_STORE';

export const DEFAULT_GLOBAL_POLICY = {
  // tokens per second steady rate (e.g., 5 req/sec)
  refillRatePerSec: 5,
  // allow short bursts up to this number
  burstCapacity: 50,
  // default cost per request
  cost: 1,
  // key strategy: ip | user | ip_ua
  keyStrategy: 'ip' as const,
  // default key prefix
  prefix: 'rl:',
  // auto-expire idle bucket keys (seconds)
  idleExpireSeconds: 3600,
};

export const HEADERS = {
  LIMIT: 'X-RateLimit-Limit',
  REMAINING: 'X-RateLimit-Remaining',
  RESET: 'X-RateLimit-Reset',
  RETRY_AFTER: 'Retry-After',
};
