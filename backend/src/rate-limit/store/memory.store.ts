import {
  RateLimitPolicy,
  RateLimitResult,
  RateLimitStore,
} from '../rate-limit.interfaces';

type BucketState = {
  tokens: number;
  lastRefillMs: number;
  expiresAt: number; // for idle cleanup
};

export class MemoryRateLimitStore implements RateLimitStore {
  private buckets = new Map<string, BucketState>();

  constructor() {
    // Periodic cleanup of idle buckets
    setInterval(() => this.cleanup(), 60_000).unref?.();
  }

  private cleanup() {
    const now = Date.now();
    for (const [key, state] of this.buckets.entries()) {
      if (state.expiresAt < now) {
        this.buckets.delete(key);
      }
    }
  }

  consume(key: string, policy: RateLimitPolicy): Promise<RateLimitResult> {
    const nowMs = Date.now();
    const cost = policy.cost ?? 1;
    const idleExpireSeconds = policy.idleExpireSeconds ?? 3600;

    let state = this.buckets.get(key);
    if (!state) {
      state = {
        tokens: policy.burstCapacity,
        lastRefillMs: nowMs,
        expiresAt: nowMs + idleExpireSeconds * 1000,
      };
    } else {
      if (nowMs > state.lastRefillMs) {
        const deltaMs = nowMs - state.lastRefillMs;
        const refill = (deltaMs / 1000) * policy.refillRatePerSec;
        state.tokens = Math.min(policy.burstCapacity, state.tokens + refill);
        state.lastRefillMs = nowMs;
      }
      state.expiresAt = nowMs + idleExpireSeconds * 1000;
    }

    let allowed = false;
    if (state.tokens >= cost) {
      state.tokens -= cost;
      allowed = true;
    }

    this.buckets.set(key, state);

    const remaining = Math.max(0, Math.floor(state.tokens));
    const deficit = policy.burstCapacity - state.tokens;
    const resetSeconds = Math.max(
      0,
      Math.ceil(deficit / policy.refillRatePerSec),
    );
    const limit = policy.burstCapacity;

    return Promise.resolve({ allowed, remaining, resetSeconds, limit });
  }
}
