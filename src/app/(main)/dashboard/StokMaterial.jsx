'use client'
import { useState, useEffect, useCallback } from 'react'
import api from '@/app/utils/Api'
import Modal from '@/components/Modal'
import dayjs from 'dayjs'
import {
    Boxes,
    Package,
    PackageCheck,
    PackageX,
    AlertTriangle,
    TrendingDown,
    Search,
    Eye,
    ChevronLeft,
    ChevronRight,
    Calendar,
    MapPin,
    User,
} from 'lucide-react'

const STATUS_CONFIG = {
    aman: {
        label: 'Aman',
        badge: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-300',
        dot: 'bg-emerald-500',
    },
    menipis: {
        label: 'Menipis',
        badge: 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300',
        dot: 'bg-amber-500',
    },
    habis: {
        label: 'Habis',
        badge: 'bg-rose-100 text-rose-800 dark:bg-rose-900/30 dark:text-rose-300',
        dot: 'bg-rose-500',
    },
}

const STATUS_FILTERS = [
    { key: '', label: 'Semua' },
    { key: 'aman', label: 'Aman' },
    { key: 'menipis', label: 'Menipis' },
    { key: 'habis', label: 'Habis' },
]

const formatNumber = (value) => Number(value || 0).toLocaleString('id-ID')

