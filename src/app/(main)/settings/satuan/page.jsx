'use client'
import ProtectedRoute from "@/components/ProtectedRoute";
import DataSatuan from "./DataSatuan";
export default function Satuan() {
  return (
    <ProtectedRoute>
      <DataSatuan />
    </ProtectedRoute>
  )
}