import { SetMetadata } from '@nestjs/common';
import { RATE_LIMIT_METADATA } from './rate-limit.constants';
import { RateLimitPolicy } from './rate-limit.interfaces';

export const RateLimit = (policy: Partial<RateLimitPolicy>) =>
  SetMetadata(RATE_LIMIT_METADATA, policy);
