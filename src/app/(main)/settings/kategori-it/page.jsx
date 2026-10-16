'use client'
import ProtectedRoute from "@/components/ProtectedRoute";
import DataKategoriIt from "./DataKategoriIt";

export default function KategoriItPage() {
  return (
    <div>
      <ProtectedRoute>
        <DataKategoriIt />
      </ProtectedRoute>
    </div>
  );
}
