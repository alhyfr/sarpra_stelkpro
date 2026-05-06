'use client'
import { useState, useEffect } from 'react'
import dynamic from 'next/dynamic'
import api from '@/app/utils/Api'
import { Package, TrendingUp, TrendingDown, BarChart3 } from 'lucide-react'

const Chart = dynamic(() => import('react-apexcharts'), { ssr: false })

export default function InfoAtk() {
    const [data, setData] = useState(null)
    const [loading, setLoading] = useState(true)
    const [isDark, setIsDark] = useState(false)

    useEffect(() => {
        const checkDarkMode = () => {
            if (typeof window !== 'undefined') {
                const isDarkMode = document.documentElement.classList.contains('dark') ||
                    window.matchMedia('(prefers-color-scheme: dark)').matches
                setIsDark(isDarkMode)
            }
        }

        checkDarkMode()

        const observer = new MutationObserver(checkDarkMode)
        if (typeof document !== 'undefined') {
            observer.observe(document.documentElement, {
                attributes: true,
                attributeFilter: ['class'],
            })
        }

        return () => observer.disconnect()
    }, [])

    const fetchData = async () => {
        try {
            setLoading(true)
            const response = await api.get('/sp/stat-atk-triwulan')

            if (response.data && response.data.status === 'success' && response.data.data) {
                setData(response.data.data)
            }
        } catch (error) {
            console.error('Error fetching ATK triwulan data:', error)
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        fetchData()
    }, [])

    // Hitung total keseluruhan untuk summary cards
    const totalMasuk = data?.series?.[0]?.data?.reduce((a, b) => a + b, 0) || 0
    const totalKeluar = data?.series?.[1]?.data?.reduce((a, b) => a + b, 0) || 0
    const stokTerakhir = data?.series?.[2]?.data?.slice(-1)[0] || 0

    const summaryCards = [
        {
            label: 'Total Masuk',
            value: totalMasuk,
            icon: TrendingUp,
            color: 'text-emerald-600 dark:text-emerald-400',
            bg: 'bg-emerald-50 dark:bg-emerald-900/30',
        },
        {
            label: 'Total Pengambilan',
            value: totalKeluar,
            icon: TrendingDown,
            color: 'text-rose-600 dark:text-rose-400',
            bg: 'bg-rose-50 dark:bg-rose-900/30',
        },
        {
            label: 'Stok Tersedia',
            value: stokTerakhir,
            icon: Package,
            color: 'text-blue-600 dark:text-blue-400',
            bg: 'bg-blue-50 dark:bg-blue-900/30',
        },
    ]

    const chartOptions = {
        chart: {
            type: 'bar',
            height: 350,
            toolbar: { show: false },
            fontFamily: 'inherit',
            stacked: false,
        },
        plotOptions: {
            bar: {
                horizontal: false,
                columnWidth: '50%',
                borderRadius: 6,
                borderRadiusApplication: 'end',
            },
        },
        dataLabels: { enabled: false },
        stroke: {
            show: true,
            width: [0, 0, 3],
            curve: 'smooth',
        },
        xaxis: {
            categories: data?.categories || [],
            axisBorder: { show: false },
            axisTicks: { show: false },
            labels: {
                style: {
                    fontSize: '12px',
                    colors: isDark ? '#9ca3af' : '#6b7280',
                },
            },
        },
        yaxis: {
            labels: {
                style: {
                    fontSize: '11px',
                    colors: isDark ? '#9ca3af' : '#6b7280',
                },
                formatter: (val) => Math.round(val),
            },
        },
        colors: ['#10b981', '#ef4444', '#3b82f6'],
        fill: {
            opacity: [0.85, 0.85, 1],
            type: ['solid', 'solid', 'solid'],
        },
        grid: {
            show: true,
            borderColor: isDark ? '#374151' : '#f1f5f9',
            strokeDashArray: 4,
            xaxis: { lines: { show: false } },
            yaxis: { lines: { show: true } },
        },
        tooltip: {
            shared: true,
            intersect: false,
            y: {
                formatter: (val) => val + ' Unit',
            },
        },
        legend: {
            position: 'top',
            horizontalAlign: 'center',
            fontSize: '12px',
            itemMargin: { horizontal: 12, vertical: 4 },
            labels: {
                colors: isDark ? '#d1d5db' : '#374151',
            },
            markers: {
                radius: 3,
            },
        },
        theme: {
            mode: isDark ? 'dark' : 'light',
        },
        responsive: [
            {
                breakpoint: 640,
                options: {
                    plotOptions: {
                        bar: {
                            columnWidth: '65%',
                            borderRadius: 4,
                        },
                    },
                    legend: {
                        position: 'bottom',
                        horizontalAlign: 'center',
                        fontSize: '11px',
                    },
                },
            },
        ],
    }

    // Series: 2 bar (masuk, keluar) + 1 line (stok tersedia)
    const chartSeries = data?.series
        ? [
            { name: data.series[0]?.name || 'Total Masuk', type: 'column', data: data.series[0]?.data || [] },
            { name: data.series[1]?.name || 'Pengambilan', type: 'column', data: data.series[1]?.data || [] },
            { name: data.series[2]?.name || 'Stok Tersedia', type: 'line', data: data.series[2]?.data || [] },
        ]
        : []

    return (
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
            {/* Header */}
            <div className="flex items-center gap-3 mb-6">
                <div className="p-2 bg-indigo-50 dark:bg-indigo-900/30 rounded-lg">
                    <BarChart3 className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                </div>
                <div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Statistik ATK per Triwulan</h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Data alat tulis kantor tahun berjalan</p>
                </div>
            </div>

            {loading ? (
                <div className="flex items-center justify-center h-[400px]">
                    <div className="flex flex-col items-center gap-3">
                        <div className="w-8 h-8 border-4 border-indigo-200 dark:border-indigo-800 border-t-indigo-600 dark:border-t-indigo-400 rounded-full animate-spin" />
                        <span className="text-sm text-gray-500 dark:text-gray-400">Memuat data...</span>
                    </div>
                </div>
            ) : !data ? (
                <div className="flex items-center justify-center h-[400px]">
                    <div className="text-gray-500 dark:text-gray-400">Data tidak tersedia</div>
                </div>
            ) : (
                <>
                    {/* Summary Cards */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
                        {summaryCards.map((card, index) => (
                            <div key={index} className={`${card.bg} rounded-lg p-4 flex items-center gap-3`}>
                                <card.icon className={`w-5 h-5 ${card.color} flex-shrink-0`} />
                                <div>
                                    <p className="text-xs text-gray-500 dark:text-gray-400">{card.label}</p>
                                    <p className={`text-xl font-bold ${card.color}`}>
                                        {card.value.toLocaleString('id-ID')}
                                    </p>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Chart */}
                    <div className="w-full">
                        <div className="min-h-[300px] sm:min-h-[350px]">
                            <Chart
                                options={chartOptions}
                                series={chartSeries}
                                type="line"
                                height={350}
                                width="100%"
                            />
                        </div>
                    </div>
                </>
            )}
        </div>
    )
}
