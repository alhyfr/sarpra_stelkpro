import ProtectedRoute from '@/components/ProtectedRoute';
import DataBarang from './DataBarang';
export default function BarangPage() {
  return (
    <ProtectedRoute>
        <DataBarang />
    </ProtectedRoute>
  )
}