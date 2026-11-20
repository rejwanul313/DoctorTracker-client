import type { ApiErrorBody } from '@dt/shared';

export class ApiError extends Error {
  constructor(
    public readonly status: number,
    public readonly code: string,
    message: string,
    public readonly details?: Record<string, string>,
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

type QueryValue = string | number | boolean | null | undefined;

interface RequestOptions {
  method?: 'GET' | 'POST' | 'PATCH' | 'DELETE';
  body?: unknown;
  query?: Record<string, QueryValue>;
  signal?: AbortSignal;
}

export function toQueryString(query?: Record<string, QueryValue>): string {
  if (!query) return '';
  const params = new URLSearchParams();
  for (const [key, value] of Object.entries(query)) {
    if (value !== undefined && value !== null && value !== '') params.set(key, String(value));
  }
  const qs = params.toString();
  return qs ? `?${qs}` : '';
}

let redirecting = false;

/** Session expired or missing → back to sign-in, remembering where the user was. */
function handleUnauthorized() {
  if (typeof window === 'undefined' || redirecting) return;
  if (window.location.pathname.startsWith('/login')) return;
  redirecting = true;
  const next = encodeURIComponent(window.location.pathname + window.location.search);
  // Full navigation (not router.push): drops all client state from the expired session.
  // eslint-disable-next-line @next/next/no-location-assign-relative-destination
  window.location.assign(`/login?next=${next}`);
}

/**
 * Thin fetch wrapper. All requests go to the same origin (`/api/*`), which Next.js rewrites to
 * the Express API, so the httpOnly session cookie is sent automatically.
 */
export async function api<T>(
  path: string,
  { method = 'GET', body, query, signal }: RequestOptions = {},
): Promise<T> {
  let res: Response;
  try {
    res = await fetch(`/api${path}${toQueryString(query)}`, {
      method,
      signal,
      credentials: 'same-origin',
      headers: body !== undefined ? { 'Content-Type': 'application/json' } : undefined,
      body: body !== undefined ? JSON.stringify(body) : undefined,
    });
  } catch (err) {
    if (err instanceof DOMException && err.name === 'AbortError') throw err;
    throw new ApiError(0, 'NETWORK_ERROR', 'Cannot reach the server. Check your connection.');
  }

  if (res.status === 204) return undefined as T;

  const json = (await res.json().catch(() => null)) as (T & Partial<ApiErrorBody>) | null;

  if (!res.ok) {
    if (res.status === 401 && path !== '/auth/login') handleUnauthorized();
    const error = json?.error;
    throw new ApiError(
      res.status,
      error?.code ?? 'HTTP_ERROR',
      error?.message ?? `Request failed (${res.status}).`,
      error?.details,
    );
  }
  return json as T;
}

export function errorMessage(err: unknown): string {
  if (err instanceof Error) return err.message;
  return 'Something went wrong.';
}
