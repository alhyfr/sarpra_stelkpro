'use client'
import ProtectedRoute from "@/components/ProtectedRoute";
import DataEx from "./DataEx";
export default function Eksternal() {
    return (
        <div>
            <ProtectedRoute>
                <DataEx />
            </ProtectedRoute>
        </div>
    )
}