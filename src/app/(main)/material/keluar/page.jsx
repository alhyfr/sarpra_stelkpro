'use client'
import ProtectedRoute from "@/components/ProtectedRoute";
import DataMaterialKeluar from "./DataMaterialKeluar";

export default function MaterialKeluarPage() {
    return (
        <div>
            <ProtectedRoute>
                <DataMaterialKeluar />
            </ProtectedRoute>
        </div>
    )
}