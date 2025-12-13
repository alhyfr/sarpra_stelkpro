'use client'
import { useState, useEffect } from 'react'
import { Box, MonitorSmartphone, FileText, TrendingUp, TrendingDown, CheckCircle2, Building2, Wrench } from 'lucide-react'
import api from '@/app/utils/Api'
import dayjs from 'dayjs'

export default function StatGrid() {
    const [perbaikanGedung, setPerbaikanGedung] = useState(0)
    const [perbaikanAset, setPerbaikanAset] = useState(0)
    const [selesaiGedung, setSelesaiGedung] = useState(0)
    const [selesaiAset, setSelesaiAset] = useState(0)
    const [selesaiBulanIni, setSelesaiBulanIni] = useState(0)
    const [monitoringBulanIni, setMonitoringBulanIni] = useState(0)
    const [totalAset, setTotalAset] = useState(0)
    const [loading, setLoading] = useState(true)

    const getDashboardData = async () => {
        try {
            setLoading(true)
            const response = await api.get('/sp/stat-grid')
            
            const data = response.data?.data || response.data || {}
            
            // Total Aset - totalInventaris adalah number langsung
            const totalInventarisData = Number(data?.totalInventaris) || 0
            setTotalAset(totalInventarisData)
            
            // Monitoring Bulan Ini - monitoring adalah number langsung
            const monitoringData = Number(data?.monitoring) || 0
            setMonitoringBulanIni(monitoringData)
            
            // Bulan dan tahun berjalan untuk filter
            const currentDate = new Date()
            const currentYear = currentDate.getFullYear()
            const currentMonth = currentDate.getMonth() + 1 // 1-12
            
            // Helper function untuk check apakah tanggal di bulan berjalan
            const isCurrentMonth = (dateString) => {
                if (!dateString) return false
                const date = dayjs(dateString)
                return date.isValid() && date.year() === currentYear && (date.month() + 1) === currentMonth
            }
            
            // Perbaikan Gedung - backend sudah memfilter tahun berjalan berdasarkan tgl_masuk
            // Frontend memfilter berdasarkan status
            const gedungArray = Array.isArray(data?.perbaikanGedung) ? data.perbaikanGedung : []
            const gedungPending = gedungArray.filter(item => item.status !== 'selesai').length
            const gedungSelesai = gedungArray.filter(item => item.status === 'selesai').length
            const gedungSelesaiBulanIni = gedungArray.filter(item => 
                item.status === 'selesai' && isCurrentMonth(item.tgl_selesai)
            ).length
            
            // Perawatan Aset - backend sudah memfilter tahun berjalan berdasarkan tgl_masuk
            // Frontend memfilter berdasarkan status
            const asetArray = Array.isArray(data?.perawatanAset) ? data.perawatanAset : []
            const asetPending = asetArray.filter(item => item.status !== 'selesai').length
            const asetSelesai = asetArray.filter(item => item.status === 'selesai').length
            const asetSelesaiBulanIni = asetArray.filter(item => 
                item.status === 'selesai' && isCurrentMonth(item.tgl_selesai)
            ).length
            
            setPerbaikanGedung(gedungPending)
            setPerbaikanAset(asetPending)
            setSelesaiGedung(gedungSelesai)
            setSelesaiAset(asetSelesai)
            setSelesaiBulanIni(gedungSelesaiBulanIni + asetSelesaiBulanIni)
        } catch (error) {
            console.error('Error fetching dashboard data:', error)
            setPerbaikanGedung(0)
            setPerbaikanAset(0)
            setSelesaiGedung(0)
            setSelesaiAset(0)
            setSelesaiBulanIni(0)
            setMonitoringBulanIni(0)
            setTotalAset(0)
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        getDashboardData()
    }, [])

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Card Total Aset */}
            <div className="group bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm border border-gray-200 dark:border-gray-700 hover:shadow-md transition-all duration-300">
                <div className="flex items-center justify-between mb-3">
                    <div className="p-2 rounded-lg bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 group-hover:scale-110 transition-transform">
                        <Box className="w-5 h-5" />
                    </div>
                    <div className="flex items-center gap-2">
                        <span className="flex items-center text-sm font-medium text-green-600">
                            <TrendingUp className="w-4 h-4 mr-1" />
                            +12.5%
                        </span>
                    </div>
                </div>
                <div>
                    <h4 className="text-xl font-bold text-gray-900 dark:text-white mb-1">
                        {loading ? "..." : totalAset.toLocaleString('id-ID')}
                    </h4>
                    <div className="flex items-center justify-between mb-1">
                        <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Aset</p>
                        <span className="text-xs text-gray-500 dark:text-gray-500">Unit aset terdata</span>
                    </div>
                </div>
            </div>

            {/* Card Monitoring Bulan Ini */}
            <div className="group bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm border border-gray-200 dark:border-gray-700 hover:shadow-md transition-all duration-300">
                <div className="flex items-center justify-between mb-3">
                    <div className="p-2 rounded-lg bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400 group-hover:scale-110 transition-transform">
                        <MonitorSmartphone className="w-5 h-5" />
                    </div>
                    <div className="flex items-center gap-2">
                        <span className="text-xs font-medium text-gray-500 dark:text-gray-400">
                            {new Date().getFullYear()}
                        </span>
                        <span className="flex items-center text-sm font-medium text-green-600">
                            <TrendingUp className="w-4 h-4 mr-1" />
                            +8.2%
                        </span>
                    </div>
                </div>
                <div>
                    <h4 className="text-xl font-bold text-gray-900 dark:text-white mb-1">
                        {loading ? "..." : monitoringBulanIni.toLocaleString('id-ID')}
                    </h4>
                    <div className="flex items-center justify-between mb-1">
                        <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Monitoring Bulan Ini</p>
                        <span className="text-xs text-gray-500 dark:text-gray-500">Pengecekan rutin</span>
                    </div>
                </div>
            </div>

            {/* Card Laporan Perbaikan */}
            <div className="group bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm border border-gray-200 dark:border-gray-700 hover:shadow-md transition-all duration-300">
                <div className="flex items-center justify-between mb-3">
                    <div className="p-2 rounded-lg bg-orange-50 dark:bg-orange-900/20 text-orange-600 dark:text-orange-400 group-hover:scale-110 transition-transform">
                        <FileText className="w-5 h-5" />
                    </div>
                    <div className="flex items-center gap-2">
                        <span className="text-xs font-medium text-gray-500 dark:text-gray-400">
                            {new Date().getFullYear()}
                        </span>
                    </div>
                </div>
                <div>
                    <h4 className="text-xl font-bold text-gray-900 dark:text-white mb-1">
                        {loading ? "..." : (perbaikanGedung + perbaikanAset).toString()}
                    </h4>
                    <div className="flex items-center justify-between mb-1">
                        <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Laporan Perbaikan</p>
                        <span className="text-xs text-gray-500 dark:text-gray-500">Butuh tindak lanjut</span>
                    </div>
                    <div className="mt-2 pt-2 border-t border-gray-200 dark:border-gray-700">
                        <div className="flex items-center justify-between gap-3">
                            <div className="flex items-center gap-1.5 flex-1">
                                <Building2 className="w-3.5 h-3.5 text-gray-500 dark:text-gray-400 flex-shrink-0" />
                                <div className="flex-1 min-w-0">
                                    <p className="text-xs text-gray-500 dark:text-gray-400 truncate">Gedung</p>
                                    <p className="text-xs font-semibold text-gray-900 dark:text-white">{perbaikanGedung}</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-1.5 flex-1">
                                <Wrench className="w-3.5 h-3.5 text-gray-500 dark:text-gray-400 flex-shrink-0" />
                                <div className="flex-1 min-w-0">
                                    <p className="text-xs text-gray-500 dark:text-gray-400 truncate">Aset</p>
                                    <p className="text-xs font-semibold text-gray-900 dark:text-white">{perbaikanAset}</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Card Perbaikan Selesai */}
            <div className="group bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm border border-gray-200 dark:border-gray-700 hover:shadow-md transition-all duration-300">
                <div className="flex items-center justify-between mb-3">
                    <div className="p-2 rounded-lg bg-purple-50 dark:bg-purple-900/20 text-purple-600 dark:text-purple-400 group-hover:scale-110 transition-transform">
                        <CheckCircle2 className="w-5 h-5" />
                    </div>
                    <div className="flex items-center gap-2">
                        <span className="flex items-center text-sm font-medium text-green-600">
                            <TrendingUp className="w-4 h-4 mr-1" />
                        </span>
                    </div>
                </div>
                <div>
                    <h4 className="text-xl font-bold text-gray-900 dark:text-white mb-1">
                        {loading ? "..." : (selesaiGedung + selesaiAset).toString()}
                    </h4>
                    <div className="flex items-center justify-between mb-1">
                        <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Perbaikan Selesai</p>
                        <span className="text-xs text-gray-500 dark:text-gray-500">Bulan ini : {loading ? "..." : selesaiBulanIni}</span>
                    </div>
                    <div className="mt-2 pt-2 border-t border-gray-200 dark:border-gray-700">
                        <div className="flex items-center justify-between gap-3">
                            <div className="flex items-center gap-1.5 flex-1">
                                <Building2 className="w-3.5 h-3.5 text-gray-500 dark:text-gray-400 flex-shrink-0" />
                                <div className="flex-1 min-w-0">
                                    <p className="text-xs text-gray-500 dark:text-gray-400 truncate">Gedung</p>
                                    <p className="text-xs font-semibold text-gray-900 dark:text-white">{selesaiGedung}</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-1.5 flex-1">
                                <Wrench className="w-3.5 h-3.5 text-gray-500 dark:text-gray-400 flex-shrink-0" />
                                <div className="flex-1 min-w-0">
                                    <p className="text-xs text-gray-500 dark:text-gray-400 truncate">Aset</p>
                                    <p className="text-xs font-semibold text-gray-900 dark:text-white">{selesaiAset}</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}