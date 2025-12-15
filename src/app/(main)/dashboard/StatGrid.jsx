"use client";
import { useState, useEffect } from "react";
import {
  Box,
  MonitorSmartphone,
  FileText,
  TrendingUp,
  CheckCircle2,
  Building2,
  Wrench,
} from "lucide-react";
import api from "@/app/utils/Api";
import dayjs from "dayjs";

export default function StatGrid() {
  const [perbaikanGedung, setPerbaikanGedung] = useState(0);
  const [perbaikanAset, setPerbaikanAset] = useState(0);
  const [selesaiGedung, setSelesaiGedung] = useState(0);
  const [selesaiAset, setSelesaiAset] = useState(0);
  const [selesaiBulanIni, setSelesaiBulanIni] = useState(0);
  const [monitoringBulanIni, setMonitoringBulanIni] = useState(0);
  const [totalAset, setTotalAset] = useState(0);
  const [loading, setLoading] = useState(true);

  const getDashboardData = async () => {
    try {
      setLoading(true);
      const response = await api.get("/sp/stat-grid");

      const data = response.data?.data || response.data || {};

      // Total Aset - totalInventaris adalah number langsung
      const totalInventarisData = Number(data?.totalInventaris) || 0;
      setTotalAset(totalInventarisData);

      // Monitoring Bulan Ini - monitoring adalah number langsung
      const monitoringData = Number(data?.monitoring) || 0;
      setMonitoringBulanIni(monitoringData);

      // Bulan dan tahun berjalan untuk filter
      const currentDate = new Date();
      const currentYear = currentDate.getFullYear();
      const currentMonth = currentDate.getMonth() + 1; // 1-12

      // Helper function untuk check apakah tanggal di bulan berjalan
      const isCurrentMonth = (dateString) => {
        if (!dateString) return false;
        const date = dayjs(dateString);
        return (
          date.isValid() &&
          date.year() === currentYear &&
          date.month() + 1 === currentMonth
        );
      };

      // Perbaikan Gedung - backend sudah memfilter tahun berjalan berdasarkan tgl_masuk
      // Frontend memfilter berdasarkan status
      const gedungArray = Array.isArray(data?.perbaikanGedung)
        ? data.perbaikanGedung
        : [];
      const gedungPending = gedungArray.filter(
        (item) => item.status !== "selesai"
      ).length;
      const gedungSelesai = gedungArray.filter(
        (item) => item.status === "selesai"
      ).length;
      const gedungSelesaiBulanIni = gedungArray.filter(
        (item) => item.status === "selesai" && isCurrentMonth(item.tgl_selesai)
      ).length;

      // Perawatan Aset - backend sudah memfilter tahun berjalan berdasarkan tgl_masuk
      // Frontend memfilter berdasarkan status
      const asetArray = Array.isArray(data?.perawatanAset)
        ? data.perawatanAset
        : [];
      const asetPending = asetArray.filter(
        (item) => item.status !== "selesai"
      ).length;
      const asetSelesai = asetArray.filter(
        (item) => item.status === "selesai"
      ).length;
      const asetSelesaiBulanIni = asetArray.filter(
        (item) => item.status === "selesai" && isCurrentMonth(item.tgl_selesai)
      ).length;

      setPerbaikanGedung(gedungPending);
      setPerbaikanAset(asetPending);
      setSelesaiGedung(gedungSelesai);
      setSelesaiAset(asetSelesai);
      setSelesaiBulanIni(gedungSelesaiBulanIni + asetSelesaiBulanIni);
    } catch (error) {
      console.error("Error fetching dashboard data:", error);
      setPerbaikanGedung(0);
      setPerbaikanAset(0);
      setSelesaiGedung(0);
      setSelesaiAset(0);
      setSelesaiBulanIni(0);
      setMonitoringBulanIni(0);
      setTotalAset(0);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    getDashboardData();
  }, []);

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {/* Card Total Aset */}
      <div className="group bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm border border-gray-200 dark:border-gray-700 hover:shadow-md transition-all duration-300">
        <div className="flex items-center justify-between mb-3">
          <div className="p-1 rounded-lg bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 group-hover:scale-110 transition-transform">
            <svg
              viewBox="0 0 48 48"
              className="w-[30px] h-[30px] text-blue-600 dark:text-blue-400"
              fill="none"
              stroke="currentColor"
              strokeWidth="3"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M5.5,11.5l3.4-1.7c1.9-0.9,4.2-0.1,5,1.9l8.8,20.9c1.4,3.3,5.2,4.8,8.5,3.4l11.7-5.1" />
              <circle cx="22.9" cy="39.1" r="3.4" />
              <path d="M39.2,23l0.6,1.3c0.4,0.8,0,1.8-0.9,2.2l-9,3.9c-0.8,0.4-1.8,0-2.2-0.9l-5-11.5" />
              <path d="M20.7,13.3l-1-2.2c-0.4-0.8,0-1.8,0.9-2.2l9-3.9c0.8-0.4,1.8,0,2.2,0.9l5.4,12.4" />
              <line x1="24.8" y1="20.2" x2="30.5" y2="17.6" />
            </svg>
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
            {loading ? "..." : totalAset.toLocaleString("id-ID")}
          </h4>
          <div className="flex items-center justify-between mb-1">
            <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
              Total Aset
            </p>
            <span className="text-xs text-gray-500 dark:text-gray-500">
              Unit aset terdata
            </span>
          </div>
        </div>
      </div>

      {/* Card Monitoring Bulan Ini */}
      <div className="group bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm border border-gray-200 dark:border-gray-700 hover:shadow-md transition-all duration-300">
        <div className="flex items-center justify-between mb-3">
          <div className="p-2 rounded-lg bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400 group-hover:scale-110 transition-transform">
            <svg
              viewBox="0 0 50 50"
              className="w-5 h-5 text-emerald-600 dark:text-emerald-400"
              fill="currentColor"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path d="M 45 2 C 43.894531 2 43 2.894531 43 4 C 43 4.292969 43.074219 4.5625 43.1875 4.8125 L 35.1875 16 C 35.125 15.996094 35.0625 16 35 16 C 34.601563 16 34.21875 16.109375 33.90625 16.3125 L 27 12.875 C 26.933594 11.828125 26.0625 11 25 11 C 23.894531 11 23 11.894531 23 13 C 23 13.105469 23.015625 13.210938 23.03125 13.3125 L 15.71875 19.125 C 15.496094 19.039063 15.253906 19 15 19 C 14 19 13.179688 19.730469 13.03125 20.6875 L 6.21875 23.4375 C 5.878906 23.171875 5.460938 23 5 23 C 3.894531 23 3 23.894531 3 25 C 3 26.105469 3.894531 27 5 27 C 6.007813 27 6.832031 26.253906 6.96875 25.28125 L 13.78125 22.5625 C 14.121094 22.828125 14.539063 23 15 23 C 16.105469 23 17 22.105469 17 21 C 17 20.894531 16.984375 20.789063 16.96875 20.6875 L 24.28125 14.875 C 24.503906 14.960938 24.746094 15 25 15 C 25.398438 15 25.78125 14.890625 26.09375 14.6875 L 33 18.125 C 33.066406 19.171875 33.9375 20 35 20 C 36.105469 20 37 19.105469 37 18 C 37 17.707031 36.925781 17.4375 36.8125 17.1875 L 44.8125 6 C 44.875 6.003906 44.9375 6 45 6 C 46.105469 6 47 5.105469 47 4 C 47 2.894531 46.105469 2 45 2 Z M 41 15 L 41 50 L 49 50 L 49 15 Z M 43 17 L 47 17 L 47 48 L 43 48 Z M 21 24 L 21 50 L 29 50 L 29 24 Z M 23 26 L 27 26 L 27 48 L 23 48 Z M 31 29 L 31 50 L 39 50 L 39 29 Z M 33 31 L 37 31 L 37 48 L 33 48 Z M 11 32 L 11 50 L 19 50 L 19 32 Z M 13 34 L 17 34 L 17 48 L 13 48 Z M 1 36 L 1 50 L 9 50 L 9 36 Z M 3 38 L 7 38 L 7 48 L 3 48 Z" />
            </svg>
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
            {loading ? "..." : monitoringBulanIni.toLocaleString("id-ID")}
          </h4>
          <div className="flex items-center justify-between mb-1">
            <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
              Monitoring Bulan Ini
            </p>
            <span className="text-xs text-gray-500 dark:text-gray-500">
              Pengecekan rutin
            </span>
          </div>
        </div>
      </div>

      {/* Card Laporan Perbaikan */}
      <div className="group bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm border border-gray-200 dark:border-gray-700 hover:shadow-md transition-all duration-300">
        <div className="flex items-center justify-between mb-3">
          <div className="p-2 rounded-lg bg-orange-50 dark:bg-orange-900/20 text-orange-600 dark:text-orange-400 group-hover:scale-110 transition-transform">
            <svg
              viewBox="0 0 50 50"
              className="w-5 h-5 text-orange-600 dark:text-orange-400"
              fill="currentColor"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path d="M 49.601563 8.898438 C 49.5 8.601563 49.199219 8.300781 48.898438 8.300781 C 48.601563 8.199219 48.199219 8.300781 48 8.601563 L 42.699219 13.898438 C 42.398438 14.199219 41.800781 14.199219 41.5 13.898438 L 36.199219 8.601563 C 35.898438 8.300781 35.898438 7.699219 36.199219 7.398438 L 41.5 2 C 41.699219 1.800781 41.800781 1.398438 41.800781 1.101563 C 41.699219 0.800781 41.5 0.5 41.199219 0.398438 C 37.199219 -1 30.800781 1.898438 28.199219 4.5 C 25.601563 7.101563 25.300781 10.699219 27.398438 14.601563 L 27.199219 14.800781 L 25 12.5 C 23.101563 10.398438 20.5 9.199219 17.601563 9.101563 C 14.699219 9 12.101563 10.101563 10.101563 12.101563 L 3.101563 19.101563 C -0.898438 23.101563 -0.898438 29.601563 3.101563 33.601563 L 5 35.5 L 2 38.300781 C 1.199219 39.101563 0.300781 40.5 0 42.300781 C -0.101563 43.800781 0 45.898438 2 48 C 3.601563 49.601563 5.300781 50 6.699219 50 C 7 50 7.398438 50 7.699219 49.898438 C 9.5 49.601563 10.898438 48.699219 11.699219 47.898438 L 15.101563 44.398438 C 15.300781 44.398438 15.5 44.5 15.800781 44.5 C 17.398438 44.5 18.898438 43.699219 19.699219 42.398438 C 20.199219 42.601563 20.800781 42.699219 21.300781 42.699219 C 23.601563 42.699219 25.5 41.101563 25.898438 38.898438 C 26.199219 39 26.5 39 26.800781 39 C 29.101563 39 31 37.398438 31.398438 35.199219 C 31.699219 35.300781 32 35.300781 32.300781 35.300781 C 34.898438 35.300781 37 33.199219 37 30.601563 C 37 29.199219 36.300781 27.800781 35.199219 26.898438 L 33.199219 24.898438 L 35.398438 22.699219 C 39.300781 24.800781 42.800781 24.5 45.5 21.898438 C 48.101563 19.199219 51 12.800781 49.601563 8.898438 Z M 10.300781 46.5 C 9.800781 47 8.699219 47.699219 7.398438 47.898438 C 5.898438 48.101563 4.601563 47.601563 3.5 46.5 C 2.300781 45.300781 1.898438 44 2.101563 42.601563 C 2.300781 41.300781 3 40.300781 3.5 39.699219 L 6.398438 36.898438 L 12.199219 42.699219 C 12.5 43 12.800781 43.300781 13.199219 43.601563 Z M 34 28.398438 C 34.699219 28.898438 35.101563 29.699219 35.101563 30.5 C 35.101563 32 33.898438 33.199219 32.398438 33.199219 C 31.898438 33.199219 31.5 33.101563 31 32.800781 L 29.199219 31.699219 L 29.5 33.800781 C 29.5 33.898438 29.5 34 29.5 34.199219 C 29.5 35.699219 28.300781 36.898438 26.800781 36.898438 C 26.300781 36.898438 25.898438 36.800781 25.398438 36.5 L 23.601563 35.398438 L 23.898438 37.5 C 23.898438 37.601563 23.898438 37.699219 23.898438 37.898438 C 23.898438 39.398438 22.699219 40.601563 21.199219 40.601563 C 20.699219 40.601563 20.101563 40.398438 19.699219 40.101563 L 18.601563 39.398438 L 18.199219 40.601563 C 17.800781 41.699219 16.800781 42.398438 15.699219 42.398438 C 14.898438 42.398438 14.101563 42 13.601563 41.398438 L 4.398438 32.199219 C 1.199219 29 1.199219 23.699219 4.398438 20.5 L 11.398438 13.5 C 13 11.898438 15.199219 11 17.5 11.101563 C 19.800781 11.199219 21.898438 12.101563 23.5 13.898438 L 25.800781 16.300781 L 25.199219 16.898438 L 25 16.601563 C 24.601563 16.199219 24 16.199219 23.601563 16.601563 C 23.199219 17 23.199219 17.601563 23.601563 18 L 33.898438 28.300781 Z M 44 20.398438 C 41.300781 23.101563 38 22 35.699219 20.5 C 35.300781 20.300781 34.800781 20.300781 34.5 20.699219 L 31.800781 23.398438 L 26.601563 18.199219 L 29.300781 15.5 C 29.601563 15.199219 29.699219 14.699219 29.5 14.300781 C 28.101563 11.898438 27 8.601563 29.601563 6 C 31.5 4.101563 35.601563 2.101563 38.699219 2 L 34.800781 5.898438 C 33.699219 7 33.699219 8.800781 34.800781 10 L 40.101563 15.300781 C 41.199219 16.398438 43 16.398438 44.199219 15.300781 L 48.101563 11.398438 C 48 14.398438 45.898438 18.5 44 20.398438 Z" />
            </svg>
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
            <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
              Laporan Perbaikan
            </p>
            <span className="text-xs text-gray-500 dark:text-gray-500">
              Butuh tindak lanjut
            </span>
          </div>
          <div className="mt-2 pt-2 border-t border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-1.5 flex-1">
                <Building2 className="w-3.5 h-3.5 text-gray-500 dark:text-gray-400 flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                    Gedung
                  </p>
                  <p className="text-xs font-semibold text-gray-900 dark:text-white">
                    {perbaikanGedung}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-1.5 flex-1">
                <Wrench className="w-3.5 h-3.5 text-gray-500 dark:text-gray-400 flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                    Aset
                  </p>
                  <p className="text-xs font-semibold text-gray-900 dark:text-white">
                    {perbaikanAset}
                  </p>
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
            <svg
              viewBox="0 0 50 50"
              className="w-5 h-5 text-purple-600 dark:text-purple-400"
              fill="currentColor"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path d="M 23.597656 2 C 23.113281 1.996094 22.695313 2.34375 22.609375 2.820313 L 22.0625 5.8125 C 21.59375 5.964844 21.140625 6.148438 20.695313 6.367188 L 18.238281 4.59375 C 17.84375 4.308594 17.296875 4.347656 16.953125 4.695313 L 14.816406 6.796875 C 14.472656 7.140625 14.421875 7.679688 14.699219 8.078125 L 16.425781 10.578125 C 16.199219 11.019531 16.007813 11.472656 15.855469 11.9375 L 12.859375 12.421875 C 12.378906 12.496094 12.023438 12.910156 12.019531 13.402344 L 12 16.402344 C 11.996094 16.886719 12.34375 17.304688 12.820313 17.390625 L 15.824219 17.9375 C 15.972656 18.402344 16.160156 18.851563 16.378906 19.292969 L 14.59375 21.761719 C 14.308594 22.15625 14.347656 22.703125 14.691406 23.050781 L 16.800781 25.183594 C 17.140625 25.527344 17.679688 25.578125 18.078125 25.300781 L 20.609375 23.558594 C 21.046875 23.78125 21.496094 23.964844 21.957031 24.117188 L 22.472656 27.148438 C 22.554688 27.628906 22.964844 27.980469 23.453125 27.984375 L 26.449219 28 C 26.941406 28.003906 27.359375 27.648438 27.441406 27.167969 L 27.953125 24.140625 C 28.410156 23.992188 28.855469 23.8125 29.289063 23.59375 L 31.800781 25.378906 C 32.199219 25.660156 32.738281 25.613281 33.082031 25.273438 L 35.21875 23.167969 C 35.566406 22.824219 35.613281 22.277344 35.328125 21.875 L 33.546875 19.375 C 33.769531 18.941406 33.957031 18.5 34.109375 18.046875 L 37.152344 17.53125 C 37.628906 17.449219 37.980469 17.035156 37.984375 16.546875 L 38 13.550781 C 38.003906 13.0625 37.652344 12.644531 37.167969 12.5625 L 34.152344 12.050781 C 34.003906 11.589844 33.820313 11.140625 33.605469 10.699219 L 35.378906 8.195313 C 35.664063 7.800781 35.621094 7.261719 35.277344 6.914063 L 33.167969 4.78125 C 32.824219 4.4375 32.277344 4.386719 31.878906 4.671875 L 29.402344 6.429688 C 28.964844 6.207031 28.519531 6.019531 28.0625 5.867188 L 27.578125 2.859375 C 27.5 2.375 27.085938 2.019531 26.59375 2.015625 Z M 24.425781 4.003906 L 25.738281 4.011719 L 26.171875 6.714844 C 26.234375 7.109375 26.527344 7.425781 26.910156 7.523438 C 27.644531 7.710938 28.351563 8.011719 29.015625 8.414063 C 29.355469 8.625 29.789063 8.609375 30.113281 8.378906 L 32.34375 6.796875 L 33.265625 7.726563 L 31.660156 9.976563 C 31.433594 10.300781 31.414063 10.726563 31.617188 11.066406 C 32.011719 11.734375 32.300781 12.445313 32.472656 13.175781 C 32.566406 13.566406 32.882813 13.863281 33.28125 13.933594 L 35.996094 14.390625 L 35.988281 15.699219 L 33.246094 16.160156 C 32.855469 16.226563 32.539063 16.519531 32.441406 16.902344 C 32.257813 17.628906 31.964844 18.332031 31.5625 18.988281 C 31.355469 19.332031 31.371094 19.765625 31.605469 20.089844 L 33.203125 22.34375 L 32.277344 23.261719 L 30.007813 21.652344 C 29.683594 21.421875 29.257813 21.40625 28.917969 21.609375 C 28.253906 22.003906 27.550781 22.285156 26.820313 22.464844 C 26.429688 22.558594 26.136719 22.875 26.070313 23.269531 L 25.609375 25.996094 L 24.304688 25.984375 L 23.84375 23.25 C 23.777344 22.859375 23.484375 22.542969 23.09375 22.449219 C 22.371094 22.269531 21.660156 21.972656 20.996094 21.574219 C 20.660156 21.371094 20.234375 21.382813 19.910156 21.609375 L 17.632813 23.179688 L 16.710938 22.246094 L 18.316406 20.027344 C 18.550781 19.703125 18.570313 19.269531 18.363281 18.925781 C 17.96875 18.257813 17.679688 17.546875 17.5 16.8125 C 17.40625 16.429688 17.097656 16.136719 16.707031 16.0625 L 14.003906 15.574219 L 14.015625 14.261719 L 16.707031 13.828125 C 17.101563 13.765625 17.421875 13.472656 17.519531 13.085938 C 17.707031 12.347656 18 11.636719 18.40625 10.972656 C 18.613281 10.636719 18.601563 10.207031 18.375 9.882813 L 16.824219 7.632813 L 17.753906 6.710938 L 19.964844 8.304688 C 20.285156 8.539063 20.714844 8.558594 21.058594 8.359375 C 21.730469 7.957031 22.445313 7.671875 23.183594 7.492188 C 23.570313 7.402344 23.863281 7.089844 23.933594 6.703125 Z M 24.988281 10.035156 C 23.703125 10.027344 22.414063 10.507813 21.433594 11.480469 C 19.472656 13.417969 19.457031 16.609375 21.394531 18.574219 C 23.332031 20.535156 26.527344 20.550781 28.488281 18.613281 C 30.449219 16.675781 30.464844 13.480469 28.527344 11.519531 C 27.558594 10.539063 26.273438 10.042969 24.988281 10.035156 Z M 24.980469 12.023438 C 25.75 12.027344 26.515625 12.328125 27.105469 12.925781 C 28.285156 14.117188 28.273438 16.011719 27.082031 17.1875 C 25.890625 18.367188 23.996094 18.359375 22.816406 17.167969 C 21.636719 15.972656 21.648438 14.078125 22.839844 12.902344 C 23.4375 12.3125 24.207031 12.019531 24.980469 12.023438 Z M 14.421875 28 C 11.8125 28 10.609375 28.625 9.3125 29.125 C 9.3125 29.128906 9.3125 29.128906 9.3125 29.128906 C 6.824219 30.097656 2.566406 32.105469 2.566406 32.105469 C 2.066406 32.339844 1.851563 32.9375 2.085938 33.4375 C 2.324219 33.9375 2.921875 34.152344 3.421875 33.917969 C 3.421875 33.917969 7.707031 31.898438 10.035156 30.992188 C 11.472656 30.433594 12.097656 30 14.421875 30 C 19.550781 30 19.34375 32.226563 21.507813 33.5 C 21.539063 33.519531 21.574219 33.539063 21.609375 33.550781 C 24.292969 34.753906 27.175781 35 29.5 35 C 30.527344 35 31.175781 35.238281 31.527344 35.503906 C 31.875 35.773438 32 36.050781 32 36.5 C 32 37.027344 31.867188 37.277344 31.519531 37.53125 C 31.175781 37.78125 30.511719 38 29.5 38 L 24.25 38 C 22.046875 38 18.253906 37.03125 18.253906 37.03125 C 17.910156 36.9375 17.539063 37.039063 17.285156 37.292969 C 17.03125 37.546875 16.933594 37.917969 17.027344 38.261719 C 17.125 38.609375 17.398438 38.878906 17.746094 38.96875 C 17.746094 38.96875 21.507813 40 24.25 40 L 29.5 40 C 30.519531 40 31.40625 39.832031 32.148438 39.464844 C 32.246094 39.4375 32.339844 39.394531 32.421875 39.335938 L 41.90625 33.113281 C 43.332031 32.289063 44.304688 32.058594 44.875 32.066406 C 45.445313 32.078125 45.640625 32.25 45.8125 32.46875 C 46.066406 32.796875 46.082031 32.921875 45.917969 33.300781 C 45.75 33.683594 45.261719 34.273438 44.382813 34.882813 C 44.382813 34.882813 44.382813 34.882813 44.378906 34.882813 C 43.292969 35.640625 31.148438 43.554688 29.746094 44.351563 C 28.6875 44.953125 27.847656 45.585938 26.890625 45.855469 C 25.933594 46.121094 24.804688 46.121094 22.9375 45.230469 C 21.691406 44.632813 16.386719 41.914063 14.667969 41.042969 C 13.710938 40.558594 12.894531 40.285156 12.0625 40.332031 C 11.226563 40.378906 10.519531 40.734375 9.789063 41.195313 C 9.785156 41.195313 9.78125 41.199219 9.78125 41.203125 L 7.304688 42.785156 C 6.992188 42.972656 6.808594 43.316406 6.820313 43.679688 C 6.832031 44.042969 7.042969 44.371094 7.367188 44.535156 C 7.695313 44.699219 8.082031 44.675781 8.382813 44.46875 L 10.847656 42.890625 C 11.484375 42.492188 11.84375 42.347656 12.171875 42.328125 C 12.5 42.308594 12.949219 42.414063 13.765625 42.828125 C 15.46875 43.691406 20.691406 46.371094 22.078125 47.03125 C 24.253906 48.074219 26.015625 48.171875 27.425781 47.78125 C 28.835938 47.386719 29.839844 46.597656 30.734375 46.089844 C 32.664063 44.992188 44.128906 37.492188 45.523438 36.523438 C 46.582031 35.785156 47.359375 35.015625 47.753906 34.09375 C 48.148438 33.171875 48.019531 32.046875 47.390625 31.242188 C 47.390625 31.242188 47.390625 31.242188 47.390625 31.238281 C 46.894531 30.605469 46.015625 30.089844 44.910156 30.066406 C 44.28125 30.054688 43.582031 30.199219 42.804688 30.484375 C 42.660156 30.292969 42.441406 30.042969 42.140625 29.824219 C 41.558594 29.390625 40.632813 29 39.375 29 C 38.730469 29 38.203125 29.148438 37.78125 29.324219 C 37.179688 28.75 36.113281 28.019531 34.5625 28.019531 C 33.304688 28.019531 32.125 28.441406 31.304688 28.925781 C 31.152344 29.015625 30.785156 29.246094 30.160156 29.636719 C 29.535156 30.027344 28.71875 30.53125 27.914063 31.035156 C 26.628906 31.835938 25.832031 32.335938 25.371094 32.625 C 24.390625 32.429688 23.410156 32.152344 22.484375 31.746094 C 21.695313 31.238281 20.175781 28 14.421875 28 Z M 34.5625 30.019531 C 35.195313 30.019531 35.648438 30.179688 35.96875 30.367188 L 31.34375 33.234375 C 30.792969 33.078125 30.175781 33 29.5 33 C 29.210938 33 28.894531 32.980469 28.59375 32.96875 C 28.78125 32.851563 28.78125 32.851563 28.972656 32.734375 C 29.777344 32.230469 30.589844 31.722656 31.21875 31.332031 C 31.84375 30.945313 32.355469 30.628906 32.320313 30.648438 C 32.792969 30.367188 33.820313 30.019531 34.5625 30.019531 Z M 39.375 31 C 40.1875 31 40.625 31.207031 40.890625 31.390625 C 40.875 31.398438 40.863281 31.40625 40.847656 31.417969 L 33.9375 35.949219 C 33.84375 35.390625 33.613281 34.855469 33.246094 34.410156 L 38.078125 31.414063 L 38.082031 31.40625 C 38.121094 31.386719 38.957031 31 39.375 31 Z" />
            </svg>
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
            <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
              Perbaikan Selesai
            </p>
            <span className="text-xs text-gray-500 dark:text-gray-500">
              Bulan ini : {loading ? "..." : selesaiBulanIni}
            </span>
          </div>
          <div className="mt-2 pt-2 border-t border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-1.5 flex-1">
                <Building2 className="w-3.5 h-3.5 text-gray-500 dark:text-gray-400 flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                    Gedung
                  </p>
                  <p className="text-xs font-semibold text-gray-900 dark:text-white">
                    {selesaiGedung}
                  </p>
                        </div>
                    </div>
              <div className="flex items-center gap-1.5 flex-1">
                <Wrench className="w-3.5 h-3.5 text-gray-500 dark:text-gray-400 flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                    Aset
                  </p>
                  <p className="text-xs font-semibold text-gray-900 dark:text-white">
                    {selesaiAset}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
