'use client'
import ProtectedRoute from "@/components/ProtectedRoute";
export default function InvantarisLaboratorium() {
    return (
        <div>
            <ProtectedRoute>
                <h1>Invantaris Laboratorium</h1>
            </ProtectedRoute>
        </div>
    )
}