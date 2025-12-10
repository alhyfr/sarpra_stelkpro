'use client'

import { useAuth } from '@/app/context/AuthContext';
import ProtectedRoute from '@/components/ProtectedRoute';
import DataAkun from './DataAkun';
import HakAkses from '@/components/HakAkses';

export default function Account() {
    const { user } = useAuth();
    return(
        <ProtectedRoute>
            {
                user?.level === 1 ? (
                    <DataAkun />
                ) : (
                    <HakAkses />
                )
            }
        </ProtectedRoute>
    )
}