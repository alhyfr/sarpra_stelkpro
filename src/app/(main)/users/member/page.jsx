'use client'
import ProtectedRoute from '@/components/ProtectedRoute';
import DataMember from './DataMember';
export default function MemberPage() {
    return (
        <ProtectedRoute>
            <DataMember />
        </ProtectedRoute>
    )
}