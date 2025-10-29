"use client";
import ProtectedRoute from "@/components/ProtectedRoute";
import DataPending from "./DataPending";
export default function Pending() {
  return (
    <div>
      <ProtectedRoute>
        <DataPending />
      </ProtectedRoute>
    </div>
  );
}
