import { generateSecret, generateSync, verify, generateURI } from 'otplib';
import { createCipheriv, createDecipheriv, randomBytes } from 'crypto';

const ALGORITHM = 'aes-256-gcm';

function getEncryptionKey(): Buffer {
  const hex = process.env.TOTP_ENCRYPTION_KEY!;
  if (!hex || hex.length !== 64) {
    throw new Error('TOTP_ENCRYPTION_KEY must be a 64-char hex string (32 bytes)');
  }
  return Buffer.from(hex, 'hex');
}

export function encryptSecret(secret: string): string {
  const key = getEncryptionKey();
  const iv = randomBytes(12);
  const cipher = createCipheriv(ALGORITHM, key, iv);
  const encrypted = Buffer.concat([cipher.update(secret, 'utf8'), cipher.final()]);
  const tag = cipher.getAuthTag();
  return `${iv.toString('hex')}:${tag.toString('hex')}:${encrypted.toString('hex')}`;
}

export function decryptSecret(stored: string): string {
  const key = getEncryptionKey();
  const [ivHex, tagHex, encryptedHex] = stored.split(':');
  if (!ivHex || !tagHex || !encryptedHex) {
    throw new Error('Invalid encrypted secret format');
  }
  const iv = Buffer.from(ivHex, 'hex');
  const tag = Buffer.from(tagHex, 'hex');
  const encrypted = Buffer.from(encryptedHex, 'hex');
  const decipher = createDecipheriv(ALGORITHM, key, iv);
  decipher.setAuthTag(tag);
  return decipher.update(encrypted) + decipher.final('utf8');
}

export function createTotpSecret(email: string): { secret: string; otpauthUrl: string } {
  const secret = generateSecret();
  const otpauthUrl = generateURI({
    issuer: 'Emoclew',
    label: email,
    secret,
  });
  return { secret, otpauthUrl };
}

export async function verifyToken(token: string, encryptedSecret: string): Promise<boolean> {
  try {
    const secret = decryptSecret(encryptedSecret);
    const result = await verify({ token, secret, epochTolerance: 1 });
    return result.valid;
  } catch {
    return false;
  }
}