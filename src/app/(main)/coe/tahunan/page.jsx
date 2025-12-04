'use client'
import ProtectedRoute from "@/components/ProtectedRoute";
import DataTahunan from "./DataTahunan";
export default function Tahunan() {
    return (
        <div>
            <ProtectedRoute>
                <DataTahunan />
            </ProtectedRoute>
        </div>
    )
}