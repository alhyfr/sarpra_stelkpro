'use client'
import ProtectedRoute from "@/components/ProtectedRoute";
import DataLaporanPerawatanIt from "./DataLaporanPerawatanIt";

export default function LaporanPerawatanItPage() {
  return (
    <div>
      <ProtectedRoute>
        <DataLaporanPerawatanIt />
      </ProtectedRoute>
    </div>
  );
}
