'use client'
import ProtectedRoute from "@/components/ProtectedRoute";
import DataRuangan from "./DataRuangan";
export default function Page() {
    return <ProtectedRoute>
        <DataRuangan />
    </ProtectedRoute>;
}   