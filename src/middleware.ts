import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Protected routes
const protectedRoutes = ['/profile', '/favorites'];
const adminRoutes = ['/admin'];
const authRoutes = ['/login', '/register'];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  
  // Note: We can't directly use Zustand store in middleware since it runs on the edge.
  // Instead, we check cookies for auth state. 
  // For now, let's assume we store auth state in a cookie named 'auth-storage' (from Zustand persist).
  const authCookie = request.cookies.get('auth-storage')?.value;
  let isAuthenticated = false;
  let role = 'USER';

  if (authCookie) {
    try {
      const parsed = JSON.parse(decodeURIComponent(authCookie));
      isAuthenticated = parsed.state?.isAuthenticated === true;
      role = parsed.state?.user?.role || 'USER';
    } catch (e) {
      console.error('Error parsing auth cookie', e);
    }
  }

  // 1. Redirect authenticated users away from auth pages
  const isAuthRoute = authRoutes.some(route => pathname.startsWith(route));
  if (isAuthRoute && isAuthenticated) {
    return NextResponse.redirect(new URL('/', request.url));
  }

  // 2. Protect user routes
  const isProtectedRoute = protectedRoutes.some(route => pathname.startsWith(route));
  if (isProtectedRoute && !isAuthenticated) {
    const url = new URL('/login', request.url);
    url.searchParams.set('callbackUrl', pathname);
    return NextResponse.redirect(url);
  }

  // 3. Protect admin routes
  const isAdminRoute = adminRoutes.some(route => pathname.startsWith(route));
  if (isAdminRoute) {
    if (!isAuthenticated) {
      const url = new URL('/login', request.url);
      url.searchParams.set('callbackUrl', pathname);
      return NextResponse.redirect(url);
    }
    if (role !== 'ADMIN') {
      // If authenticated but not admin, redirect to home or unauthorized page
      return NextResponse.redirect(new URL('/', request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
};
