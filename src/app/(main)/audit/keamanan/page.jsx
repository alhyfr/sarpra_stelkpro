'use client'
import ProtectedRoute from "@/components/ProtectedRoute";
import DataKeamanan from "./DataKeamanan";
export default function Keamanan() {
    return (
        <div>
            <ProtectedRoute>
                <DataKeamanan />
            </ProtectedRoute>
        </div>
    )
}