'use client'
import ProtectedRoute from "@/components/ProtectedRoute";
import DataMaterial from "./DataMatrial";

export default function MaterialMasukPage() {
    return (
        <div>
            <ProtectedRoute>
                <DataMaterial />
            </ProtectedRoute>
        </div>
    );
}