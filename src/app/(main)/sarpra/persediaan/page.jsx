"use client";
import ProtectedRoute from "@/components/ProtectedRoute";
import DataPersediaan from "./DataPersediaan";

export default function PersediaanPage() {
  return (
    <ProtectedRoute>
      <DataPersediaan />
    </ProtectedRoute>
  );
}
