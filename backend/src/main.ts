import 'reflect-metadata';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import cookieParser from 'cookie-parser';
import helmet from 'helmet';
import type { RequestHandler } from 'express';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // ✅ Enhanced CORS: Dynamic origin validation
  const frontendOrigins = [
    process.env.FRONTEND_URL || 'http://localhost:3000',
    'http://localhost:3001', // For multi-port dev if needed
  ];

  app.enableCors({
    origin: (
      origin: string | undefined,
      callback: (err: Error | null, allow: boolean) => void,
    ): void => {
      // Allow non-browser requests (e.g., mobile apps)
      if (!origin) return callback(null, true);
      if (frontendOrigins.includes(origin)) {
        return callback(null, true);
      }
      console.warn(`CORS blocked origin: ${origin}`); // Log for debug
      return callback(new Error('Not allowed by CORS'), false);
    },
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS', 'HEAD'],
    credentials: true, // Essential for cookies/tokens
    allowedHeaders: [
      'Content-Type',
      'Authorization',
      'X-Requested-With',
      'Accept',
      'Origin',
      'X-Forwarded-For',
      'User-Agent',
    ],
    exposedHeaders: [
      'X-RateLimit-Limit',
      'X-RateLimit-Remaining',
      'X-RateLimit-Reset',
      'Retry-After',
      'Set-Cookie',
    ],
    preflightContinue: false,
    optionsSuccessStatus: 204,
    maxAge: 86400, // Cache preflight responses for 24h
  });

  // ✅ Helmet: Relaxed CSP for dev
  const helmetOptions = {
    contentSecurityPolicy:
      process.env.NODE_ENV === 'production'
        ? "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; connect-src 'self' https://*.google.com https://accounts.google.com;"
        : false, // Disable CSP in dev to avoid blocks
    crossOriginEmbedderPolicy: false,
  };

  const helmetFactory = helmet as unknown as (opts?: unknown) => RequestHandler;
  app.use(helmetFactory(helmetOptions));

  // Global validation
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  // Cookie parser
  const cookieSecret = process.env.COOKIE_SECRET || 'change-me-cookie-secret';
  app.use(cookieParser(cookieSecret));

  const port = process.env.PORT ?? 3000;
  await app.listen(port);
  console.log(`Application running on: http://localhost:${port}`);
}

bootstrap().catch((error: Error) => {
  console.error('Failed to start application:', error);
  process.exit(1);
});
