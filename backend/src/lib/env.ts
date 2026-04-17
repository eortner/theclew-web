const REQUIRED = [
  'DATABASE_URL',
  'JWT_SECRET',
  'FRONTEND_URL',
  'TOTP_ENCRYPTION_KEY',
] as const;

const OAUTH_GOOGLE   = ['GOOGLE_CLIENT_ID', 'GOOGLE_CLIENT_SECRET', 'GOOGLE_CALLBACK_URL'];
const OAUTH_FACEBOOK = ['FACEBOOK_APP_ID', 'FACEBOOK_APP_SECRET', 'FACEBOOK_CALLBACK_URL'];

export function validateEnv(): void {
  const missing = REQUIRED.filter((k) => !process.env[k]);
  if (missing.length) {
    console.error(`[ENV] Missing required environment variables: ${missing.join(', ')}`);
    process.exit(1);
  }

  if (process.env.JWT_SECRET!.length < 32) {
    console.error('[ENV] JWT_SECRET must be at least 32 characters');
    process.exit(1);
  }

  if (process.env.TOTP_ENCRYPTION_KEY!.length < 64) {
    console.error('[ENV] TOTP_ENCRYPTION_KEY must be at least 64 hex characters (32 bytes)');
    process.exit(1);
  }

  const missingGoogle   = OAUTH_GOOGLE.filter((k) => !process.env[k]);
  const missingFacebook = OAUTH_FACEBOOK.filter((k) => !process.env[k]);
  if (missingGoogle.length)   console.warn(`[ENV] Google OAuth disabled — missing: ${missingGoogle.join(', ')}`);
  if (missingFacebook.length) console.warn(`[ENV] Facebook OAuth disabled — missing: ${missingFacebook.join(', ')}`);
}

export const isGoogleEnabled   = OAUTH_GOOGLE.every((k) => !!process.env[k]);
export const isFacebookEnabled = OAUTH_FACEBOOK.every((k) => !!process.env[k]);