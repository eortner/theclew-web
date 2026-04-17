import request from 'supertest';
import app from '../src/app';
import { prisma } from '../src/lib/prisma';

const BASE = '/auth';

const testUser = {
  email: 'test@emoclew.com',
  name: 'Test User',
  password: 'Password123!',
};

describe('POST /auth/register', () => {
  it('creates a new user and sets auth cookie', async () => {
    const res = await request(app).post(`${BASE}/register`).send(testUser);

    expect(res.status).toBe(201);
    expect(res.body.user.email).toBe(testUser.email);
    expect(res.body.user.passwordHash).toBeUndefined();
    expect(res.headers['set-cookie']).toBeDefined();
  });

  it('returns 409 on duplicate email', async () => {
    await request(app).post(`${BASE}/register`).send(testUser);
    const res = await request(app).post(`${BASE}/register`).send(testUser);

    expect(res.status).toBe(409);
  });

  it('returns 400 on invalid payload', async () => {
    const res = await request(app).post(`${BASE}/register`).send({ email: 'bad' });
    expect(res.status).toBe(400);
  });
});

describe('POST /auth/login', () => {
  beforeEach(async () => {
    await request(app).post(`${BASE}/register`).send(testUser);
  });

  it('returns user and sets auth cookie on valid credentials', async () => {
    const res = await request(app).post(`${BASE}/login`).send({
      email: testUser.email,
      password: testUser.password,
    });

    expect(res.status).toBe(200);
    expect(res.body.user.email).toBe(testUser.email);
    expect(res.headers['set-cookie']).toBeDefined();
  });

  it('returns 401 on wrong password', async () => {
    const res = await request(app).post(`${BASE}/login`).send({
      email: testUser.email,
      password: 'wrongpassword',
    });
    expect(res.status).toBe(401);
  });

  it('returns 400 on missing fields', async () => {
    const res = await request(app).post(`${BASE}/login`).send({});
    expect(res.status).toBe(400);
  });
});

describe('POST /auth/logout', () => {
  it('clears cookie and returns 204', async () => {
    const registerRes = await request(app).post(`${BASE}/register`).send(testUser);
    const cookie = registerRes.headers['set-cookie'];

    const res = await request(app)
      .post(`${BASE}/logout`)
      .set('Cookie', cookie);

    expect(res.status).toBe(204);
    // Cookie should be cleared (maxAge=0 or expires in past)
    expect(res.headers['set-cookie'][0]).toMatch(/emoclew_token=;/);
  });

  it('returns 401 without a session', async () => {
    const res = await request(app).post(`${BASE}/logout`);
    expect(res.status).toBe(401);
  });
});

describe('GET /health', () => {
  it('returns ok', async () => {
    const res = await request(app).get('/health');
    expect(res.status).toBe(200);
    expect(res.body.status).toBe('ok');
  });
});