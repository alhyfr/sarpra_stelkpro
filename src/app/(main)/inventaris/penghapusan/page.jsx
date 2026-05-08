import ProtectedRoute from "@/components/ProtectedRoute";
import DataPenghapusan from "./DataPenghapusan";
export default function Page() {
    return (
        <ProtectedRoute>
            <DataPenghapusan />
        </ProtectedRoute>
    );
}