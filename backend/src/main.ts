import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import cookieParser from 'cookie-parser';
import csurf from 'csurf';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Security: strict CORS configuration
  const allowOrigin = (process.env.CORS_ORIGIN || 'http://localhost:3000')
    .split(',')
    .map((s: string) => s.trim())
    .filter(Boolean);

  app.enableCors({
    origin: (
      origin: string | undefined,
      cb: (err: Error | null, allow?: boolean) => void,
    ) => {
      // Allow non-browser tools without Origin (e.g., curl, Postman)
      if (!origin) return cb(null, true);
      if (allowOrigin.includes(origin)) return cb(null, true);
      return cb(new Error('CORS: Origin not allowed'), false);
    },
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    credentials: true,
    allowedHeaders: [
      'Content-Type',
      'Authorization',
      'X-CSRF-Token',
      'X-Requested-With',
      'Accept',
      'Origin',
    ],
    exposedHeaders: [
      'X-RateLimit-Limit',
      'X-RateLimit-Remaining',
      'X-RateLimit-Reset',
      'Retry-After',
    ],
    preflightContinue: false,
    optionsSuccessStatus: 204,
  });

  // Validation for DTOs
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  // Cookies + CSRF
  const cookieSecret = process.env.COOKIE_SECRET || 'change-me-cookie-secret';
  app.use(cookieParser(cookieSecret));

  const isProd = process.env.NODE_ENV === 'production';
  app.use(
    // eslint-disable-next-line @typescript-eslint/no-unsafe-call
    csurf({
      cookie: {
        httpOnly: true,
        sameSite: 'strict',
        secure: isProd,
      },
      ignoreMethods: ['GET', 'HEAD', 'OPTIONS'],
    }),
  );

  const port = process.env.PORT ?? 3000;
  await app.listen(port);
  console.log(`Application is running on: http://localhost:${port}`);
}

// Properly handle the bootstrap promise
bootstrap().catch((error: Error) => {
  console.error('Failed to start application:', error);
  process.exit(1);
});
