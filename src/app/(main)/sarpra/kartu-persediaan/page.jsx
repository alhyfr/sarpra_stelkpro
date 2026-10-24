"use client";
import ProtectedRoute from "@/components/ProtectedRoute";
import DataKartu from "./DataKartu";

export default function KartuPersediaanPage() {
  return (
    <ProtectedRoute>
      <DataKartu />
    </ProtectedRoute>
  );
}
