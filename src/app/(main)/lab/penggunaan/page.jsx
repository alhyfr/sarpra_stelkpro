"use client";
import ProtectedRoute from "@/components/ProtectedRoute";
import DataPenggunaan from "./DataPenggunaan";

export default function PenggunaanLabPage() {
  return (
    <ProtectedRoute>
      <DataPenggunaan />
    </ProtectedRoute>
  );
}
