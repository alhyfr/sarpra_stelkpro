'use client'
import ProtectedRoute from "@/components/ProtectedRoute";
import DataInv from "./DataInv";
export default function InvantarisLaboratorium() {
    return (
        <div>
            <ProtectedRoute>
                <DataInv />
            </ProtectedRoute>
        </div>
    )
}