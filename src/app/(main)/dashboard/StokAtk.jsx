'use client'
import { useState, useEffect } from 'react'
import api from '@/app/utils/Api'
import { Package, TrendingUp, TrendingDown, Box } from 'lucide-react'

export default function StokAtk() {
    const [data, setData] = useState([])
    const [loading, setLoading] = useState(true)

    const getMasukKeluarStok = async (id) => {
        try {
            const response = await api.get(`/sp/atk/inout/${id}`)
            if (response.data && response.data.message === 'success' && response.data.data) {
                return response.data.data
            }
            return { total_masuk: 0, total_keluar: 0 }
        } catch (error) {
            console.error('Error fetching masuk/keluar:', error)
            return { total_masuk: 0, total_keluar: 0 }
        }
    }

    const getStokAtk = async () => {
        try {
            setLoading(true)
            const queryParams = new URLSearchParams({
                per_page: 100
            })
            
            const response = await api.get(`/sp/atk?${queryParams}`)
            
            if (response.data && response.data.message === 'success' && response.data.data) {
                // Ambil data masuk/keluar untuk setiap item (sama seperti DataAtk.jsx)
                const dataWithMasukKeluar = await Promise.all(
                    response.data.data.map(async (item) => {
                        try {
                            // Cek apakah total_masuk dan total_keluar sudah ada di item
                            let totalMasuk = parseFloat(item.total_masuk) || 0
                            let totalKeluar = parseFloat(item.total_keluar) || 0
                            
                            // Jika tidak ada, fetch dari API
                            if (!item.total_masuk && !item.total_keluar) {
                                const masukKeluarData = await getMasukKeluarStok(item.id)
                                const stokData = masukKeluarData || { total_masuk: 0, total_keluar: 0 }
                                totalMasuk = parseFloat(stokData.total_masuk) || 0
                                totalKeluar = parseFloat(stokData.total_keluar) || 0
                            }
                            
                            // Perhitungan tersedia: totalMasuk - totalKeluar
                            return {
                                ...item,
                                masuk: totalMasuk,
                                keluar: totalKeluar,
                                total_masuk: totalMasuk,
                                total_keluar: totalKeluar,
                                tersedia: totalMasuk - totalKeluar
                            }
                        } catch (error) {
                            console.error(`Error processing item ${item.id}:`, error)
                            const totalMasuk = parseFloat(item.total_masuk) || 0
                            const totalKeluar = parseFloat(item.total_keluar) || 0
                            return {
                                ...item,
                                masuk: totalMasuk,
                                keluar: totalKeluar,
                                total_masuk: totalMasuk,
                                total_keluar: totalKeluar,
                                tersedia: totalMasuk - totalKeluar
                            }
                        }
                    })
                )
                
                setData(dataWithMasukKeluar)
            } else {
                setData([])
            }
        } catch (error) {
            console.error('Error fetching ATK:', error)
            setData([])
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        getStokAtk()
    }, [])

    return (
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
            <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                    <Package className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                    Alat Tulis Kantor
                </h3>
            </div>
            
            {loading ? (
                <div className="flex items-center justify-center py-12">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                </div>
            ) : data.length === 0 ? (
                <div className="text-center py-12 text-gray-500 dark:text-gray-400">
                    Tidak ada data ATK
                </div>
            ) : (
                <div className="overflow-x-auto">
                    <div className="min-w-full overflow-y-auto max-h-[500px]">
                        <table className="w-full">
                            <thead className="sticky top-0 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-gray-700 dark:to-gray-800 border-b border-gray-200 dark:border-gray-600">
                                <tr>
                                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                                        Nama ATK
                                    </th>
                                    <th className="px-4 py-3 text-center text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                                        <div className="flex items-center justify-center gap-1">
                                            <TrendingUp className="w-4 h-4 text-green-600" />
                                            Masuk
                                        </div>
                                    </th>
                                    <th className="px-4 py-3 text-center text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                                        <div className="flex items-center justify-center gap-1">
                                            <TrendingDown className="w-4 h-4 text-red-600" />
                                            Keluar
                                        </div>
                                    </th>
                                    <th className="px-4 py-3 text-center text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                                        <div className="flex items-center justify-center gap-1">
                                            <Box className="w-4 h-4 text-blue-600" />
                                            Tersedia
                                        </div>
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                                {data.map((item, index) => (
                                    <tr 
                                        key={item.id || index}
                                        className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
                                    >
                                        <td className="px-4 py-3 whitespace-nowrap">
                                            <div className="text-sm font-medium text-gray-900 dark:text-white">
                                                {item.nabar || '-'}
                                            </div>
                                            {item.satuan && (
                                                <div className="text-xs text-gray-500 dark:text-gray-400">
                                                    Satuan: {item.satuan}
                                                </div>
                                            )}
                                        </td>
                                        <td className="px-4 py-3 whitespace-nowrap text-center">
                                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300">
                                                {item.masuk || 0}
                                            </span>
                                        </td>
                                        <td className="px-4 py-3 whitespace-nowrap text-center">
                                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300">
                                                {item.keluar || 0}
                                            </span>
                                        </td>
                                        <td className="px-4 py-3 whitespace-nowrap text-center">
                                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                                (item.tersedia || 0) > 10 
                                                    ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300'
                                                    : (item.tersedia || 0) > 0
                                                    ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300'
                                                    : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'
                                            }`}>
                                                {item.tersedia || 0}
                                            </span>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}
        </div>
    )
}