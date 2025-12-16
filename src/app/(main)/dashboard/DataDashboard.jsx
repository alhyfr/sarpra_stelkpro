'use client'
import { useState, useEffect } from 'react'
import dynamic from 'next/dynamic'
import {
    LayoutDashboard,
    Box,
    MonitorSmartphone,
    FileText,
    TrendingUp,
    TrendingDown,
    Clock,
    AlertCircle,
    CheckCircle2
} from 'lucide-react'
import AktifitasTerbru from './Aktifitas_Terbru'
import DashboardChart from './DashboardChart'
import JadLabMendatang from './JadLabMendatang'
import Team from './Team'
import StokAtk from './StokAtk'
import StatGrid from './StatGrid'
import StatInv from './StatInv'
import TrenAlat from './TrenAlat'
import StatPerbaikanAset from './StatPerbaikanAset'
import StatAtk from './StatAtk'

// Dynamically import Chart to avoid SSR issues
const Chart = dynamic(() => import('react-apexcharts'), { ssr: false })

export default function DataDashboard() {
    return (
        <div className="space-y-6">
            {/* Stats Grid */}
            <StatGrid />
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Main Chart Area */}
                <div className="lg:col-span-2 bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
                    <DashboardChart />
                </div>

                {/* Recent Activity */}
                <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">Aktivitas Terbaru</h3>
                    <AktifitasTerbru />
                </div>
            </div>

            {/* Additional Info Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Team />
                <JadLabMendatang />
                <StokAtk />
            </div>

            {/* Statistics Charts Section */}
            <div>
                <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6">Laporan & Statistik</h2>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Column 1: Trends & Status */}
                    <div className="grid grid-cols-1 gap-6">
                        <StatInv />
                        <StatPerbaikanAset />
                    </div>

                    {/* Column 2: Tools & ATK */}
                    <div className="grid grid-cols-1 gap-6">
                        <TrenAlat />
                        <StatAtk />
                    </div>
                </div>
            </div>
        </div>
    )
}






