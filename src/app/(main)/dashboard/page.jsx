'use client'

import { useAuth } from '@/app/context/AuthContext';
import ProtectedRoute from '@/components/ProtectedRoute';

export default function Dashboard(){
    const { user } = useAuth();

    return(
        <ProtectedRoute>
            <div className="space-y-6">
                {/* Breadcrumb */}
                <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                    <span>Dashboard</span>
                </div>

                {/* Page Title */}
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                        Dashboard
                    </h1>
                    <p className="text-gray-600 dark:text-gray-400 mt-1">
                        Selamat datang, {user?.name}!
                    </p>
                </div>

                {/* Content Card */}
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-8">
                    <div className="text-center py-12">
                        <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                            Selamat Datang di Stelk Property
                        </h2>
                        <p className="text-gray-600 dark:text-gray-400">
                            Sistem Pengelolaan Sarana & Prasarana SMK Telkom Makassar
                        </p>
                        <div className="mt-4 text-sm text-gray-500">
                            <p>Login sebagai: <span className="font-medium text-gray-700 dark:text-gray-300">{user?.email}</span></p>
                        </div>
                    </div>
                </div>
            </div>
        </ProtectedRoute>
    )
}