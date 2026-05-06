'use client'
import { useState, useEffect } from 'react'
import dynamic from 'next/dynamic'
import api from '@/app/utils/Api'
import {
    Wrench,
    Clock,
    CheckCircle2,
    AlertCircle,
    Loader2,
    Settings2,
    Building2,
    Monitor,
    ChevronLeft,
    ChevronRight
} from 'lucide-react'

const Chart = dynamic(() => import('react-apexcharts'), { ssr: false })

export default function InfoPerawatan() {
    const [data, setData] = useState(null)
    const [loading, setLoading] = useState(true)
    const [isDark, setIsDark] = useState(false)
    const [activeTab, setActiveTab] = useState('semua') // 'semua' | 'aset' | 'gedung'
    const [currentPage, setCurrentPage] = useState(1)
    const perPage = 5

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
            const response = await api.get('/sp/infografis-perawatan')

            if (response.data && response.data.status === 'success' && response.data.data) {
                setData(response.data.data)
            }
        } catch (error) {
            console.error('Error fetching infografis perawatan:', error)
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        fetchData()
    }, [])

    // Format tanggal
    const formatDate = (dateStr) => {
        if (!dateStr) return '-'
        try {
            const date = new Date(dateStr)
            return date.toLocaleDateString('id-ID', {
                day: '2-digit',
                month: 'short',
                year: 'numeric',
            })
        } catch {
            return dateStr
        }
    }

    // Status badge
    const getStatusBadge = (status) => {
        const s = (status || '').toLowerCase()
        if (s.includes('selesai') || s.includes('done')) {
            return (
                <span className="inline-flex items-center gap-1 px-2 py-1 text-xs font-medium rounded-full bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-400">
                    <CheckCircle2 className="w-3 h-3" />
                    Selesai
                </span>
            )
        }
        if (s.includes('proses') || s.includes('progress') || s.includes('sedang')) {
            return (
                <span className="inline-flex items-center gap-1 px-2 py-1 text-xs font-medium rounded-full bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-400">
                    <Loader2 className="w-3 h-3" />
                    Diproses
                </span>
            )
        }
        return (
            <span className="inline-flex items-center gap-1 px-2 py-1 text-xs font-medium rounded-full bg-amber-100 dark:bg-amber-900/40 text-amber-700 dark:text-amber-400">
                <AlertCircle className="w-3 h-3" />
                Pending
            </span>
        )
    }

    // Kategori badge
    const getKategoriBadge = (kategori) => {
        if (kategori === 'Aset') {
            return (
                <span className="inline-flex items-center gap-1 px-2 py-1 text-xs font-medium rounded-full bg-violet-100 dark:bg-violet-900/40 text-violet-700 dark:text-violet-400">
                    <Monitor className="w-3 h-3" />
                    Aset
                </span>
            )
        }
        return (
            <span className="inline-flex items-center gap-1 px-2 py-1 text-xs font-medium rounded-full bg-cyan-100 dark:bg-cyan-900/40 text-cyan-700 dark:text-cyan-400">
                <Building2 className="w-3 h-3" />
                Gedung/Barang
            </span>
        )
    }

    // Donut chart helper
    const getDonutOptions = (title, seriesData, labels) => ({
        chart: {
            type: 'donut',
            height: 200,
            fontFamily: 'inherit',
        },
        labels: labels,
        colors: ['#f59e0b', '#3b82f6', '#10b981'],
        plotOptions: {
            pie: {
                donut: {
                    size: '68%',
                    labels: {
                        show: true,
                        total: {
                            show: true,
                            label: 'Total',
                            fontSize: '14px',
                            fontWeight: 600,
                            color: isDark ? '#d1d5db' : '#64748b',
                        },
                    },
                },
            },
        },
        dataLabels: { enabled: false },
        legend: {
            position: 'bottom',
            fontSize: '11px',
            labels: {
                colors: isDark ? '#d1d5db' : '#374151',
            },
            markers: { radius: 3 },
            itemMargin: { horizontal: 8, vertical: 2 },
        },
        stroke: { show: false },
        theme: {
            mode: isDark ? 'dark' : 'light',
        },
    })

    // Statistik data
    const statAset = data?.statistik?.aset || { pending: 0, proses: 0, selesai: 0, total: 0 }
    const statBarang = data?.statistik?.barang || { pending: 0, proses: 0, selesai: 0, total: 0 }

    // Filter timeline berdasarkan tab
    const filteredTimeline = (data?.timeline || []).filter((item) => {
        if (activeTab === 'semua') return true
        if (activeTab === 'aset') return item.kategori === 'Aset'
        if (activeTab === 'gedung') return item.kategori !== 'Aset'
        return true
    })

    // Stat summary cards
    const totalPending = statAset.pending + statBarang.pending
    const totalProses = statAset.proses + statBarang.proses
    const totalSelesai = statAset.selesai + statBarang.selesai
    const totalAll = statAset.total + statBarang.total

    const statCards = [
        {
            label: 'Total Laporan',
            value: totalAll,
            icon: Wrench,
            color: 'text-gray-700 dark:text-gray-200',
            bg: 'bg-gray-100 dark:bg-gray-700/50',
        },
        {
            label: 'Pending',
            value: totalPending,
            icon: AlertCircle,
            color: 'text-amber-600 dark:text-amber-400',
            bg: 'bg-amber-50 dark:bg-amber-900/30',
        },
        {
            label: 'Diproses',
            value: totalProses,
            icon: Clock,
            color: 'text-blue-600 dark:text-blue-400',
            bg: 'bg-blue-50 dark:bg-blue-900/30',
        },
        {
            label: 'Selesai',
            value: totalSelesai,
            icon: CheckCircle2,
            color: 'text-emerald-600 dark:text-emerald-400',
            bg: 'bg-emerald-50 dark:bg-emerald-900/30',
        },
    ]

    return (
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
            {/* Header */}
            <div className="flex items-center gap-3 mb-6">
                <div className="p-2 bg-orange-50 dark:bg-orange-900/30 rounded-lg">
                    <Settings2 className="w-5 h-5 text-orange-600 dark:text-orange-400" />
                </div>
                <div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Infografis Perawatan</h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Statistik perbaikan aset & gedung tahun berjalan</p>
                </div>
            </div>

            {loading ? (
                <div className="flex items-center justify-center h-[400px]">
                    <div className="flex flex-col items-center gap-3">
                        <div className="w-8 h-8 border-4 border-orange-200 dark:border-orange-800 border-t-orange-600 dark:border-t-orange-400 rounded-full animate-spin" />
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
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
                        {statCards.map((card, index) => (
                            <div key={index} className={`${card.bg} rounded-lg p-3 flex items-center gap-3`}>
                                <card.icon className={`w-5 h-5 ${card.color} flex-shrink-0`} />
                                <div>
                                    <p className="text-xs text-gray-500 dark:text-gray-400">{card.label}</p>
                                    <p className={`text-lg font-bold ${card.color}`}>{card.value}</p>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Donut Charts */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-6">
                        {/* Aset */}
                        <div className="border border-gray-100 dark:border-gray-700 rounded-lg p-4">
                            <div className="flex items-center gap-2 mb-2">
                                <Monitor className="w-4 h-4 text-violet-500" />
                                <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300">Perbaikan Aset</h4>
                            </div>
                            {statAset.total === 0 ? (
                                <div className="flex items-center justify-center h-[180px] text-sm text-gray-400">Belum ada data</div>
                            ) : (
                                <Chart
                                    options={getDonutOptions('Aset', [statAset.pending, statAset.proses, statAset.selesai], ['Pending', 'Diproses', 'Selesai'])}
                                    series={[statAset.pending, statAset.proses, statAset.selesai]}
                                    type="donut"
                                    height={200}
                                />
                            )}
                        </div>

                        {/* Gedung/Barang */}
                        <div className="border border-gray-100 dark:border-gray-700 rounded-lg p-4">
                            <div className="flex items-center gap-2 mb-2">
                                <Building2 className="w-4 h-4 text-cyan-500" />
                                <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300">Perbaikan Gedung/Barang</h4>
                            </div>
                            {statBarang.total === 0 ? (
                                <div className="flex items-center justify-center h-[180px] text-sm text-gray-400">Belum ada data</div>
                            ) : (
                                <Chart
                                    options={getDonutOptions('Gedung', [statBarang.pending, statBarang.proses, statBarang.selesai], ['Pending', 'Diproses', 'Selesai'])}
                                    series={[statBarang.pending, statBarang.proses, statBarang.selesai]}
                                    type="donut"
                                    height={200}
                                />
                            )}
                        </div>
                    </div>

                    {/* Timeline Section */}
                    <div>
                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4">
                            <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300">Timeline Perbaikan Terbaru</h4>
                            <div className="flex bg-gray-100 dark:bg-gray-700 rounded-lg p-1 self-start sm:self-auto">
                                {[
                                    { key: 'semua', label: 'Semua' },
                                    { key: 'aset', label: 'Aset' },
                                    { key: 'gedung', label: 'Gedung' },
                                ].map((tab) => (
                                    <button
                                        key={tab.key}
                                        onClick={() => { setActiveTab(tab.key); setCurrentPage(1) }}
                                        className={`px-3 py-1 text-xs font-medium rounded-md transition-all ${activeTab === tab.key
                                            ? 'bg-white dark:bg-gray-600 text-gray-900 dark:text-white shadow-sm'
                                            : 'text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
                                            }`}
                                    >
                                        {tab.label}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {filteredTimeline.length === 0 ? (
                            <div className="flex items-center justify-center h-[120px] text-sm text-gray-400 dark:text-gray-500">
                                Tidak ada data perbaikan
                            </div>
                        ) : (
                            <div className="overflow-x-auto rounded-lg border border-gray-100 dark:border-gray-700">
                                <table className="w-full text-sm">
                                    <thead>
                                        <tr className="bg-gray-50 dark:bg-gray-700/50">
                                            <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Item</th>
                                            <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Kategori</th>
                                            <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Kerusakan</th>
                                            <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Tgl Rusak</th>
                                            <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Tgl Selesai</th>
                                            <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Status</th>
                                            <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">PIC</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                                        {filteredTimeline.slice((currentPage - 1) * perPage, currentPage * perPage).map((item, index) => (
                                            <tr key={index} className="hover:bg-gray-50 dark:hover:bg-gray-700/30 transition-colors">
                                                <td className="px-4 py-3 text-gray-900 dark:text-gray-100 font-medium max-w-[180px] truncate">
                                                    {item.nama_item || '-'}
                                                </td>
                                                <td className="px-4 py-3">
                                                    {getKategoriBadge(item.kategori)}
                                                </td>
                                                <td className="px-4 py-3 text-gray-600 dark:text-gray-400 max-w-[150px] truncate">
                                                    {item.jenis_kerusakan || '-'}
                                                </td>
                                                <td className="px-4 py-3 text-gray-600 dark:text-gray-400 whitespace-nowrap">
                                                    {formatDate(item.tgl_rusak)}
                                                </td>
                                                <td className="px-4 py-3 text-gray-600 dark:text-gray-400 whitespace-nowrap">
                                                    {formatDate(item.tgl_diperbaiki)}
                                                </td>
                                                <td className="px-4 py-3">
                                                    {getStatusBadge(item.status)}
                                                </td>
                                                <td className="px-4 py-3 text-gray-600 dark:text-gray-400">
                                                    {item.pic || '-'}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}

                        {/* Pagination */}
                        {filteredTimeline.length > perPage && (
                            <div className="mt-3 flex items-center justify-between">
                                <span className="text-xs text-gray-500 dark:text-gray-400">
                                    {(currentPage - 1) * perPage + 1}–{Math.min(currentPage * perPage, filteredTimeline.length)} dari {filteredTimeline.length} data
                                </span>
                                <div className="flex items-center gap-1">
                                    <button
                                        onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                                        disabled={currentPage === 1}
                                        className="p-1.5 rounded-md border border-gray-200 dark:border-gray-600 text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                                    >
                                        <ChevronLeft className="w-4 h-4" />
                                    </button>
                                    <span className="px-3 py-1 text-xs font-medium text-gray-700 dark:text-gray-300">
                                        {currentPage} / {Math.ceil(filteredTimeline.length / perPage)}
                                    </span>
                                    <button
                                        onClick={() => setCurrentPage(p => Math.min(Math.ceil(filteredTimeline.length / perPage), p + 1))}
                                        disabled={currentPage >= Math.ceil(filteredTimeline.length / perPage)}
                                        className="p-1.5 rounded-md border border-gray-200 dark:border-gray-600 text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                                    >
                                        <ChevronRight className="w-4 h-4" />
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                </>
            )}
        </div>
    )
}
