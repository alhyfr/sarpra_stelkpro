'use client'
import ProtectedRoute from "@/components/ProtectedRoute";
import DataAc from "./_components/DataAc";

export default function PerawatanAcPage() {
    return (
        <div>
            <ProtectedRoute>
                <DataAc />
            </ProtectedRoute>
        </div>
    )
}