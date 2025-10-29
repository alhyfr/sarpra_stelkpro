'use client'
import ProtectedRoute from "@/components/ProtectedRoute";
import DataAtkKeluar from "./DataAtkKeluar";

export default function Page() {
  return (
    <div>
     <ProtectedRoute>
        <DataAtkKeluar />
     </ProtectedRoute>
    </div>
  )
}