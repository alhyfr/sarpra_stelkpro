'use client'

import { useAuth } from '@/app/context/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import Loading from '@/components/Loading';

// ============================================
// PROTECTED ROUTE COMPONENT
// ============================================
// Wrapper component untuk protect pages dari user yang belum login
// Usage: Wrap page content dengan <ProtectedRoute>...</ProtectedRoute>

export default function ProtectedRoute({ 
  children,
  redirectTo = '/login',
  loadingComponent = null 
}) {
  const { isAuthenticated, isLoading } = useAuth();
  const router = useRouter();

  // ============================================
  // CEK AUTH DAN REDIRECT JIKA BELUM LOGIN
  // ============================================
  useEffect(() => {
    // Jika selesai loading dan ternyata belum authenticated
    if (!isLoading && !isAuthenticated) {
      router.push(redirectTo);
    }
  }, [isLoading, isAuthenticated, router, redirectTo]);

  // ============================================
  // SHOW LOADING SAAT CEK AUTH
  // ============================================
  if (isLoading) {
    // Custom loading component jika disediakan
    if (loadingComponent) {
      return loadingComponent;
    }
    
    // Default loading component
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <Loading size="lg" text="Memuat..." />
      </div>
    );
  }

  // ============================================
  // JIKA BELUM AUTHENTICATED, RETURN NULL
  // ============================================
  // Will redirect di useEffect di atas
  if (!isAuthenticated) {
    return null;
  }

  // ============================================
  // JIKA AUTHENTICATED, RENDER CHILDREN
  // ============================================
  return children;
}

