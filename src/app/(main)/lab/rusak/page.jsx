"use client";
import ProtectedRoute from "@/components/ProtectedRoute";
import DataBarangRusak from "./DataBarangRusak";

export default function RusakPage() {
  return (
    <ProtectedRoute>
      <DataBarangRusak />
    </ProtectedRoute>
  );
}
