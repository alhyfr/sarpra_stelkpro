'use client'
import ProtectedRoute from "@/components/ProtectedRoute";
import DataSupport from "./DataSupport";
export default function Support() {
    return (
        <div>
            <ProtectedRoute>
                <DataSupport />
            </ProtectedRoute>
        </div>
    )
}