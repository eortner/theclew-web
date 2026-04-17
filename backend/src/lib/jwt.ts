import jwt, { SignOptions } from 'jsonwebtoken';
import { randomUUID } from 'crypto';
import { User } from '@prisma/client';

export interface JwtPayload {
  sub:   string;
  email: string;
  role:  string;
  jti:   string;
  iat:   number;
  exp:   number;
}

export function signToken(user: Pick<User, 'id' | 'email' | 'role'>): string {
  const options: SignOptions = {
    expiresIn: (process.env.JWT_EXPIRES_IN ?? '7d') as SignOptions['expiresIn'],
  };

  return jwt.sign(
    { sub: user.id, email: user.email, role: user.role, jti: randomUUID() },
    process.env.JWT_SECRET!,
    options,
  );
}

export function verifyToken(token: string): JwtPayload {
  return jwt.verify(token, process.env.JWT_SECRET!, {
    algorithms: ['HS256'],
  }) as JwtPayload;
}