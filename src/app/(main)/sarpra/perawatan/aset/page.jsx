'use client'
import ProtectedRoute from "@/components/ProtectedRoute";
import DataAset from "./DataAset";

export default function PerawatanAsetPage() {
    return (
        <div>
            <ProtectedRoute>
                <DataAset />
            </ProtectedRoute>
        </div>
    )
}