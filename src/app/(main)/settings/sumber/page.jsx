"use client";
import ProtectedRoute from "@/components/ProtectedRoute";
import DataSumber from "./DataSumber";
export default function SumberPage() {
  return (
    <div>
      <ProtectedRoute>
        <DataSumber />
      </ProtectedRoute>
    </div>
  );
}
