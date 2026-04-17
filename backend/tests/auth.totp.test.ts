import request from 'supertest';
import app from '../src/app';

// Mock the entire totp.service so otplib is never loaded in tests
jest.mock('../src/auth/totp.service', () => ({
  createTotpSecret: jest.fn().mockReturnValue({
    secret: 'MOCK_SECRET',
    otpauthUrl: 'otpauth://totp/Emoclew:totp@emoclew.com?secret=MOCK_SECRET&issuer=Emoclew',
  }),
  encryptSecret: jest.fn().mockReturnValue('encrypted:mock:secret'),
  decryptSecret: jest.fn().mockReturnValue('MOCK_SECRET'),
  verifyToken: jest.fn(),
}));

import { verifyToken } from '../src/auth/totp.service';
const mockVerifyToken = verifyToken as jest.Mock;

const testUser = {
  email: 'totp@emoclew.com',
  name: 'TOTP User',
  password: 'Password123!',
};

async function registerAndGetCookie(): Promise<string[]> {
  const res = await request(app).post('/auth/register').send(testUser);
  const cookie = res.headers['set-cookie'];
  return Array.isArray(cookie) ? cookie : [cookie];
}

describe('TOTP setup', () => {
  it('returns 401 without auth', async () => {
    const res = await request(app).post('/auth/totp/setup');
    expect(res.status).toBe(401);
  });

  it('returns otpauthUrl on setup', async () => {
    const cookie = await registerAndGetCookie();
    const res = await request(app)
      .post('/auth/totp/setup')
      .set('Cookie', cookie);

    expect(res.status).toBe(200);
    expect(res.body.otpauthUrl).toMatch(/^otpauth:\/\/totp\//);
  });

  it('returns 400 if setup called when TOTP already enabled', async () => {
    const cookie = await registerAndGetCookie();
    mockVerifyToken.mockResolvedValueOnce(true);

    await request(app).post('/auth/totp/setup').set('Cookie', cookie);
    await request(app)
      .post('/auth/totp/verify')
      .set('Cookie', cookie)
      .send({ token: '123456' });

    const res = await request(app).post('/auth/totp/setup').set('Cookie', cookie);
    expect(res.status).toBe(400);
  });
});

describe('TOTP verify + enable', () => {
  it('returns 400 without token', async () => {
    const cookie = await registerAndGetCookie();
    await request(app).post('/auth/totp/setup').set('Cookie', cookie);

    const res = await request(app)
      .post('/auth/totp/verify')
      .set('Cookie', cookie)
      .send({});

    expect(res.status).toBe(400);
  });

  it('returns 401 with wrong token', async () => {
    const cookie = await registerAndGetCookie();
    await request(app).post('/auth/totp/setup').set('Cookie', cookie);
    mockVerifyToken.mockResolvedValueOnce(false);

    const res = await request(app)
      .post('/auth/totp/verify')
      .set('Cookie', cookie)
      .send({ token: '000000' });

    expect(res.status).toBe(401);
  });

  it('returns 200 with correct token', async () => {
    const cookie = await registerAndGetCookie();
    await request(app).post('/auth/totp/setup').set('Cookie', cookie);
    mockVerifyToken.mockResolvedValueOnce(true);

    const res = await request(app)
      .post('/auth/totp/verify')
      .set('Cookie', cookie)
      .send({ token: '123456' });

    expect(res.status).toBe(200);
  });
});

describe('TOTP reauth', () => {
  it('returns 400 if TOTP not enabled', async () => {
    const cookie = await registerAndGetCookie();
    const res = await request(app)
      .post('/auth/totp/reauth')
      .set('Cookie', cookie)
      .send({ token: '000000' });

    expect(res.status).toBe(400);
  });
});

describe('TOTP disable', () => {
  it('returns 400 if TOTP not enabled', async () => {
    const cookie = await registerAndGetCookie();
    const res = await request(app)
      .post('/auth/totp/disable')
      .set('Cookie', cookie)
      .send({ token: '000000' });

    expect(res.status).toBe(400);
  });
});