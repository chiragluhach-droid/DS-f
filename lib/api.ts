const BASE = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:5001/api';

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
}

export async function api<T>(path: string, options: Options = {}): Promise<T> {
  const { body, headers, ...rest } = options;

  const res = await fetch(`${BASE}${path}`, {
    ...rest,
    credentials: 'include',
    headers: {
      ...(body ? { 'Content-Type': 'application/json' } : {}),
      ...headers,
    },
    ...(body ? { body: JSON.stringify(body) } : {}),
  });

  let payload: { success: boolean; data?: T; error?: { code: string; message: string; details?: ApiError['details'] } };
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
    const res = await fetch(`${BASE}${path}`, { cache: 'no-store' });
    const payload = await res.json();
    if (!res.ok || !payload.success) return null;
    return payload.data as T;
  } catch {
    return null;
  }
}
