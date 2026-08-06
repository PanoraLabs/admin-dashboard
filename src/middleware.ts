import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

const COOKIE_NAME = 'panora_admin_token'

const PUBLIC_PATHS = new Set(['/login'])
const SKIP_PATHS = ['/_next', '/favicon.ico']

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl

  if (SKIP_PATHS.some((p) => pathname.startsWith(p))) return NextResponse.next()
  if (PUBLIC_PATHS.has(pathname)) return NextResponse.next()

  const token = req.cookies.get(COOKIE_NAME)?.value
  if (!token) {
    const url = req.nextUrl.clone()
    url.pathname = '/login'
    return NextResponse.redirect(url)
  }
  return NextResponse.next()
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
}
