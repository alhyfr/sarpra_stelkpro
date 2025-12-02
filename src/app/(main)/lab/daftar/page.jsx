'use client'
import ProtectedRoute from "@/components/ProtectedRoute";
import DataDaftar from "./DataDaftar";
export default function DaftarLaboratorium() {
    return (
        <div>
            <ProtectedRoute>
                <DataDaftar />
            </ProtectedRoute>
        </div>
    )
}