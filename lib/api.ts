const BASE = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:5001/api';

/**
 * BASE may be a path like "/api" when the API is proxied through this site (see
 * next.config.ts). The browser can use that as-is; server-side rendering has no
 * origin to resolve it against, so it needs the API's real address.
 */
function url(path: string): string {
  if (!BASE.startsWith('/') || typeof window !== 'undefined') return `${BASE}${path}`;
  const origin = process.env.API_ORIGIN?.replace(/\/$/, '') ?? '';
  return `${origin}${BASE}${path}`;
}

export class ApiError extends Error {
  code: string;
  status: number;
  details?: { path: string; message: string }[];

  constructor(status: number, message: string, code = 'ERROR', details?: ApiError['details']) {
    super(message);
    this.status = status;
    this.code = code;
    this.details = details;
  }
}

interface Options extends Omit<RequestInit, 'body'> {
  body?: unknown;
  /** Internal: stops a refreshed request from trying to refresh again. */
  retried?: boolean;
}

/** Endpoints that must never trigger a session refresh, or it would loop. */
const AUTH_PATHS = ['/auth/login', '/auth/register', '/auth/refresh', '/auth/logout'];

let refreshing: Promise<boolean> | null = null;

/**
 * Trades the long-lived refresh cookie for a new session. Shared between
 * concurrent callers so a page with several requests refreshes once.
 */
async function refreshSession(): Promise<boolean> {
  refreshing ??= fetch(url('/auth/refresh'), { method: 'POST', credentials: 'include' })
    .then((res) => res.ok)
    .catch(() => false)
    .finally(() => {
      refreshing = null;
    });
  return refreshing;
}

export async function api<T>(path: string, options: Options = {}): Promise<T> {
  const { body, headers, retried, ...rest } = options;

  const res = await fetch(url(path), {
    ...rest,
    credentials: 'include',
    headers: {
      ...(body ? { 'Content-Type': 'application/json' } : {}),
      ...headers,
    },
    ...(body ? { body: JSON.stringify(body) } : {}),
  });

  // An expired access token is recoverable: refresh once, then replay.
  if (res.status === 401 && !retried && !AUTH_PATHS.some((p) => path.startsWith(p))) {
    if (await refreshSession()) return api<T>(path, { ...options, retried: true });
  }

  let payload: {
    success: boolean;
    data?: T;
    error?: { code: string; message: string; details?: ApiError['details'] };
  };
  try {
    payload = await res.json();
  } catch {
    throw new ApiError(res.status, 'The server sent back an unreadable response.', 'BAD_RESPONSE');
  }

  if (!res.ok || !payload.success) {
    throw new ApiError(
      res.status,
      payload.error?.message ?? 'Something went wrong.',
      payload.error?.code ?? 'ERROR',
      payload.error?.details
    );
  }

  return payload.data as T;
}

export const get = <T,>(path: string, init?: Options) => api<T>(path, { ...init, method: 'GET' });
export const post = <T,>(path: string, body?: unknown, init?: Options) =>
  api<T>(path, { ...init, method: 'POST', body });
export const patch = <T,>(path: string, body?: unknown, init?: Options) =>
  api<T>(path, { ...init, method: 'PATCH', body });
export const del = <T,>(path: string, init?: Options) => api<T>(path, { ...init, method: 'DELETE' });

/** Server-side fetch for RSC — no cookies, always fresh. */
export async function serverGet<T>(path: string): Promise<T | null> {
  try {
    const res = await fetch(url(path), { cache: 'no-store' });
    const payload = await res.json();
    if (!res.ok || !payload.success) return null;
    return payload.data as T;
  } catch {
    return null;
  }
}
