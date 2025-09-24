import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy, Profile, StrategyOptions } from 'passport-google-oauth20';

@Injectable()
export class GoogleStrategy extends PassportStrategy(Strategy, 'google') {
  constructor() {
    const options: StrategyOptions = {
      clientID: process.env.GOOGLE_CLIENT_ID ?? 'GOOGLE_CLIENT_ID',
      clientSecret: process.env.GOOGLE_CLIENT_SECRET ?? 'GOOGLE_CLIENT_SECRET',
      callbackURL:
        process.env.GOOGLE_CALLBACK_URL ??
        'http://localhost:3001/api/auth/google/callback',
      scope: ['email', 'profile'],
    };
    // eslint-disable-next-line @typescript-eslint/no-unsafe-call
    super(options);
  }

  validate(_accessToken: string, _refreshToken: string, profile: Profile) {
    type Email = { value?: string; verified?: boolean };
    type Photo = { value?: string };

    type P = {
      id: string;
      displayName?: string;
      emails?: Email[];
      photos?: Photo[];
    };

    const p: P = (profile as unknown as P) ?? ({} as P);
    const emails = Array.isArray(p.emails) ? p.emails : [];
    const photos = Array.isArray(p.photos) ? p.photos : [];

    const primaryEmail = emails.length > 0 ? emails[0] : undefined;
    const primaryPhoto = photos.length > 0 ? photos[0] : undefined;

    const email =
      typeof primaryEmail?.value === 'string' ? primaryEmail.value : '';
    const avatarUrl =
      typeof primaryPhoto?.value === 'string' ? primaryPhoto.value : null;
    const emailVerified = Boolean(primaryEmail?.verified ?? false);

    return {
      provider: 'google' as const,
      providerId: p.id,
      email,
      name: p.displayName ?? '',
      avatarUrl,
      emailVerified,
    };
  }
}
