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
import InfoAtk from './infoAtk'
import InfoPerawatan from './InfoPerawatan'
import StokMaterial from './StokMaterial'

// Dynamically import Chart to avoid SSR issues
const Chart = dynamic(() => import('react-apexcharts'), { ssr: false })

export default function DataDashboard() {
    return (
        <div className="space-y-4 sm:space-y-6">
            {/* Stats Grid */}
            <StatGrid />
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
                {/* Main Chart Area */}
                <div className="lg:col-span-2 bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-4 sm:p-6 overflow-hidden">
                    <DashboardChart />
                </div>

                {/* Recent Activity */}
                <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-4 sm:p-6">
                    <h3 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-white mb-4 sm:mb-6">Aktivitas Terbaru</h3>
                    <AktifitasTerbru />
                </div>
            </div>

            {/* Additional Info Grid — 1 kolom di phone, 2 di iPad mini, 3 di desktop */}
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-6">
                <Team />
                <JadLabMendatang />
                <div className="md:col-span-2 xl:col-span-1">
                    <StokAtk />
                </div>
            </div>

            {/* Statistics Charts Section */}
            <div>
                <h2 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white mb-4 sm:mb-6">Laporan & Statistik</h2>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
                    <div className="grid grid-cols-1 gap-4 sm:gap-6">
                        <StatInv />
                        <StatPerbaikanAset />
                    </div>
                    <div className="grid grid-cols-1 gap-4 sm:gap-6">
                        <TrenAlat />
                        <StatAtk />
                    </div>
                </div>
            </div>

            {/* Infografis Section */}
            <div>
                <h2 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white mb-4 sm:mb-6">Infografis</h2>
                <div className="grid grid-cols-1 gap-4 sm:gap-6">
                    <StokMaterial />
                    <InfoAtk />
                    <InfoPerawatan />
                </div>
            </div>
        </div>
    )
}






