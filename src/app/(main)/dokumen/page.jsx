"use client";
import ProtectedRoute from "@/components/ProtectedRoute";
import DataDokumen from "./DataDokumen";

export default function DokumenPage() {
  return (
    <ProtectedRoute>
      <DataDokumen />
    </ProtectedRoute>
  );
}
