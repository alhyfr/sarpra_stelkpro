'use client'
import ProtectedRoute from "@/components/ProtectedRoute";
import DataAtkMasuk from "./DataAtkMasuk";
export default function ATKMasuk() {
    return (
        <div>
            <ProtectedRoute>
                <DataAtkMasuk />
            </ProtectedRoute>
        </div>
    )
}