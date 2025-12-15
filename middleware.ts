import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

// Allow list prefixes
const ALLOWED_PREFIXES = [
  '/admin',
  '/api/admin',
  '/_next', // Next internals (chunks, build assets)
  '/favicon.ico',
  '/robots.txt',
  '/sitemap.xml',
  '/assets', // in case assets folder is used
]

// File extensions to allow from public (images, css, etc.)
const ALLOWED_EXTENSIONS = [
  '.png', '.jpg', '.jpeg', '.gif', '.svg', '.webp', '.ico',
  '.css', '.js', '.map', '.txt', '.woff', '.woff2', '.ttf', '.otf', '.eot', '.mp4', '.webm'
]

export function middleware(req: NextRequest) {
  const { nextUrl } = req
  const { pathname } = nextUrl

  // Allow Next.js internals and public assets
  const isAllowedPrefix = ALLOWED_PREFIXES.some((p) => pathname.startsWith(p))
  const hasAllowedExtension = ALLOWED_EXTENSIONS.some((ext) => pathname.endsWith(ext))

  if (isAllowedPrefix || hasAllowedExtension) {
    return NextResponse.next()
  }

  // Redirect everything else to /admin
  const url = req.nextUrl.clone()
  url.pathname = '/admin'
  url.search = ''
  return NextResponse.redirect(url)
}

// Run middleware on all routes
export const config = {
  matcher: ['/((?!api/).*)', '/api/:path*'],
}
