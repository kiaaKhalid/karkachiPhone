import { Controller, Get, Res } from '@nestjs/common';
import type { Response } from 'express';

// Exposes a safe endpoint to fetch a CSRF token for the frontend.
// csurf stores a CSRF secret in an httpOnly cookie; this endpoint
// calls req.csrfToken() (wired by csurf) and returns the token to the client
// so it can be sent back in the X-CSRF-Token header on write requests.
@Controller('api/security')
export class SecurityController {
  @Get('csrf-token')
  getCsrfToken(@Res() res: Response) {
    // csurf attaches csrfToken() to the request via response.locals in express adapter.
    // The Nest @Res() bypasses the standard response mapping, so we can access req via res.req.
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    const req = res.req as any;
    // eslint-disable-next-line @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
    const token: string = req.csrfToken?.() ?? '';

    // Optionally also set a non-httpOnly cookie to make it easy for SPA to read
    // and include in X-CSRF-Token header. Keep it short-lived by design at the SPA side.
    res.cookie('XSRF-TOKEN', token, {
      sameSite: 'strict',
      secure: process.env.NODE_ENV === 'production',
    });

    return res.json({ csrfToken: token });
  }
}
