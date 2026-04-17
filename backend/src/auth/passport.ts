import { PassportStatic } from 'passport';
import { Strategy as LocalStrategy } from 'passport-local';
import { Strategy as JwtStrategy, ExtractJwt } from 'passport-jwt';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import { Strategy as FacebookStrategy } from 'passport-facebook';
import bcrypt from 'bcryptjs';
import { prisma } from '../lib/prisma';
import { AuthProvider } from '@prisma/client';
import { isBlacklisted } from '../lib/token-blacklist';
import { JwtPayload } from '../lib/jwt';
import { isGoogleEnabled, isFacebookEnabled } from '../lib/env';

export function configurePassport(passport: PassportStatic): void {

  // ── Local (email + password) ──
  passport.use(new LocalStrategy(
    { usernameField: 'email' },
    async (email, password, done) => {
      try {
        const user = await prisma.user.findUnique({ where: { email } });

        // Always run bcrypt even if user not found — prevents timing attacks
        // that could reveal whether an email is registered
        const hash = user?.passwordHash ?? '$2a$12$invalidhashpaddingtomakecomparelong';
        const valid = await bcrypt.compare(password, hash);

        if (!user || !user.passwordHash || !valid) {
          return done(null, false, { message: 'Invalid credentials' });
        }
        return done(null, user);
      } catch (err) {
        return done(err);
      }
    }
  ));

  // ── JWT ──
  passport.use(new JwtStrategy(
    {
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey: process.env.JWT_SECRET!,
    },
    async (payload: JwtPayload, done) => {
      try {
        if (isBlacklisted(payload.jti)) return done(null, false);
        const user = await prisma.user.findUnique({ where: { id: payload.sub } });
        if (!user) return done(null, false);
        return done(null, user);
      } catch (err) {
        return done(err);
      }
    }
  ));

  // ── Google OAuth2 ──
  if (isGoogleEnabled) {
    passport.use(new GoogleStrategy(
      {
        clientID:     process.env.GOOGLE_CLIENT_ID!,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
        callbackURL:  process.env.GOOGLE_CALLBACK_URL!,
      },
      async (_accessToken, _refreshToken, profile, done) => {
        try {
          const email = profile.emails?.[0]?.value;
          if (!email) return done(new Error('No email provided by Google'));

          let user = await prisma.user.findFirst({
            where: { provider: AuthProvider.GOOGLE, providerId: profile.id },
          });

          if (!user) {
            user = await prisma.user.upsert({
              where: { email },
              update: { provider: AuthProvider.GOOGLE, providerId: profile.id },
              create: {
                email,
                name:       profile.displayName,
                avatarUrl:  profile.photos?.[0]?.value,
                provider:   AuthProvider.GOOGLE,
                providerId: profile.id,
              },
            });
          }

          return done(null, user);
        } catch (err) {
          return done(err as Error);
        }
      }
    ));
  }

  // ── Facebook OAuth ──
  if (isFacebookEnabled) {
    passport.use(new FacebookStrategy(
      {
        clientID:     process.env.FACEBOOK_APP_ID!,
        clientSecret: process.env.FACEBOOK_APP_SECRET!,
        callbackURL:  process.env.FACEBOOK_CALLBACK_URL!,
        profileFields: ['id', 'emails', 'name', 'picture'],
      },
      async (_accessToken, _refreshToken, profile, done) => {
        try {
          const email = profile.emails?.[0]?.value;
          if (!email) return done(new Error('No email provided by Facebook'));

          let user = await prisma.user.findFirst({
            where: { provider: AuthProvider.FACEBOOK, providerId: profile.id },
          });

          if (!user) {
            user = await prisma.user.upsert({
              where: { email },
              update: { provider: AuthProvider.FACEBOOK, providerId: profile.id },
              create: {
                email,
                name:       `${profile.name?.givenName ?? ''} ${profile.name?.familyName ?? ''}`.trim(),
                avatarUrl:  profile.photos?.[0]?.value,
                provider:   AuthProvider.FACEBOOK,
                providerId: profile.id,
              },
            });
          }

          return done(null, user);
        } catch (err) {
          return done(err as Error);
        }
      }
    ));
  }
}
