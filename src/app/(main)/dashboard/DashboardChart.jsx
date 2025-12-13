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
      <div className="h-[350px] w-full flex items-center justify-center">
        <div className="text-gray-500 dark:text-gray-400">Memuat data...</div>
      </div>
    );
  }

  if (!chartData || !chartData.options || !chartData.series) {
    return (
      <div className="h-[350px] w-full flex items-center justify-center">
        <div className="text-gray-500 dark:text-gray-400">Data tidak tersedia</div>
      </div>
    );
  }

  return (
    <div className="h-[350px] w-full">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            Aktivitas Bulanan
          </h3>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Ringkasan aktivitas sistem bulan ini
          </p>
        </div>
        <select 
          value={filter === 'tahun_ini' ? 'Tahun Ini' : 'Bulan Ini'}
          onChange={handleFilterChange}
          className="text-sm bg-gray-50 dark:bg-gray-700 border-gray-200 dark:border-gray-600 rounded-lg px-3 py-2 text-gray-600 dark:text-gray-300"
        >
          <option>Tahun Ini</option>
          <option>Bulan Ini</option>
        </select>
      </div>
      <Chart
        options={chartData.options}
        series={chartData.series}
        type="bar"
        height="100%"
        width="100%"
      />
    </div>
  );
}
