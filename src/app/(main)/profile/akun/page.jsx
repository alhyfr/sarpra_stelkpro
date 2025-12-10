'use client'
import ProtectedRoute from '@/components/ProtectedRoute';
export default function AkunPage() {
  return (
    <div>
      <ProtectedRoute>
        <h1>Akun Page</h1>
      </ProtectedRoute>
    </div>
  )
}