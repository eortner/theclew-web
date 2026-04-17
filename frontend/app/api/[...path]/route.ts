import { NextRequest, NextResponse } from 'next/server';

const BACKEND_URL = process.env.BACKEND_URL ?? 'http://localhost:4000';

const ALLOWED_REQUEST_HEADERS = new Set([
  'content-type',
  'accept',
  'accept-language',
  'cache-control',
]);

const ALLOWED_RESPONSE_HEADERS = new Set([
  'content-type',
  'cache-control',
  'expires',
  'pragma',
]);

// In production: __Host- prefix enforces Secure + no Domain + path=/ at browser level
// In development: plain name since __Host- requires HTTPS and silently fails on http://localhost
const AUTH_COOKIE = process.env.NODE_ENV === 'production'
  ? '__Host-emoclew_token'
  : 'emoclew_token';

async function handler(req: NextRequest): Promise<NextResponse> {
  const path = req.nextUrl.pathname.replace(/^\/api/, '');
  const search = req.nextUrl.search ?? '';
  const backendUrl = `${BACKEND_URL}${path}${search}`;

  const forwardHeaders = new Headers();

  for (const [key, value] of req.headers.entries()) {
    if (ALLOWED_REQUEST_HEADERS.has(key.toLowerCase())) {
      forwardHeaders.set(key, value);
    }
  }

  const authCookie = req.cookies.get(AUTH_COOKIE);
  if (authCookie) {
    forwardHeaders.set('cookie', `${AUTH_COOKIE}=${authCookie.value}`);
  }

  forwardHeaders.set('x-forwarded-host', req.nextUrl.host);

  let body: ArrayBuffer | undefined;
  if (!['GET', 'HEAD'].includes(req.method)) {
    body = await req.arrayBuffer();
  }

  console.log('→ method:', req.method);
  console.log('→ url:', backendUrl);
  console.log('→ headers:', Object.fromEntries(forwardHeaders.entries()));
  console.log('→ body size:', body?.byteLength);

  let backendRes: Response;
  try {
    backendRes = await fetch(backendUrl, {
      method: req.method,
      headers: forwardHeaders,
      body: body ?? undefined,
      redirect: 'manual',
    });
  } catch {
    return NextResponse.json(
      { error: 'Service unavailable' },
      { status: 503 }
    );
  }

  const resHeaders = new Headers();

  for (const [key, value] of req.headers.entries()) {
    if (ALLOWED_REQUEST_HEADERS.has(key.toLowerCase())) {
      resHeaders.set(key, value);
    }
  }

  // Explicitly enforce content-type for requests with a body
  // Next.js can drop this header when reading the stream
  if (!['GET', 'HEAD'].includes(req.method) && !forwardHeaders.get('content-type')) {
    forwardHeaders.set('content-type', 'application/json');
  }

  const setCookieHeader = backendRes.headers.get('set-cookie');
  if (setCookieHeader && setCookieHeader.includes(AUTH_COOKIE)) {
    resHeaders.set('set-cookie', setCookieHeader);
  }

  if (backendRes.status >= 300 && backendRes.status < 400) {
    const location = backendRes.headers.get('location');
    if (location) {
      return NextResponse.redirect(location, { status: backendRes.status });
    }
  }

  const resBody = await backendRes.arrayBuffer();

  return new NextResponse(resBody, {
    status: backendRes.status,
    headers: resHeaders,
  });
}

export const GET     = handler;
export const POST    = handler;
export const PATCH   = handler;
export const DELETE  = handler;
export const OPTIONS = handler;