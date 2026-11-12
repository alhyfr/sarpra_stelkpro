"use client";
import ProtectedRoute from "@/components/ProtectedRoute";
import DataPinjamLab from "./DataPinjamLab";

export default function PinjamBarangLabPage() {
  return (
    <ProtectedRoute>
      <DataPinjamLab />
    </ProtectedRoute>
  );
}
