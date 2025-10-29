'use client'

import { useAuth } from '@/app/context/AuthContext';
import ProtectedRoute from '@/components/ProtectedRoute';
import DataAkun from './DataAkun';

export default function Account() {
    const { user } = useAuth();
    return(
        <ProtectedRoute>
           <DataAkun />
        </ProtectedRoute>
    )
}