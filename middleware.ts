import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(req: NextRequest) {
  if (req.nextUrl.pathname.startsWith('/api/')) {
    const auth = req.headers.get('authorization') || ''
    const expected = process.env.INTERNAL_AUTH_TOKEN
    if (!expected) return NextResponse.json({ error: 'Server misconfigured: missing INTERNAL_AUTH_TOKEN' }, { status: 500 })
    if (auth !== `Bearer ${expected}`) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
  }
  return NextResponse.next()
}

export const config = {
  matcher: ['/api/:path*'],
}
