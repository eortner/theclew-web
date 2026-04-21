import { Request, Response } from 'express';
import { User } from '@prisma/client';
import { prisma } from '../lib/prisma';
import { createTotpSecret, encryptSecret, verifyToken } from './totp.service';

export async function setupTotp(req: Request, res: Response): Promise<void> {
  const user = req.user as User;

  if (user.totpEnabled) {
    res.status(400).json({ error: 'TOTP is already enabled' });
    return;
  }

  const { secret, otpauthUrl } = createTotpSecret(user.email);
  const encryptedSecret = encryptSecret(secret);

  await prisma.user.update({
    where: { id: user.id },
    data: { totpSecret: encryptedSecret },
  });

  res.json({ otpauthUrl });
}

export async function verifyAndEnableTotp(req: Request, res: Response): Promise<void> {
  const user = req.user as User;
  const { token } = req.body;

  if (!token || typeof token !== 'string') {
    res.status(400).json({ error: 'Token is required' });
    return;
  }

  const freshUser = await prisma.user.findUnique({ where: { id: user.id } });

  if (!freshUser?.totpSecret) {
    res.status(400).json({ error: 'TOTP setup not initiated — call /auth/totp/setup first' });
    return;
  }

  if (freshUser.totpEnabled) {
    res.status(400).json({ error: 'TOTP is already enabled' });
    return;
  }

  if (!(verifyToken(token, freshUser.totpSecret))) {
    res.status(401).json({ error: 'Invalid TOTP token' });
    return;
  }

  await prisma.user.update({
    where: { id: user.id },
    data: { totpEnabled: true, totpVerifiedAt: new Date() },
  });

  res.json({ message: 'TOTP enabled successfully' });
}

export async function disableTotp(req: Request, res: Response): Promise<void> {
  const user = req.user as User;
  const { token } = req.body;

  if (!token || typeof token !== 'string') {
    res.status(400).json({ error: 'Token is required' });
    return;
  }

  const freshUser = await prisma.user.findUnique({ where: { id: user.id } });

  if (!freshUser?.totpEnabled || !freshUser.totpSecret) {
    res.status(400).json({ error: 'TOTP is not enabled' });
    return;
  }

  if (!(verifyToken(token, freshUser.totpSecret))) {
    res.status(401).json({ error: 'Invalid TOTP token' });
    return;
  }

  await prisma.user.update({
    where: { id: user.id },
    data: { totpEnabled: false, totpSecret: null, totpVerifiedAt: null },
  });

  res.json({ message: 'TOTP disabled successfully' });
}

export async function reauthTotp(req: Request, res: Response): Promise<void> {
  const user = req.user as User;
  const { token } = req.body;

  if (!token || typeof token !== 'string') {
    res.status(400).json({ error: 'Token is required' });
    return;
  }

  const freshUser = await prisma.user.findUnique({ where: { id: user.id } });

  if (!freshUser?.totpEnabled || !freshUser.totpSecret) {
    res.status(400).json({ error: 'TOTP is not enabled on this account' });
    return;
  }

  if (!(verifyToken(token, freshUser.totpSecret))) {
    res.status(401).json({ error: 'Invalid TOTP token' });
    return;
  }

  await prisma.user.update({
    where: { id: user.id },
    data: { totpVerifiedAt: new Date() },
  });

  res.json({ message: 'TOTP verified' });
}