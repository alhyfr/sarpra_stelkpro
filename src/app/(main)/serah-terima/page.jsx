'use client'
import ProtectedRoute from '@/components/ProtectedRoute'
import DataSerti from './DataSerti'

export default function SerahTerima() {
    return (
        <ProtectedRoute>
            <DataSerti />
        </ProtectedRoute>
    )
}