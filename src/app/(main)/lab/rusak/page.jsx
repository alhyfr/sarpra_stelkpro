'use client'
import ProtectedRoute from "@/components/ProtectedRoute";
export default function Rusak() {
    return (
        <div>
            <ProtectedRoute>
                <h1>Rusak</h1>
            </ProtectedRoute>
        </div>
    )
}