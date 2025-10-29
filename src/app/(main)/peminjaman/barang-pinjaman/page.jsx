
import ProtectedRoute from '@/components/ProtectedRoute';
import DataBarang from './DataBarang';
export default function BarangPinjaman() {
  return (
    <div>
      <ProtectedRoute>
        <DataBarang />
      </ProtectedRoute>
    </div>
  );
}