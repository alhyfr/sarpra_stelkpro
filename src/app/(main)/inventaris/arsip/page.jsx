import ProtectedRoute from "@/components/ProtectedRoute";
import DataArsip from "./DataArsip";

export default function Page() {
  return (
    <ProtectedRoute>
      <DataArsip />
    </ProtectedRoute>
  );
}