export default function StokMaterial() {
    const [ringkasan, setRingkasan] = useState(null)
    const [ringkasanLoading, setRingkasanLoading] = useState(true)

    const [data, setData] = useState([])
    const [loading, setLoading] = useState(true)
    const [pagination, setPagination] = useState({ current_page: 1, last_page: 1, total: 0 })

    const [search, setSearch] = useState('')
    const [statusStok, setStatusStok] = useState('')
    const [page, setPage] = useState(1)
    const perPage = 5

    const [detail, setDetail] = useState(null)
    const [detailLoading, setDetailLoading] = useState(false)
    const [showDetail, setShowDetail] = useState(false)

    const getRingkasan = useCallback(async () => {
        try {
            setRingkasanLoading(true)
            const response = await api.get('/sp/material-data/ringkasan')
            if (response.data?.status === 'success') {
                setRingkasan(response.data.data)
            }
        } catch (error) {
            console.error('Error fetching ringkasan stok material:', error)
            setRingkasan(null)
        } finally {
            setRingkasanLoading(false)
        }
    }, [])

    const getStokMaterial = useCallback(async () => {
        try {
            setLoading(true)
            const queryParams = new URLSearchParams({
                page,
                per_page: perPage,
            })
            if (search.trim()) queryParams.append('search', search.trim())
            if (statusStok) queryParams.append('status_stok', statusStok)

            const response = await api.get(`/sp/material-data?${queryParams}`)
            if (response.data?.status === 'success') {
                setData(response.data.data || [])
                setPagination(response.data.pagination || { current_page: 1, last_page: 1, total: 0 })
            } else {
                setData([])
            }
        } catch (error) {
            console.error('Error fetching stok material:', error)
            setData([])
        } finally {
            setLoading(false)
        }
    }, [page, search, statusStok])

    const getDetail = async (id) => {
        try {
            setShowDetail(true)
            setDetailLoading(true)
            setDetail(null)
            const response = await api.get(`/sp/material-data/${id}`)
            if (response.data?.status === 'success') {
                setDetail(response.data.data)
            }
        } catch (error) {
            console.error('Error fetching detail material:', error)
            setDetail(null)
        } finally {
            setDetailLoading(false)
        }
    }

    useEffect(() => {
        getRingkasan()
    }, [getRingkasan])

    // Debounce fetch saat search/filter/page berubah
    useEffect(() => {
        const timeout = setTimeout(() => {
            getStokMaterial()
        }, 400)
        return () => clearTimeout(timeout)
    }, [getStokMaterial])

    const handleSearchChange = (e) => {
        setSearch(e.target.value)
        setPage(1)
    }

    const handleStatusChange = (key) => {
        setStatusStok(key)
        setPage(1)
    }

    const summaryCards = [
        {
            label: 'Total Material',
            value: ringkasan?.total_material,
            icon: Boxes,
            color: 'text-indigo-600 dark:text-indigo-400',
            bg: 'bg-indigo-50 dark:bg-indigo-900/30',
        },
        {
            label: 'Total Stok',
            value: ringkasan?.total_stok,
            icon: Package,
            color: 'text-blue-600 dark:text-blue-400',
            bg: 'bg-blue-50 dark:bg-blue-900/30',
        },
        {
            label: 'Stok Aman',
            value: ringkasan?.material_aman,
            icon: PackageCheck,
            color: 'text-emerald-600 dark:text-emerald-400',
            bg: 'bg-emerald-50 dark:bg-emerald-900/30',
        },
        {
            label: 'Stok Menipis',
            value: ringkasan?.material_menipis,
            icon: AlertTriangle,
            color: 'text-amber-600 dark:text-amber-400',
            bg: 'bg-amber-50 dark:bg-amber-900/30',
        },
        {
            label: 'Stok Habis',
            value: ringkasan?.material_habis,
            icon: PackageX,
            color: 'text-rose-600 dark:text-rose-400',
            bg: 'bg-rose-50 dark:bg-rose-900/30',
        },
        {
            label: 'Total Pemakaian',
            value: ringkasan?.total_pemakaian,
            icon: TrendingDown,
            color: 'text-purple-600 dark:text-purple-400',
            bg: 'bg-purple-50 dark:bg-purple-900/30',
        },
    ]

    const renderStatusBadge = (status) => {
        const config = STATUS_CONFIG[status] || STATUS_CONFIG.aman
        return (
            <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium ${config.badge}`}>
                <span className={`w-1.5 h-1.5 rounded-full ${config.dot}`} />
                {config.label}
            </span>
        )
    }

    return (
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
            {/* Header */}
            <div className="flex items-center gap-3 mb-6">
                <div className="p-2 bg-indigo-50 dark:bg-indigo-900/30 rounded-lg">
                    <Boxes className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                </div>
                <div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Stok &amp; Pemakaian Material</h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Pantau ketersediaan dan pemakaian material</p>
                </div>
            </div>

            {/* Summary Cards */}
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 mb-6">
                {summaryCards.map((card, index) => (
                    <div key={index} className={`${card.bg} rounded-lg p-4`}>
                        <div className="flex items-center gap-2 mb-2">
                            <card.icon className={`w-4 h-4 ${card.color} flex-shrink-0`} />
                            <p className="text-xs text-gray-500 dark:text-gray-400 truncate">{card.label}</p>
                        </div>
                        <p className={`text-xl font-bold ${card.color}`}>
                            {ringkasanLoading ? '...' : formatNumber(card.value)}
                        </p>
                    </div>
                ))}
            </div>

            {/* Controls */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4">
                <div className="relative flex-1 max-w-xs">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Search className="h-4 w-4 text-gray-400" />
                    </div>
                    <input
                        type="text"
                        value={search}
                        onChange={handleSearchChange}
                        placeholder="Cari material..."
                        className="w-full pl-9 pr-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 placeholder-gray-400 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                    />
                </div>
                <div className="flex bg-gray-100 dark:bg-gray-700 rounded-lg p-1 self-start sm:self-auto">
                    {STATUS_FILTERS.map((filter) => (
                        <button
                            key={filter.key || 'semua'}
                            onClick={() => handleStatusChange(filter.key)}
                            className={`px-3 py-1 text-xs font-medium rounded-md transition-all ${statusStok === filter.key
                                ? 'bg-white dark:bg-gray-600 text-gray-900 dark:text-white shadow-sm'
                                : 'text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
                                }`}
                        >
                            {filter.label}
                        </button>
                    ))}
                </div>
            </div>

            {/* Table */}
            {loading ? (
                <div className="flex items-center justify-center h-[200px]">
                    <div className="w-8 h-8 border-4 border-indigo-200 dark:border-indigo-800 border-t-indigo-600 dark:border-t-indigo-400 rounded-full animate-spin" />
                </div>
            ) : data.length === 0 ? (
                <div className="flex items-center justify-center h-[120px] text-sm text-gray-400 dark:text-gray-500">
                    Tidak ada data material
                </div>
            ) : (
                <div className="overflow-x-auto rounded-lg border border-gray-100 dark:border-gray-700">
                    <table className="w-full text-sm">
                        <thead>
                            <tr className="bg-gray-50 dark:bg-gray-700/50">
                                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Material</th>
                                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Kategori</th>
                                <th className="text-center px-4 py-3 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Stok</th>
                                <th className="text-center px-4 py-3 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Pemakaian</th>
                                <th className="text-center px-4 py-3 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Terakhir Pakai</th>
                                <th className="text-center px-4 py-3 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Status</th>
                                <th className="text-center px-4 py-3 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Aksi</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                            {data.map((item) => (
                                <tr key={item.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/30 transition-colors">
                                    <td className="px-4 py-3">
                                        <div className="font-medium text-gray-900 dark:text-gray-100">{item.nama_material || '-'}</div>
                                        <div className="text-xs text-gray-500 dark:text-gray-400">Satuan: {item.satuan || '-'}</div>
                                    </td>
                                    <td className="px-4 py-3 text-gray-600 dark:text-gray-400">{item.kategori || '-'}</td>
                                    <td className="px-4 py-3 text-center">
                                        <div className="font-semibold text-gray-900 dark:text-gray-100">{formatNumber(item.stok_sekarang)}</div>
                                        <div className="text-xs text-gray-400 dark:text-gray-500">Min: {formatNumber(item.stok_minimal)}</div>
                                    </td>
                                    <td className="px-4 py-3 text-center">
                                        <div className="font-semibold text-rose-600 dark:text-rose-400">{formatNumber(item.total_pemakaian)}</div>
                                        <div className="text-xs text-gray-400 dark:text-gray-500">{formatNumber(item.total_transaksi)} transaksi</div>
                                    </td>
                                    <td className="px-4 py-3 text-center text-gray-600 dark:text-gray-400 text-xs">
                                        {item.terakhir_pakai ? dayjs(item.terakhir_pakai).format('DD-MM-YYYY') : '-'}
                                    </td>
                                    <td className="px-4 py-3 text-center">{renderStatusBadge(item.status_stok)}</td>
                                    <td className="px-4 py-3 text-center">
                                        <button
                                            onClick={() => getDetail(item.id)}
                                            className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-medium text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-900/30 rounded-md transition-colors"
                                            title="Lihat riwayat pemakaian"
                                        >
                                            <Eye className="w-3.5 h-3.5" />
                                            Detail
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            {/* Pagination */}
            {!loading && pagination.total > 0 && (
                <div className="mt-3 flex items-center justify-between">
                    <span className="text-xs text-gray-500 dark:text-gray-400">
                        {formatNumber(pagination.from)}–{formatNumber(pagination.to)} dari {formatNumber(pagination.total)} material
                    </span>
                    <div className="flex items-center gap-1">
                        <button
                            onClick={() => setPage((p) => Math.max(1, p - 1))}
                            disabled={pagination.current_page <= 1}
                            className="p-1.5 rounded-md border border-gray-200 dark:border-gray-600 text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                        >
                            <ChevronLeft className="w-4 h-4" />
                        </button>
                        <span className="px-3 py-1 text-xs font-medium text-gray-700 dark:text-gray-300">
                            {pagination.current_page} / {pagination.last_page}
                        </span>
                        <button
                            onClick={() => setPage((p) => Math.min(pagination.last_page, p + 1))}
                            disabled={pagination.current_page >= pagination.last_page}
                            className="p-1.5 rounded-md border border-gray-200 dark:border-gray-600 text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                        >
                            <ChevronRight className="w-4 h-4" />
                        </button>
                    </div>
                </div>
            )}

            {/* Detail Modal */}
            <Modal
                show={showDetail}
                onClose={() => setShowDetail(false)}
                title="Detail Stok & Riwayat Pemakaian"
                size="lg"
            >
                {detailLoading ? (
                    <div className="flex items-center justify-center h-[200px]">
                        <div className="w-8 h-8 border-4 border-indigo-200 dark:border-indigo-800 border-t-indigo-600 dark:border-t-indigo-400 rounded-full animate-spin" />
                    </div>
                ) : !detail ? (
                    <div className="flex items-center justify-center h-[120px] text-sm text-gray-400 dark:text-gray-500">
                        Detail tidak tersedia
                    </div>
                ) : (
                    <div className="space-y-5">
                        {/* Info Material */}
                        <div className="flex items-start justify-between gap-3 flex-wrap">
                            <div>
                                <h4 className="text-lg font-bold text-gray-900 dark:text-white">{detail.nama_material}</h4>
                                <p className="text-sm text-gray-500 dark:text-gray-400">
                                    {detail.kategori || 'Tanpa kategori'} &middot; Satuan: {detail.satuan || '-'}
                                </p>
                            </div>
                            {renderStatusBadge(detail.status_stok)}
                        </div>

                        {/* Ringkasan Detail */}
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                            <div className="bg-blue-50 dark:bg-blue-900/30 rounded-lg p-3">
                                <p className="text-xs text-gray-500 dark:text-gray-400">Stok Sekarang</p>
                                <p className="text-lg font-bold text-blue-600 dark:text-blue-400">{formatNumber(detail.stok_sekarang)}</p>
                            </div>
                            <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-3">
                                <p className="text-xs text-gray-500 dark:text-gray-400">Stok Minimal</p>
                                <p className="text-lg font-bold text-gray-700 dark:text-gray-300">{formatNumber(detail.stok_minimal)}</p>
                            </div>
                            <div className="bg-rose-50 dark:bg-rose-900/30 rounded-lg p-3">
                                <p className="text-xs text-gray-500 dark:text-gray-400">Total Pemakaian</p>
                                <p className="text-lg font-bold text-rose-600 dark:text-rose-400">{formatNumber(detail.total_pemakaian)}</p>
                            </div>
                            <div className="bg-purple-50 dark:bg-purple-900/30 rounded-lg p-3">
                                <p className="text-xs text-gray-500 dark:text-gray-400">Total Transaksi</p>
                                <p className="text-lg font-bold text-purple-600 dark:text-purple-400">{formatNumber(detail.total_transaksi)}</p>
                            </div>
                        </div>

                        {/* Riwayat Pemakaian */}
                        <div>
                            <h5 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">Riwayat Pemakaian</h5>
                            {(!detail.riwayat_pemakaian || detail.riwayat_pemakaian.length === 0) ? (
                                <div className="flex items-center justify-center h-[80px] text-sm text-gray-400 dark:text-gray-500 border border-dashed border-gray-200 dark:border-gray-700 rounded-lg">
                                    Belum ada riwayat pemakaian
                                </div>
                            ) : (
                                <div className="space-y-2 max-h-[280px] overflow-y-auto pr-1">
                                    {detail.riwayat_pemakaian.map((riwayat) => (
                                        <div
                                            key={riwayat.id}
                                            className="flex items-start justify-between gap-3 p-3 rounded-lg border border-gray-100 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/30 transition-colors"
                                        >
                                            <div className="space-y-1">
                                                <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
                                                    <Calendar className="w-3.5 h-3.5" />
                                                    {riwayat.tgl_pakai ? dayjs(riwayat.tgl_pakai).format('DD MMMM YYYY') : '-'}
                                                </div>
                                                <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-gray-600 dark:text-gray-400">
                                                    <span className="inline-flex items-center gap-1">
                                                        <MapPin className="w-3.5 h-3.5" />
                                                        {riwayat.lokasi_pakai || '-'}
                                                    </span>
                                                    <span className="inline-flex items-center gap-1">
                                                        <User className="w-3.5 h-3.5" />
                                                        {riwayat.teknisi || '-'}
                                                    </span>
                                                </div>
                                                {riwayat.keterangan && (
                                                    <p className="text-xs text-gray-400 dark:text-gray-500 italic">{riwayat.keterangan}</p>
                                                )}
                                            </div>
                                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-rose-100 text-rose-800 dark:bg-rose-900/30 dark:text-rose-300 whitespace-nowrap">
                                                -{formatNumber(riwayat.jumlah_pakai)} {detail.satuan || ''}
                                            </span>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </Modal>
        </div>
    )
}
