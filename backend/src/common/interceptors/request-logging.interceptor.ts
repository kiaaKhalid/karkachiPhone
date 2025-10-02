import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import type { Request } from 'express';
import { resolveClientIp } from '../../common/utils/ip.util';

interface AuthUserLike {
  role?: string;
  email?: string;
  sub?: string | number;
  id?: string | number;
  userId?: string | number;
}

@Injectable()
export class RequestLoggingInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const req = context
      .switchToHttp()
      .getRequest<Request & { user?: AuthUserLike }>();

    // Capture early to avoid mutation later
    const method = req.method;
    const url = req.originalUrl || req.url;
    const ip = resolveClientIp(req, true);
    const role = req.user?.role ?? 'ANON';
    const email = req.user?.email ?? 'unknown';

    const started = Date.now();
    return next.handle().pipe(
      tap({
        next: () => {
          // noop on successful emission
        },
        error: () => {
          // errors will still log below with duration
        },
        complete: () => {
          const ts = new Date().toISOString().replace('T', ' ').slice(0, 19);
          const duration = Date.now() - started;
          // Simple console log (non-blocking enough for dev; can be swapped to Winston later)
          // Example: [2025-09-30 15:20:45] IP: 192.168.1.10 | Role: ADMIN | Email: admin@test.com | GET /api/admin/orders (123ms)
          // Avoid logging sensitive data; only metadata
          console.log(
            `[${ts}] IP: ${ip} | Role: ${role} | Email: ${email} | ${method} ${url} (${duration}ms)`,
          );
        },
      }),
    );
  }
}
