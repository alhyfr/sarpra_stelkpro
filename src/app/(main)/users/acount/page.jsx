'use client'

import { useAuth } from '@/app/context/AuthContext';
import ProtectedRoute from '@/components/ProtectedRoute';
import DataAkun from './DataAkun';
import HakAkses from '@/components/HakAkses';
import { isSuperAdmin } from '@/constants/rbac';

export default function Account() {
    const { user } = useAuth();
    return(
        <ProtectedRoute>
            {
                isSuperAdmin(user) ? (
                    <DataAkun />
                ) : (
                    <HakAkses />
                )
            }
        </ProtectedRoute>
    )
}