'use client'

import { useAuth } from '@/app/context/AuthContext';
import ProtectedRoute from '@/components/ProtectedRoute';
import DataDashboard from './DataDashboard';

export default function Dashboard() {
    const { user } = useAuth();

    return (
        <ProtectedRoute>
            <div className="space-y-6">

                {/* Page Title */}
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                        Dashboard
                    </h1>
                    <p className="text-gray-600 dark:text-gray-400 mt-1">
                        Selamat datang, {user?.name}!
                    </p>
                </div>


                <DataDashboard />
            </div>
        </ProtectedRoute>
    )
}