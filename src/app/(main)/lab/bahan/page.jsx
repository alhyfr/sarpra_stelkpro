'use client'
import ProtectedRoute from "@/components/ProtectedRoute";
import DataBahan from "./DataBahan";
export default function BahanPraktikum() {
    return (
        <div>
            <ProtectedRoute>
                <DataBahan />
            </ProtectedRoute>
        </div>
    )
}