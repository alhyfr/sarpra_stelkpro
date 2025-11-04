import ProtectedRoute from '@/components/ProtectedRoute';
import DataRuangan from './dataRuangan';
export default function RuanganPage() {
  return (
    <ProtectedRoute>
        <DataRuangan />
    </ProtectedRoute>
  )
}