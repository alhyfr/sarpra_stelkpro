'use client'

import { AuthProvider } from "@/app/context/AuthContext";
import GlobalLoadingOverlay from "@/components/GlobalLoadingOverlay";

// ============================================
// CLIENT LAYOUT WITH AUTH PROVIDER
// ============================================
// Wrapper untuk menyediakan Auth Context ke seluruh aplikasi
export default function ClientLayout({ children }) {
  return (
    <AuthProvider>
      <GlobalLoadingOverlay />
      {children}
    </AuthProvider>
  );
}

