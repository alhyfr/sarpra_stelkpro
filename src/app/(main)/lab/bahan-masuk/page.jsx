import ProtectedRoute from "@/components/ProtectedRoute";
import DataBahanMasuk from "./DataBahanMasuk";

export default function BahanMasuk() {
    return (
        <div>
            <ProtectedRoute>
                <DataBahanMasuk />
            </ProtectedRoute>
        </div>
    )
}