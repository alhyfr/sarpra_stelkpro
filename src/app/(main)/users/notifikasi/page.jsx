'use client'
import { useAuth } from '@/app/context/AuthContext';
import DataAktifitas from './DataAktifitas';
import ProtectedRoute from '@/components/ProtectedRoute';
import HakAkses from '@/components/HakAkses';

export default function Notifikasi() {
    const { user } = useAuth();
    return (
        <ProtectedRoute>
            {
                user?.level === 1 ? (
                    <DataAktifitas />
                ) : (
                    <HakAkses />
                )
            }
        </ProtectedRoute>
    )
}