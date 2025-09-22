import { Module } from '@nestjs/common';
import type { IncomingHttpHeaders } from 'http';
import { RateLimitModule } from './rate-limit/rate-limit.module';
import { ExampleController } from './example/example.controller';

@Module({
  imports: [
    RateLimitModule.forRoot({
      trustProxy: true, // enable when behind reverse proxy / CDN in prod
      keyStrategy: 'ip', // global default
      refillRatePerSec: 5, // global default: 5 req/sec
      burstCapacity: 100, // allow short bursts
      cost: 1,
      idleExpireSeconds: 3600,
      // If using JWT and req.user exists, this is not needed; but you can customize:
      userIdResolver: (req: { headers: IncomingHttpHeaders; user?: any }) => {
        // Example fallback: read user id from a header in dev
        const val = req.headers['x-user-id'];
        const hdr = Array.isArray(val) ? val[0] : val;
        if (typeof hdr === 'string') return hdr;
        return undefined;
      },
    }),
  ],
  controllers: [ExampleController],
})
export class AppModule {}
