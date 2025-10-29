import { NextResponse } from 'next/server';

// ============================================
// MIDDLEWARE - ROUTE PROTECTION
// ============================================
// Middleware ini berjalan di server-side sebelum request sampai ke page
// Digunakan untuk protect routes dan redirect user

// ============================================
// CONFIGURATION
// ============================================

// Routes yang bisa diakses tanpa login
const publicRoutes = [
  '/login',
  '/register',
  '/forgot-password',
  '/reset-password',
];

// Routes yang harus login (akan di-protect)
const protectedRoutes = [
  '/dashboard',
  '/inventaris',
  '/users/teams',
  '/profile',
];

// Auth routes yang tidak boleh diakses jika sudah login
const authRoutes = [
  '/login',
  '/register',
];

// ============================================
// HELPER FUNCTIONS
// ============================================

// Check apakah path match dengan route patterns
function isPathMatch(pathname, routes) {
  return routes.some(route => {
    // Exact match
    if (pathname === route) return true;
    // Prefix match (untuk nested routes)
    if (pathname.startsWith(route + '/')) return true;
    return false;
  });
}

// Get token dari cookies atau headers
function getToken(request) {
  const tokenKey = process.env.NEXT_PUBLIC_TOKEN_KEY || 'stelk_auth_token';
  
  // Coba ambil dari cookie
  const cookieToken = request.cookies.get(tokenKey);
  
  // Atau dari Authorization header
  const authHeader = request.headers.get('authorization');
  
  const token = cookieToken?.value || authHeader?.replace('Bearer ', '') || null;
  
  // Debug log
  if (process.env.NEXT_PUBLIC_DEBUG === 'true' && token) {
    console.log('🔑 Middleware: Token found in', cookieToken ? 'cookie' : 'header');
  }
  
  return token;
}

// ============================================
// MAIN MIDDLEWARE FUNCTION
// ============================================
export function middleware(request) {
  const { pathname } = request.nextUrl;
  const token = getToken(request);
  const isAuthenticated = !!token;

  // Debug log (hanya di development)
  if (process.env.NEXT_PUBLIC_DEBUG === 'true') {
    console.log('🛡️ Middleware check:', {
      path: pathname,
      authenticated: isAuthenticated,
      hasToken: !!token,
      action: 'checking...'
    });
  }

  // ============================================
  // 1. ALLOW PUBLIC ROUTES (/_next, /api, /static files)
  // ============================================
  if (
    pathname.startsWith('/_next') ||
    pathname.startsWith('/api') ||
    pathname.startsWith('/static') ||
    pathname.includes('.') // file extensions (images, fonts, etc)
  ) {
    return NextResponse.next();
  }

  // ============================================
  // 2. REDIRECT ROOT PATH
  // ============================================
  // Root path "/" akan di-handle oleh page.js (client-side redirect)
  if (pathname === '/') {
    return NextResponse.next();
  }

  // ============================================
  // 3. PROTECT PRIVATE ROUTES
  // ============================================
  // Jika user belum login dan akses protected route → redirect ke login
  if (isPathMatch(pathname, protectedRoutes) && !isAuthenticated) {
    if (process.env.NEXT_PUBLIC_DEBUG === 'true') {
      console.log('🚫 Middleware: Blocking access to protected route, redirecting to login');
    }
    
    const loginUrl = new URL('/login', request.url);
    // Simpan redirect URL untuk kembali setelah login
    loginUrl.searchParams.set('redirect', pathname);
    
    return NextResponse.redirect(loginUrl);
  }

  // ============================================
  // 4. REDIRECT AUTHENTICATED USER FROM AUTH PAGES
  // ============================================
  // Jika user sudah login dan akses login/register → redirect ke dashboard
  if (isPathMatch(pathname, authRoutes) && isAuthenticated) {
    if (process.env.NEXT_PUBLIC_DEBUG === 'true') {
      console.log('✅ Middleware: User authenticated, redirecting from auth page to dashboard');
    }
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }
  
  // Debug: Log allowed access
  if (process.env.NEXT_PUBLIC_DEBUG === 'true') {
    console.log('✅ Middleware: Allowing access to', pathname);
  }

  // ============================================
  // 5. ALLOW REQUEST TO CONTINUE
  // ============================================
  return NextResponse.next();
}

// ============================================
// MIDDLEWARE CONFIG
// ============================================
// Tentukan paths mana saja yang akan di-check oleh middleware
export const config = {
  matcher: [
    /*
     * Match semua request paths kecuali:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public files (images, fonts, dll)
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico)$).*)',
  ],
};

