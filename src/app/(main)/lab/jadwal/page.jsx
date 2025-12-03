'use client'
import ProtectedRoute from "@/components/ProtectedRoute";
import DataJadwal from "./DataJadwal";
export default function JadwalPenggunaan() {
    return (
        <div>
            <ProtectedRoute>
                <DataJadwal />
            </ProtectedRoute>
        </div>
    )
}