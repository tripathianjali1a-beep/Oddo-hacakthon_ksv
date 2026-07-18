import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Routes that require authentication (any logged-in user)
const protectedCustomerRoutes = ['/account', '/orders', '/addresses', '/checkout'];

// Routes that require admin role
const adminRoutes = ['/admin'];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Read auth from cookies (we store a lightweight auth cookie on login)
  const authToken = request.cookies.get('auth_token')?.value;
  const userRole = request.cookies.get('user_role')?.value;

  // Check admin routes
  const isAdminRoute = adminRoutes.some((route) => pathname.startsWith(route));
  if (isAdminRoute) {
    if (!authToken) {
      const loginUrl = new URL('/login', request.url);
      loginUrl.searchParams.set('redirect', pathname);
      return NextResponse.redirect(loginUrl);
    }
    if (userRole !== 'admin') {
      // Authenticated but not admin — redirect to home
      return NextResponse.redirect(new URL('/home', request.url));
    }
  }

  // Check customer-protected routes
  const isProtectedRoute = protectedCustomerRoutes.some((route) => pathname.startsWith(route));
  if (isProtectedRoute && !authToken) {
    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('redirect', pathname);
    return NextResponse.redirect(loginUrl);
  }

  // Prevent logged-in users from seeing the login page
  if (pathname === '/login' && authToken) {
    return NextResponse.redirect(new URL(userRole === 'admin' ? '/admin/dashboard' : '/home', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/admin/:path*',
    '/account/:path*',
    '/orders/:path*',
    '/addresses/:path*',
    '/checkout/:path*',
    '/login',
  ],
};
