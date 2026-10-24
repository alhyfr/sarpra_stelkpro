"use client";
import ProtectedRoute from "@/components/ProtectedRoute";
import DataStokMaterial from "./DataStokMaterial";

export default function StokMaterialPage() {
  return (
    <ProtectedRoute>
      <DataStokMaterial />
    </ProtectedRoute>
  );
}
