'use client'
import ProtectedRoute from "@/components/ProtectedRoute";
export default function JadwalPenggunaan() {
    return (
        <div>
            <ProtectedRoute>
                <h1>Jadwal Penggunaan</h1>
            </ProtectedRoute>
        </div>
    )
}