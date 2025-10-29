'use client'
import ProtectedRoute from '@/components/ProtectedRoute';
import DataHabisPakai from './DataHabisPakai';

export default function HabisPakaiPage() {
  return <div>
    <ProtectedRoute>
      <DataHabisPakai />
    </ProtectedRoute>
  </div>
}