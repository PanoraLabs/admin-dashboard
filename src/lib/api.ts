import 'server-only'
import { redirect } from 'next/navigation'
import { getToken, clearToken } from './session'

const BASE_URL = process.env.CORE_SERVICES_URL ?? 'http://localhost:3000'

export class ApiError extends Error {
  constructor(
    public status: number,
    message: string,
  ) {
    super(message)
  }
}

export async function adminFetch<T>(path: string, init: RequestInit = {}): Promise<T> {
  const token = await getToken()
  const res = await fetch(`${BASE_URL}${path}`, {
    ...init,
    headers: {
      'content-type': 'application/json',
      ...(token ? { authorization: `Bearer ${token}` } : {}),
      ...init.headers,
    },
    cache: 'no-store',
  })
  if (!res.ok) {
    if (res.status === 401) {
      // The session cookie is present but the backend rejected it (expired
      // or otherwise invalid JWT). Clear the stale cookie and bounce the
      // user back to /login server-side, rather than throwing and relying
      // on a client error boundary to inspect the status (Next.js strips
      // thrown error details down to a generic message + digest once the
      // error crosses the server/client boundary in production, so status
      // codes are not reliably recoverable there).
      await clearToken()
      redirect('/login')
    }
    const body = await res.text().catch(() => '')
    throw new ApiError(res.status, body || res.statusText)
  }
  if (res.status === 204) return undefined as T
  return (await res.json()) as T
}
