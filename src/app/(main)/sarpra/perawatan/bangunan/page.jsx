'use client'
import ProtectedRoute from "@/components/ProtectedRoute";
import DataBangunan from "./DataBangunan";

export default function PerawatanBangunanPage() {
    return (
        <div>
            <ProtectedRoute>
                <DataBangunan />
            </ProtectedRoute>
        </div>
    )
}