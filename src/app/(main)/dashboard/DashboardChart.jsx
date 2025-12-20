"use client";
import { useState, useEffect } from "react";
import dynamic from "next/dynamic";
import Api from "@/app/utils/Api";
const Chart = dynamic(() => import("react-apexcharts"), { ssr: false });

export default function DashboardChart() {
  const [chartData, setChartData] = useState({
        series: [],
        options: {
            chart: {
        type: "bar",
                height: 350,
                toolbar: { show: false },
        fontFamily: "inherit",
            },
            plotOptions: {
                bar: {
                    horizontal: false,
          columnWidth: "55%",
                    borderRadius: 4,
                },
            },
            dataLabels: { enabled: false },
            stroke: {
                show: true,
                width: 2,
        colors: ["transparent"],
            },
            xaxis: {
        categories: [
          "Feb",
          "Mar",
          "Apr",
          "May",
          "Jun",
          "Jul",
          "Aug",
          "Sep",
          "Oct",
        ],
                axisBorder: { show: false },
        axisTicks: { show: false },
            },
            yaxis: {
        show: false,
            },
            fill: { opacity: 1 },
      colors: ["#3b82f6", "#10b981", "#f59e0b"],
            grid: {
                show: true,
        borderColor: "#f1f5f9",
                strokeDashArray: 4,
                padding: {
                    top: 0,
                    right: 0,
                    bottom: 0,
          left: 10,
        },
        xaxis: {
          lines: {
            show: false,
          },
        },
        yaxis: {
          lines: {
            show: true,
          },
        },
            },
            tooltip: {
                y: {
                    formatter: function (val) {
            return val + " data";
          },
        },
      },
      legend: {
        position: "top",
        horizontalAlign: "right",
      },
    },
  });
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('tahun_ini');
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

  const getChartData = async (filterType = 'tahun_ini') => {
    try {
      setLoading(true);
      const response = await Api.get(`/sp/dashboard-chart?filter=${filterType}`);
      
      // Backend mengembalikan: { status: 'success', data: { series: [...], categories: [...] } }
      if (response.data && response.data.status === 'success' && response.data.data) {
        const { series, categories } = response.data.data;
        
        setChartData(prev => ({
          series: series || [],
          options: {
            ...prev.options,
            xaxis: {
              ...prev.options.xaxis,
              categories: categories || []
            }
          }
        }));
      } else {
        console.error('Invalid response structure:', response.data);
      }
    } catch (error) {
      console.error('Error fetching chart data:', error);
      // Tetap gunakan data default jika error
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (e) => {
    const newFilter = e.target.value === 'Bulan Ini' ? 'bulan_ini' : 'tahun_ini';
    setFilter(newFilter);
    getChartData(newFilter);
  };

  useEffect(() => {
    getChartData(filter);
  }, []);

  if (loading) {
    return (
      <div className="min-h-[300px] sm:min-h-[350px] w-full flex items-center justify-center p-4">
        <div className="text-gray-500 dark:text-gray-400">Memuat data...</div>
      </div>
    );
  }

  if (!chartData || !chartData.options || !chartData.series) {
    return (
      <div className="min-h-[300px] sm:min-h-[350px] w-full flex items-center justify-center p-4">
        <div className="text-gray-500 dark:text-gray-400">Data tidak tersedia</div>
      </div>
    );
  }

  return (
    <div className="w-full p-4 sm:p-6 bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-4 sm:mb-6">
        <div className="flex-1">
          <h3 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-white mb-1">
            Aktivitas Bulanan
          </h3>
          <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">
            Ringkasan aktivitas sistem bulan ini
          </p>
        </div>
        <div className="flex-shrink-0">
          <select 
            value={filter === 'tahun_ini' ? 'Tahun Ini' : 'Bulan Ini'}
            onChange={handleFilterChange}
            className="w-full sm:w-auto text-xs sm:text-sm bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg px-3 py-2 text-gray-700 dark:text-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-transparent transition-all"
          >
            <option>Tahun Ini</option>
            <option>Bulan Ini</option>
          </select>
        </div>
      </div>
      <div className="w-full overflow-x-auto">
        <div className="min-h-[250px] sm:min-h-[300px] md:min-h-[350px] w-full">
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
                horizontalAlign: 'right',
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
              grid: {
                ...chartData.options.grid,
                borderColor: isDark ? '#374151' : '#f1f5f9',
              },
              responsive: [
                {
                  breakpoint: 640,
                  options: {
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
    </div>
  );
}
