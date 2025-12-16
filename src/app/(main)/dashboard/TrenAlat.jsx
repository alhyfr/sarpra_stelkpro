'use client'

import { useState, useEffect } from 'react'
import dynamic from "next/dynamic";
const Chart = dynamic(() => import("react-apexcharts"), { ssr: false });
import Api from "@/app/utils/Api";


export default function TrenAlat() {
    const [filter, setFilter] = useState('tahun'); // 'tahun' | 'bulan'
    const [chartData, setChartData] = useState({
        series: [],
        categories: []
    });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            try {
                const response = await Api.get(`/sp/tren-pinbar?filter=${filter}`);
                if (response.data && response.data.status === 'success' && response.data.data) {
                    setChartData(response.data.data);
                } else {
                    console.error('Invalid data format:', response.data);
                }
            } catch (error) {
                console.error('Error fetching data:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [filter]);

    const chartOptions = {
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
            categories: chartData.categories,
        },
        colors: ['#8b5cf6'],
        grid: {
            show: true,
            borderColor: '#f1f5f9',
            strokeDashArray: 4,
        },
        responsive: [
            {
                breakpoint: 640,
                options: {
                    plotOptions: {
                        bar: {
                            barHeight: '80%'
                        }
                    },
                    xaxis: {
                        labels: {
                            style: {
                                fontSize: '10px'
                            }
                        }
                    }
                }
            }
        ]
    };

    return (
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-4">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Alat Paling Sering Dipinjam</h3>
                <div className="flex bg-gray-100 dark:bg-gray-700 rounded-lg p-1 self-start sm:self-auto">
                    <button
                        onClick={() => setFilter('bulan')}
                        className={`px-3 py-1 text-sm font-medium rounded-md transition-all ${filter === 'bulan'
                            ? 'bg-white dark:bg-gray-600 text-gray-900 dark:text-white shadow-sm'
                            : 'text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
                            }`}
                    >
                        Bulan
                    </button>
                    <button
                        onClick={() => setFilter('tahun')}
                        className={`px-3 py-1 text-sm font-medium rounded-md transition-all ${filter === 'tahun'
                            ? 'bg-white dark:bg-gray-600 text-gray-900 dark:text-white shadow-sm'
                            : 'text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
                            }`}
                    >
                        Tahun
                    </button>
                </div>
            </div>
            <div className="h-[300px]">
                <Chart
                    options={chartOptions}
                    series={chartData.series}
                    type="bar"
                    height="100%"
                    width="100%"
                />
            </div>
        </div>
    )
}