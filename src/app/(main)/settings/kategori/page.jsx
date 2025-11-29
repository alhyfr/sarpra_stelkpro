'use client'
import ProtectedRoute from "@/components/ProtectedRoute";
import DataKategori from "./DataKategori";
export default function KategoriPage() {
    return (
        <div>
            <ProtectedRoute>
                <DataKategori />
            </ProtectedRoute>
        </div>
    )
}