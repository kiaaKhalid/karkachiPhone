export type RateLimitKeyStrategy = 'ip' | 'user' | 'ip_ua';

export interface RateLimitPolicy {
  refillRatePerSec: number;
  burstCapacity: number;
  cost?: number;
  keyStrategy?: RateLimitKeyStrategy;
  prefix?: string;
  idleExpireSeconds?: number;
}

export interface RateLimitGlobalOptions extends RateLimitPolicy {
  // Optional function to resolve a custom identity string when keyStrategy = 'user' and req.user isn't populated
  userIdResolver?: (req: any) => string | undefined;
  // Optionally override default trust of proxy headers. In production behind reverse proxy, set true
  trustProxy?: boolean;
}

export interface RateLimitResult {
  allowed: boolean;
  remaining: number;
  resetSeconds: number;
  limit: number;
}

export interface RateLimitStore {
  /**
   * Consume tokens for a key according to the policy.
   * Returns allowed status, remaining tokens, and reset time in seconds.
   * O(1) per request.
   */
  consume(key: string, policy: RateLimitPolicy): Promise<RateLimitResult>;
  /**
   * Optional disconnect/cleanup for Redis.
   */
  close?(): Promise<void> | void;
}
