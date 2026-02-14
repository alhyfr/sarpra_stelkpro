'use client'
import { useAuth } from '@/app/context/AuthContext';
import ProtectedRoute from '@/components/ProtectedRoute';
import HakAkses from '@/components/HakAkses';
import DataToken from './DataToken';
export default function Token() {
    const { user } = useAuth();
    return (
        <ProtectedRoute>
            {
                user?.level === 1 ? (
                    <DataToken />
                ) : (
                    <HakAkses />
                )
            }
        </ProtectedRoute>
    )
}