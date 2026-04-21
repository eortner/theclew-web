const BASE = '/api';

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const res = await fetch(`${BASE}${path}`, {
    ...options,
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
      ...(options.headers ?? {}),
    },
  });

  if (res.status === 401) {
    if (typeof window !== 'undefined') window.location.href = '/login';
    throw new Error('Unauthenticated');
  }

  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body?.error ?? `Request failed: ${res.status}`);
  }

  if (res.status === 204) return undefined as T;
  return res.json();
}

export const api = {
  get:    <T>(path: string)                 => request<T>(path),
  post:   <T>(path: string, body: unknown)  => request<T>(path, { method: 'POST',   body: JSON.stringify(body) }),
  patch:  <T>(path: string, body: unknown)  => request<T>(path, { method: 'PATCH',  body: JSON.stringify(body) }),
  delete: <T>(path: string)                 => request<T>(path, { method: 'DELETE' }),

  tags: {
    list: <T>() => request<T>('/tags'),
  },

  totp: {
    setup:   ()                    => request<{ otpauthUrl: string }>('/auth/totp/setup',   { method: 'POST', body: '{}' }),
    verify:  (token: string)       => request<{ message: string }>('/auth/totp/verify',     { method: 'POST', body: JSON.stringify({ token }) }),
    disable: (token: string)       => request<{ message: string }>('/auth/totp/disable',    { method: 'POST', body: JSON.stringify({ token }) }),
    reauth:  (token: string)       => request<{ message: string }>('/auth/totp/reauth',     { method: 'POST', body: JSON.stringify({ token }) }),
  },

  merge: {
    proposeEquity: (threadId: string, proposedEquity: number) =>
      request(`/merge/${threadId}/equity`, { method: 'PATCH', body: JSON.stringify({ proposedEquity }) }),
    reauth:   (threadId: string) => request(`/merge/${threadId}/reauth`,  { method: 'POST', body: '{}' }),
    confirm:  (threadId: string) => request(`/merge/${threadId}/confirm`, { method: 'POST', body: JSON.stringify({ understood: true }) }),
    decline:  (threadId: string) => request(`/merge/${threadId}/decline`, { method: 'POST', body: '{}' }),
    vote:     (threadId: string, approve: boolean) => request(`/merge/${threadId}/vote`, { method: 'POST', body: JSON.stringify({ approve }) }),
    safe:     (threadId: string) => request(`/merge/${threadId}/safe`),
  },
};