'use client'
import ProtectedRoute from "@/components/ProtectedRoute";
export default function BahanPraktikum() {
    return (
        <div>
            <ProtectedRoute>
                <h1>Bahan Praktikum</h1>
            </ProtectedRoute>
        </div>
    )
}