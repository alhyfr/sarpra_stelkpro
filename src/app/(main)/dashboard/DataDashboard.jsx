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
                        <StatusLaporanChart />
                    </div>

                    {/* Column 2: Tools & ATK */}
                    <div className="grid grid-cols-1 gap-6">
                        <PeminjamanAlatChart />
                        <PengambilanATKChart />
                    </div>
                </div>
            </div>
        </div>
    )
}




function PeminjamanRuanganChart() {
    const [chartData] = useState({
        series: [{
            name: 'Peminjaman',
            data: [31, 40, 28, 51, 42, 109, 100]
        }],
        options: {
            chart: {
                type: 'area',
                height: 350,
                toolbar: { show: false },
                fontFamily: 'inherit'
            },
            dataLabels: { enabled: false },
            stroke: {
                curve: 'smooth',
                width: 2
            },
            xaxis: {
                categories: ['Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu', 'Minggu'],
                axisBorder: { show: false },
                axisTicks: { show: false }
            },
            yaxis: {
                show: false
            },
            fill: {
                type: 'gradient',
                gradient: {
                    shadeIntensity: 1,
                    opacityFrom: 0.7,
                    opacityTo: 0.9,
                    stops: [0, 90, 100]
                }
            },
            colors: ['#6366f1'],
            grid: {
                show: true,
                borderColor: '#f1f5f9',
                strokeDashArray: 4,
            }
        }
    })

    return (
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Tren Peminjaman Ruangan</h3>
            <div className="h-[300px]">
                <Chart
                    options={chartData.options}
                    series={chartData.series}
                    type="area"
                    height="100%"
                    width="100%"
                />
            </div>
        </div>
    )
}

function PeminjamanAlatChart() {
    const [chartData] = useState({
        series: [{
            data: [400, 430, 448, 470, 540]
        }],
        options: {
            chart: {
                type: 'bar',
                height: 350,
                toolbar: { show: false },
                fontFamily: 'inherit'
            },
            plotOptions: {
                bar: {
                    borderRadius: 4,
                    horizontal: true,
                    barHeight: '60%',
                }
            },
            dataLabels: { enabled: false },
            xaxis: {
                categories: ['Proyektor', 'Kabel HDMI', 'Speaker Portable', 'Camera DSLR', 'Tripod'],
            },
            colors: ['#8b5cf6'],
            grid: {
                show: true,
                borderColor: '#f1f5f9',
                strokeDashArray: 4,
            }
        }
    })

    return (
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Alat Paling Sering Dipinjam</h3>
            <div className="h-[300px]">
                <Chart
                    options={chartData.options}
                    series={chartData.series}
                    type="bar"
                    height="100%"
                    width="100%"
                />
            </div>
        </div>
    )
}

function PengambilanATKChart() {
    const [chartData] = useState({
        series: [{
            name: 'Stok Masuk',
            data: [500, 200, 100, 50, 300, 150, 200, 80, 400, 100]
        }, {
            name: 'Stok Keluar',
            data: [450, 180, 95, 45, 120, 90, 150, 70, 350, 85]
        }],
        options: {
            chart: {
                type: 'bar',
                height: 550, // Increased height for better spacing
                toolbar: { show: false },
                fontFamily: 'inherit'
            },
            plotOptions: {
                bar: {
                    horizontal: true,
                    dataLabels: {
                        position: 'top',
                    },
                    barHeight: '45%', // Reduced bar height to increase gap between categories
                    borderRadius: 2
                }
            },
            dataLabels: {
                enabled: false,
            },
            stroke: {
                show: true,
                width: 1,
                colors: ['#fff']
            },
            xaxis: {
                categories: ['Kertas A4', 'Pulpen Hitam', 'Spidol Board', 'Tinta Printer', 'Map Plastik', 'Buku Tulis', 'Staples', 'Lakban', 'Amplop', 'Pensil'],
            },
            fill: { opacity: 1 },
            colors: ['#10b981', '#ef4444'], // Green for In, Red for Out
            grid: {
                show: true,
                borderColor: '#f1f5f9',
                strokeDashArray: 4,
            },
            tooltip: {
                y: {
                    formatter: function (val) {
                        return val + " Unit"
                    }
                }
            },
            legend: {
                position: 'top'
            }
        }
    })

    return (
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Statistik Keluar Masuk ATK</h3>
            <div className="h-[450px]">
                <Chart
                    options={chartData.options}
                    series={chartData.series}
                    type="bar"
                    height="100%"
                    width="100%"
                />
            </div>
        </div>
    )
}

function StatusLaporanChart() {
    const [chartData] = useState({
        series: [44, 55, 13],
        options: {
            chart: {
                type: 'donut',
                height: 350,
                fontFamily: 'inherit'
            },
            labels: ['Menunggu', 'Diproses', 'Selesai'],
            colors: ['#f59e0b', '#3b82f6', '#10b981'],
            plotOptions: {
                pie: {
                    donut: {
                        size: '70%',
                        labels: {
                            show: true,
                            total: {
                                show: true,
                                label: 'Total',
                                fontSize: '22px',
                                fontWeight: 600,
                                color: '#64748b'
                            }
                        }
                    }
                }
            },
            dataLabels: { enabled: false },
            legend: {
                position: 'bottom'
            },
            stroke: { show: false }
        }
    })

    return (
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Status Laporan</h3>
            <div className="flex items-center justify-center h-[300px]">
                <Chart
                    options={chartData.options}
                    series={chartData.series}
                    type="donut"
                    width={380}
                />
            </div>
        </div>
    )
}