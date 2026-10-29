'use client'
import { useAuth } from '@/app/context/AuthContext';
import ProtectedRoute from '@/components/ProtectedRoute';
import HakAkses from '@/components/HakAkses';
import DataToken from './DataToken';
import { isSuperAdmin } from '@/constants/rbac';
export default function Token() {
    const { user } = useAuth();
    return (
        <ProtectedRoute>
            {
                isSuperAdmin(user) ? (
                    <DataToken />
                ) : (
                    <HakAkses />
                )
            }
        </ProtectedRoute>
    )
}