'use client'
import { useState, useEffect } from 'react'
import dynamic from 'next/dynamic'
import api from '@/app/utils/Api'

const Chart = dynamic(() => import('react-apexcharts'), { ssr: false })

export default function StatInv() {
    const [chartData, setChartData] = useState({
        series: [{
            name: 'Inventaris',
            data: []
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
                categories: [],
                axisBorder: { show: false },
                axisTicks: { show: false },
                labels: {
                    style: {
                        fontSize: '11px',
                        colors: '#6b7280',
                    },
                },
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
            },
            tooltip: {
                y: {
                    formatter: function (val) {
                        return val + " data";
                    },
                },
            },
        }
    })
    const [loading, setLoading] = useState(true)
    const [selectedYear, setSelectedYear] = useState(null) // null = semua tahun, atau tahun tertentu
    const [availableYears, setAvailableYears] = useState([])
    const [isDark, setIsDark] = useState(false)

    // Generate list tahun (5 tahun terakhir + tahun berjalan = 6 tahun)
    // Sesuai dengan backend yang menggunakan range 5 tahun terakhir + tahun berjalan
    useEffect(() => {
        const currentYear = new Date().getFullYear()
        const years = []
        // Urut dari tahun terbaru ke tahun terlama
        for (let i = 0; i < 6; i++) {
            years.push(currentYear - i)
        }
        setAvailableYears(years)
    }, [])

    // Check dark mode
    useEffect(() => {
        const checkDarkMode = () => {
            if (typeof window !== 'undefined') {
                const isDarkMode = document.documentElement.classList.contains('dark') || 
                                  window.matchMedia('(prefers-color-scheme: dark)').matches;
                setIsDark(isDarkMode);
            }
        };
        
        checkDarkMode();
        
        const observer = new MutationObserver(checkDarkMode);
        if (typeof document !== 'undefined') {
            observer.observe(document.documentElement, {
                attributes: true,
                attributeFilter: ['class'],
            });
        }
        
        return () => observer.disconnect();
    }, []);

    const getChartData = async (year = null) => {
        try {
            setLoading(true)
            let response
            
            if (year) {
                // Fetch data per bulan dalam tahun tertentu
                response = await api.get(`/sp/inventaris-chart?year=${year}`)
            } else {
                // Fetch data per tahun
                response = await api.get('/sp/inventaris-chart')
            }
            
            // Sesuai dengan struktur backend: { status: 'success', data: { series: [...], categories: [...] } }
            if (response.data && response.data.status === 'success' && response.data.data) {
                const { series, categories } = response.data.data
                
                // Pastikan series dan categories ada dan valid
                // Backend mengembalikan: series: [{ name: 'Inventaris', data: [...] }]
                let chartSeries = [{ name: 'Inventaris', data: [] }]
                
                if (Array.isArray(series) && series.length > 0) {
                    // Pastikan data di dalam series adalah array angka
                    const firstSeries = series[0]
                    if (firstSeries && Array.isArray(firstSeries.data)) {
                        chartSeries = series.map(s => ({
                            name: s.name || 'Inventaris',
                            data: Array.isArray(s.data) ? s.data.map(val => Number(val) || 0) : []
                        }))
                    }
                }
                
                const chartCategories = Array.isArray(categories) && categories.length > 0
                    ? categories.map(cat => String(cat)) // Pastikan semua kategori adalah string
                    : []
                
                setChartData(prev => ({
                    series: chartSeries,
                    options: {
                        ...prev.options,
                        xaxis: {
                            ...prev.options.xaxis,
                            categories: chartCategories,
                            labels: {
                                ...prev.options.xaxis.labels,
                                colors: isDark ? '#9ca3af' : '#6b7280',
                            },
                        },
                        theme: {
                            mode: isDark ? 'dark' : 'light',
                        },
                        grid: {
                            ...prev.options.grid,
                            borderColor: isDark ? '#374151' : '#f1f5f9',
                        },
                    }
                }))
            } else {
                console.error('Invalid response structure:', response.data)
                // Set data kosong jika response tidak valid
                setChartData(prev => ({
                    ...prev,
                    series: [{ name: 'Inventaris', data: [] }],
                    options: {
                        ...prev.options,
                        xaxis: {
                            ...prev.options.xaxis,
                            categories: [],
                        },
                    }
                }))
            }
        } catch (error) {
            console.error('Error fetching chart data:', error)
            // Set data kosong jika error
            setChartData(prev => ({
                ...prev,
                series: [{ name: 'Inventaris', data: [] }],
                options: {
                    ...prev.options,
                    xaxis: {
                        ...prev.options.xaxis,
                        categories: [],
                    },
                }
            }))
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        getChartData(selectedYear)
    }, [selectedYear, isDark])

    const handleYearChange = (e) => {
        const year = e.target.value === 'all' ? null : parseInt(e.target.value)
        setSelectedYear(year)
    }

    return (
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-4 sm:p-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-4 sm:mb-6">
                <div className="flex-1">
                    <h3 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-white mb-1">
                        Tren Data Inventaris
                    </h3>
                    <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">
                        {selectedYear ? `Data per bulan tahun ${selectedYear}` : 'Data per tahun'}
                    </p>
                </div>
                <div className="flex-shrink-0">
                    <select 
                        value={selectedYear || 'all'}
                        onChange={handleYearChange}
                        className="w-full sm:w-auto text-xs sm:text-sm bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg px-3 py-2 text-gray-700 dark:text-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400 focus:border-transparent transition-all"
                    >
                        <option value="all">Semua Tahun</option>
                        {availableYears.map(year => (
                            <option key={year} value={year}>{year}</option>
                        ))}
                    </select>
                </div>
            </div>
            <div className="h-[300px] sm:h-[350px]">
                {loading ? (
                    <div className="h-full flex items-center justify-center">
                        <div className="text-gray-500 dark:text-gray-400">Memuat data...</div>
                    </div>
                ) : chartData.series[0]?.data?.length === 0 || !chartData.options.xaxis.categories.length ? (
                    <div className="h-full flex items-center justify-center">
                        <div className="text-center">
                            <p className="text-gray-500 dark:text-gray-400">Tidak ada data untuk ditampilkan</p>
                            <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
                                {selectedYear ? `Tahun ${selectedYear}` : 'Periode ini'}
                            </p>
                        </div>
                    </div>
                ) : (
                    <Chart
                        options={chartData.options}
                        series={chartData.series}
                        type="area"
                        height="100%"
                        width="100%"
                    />
                )}
            </div>
        </div>
    )
}