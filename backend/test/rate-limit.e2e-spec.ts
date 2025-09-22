import { INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import request from 'supertest';
import { RateLimitModule } from '../src/rate-limit/rate-limit.module';
import { ExampleController } from '../src/example/example.controller';

describe('RateLimit (e2e, memory store)', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [
        RateLimitModule.forRoot({
          trustProxy: false,
          keyStrategy: 'ip',
          refillRatePerSec: 2, // 2 req/sec
          burstCapacity: 3,
        }),
      ],
      controllers: [ExampleController],
    }).compile();

    app = moduleRef.createNestApplication();
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  it('should allow up to burstCapacity requests immediately, then 429', async () => {
    // Hit a route without a decorator (uses global policy)
    const route = '/example/browse';
    // First 3 should pass
    // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
    await request(app.getHttpServer()).get(route).expect(200);
    // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
    await request(app.getHttpServer()).get(route).expect(200);
    // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
    await request(app.getHttpServer()).get(route).expect(200);
    // 4th should be 429 immediately since no time to refill
    // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
    const res = await request(app.getHttpServer()).get(route).expect(429);
    expect(res.headers['x-ratelimit-limit']).toBe('3');
    expect(res.headers['x-ratelimit-remaining']).toBeDefined();
    expect(res.headers['x-ratelimit-reset']).toBeDefined();
    expect(res.headers['retry-after']).toBeDefined();
  });
});
