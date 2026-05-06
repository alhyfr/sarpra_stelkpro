'use client'
import ProtectedRoute from "@/components/ProtectedRoute";
export default function PinjamBarang() {
    return (
        <div>
            <ProtectedRoute>
                <h1>Pinjam Barang</h1>
            </ProtectedRoute>
        </div>
    )
}

