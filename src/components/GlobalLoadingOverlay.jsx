'use client'

import { useAuth } from '@/app/context/AuthContext';
import Loading from '@/components/Loading';

// ============================================
// GLOBAL LOADING OVERLAY
// ============================================
// Component yang menampilkan loading overlay untuk:
// - Redirect setelah login
// - Logout process
// - Navigation transitions

export default function GlobalLoadingOverlay() {
  const { isRedirecting, redirectType } = useAuth();

  if (!isRedirecting) return null;

  // Tentukan text berdasarkan redirect type
  const loadingText = redirectType === 'logout' 
    ? 'Logging out...' 
    : 'Redirecting to dashboard...';

  const loadingSubtext = redirectType === 'logout'
    ? 'Clearing your session'
    : 'Preparing your workspace';

  return (
    <div className="fixed inset-0 bg-white/95 dark:bg-gray-900/95 backdrop-blur-md z-[9999] flex items-center justify-center">
      <div className="text-center space-y-4">
        <Loading size="xl" text="" />
        <div className="space-y-2">
          <p className="text-lg font-semibold text-gray-900 dark:text-white animate-pulse">
            {loadingText}
          </p>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            {loadingSubtext}
          </p>
        </div>
      </div>
    </div>
  );
}

