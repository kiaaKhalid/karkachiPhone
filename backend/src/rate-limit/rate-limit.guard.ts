import {
  CanActivate,
  ExecutionContext,
  Injectable,
  HttpException,
  HttpStatus,
  Inject,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import type { Request, Response } from 'express';
import {
  HEADERS,
  RATE_LIMIT_METADATA,
  RATE_LIMIT_OPTIONS,
  RATE_LIMIT_STORE,
} from './rate-limit.constants';
import type {
  RateLimitGlobalOptions,
  RateLimitPolicy,
  RateLimitStore,
} from './rate-limit.interfaces';
import { resolveClientIp } from '../common/utils/ip.util';

interface AuthenticatedRequest extends Request {
  user?: {
    id?: string | number;
    sub?: string | number;
    userId?: string | number;
    role?: string;
  };
}

@Injectable()
export class RateLimitGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    @Inject(RATE_LIMIT_OPTIONS)
    private readonly options: RateLimitGlobalOptions,
    @Inject(RATE_LIMIT_STORE)
    private readonly store: RateLimitStore,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const req = context.switchToHttp().getRequest<AuthenticatedRequest>();
    const res = context.switchToHttp().getResponse<Response>();

    const routePolicyPartial =
      this.reflector.get<Partial<RateLimitPolicy>>(
        RATE_LIMIT_METADATA,
        context.getHandler(),
      ) || {};

    // Resolve base policy from global options
    let policy: RateLimitPolicy = {
      refillRatePerSec:
        routePolicyPartial.refillRatePerSec ?? this.options.refillRatePerSec,
      burstCapacity:
        routePolicyPartial.burstCapacity ?? this.options.burstCapacity,
      cost: routePolicyPartial.cost ?? this.options.cost,
      keyStrategy: routePolicyPartial.keyStrategy ?? this.options.keyStrategy,
      prefix: routePolicyPartial.prefix ?? this.options.prefix,
      idleExpireSeconds:
        routePolicyPartial.idleExpireSeconds ?? this.options.idleExpireSeconds,
    };

    const route = req.route as { path?: string } | undefined;
    const routePath = route?.path ?? req.url;

    // Whitelist handling (bypass RL)
    if (
      Array.isArray(this.options.whitelist) &&
      this.options.whitelist.length
    ) {
      for (const rule of this.options.whitelist) {
        if (typeof rule === 'string') {
          if (routePath.startsWith(rule)) return true;
        } else if (rule instanceof RegExp) {
          if (rule.test(routePath)) return true;
        }
      }
    }

    // Per-role overrides
    const role = req.user?.role;
    if (typeof role === 'string' && this.options.rolePolicies) {
      const override = this.options.rolePolicies[role];
      if (override) {
        policy = {
          refillRatePerSec:
            override.refillRatePerSec ?? policy.refillRatePerSec,
          burstCapacity: override.burstCapacity ?? policy.burstCapacity,
          cost: override.cost ?? policy.cost,
          keyStrategy: override.keyStrategy ?? policy.keyStrategy,
          prefix: override.prefix ?? policy.prefix,
          idleExpireSeconds:
            override.idleExpireSeconds ?? policy.idleExpireSeconds,
        };
      }
    }

    const identity = this.getIdentity(req, policy.keyStrategy!);
    const key = `${policy.prefix}${policy.keyStrategy}:${identity}:${req.method}:${routePath}`;

    const result = await this.store.consume(key, policy);

    res.setHeader(HEADERS.LIMIT, policy.burstCapacity.toString());
    res.setHeader(HEADERS.REMAINING, result.remaining.toString());
    res.setHeader(HEADERS.RESET, result.resetSeconds.toString());

    if (!result.allowed) {
      res.setHeader(HEADERS.RETRY_AFTER, result.resetSeconds.toString());
      throw new HttpException(
        {
          statusCode: HttpStatus.TOO_MANY_REQUESTS,
          error: 'Too Many Requests',
          message:
            'Rate limit exceeded. Please retry after the time specified in the Retry-After header.',
        },
        HttpStatus.TOO_MANY_REQUESTS,
      );
    }

    return true;
  }

  private getIdentity(
    req: AuthenticatedRequest,
    strategy: NonNullable<RateLimitPolicy['keyStrategy']>,
  ): string {
    switch (strategy) {
      case 'user': {
        const userId =
          req.user?.id ||
          req.user?.sub ||
          req.user?.userId ||
          this.options.userIdResolver?.(req);

        if (userId) return `user:${userId}`;

        const ip = resolveClientIp(req, !!this.options.trustProxy);
        const uahRaw = req.headers['user-agent'] as
          | string
          | string[]
          | undefined;
        const uah: string | undefined = Array.isArray(uahRaw)
          ? uahRaw[0]
          : uahRaw;
        const ua = uah ?? 'unknown';

        return `anon:${ip}:${ua}`;
      }

      case 'ip_ua': {
        const ip = resolveClientIp(req, !!this.options.trustProxy);
        const uahRaw = req.headers['user-agent'] as
          | string
          | string[]
          | undefined;
        const uah: string | undefined = Array.isArray(uahRaw)
          ? uahRaw[0]
          : uahRaw;
        const ua = uah ?? 'unknown';
        return `${ip}:${ua}`;
      }

      case 'ip':
      default:
        return resolveClientIp(req, !!this.options.trustProxy);
    }
  }
}
