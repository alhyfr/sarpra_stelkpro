'use client'
import ProtectedRoute from "@/components/ProtectedRoute";
import DataGedung from "./DataGedung";
export default function Page() {
    return (
        <ProtectedRoute>
            <DataGedung />
        </ProtectedRoute>
    )
}