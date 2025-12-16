'use client'
import { useState, useEffect } from 'react'
import dynamic from 'next/dynamic'
import api from '@/app/utils/Api'
const Chart = dynamic(() => import('react-apexcharts'), { ssr: false })

export default function StatAtk() {
    const [chartData, setChartData] = useState({
        series: [{
            name: 'Stok Masuk',
            data: []
        }, {
            name: 'Stok Keluar',
            data: []
        }],
        options: {
            chart: {
                type: 'bar',
                height: 550,
                toolbar: { show: false },
                fontFamily: 'inherit'
            },
            plotOptions: {
                bar: {
                    horizontal: true,
                    dataLabels: {
                        position: 'top',
                    },
                    barHeight: '45%',
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
                categories: [],
            },
            fill: { opacity: 1 },
            colors: ['#10b981', '#ef4444'],
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
    });
    const [loading, setLoading] = useState(true);
    const [isDark, setIsDark] = useState(false);

    useEffect(() => {
        // Check for dark mode
        const checkDarkMode = () => {
            if (typeof window !== 'undefined') {
                const isDarkMode = document.documentElement.classList.contains('dark') || 
                                  window.matchMedia('(prefers-color-scheme: dark)').matches;
                setIsDark(isDarkMode);
            }
        };
        
        checkDarkMode();
        
        // Watch for theme changes
        const observer = new MutationObserver(checkDarkMode);
        if (typeof document !== 'undefined') {
            observer.observe(document.documentElement, {
                attributes: true,
                attributeFilter: ['class'],
            });
        }
        
        return () => observer.disconnect();
    }, []);

    const getChartData = async () => {
        try {
            setLoading(true);
            const response = await api.get("/sp/stat-atk");

            if (response.data && response.data.status === 'success' && response.data.data) {
                const { series, categories } = response.data.data;

                // Pastikan series dan categories ada dan valid
                const chartSeries = Array.isArray(series) && series.length > 0
                    ? series.map(s => ({
                        name: s.name || '',
                        data: Array.isArray(s.data) ? s.data.map(val => Number(val) || 0) : []
                    }))
                    : [{
                        name: 'Stok Masuk',
                        data: []
                    }, {
                        name: 'Stok Keluar',
                        data: []
                    }];

                const chartCategories = Array.isArray(categories) && categories.length > 0
                    ? categories.map(cat => String(cat))
                    : [];

                setChartData(prev => ({
                    series: chartSeries,
                    options: {
                        ...prev.options,
                        xaxis: {
                            ...prev.options.xaxis,
                            categories: chartCategories
                        }
                    }
                }));
            } else {
                console.error('Invalid response structure:', response.data);
            }
        } catch (error) {
            console.error("Error fetching ATK statistics:", error);
            setChartData(prev => ({
                ...prev,
                series: [{
                    name: 'Stok Masuk',
                    data: []
                }, {
                    name: 'Stok Keluar',
                    data: []
                }]
            }));
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        getChartData();
    }, []);

    return (
        <div className="w-full p-4 sm:p-6 bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
            <h3 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-white mb-4">Alat Tulis Kantor</h3>
            {loading ? (
                <div className="flex items-center justify-center min-h-[300px] sm:min-h-[400px] md:min-h-[450px]">
                    <div className="text-gray-500 dark:text-gray-400">Memuat data...</div>
                </div>
            ) : chartData.series[0].data.length === 0 && chartData.series[1].data.length === 0 ? (
                <div className="flex items-center justify-center min-h-[300px] sm:min-h-[400px] md:min-h-[450px]">
                    <div className="text-gray-500 dark:text-gray-400">Tidak ada data</div>
                </div>
            ) : (
                <div className="w-full overflow-x-auto">
                    <div className="min-h-[300px] sm:min-h-[400px] md:min-h-[450px] w-full" style={{ minWidth: '600px' }}>
                        <Chart
                            options={{
                                ...chartData.options,
                                chart: {
                                    ...chartData.options.chart,
                                    height: 'auto',
                                    toolbar: { show: false },
                                    fontFamily: 'inherit',
                                },
                                theme: {
                                    mode: isDark ? 'dark' : 'light',
                                },
                                legend: {
                                    ...chartData.options.legend,
                                    position: 'top',
                                    fontSize: '12px',
                                    itemMargin: {
                                        horizontal: 8,
                                        vertical: 4,
                                    },
                                    labels: {
                                        colors: isDark ? '#d1d5db' : '#374151',
                                    },
                                },
                                xaxis: {
                                    ...chartData.options.xaxis,
                                    labels: {
                                        style: {
                                            fontSize: '11px',
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
                                    },
                                },
                                grid: {
                                    ...chartData.options.grid,
                                    borderColor: isDark ? '#374151' : '#f1f5f9',
                                },
                                responsive: [
                                    {
                                        breakpoint: 640,
                                        options: {
                                            plotOptions: {
                                                bar: {
                                                    ...chartData.options.plotOptions.bar,
                                                    barHeight: '60%',
                                                },
                                            },
                                            legend: {
                                                position: 'bottom',
                                                horizontalAlign: 'center',
                                            },
                                            xaxis: {
                                                labels: {
                                                    style: {
                                                        fontSize: '10px',
                                                    },
                                                },
                                            },
                                            yaxis: {
                                                labels: {
                                                    style: {
                                                        fontSize: '10px',
                                                    },
                                                },
                                            },
                                        },
                                    },
                                ],
                            }}
                            series={chartData.series}
                            type="bar"
                            height="100%"
                            width="100%"
                        />
                    </div>
                </div>
            )}
        </div>
    )
}