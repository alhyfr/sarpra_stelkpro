'use client'
import ProtectedRoute from "@/components/ProtectedRoute";
import DataAtk from "./DataAtk";

export default function ATK() {
    return (
        <div>
            <ProtectedRoute>
                <DataAtk />
            </ProtectedRoute>
        </div>
    )
}