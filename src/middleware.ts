import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

/**
 * Middleware for single-site deployment
 *
 * This is a minimal middleware that adds security headers.
 * Unlike multi-tenant deployments, no host-based routing is needed -
 * all configuration comes from environment variables.
 */
export function middleware(request: NextRequest) {
  const response = NextResponse.next();

  // Security headers
  response.headers.set('X-Frame-Options', 'DENY');
  response.headers.set('X-Content-Type-Options', 'nosniff');
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');

  return response;
}

export const config = {
  // Match all paths except static files and API routes
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico|robots.txt|sitemap.xml).*)',
  ],
};
