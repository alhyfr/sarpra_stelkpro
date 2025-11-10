import DataEks from "./DataEks";
import ProtectedRoute from "@/components/ProtectedRoute";
export default function EksternalPage() {
  return (
    <div>
     <ProtectedRoute>
      <DataEks />
     </ProtectedRoute>
    </div>
  );
}