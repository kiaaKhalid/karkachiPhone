import { Request } from 'express';

export function resolveClientIp(req: Request, trustProxy = false): string {
  // If behind reverse proxy (e.g., Nginx/ELB/Cloudflare), use X-Forwarded-For
  if (trustProxy) {
    const fwd = req.headers['x-forwarded-for'];
    if (typeof fwd === 'string' && fwd.length > 0) {
      const [first] = fwd.split(',').map((s) => s.trim());
      if (first) return first;
    } else if (Array.isArray(fwd) && fwd.length > 0) {
      return fwd[0];
    }
  }
  // Fallbacks from Express
  return req.socket?.remoteAddress || req.ip || 'unknown';
}
