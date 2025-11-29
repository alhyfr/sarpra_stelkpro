'use client'
import ProtectedRoute from "@/components/ProtectedRoute";
export default function DaftarLaboratorium() {
    return (
        <div>
            <ProtectedRoute>
                <h1>Daftar Laboratorium</h1>
            </ProtectedRoute>
        </div>
    )
}