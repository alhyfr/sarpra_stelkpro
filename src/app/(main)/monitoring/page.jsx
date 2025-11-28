'use client'
import ProtectedRoute from "@/components/ProtectedRoute"
import DataMon from "./DataMon"

export default function Monitoring() {
    return (
        <ProtectedRoute>
            <div>
                <DataMon />
            </div>
        </ProtectedRoute>
    )
}