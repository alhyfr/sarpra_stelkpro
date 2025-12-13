'use client'
import { Calendar, Clock, FlaskConical, GraduationCap, Activity, CheckCircle } from 'lucide-react'
import { useRouter } from 'next/navigation'
import api from '@/app/utils/Api'
import { useState, useEffect } from 'react'
import dayjs from 'dayjs'

export default function JadLabMendatang() {
    const router = useRouter()
    const [schedules, setSchedules] = useState([])
    const getSchedules = async () => {
        const response = await api.get('/sp/jadwal-lab')
        setSchedules(response.data.data)
    }
    useEffect(() => {
        getSchedules()
    }, [])
    const handleClick = () => {
        router.push(`/lab/jadwal`)
    }
    
    return (
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
            <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Jadwal Laboratorium</h3>
                <button className="text-sm text-blue-600 hover:underline" onClick={handleClick}>Lihat Semua</button>
            </div>
            <div className="space-y-4">
                {schedules
                    .sort((a, b) => {
                        // Urutkan berdasarkan tanggal terbaru (descending)
                        return dayjs(b.tgl).valueOf() - dayjs(a.tgl).valueOf()
                    })
                    .slice(0, 3)
                    .map((item, idx) => (
                        <div key={idx} className="flex items-start gap-4 p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                            <div className="flex-shrink-0 w-12 text-center bg-gray-100 dark:bg-gray-700 rounded-lg p-1">
                                <span className="block text-xs font-semibold text-gray-500 uppercase">{dayjs(item.tgl).format('MMM')}</span>
                                <span className="block text-lg font-bold text-gray-900 dark:text-white">{dayjs(item.tgl).format('DD')}</span>
                            </div>
                            <div>
                                <h4 className="text-sm font-semibold text-gray-900 dark:text-white">{item.kegiatan}</h4>
                                <p className="text-xs text-gray-500">{item.nama_lab}</p>
                            </div>
                        </div>
                    ))}
            </div>
        </div>
    )
}