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
    if (pathname === route) return true;
    if (pathname.startsWith(route + '/')) return true;
    return false;
  });
}

// ============================================
// MAIN MIDDLEWARE FUNCTION
// ============================================
// CATATAN: Route protection (auth check) dilakukan sepenuhnya di client-side
// melalui ProtectedRoute component dan AuthContext.
//
// Alasan: HttpOnly cookie di-set oleh backend API (domain berbeda).
// Cookie tersebut TIDAK dikirim ke Next.js server saat navigasi halaman,
// hanya dikirim ke domain API saat fetch/axios request.
// Sehingga middleware tidak bisa membaca token → jika diaktifkan akan
// menyebabkan redirect loop antara /login dan /dashboard.
export function middleware(request) {
  const { pathname } = request.nextUrl;

  // Lewatkan semua static files dan internal Next.js paths
  if (
    pathname.startsWith('/_next') ||
    pathname.startsWith('/api') ||
    pathname.startsWith('/static') ||
    pathname.includes('.')
  ) {
    return NextResponse.next();
  }

  // Semua route lain: izinkan, biarkan client-side ProtectedRoute yang menjaga
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

