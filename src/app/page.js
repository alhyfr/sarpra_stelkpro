'use client'

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "./context/AuthContext";
import Loading from "@/components/Loading";

// ============================================
// HOME PAGE - AUTO REDIRECT
// ============================================
// Redirect user berdasarkan status autentikasi:
// - Authenticated → /dashboard
// - Not Authenticated → /login

export default function Home() {
  const { isAuthenticated, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    // Tunggu sampai loading selesai
    if (!isLoading) {
      // Jika authenticated, ke dashboard
      if (isAuthenticated) {
        router.push('/dashboard');
      } 
      // Jika tidak authenticated, ke login
      else {
        router.push('/login');
      }
    }
  }, [isLoading, isAuthenticated, router]);

  // Tampilkan loading saat cek auth atau saat redirect
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
      <Loading size="xl" text="Memuat..." />
    </div>
  );
}
