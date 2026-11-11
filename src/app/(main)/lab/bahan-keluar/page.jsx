"use client";
import ProtectedRoute from "@/components/ProtectedRoute";
import DataBahanKeluar from "./DataBahanKeluar";

export default function BahanKeluarPage() {
  return (
    <ProtectedRoute>
      <DataBahanKeluar />
    </ProtectedRoute>
  );
}
