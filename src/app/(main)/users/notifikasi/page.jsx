'use client'
import { useAuth } from '@/app/context/AuthContext';
import DataAktifitas from './DataAktifitas';
import ProtectedRoute from '@/components/ProtectedRoute';
import HakAkses from '@/components/HakAkses';
import { isSuperAdmin } from '@/constants/rbac';

export default function Notifikasi() {
    const { user } = useAuth();
    return (
        <ProtectedRoute>
            {
                isSuperAdmin(user) ? (
                    <DataAktifitas />
                ) : (
                    <HakAkses />
                )
            }
        </ProtectedRoute>
    )
}