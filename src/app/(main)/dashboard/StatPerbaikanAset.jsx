'use client'
import dynamic from "next/dynamic";
const Chart = dynamic(() => import("react-apexcharts"), { ssr: false });
import { useState, useEffect } from "react";
import api from "@/app/utils/Api";

export default function StatPerbaikanAset() {
    const [chartData, setChartData] = useState({
        series: [0, 0, 0],
        options: {
            chart: {
                type: 'donut',
                height: 350,
                fontFamily: 'inherit'
            },
            labels: ['Terjadwal', 'Diproses', 'Selesai'],
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
    });
    const [loading, setLoading] = useState(true);

    const getChartData = async () => {
        try {
            setLoading(true);
            const response = await api.get("/sp/stat-perawatan-aset");

            const data = response.data?.data || response.data || {};

            // Perawatan Aset - backend sudah memfilter tahun berjalan
            // Frontend memfilter berdasarkan status
            const asetArray = Array.isArray(data?.perawatanAset)
                ? data.perawatanAset
                : [];

            // Hitung berdasarkan status
            // Terjadwal: status 'pending' atau 'terjadwal'
            const terjadwal = asetArray.filter(
                (item) => item.status === 'pending' || item.status === 'terjadwal'
            ).length;

            // Diproses: status 'progress' atau 'proses' atau 'diproses'
            const diproses = asetArray.filter(
                (item) => item.status === 'progress' || item.status === 'proses' || item.status === 'diproses'
            ).length;

            // Selesai: status 'selesai' atau 'done'
            const selesai = asetArray.filter(
                (item) => item.status === 'selesai' || item.status === 'done'
            ).length;

            setChartData(prev => ({
                ...prev,
                series: [terjadwal, diproses, selesai]
            }));
        } catch (error) {
            console.error("Error fetching perbaikan aset data:", error);
            setChartData(prev => ({
                ...prev,
                series: [0, 0, 0]
            }));
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        getChartData();
    }, []);

    return (
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Status Laporan Perbaikan Aset</h3>
            {loading ? (
                <div className="flex items-center justify-center h-[300px]">
                    <div className="text-gray-500 dark:text-gray-400">Memuat data...</div>
                </div>
            ) : (
                <div className="flex items-center justify-center h-[300px]">
                    <Chart
                        options={chartData.options}
                        series={chartData.series}
                        type="donut"
                        width={380}
                    />
                </div>
            )}
        </div>
    )
}
