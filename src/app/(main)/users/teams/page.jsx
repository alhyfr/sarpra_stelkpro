'use client'

import { useAuth } from '@/app/context/AuthContext';
import ProtectedRoute from '@/components/ProtectedRoute';
import DataTeams from './DataTeams';

export default function Teams() {
    const { user } = useAuth();
    return(
        <ProtectedRoute>
            <DataTeams />
        </ProtectedRoute>
    )
}