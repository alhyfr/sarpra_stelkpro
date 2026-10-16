"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  CalendarDays,
  CircleDot,
  Clock3,
  CheckCircle2,
  XCircle,
  Monitor,
  FlaskConical,
  Building2,
} from "lucide-react";
import api from "@/app/utils/Api";
import dayjs from "dayjs";

const unitMeta = {
  it: { label: "IT", icon: Monitor, color: "bg-sky-100 text-sky-700" },
  lab: { label: "Lab", icon: FlaskConical, color: "bg-violet-100 text-violet-700" },
  sarpra: { label: "Sarpra", icon: Building2, color: "bg-amber-100 text-amber-700" },
};

const statusMeta = {
  incoming: "bg-slate-100 text-slate-700",
  ongoing: "bg-blue-100 text-blue-700",
  selesai: "bg-emerald-100 text-emerald-700",
  cancel: "bg-rose-100 text-rose-700",
};

export default function CoeDashboard() {
  const router = useRouter();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    setLoading(true);
    try {
      const res = await api.get("/sp/coe/dashboard");
      if (res.data.status === "success") {
        setData(res.data.data);
      }
    } catch (error) {
      console.error("Error loading COE dashboard:", error);
      setData(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const summary = data?.summary || {};
  const upcoming = data?.upcoming || [];
  const byUnit = data?.by_unit || {};

  const cards = [
    {
      key: "ongoing",
      label: "Ongoing",
      value: summary.ongoing || 0,
      icon: CircleDot,
      color: "text-blue-600 bg-blue-50",
    },
    {
      key: "minggu_ini",
      label: "7 Hari Ke Depan",
      value: summary.minggu_ini || 0,
      icon: Clock3,
      color: "text-amber-600 bg-amber-50",
    },
    {
      key: "incoming",
      label: "Incoming",
      value: summary.incoming || 0,
      icon: CalendarDays,
      color: "text-slate-600 bg-slate-50",
    },
    {
      key: "selesai",
      label: "Selesai",
      value: summary.selesai || 0,
      icon: CheckCircle2,
      color: "text-emerald-600 bg-emerald-50",
    },
  ];

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-4 sm:p-6">
      <div className="mb-4 flex items-center justify-between gap-3">
        <div>
          <h3 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-white">
            Calendar of Events
          </h3>
          <p className="text-xs text-gray-500 dark:text-gray-400">
            Ringkasan kegiatan unit IT, Lab, dan Sarpra
          </p>
        </div>
        <button
          type="button"
          className="text-sm text-blue-600 hover:underline shrink-0"
          onClick={() => router.push("/coe/tahunan")}
        >
          Kelola COE
        </button>
      </div>

      {loading ? (
        <p className="text-sm text-gray-500">Memuat data COE...</p>
      ) : !data ? (
        <p className="text-sm text-gray-500">
          Data COE belum tersedia. Pastikan migrasi sudah dijalankan.
        </p>
      ) : (
        <>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-5">
            {cards.map((card) => {
              const Icon = card.icon;
              return (
                <div
                  key={card.key}
                  className="rounded-lg border border-gray-100 dark:border-gray-700 p-3"
                >
                  <div
                    className={`inline-flex p-2 rounded-lg mb-2 ${card.color}`}
                  >
                    <Icon className="w-4 h-4" />
                  </div>
                  <div className="text-xl font-bold text-gray-900 dark:text-white">
                    {card.value}
                  </div>
                  <div className="text-xs text-gray-500">{card.label}</div>
                </div>
              );
            })}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-5">
            {["it", "lab", "sarpra"].map((unit) => {
              const meta = unitMeta[unit];
              const Icon = meta.icon;
              const stats = byUnit[unit] || {};
              const total =
                (stats.incoming || 0) +
                (stats.ongoing || 0) +
                (stats.selesai || 0) +
                (stats.cancel || 0);
              return (
                <div
                  key={unit}
                  className="rounded-lg border border-gray-100 dark:border-gray-700 p-3"
                >
                  <div className="flex items-center gap-2 mb-2">
                    <span
                      className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium ${meta.color}`}
                    >
                      <Icon className="w-3.5 h-3.5" />
                      {meta.label}
                    </span>
                    <span className="text-xs text-gray-500">{total} kegiatan</span>
                  </div>
                  <div className="flex flex-wrap gap-2 text-[11px]">
                    <span className="text-blue-600">Ongoing {stats.ongoing || 0}</span>
                    <span className="text-slate-600">Incoming {stats.incoming || 0}</span>
                    <span className="text-emerald-600">Selesai {stats.selesai || 0}</span>
                    {(stats.cancel || 0) > 0 && (
                      <span className="text-rose-600 inline-flex items-center gap-0.5">
                        <XCircle className="w-3 h-3" /> {stats.cancel}
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          <div>
            <h4 className="text-sm font-semibold text-gray-800 dark:text-gray-100 mb-3">
              Kegiatan Mendatang / Berlangsung
            </h4>
            {upcoming.length === 0 ? (
              <p className="text-sm text-gray-500">Tidak ada kegiatan aktif.</p>
            ) : (
              <div className="space-y-2 max-h-[280px] overflow-y-auto pr-1">
                {upcoming.map((item) => {
                  const um = unitMeta[item.unit] || unitMeta.it;
                  return (
                    <div
                      key={item.id}
                      className="flex items-start gap-3 rounded-lg border border-gray-100 dark:border-gray-700 p-3 hover:bg-gray-50 dark:hover:bg-gray-700/40"
                    >
                      <div className="w-12 shrink-0 text-center rounded-lg bg-gray-100 dark:bg-gray-700 p-1">
                        <span className="block text-[10px] font-semibold text-gray-500 uppercase">
                          {dayjs(item.tgl).format("MMM")}
                        </span>
                        <span className="block text-lg font-bold text-gray-900 dark:text-white">
                          {dayjs(item.tgl).format("DD")}
                        </span>
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-center gap-2 mb-1">
                          <span
                            className={`rounded-full px-2 py-0.5 text-[10px] font-medium ${um.color}`}
                          >
                            {um.label}
                          </span>
                          <span
                            className={`rounded-full px-2 py-0.5 text-[10px] font-medium ${statusMeta[item.status] || ""}`}
                          >
                            {item.status}
                          </span>
                          <span className="text-[10px] text-gray-500">
                            Progress {item.progress || 0}%
                          </span>
                        </div>
                        <h5 className="text-sm font-semibold text-gray-900 dark:text-white truncate">
                          {item.kegiatan}
                        </h5>
                        <p className="text-xs text-gray-500 truncate">
                          {item.lokasi}
                          {item.team_name ? ` · ${item.team_name}` : ""}
                          {" · "}
                          {dayjs(item.tgl).format("DD/MM")} -{" "}
                          {dayjs(item.end).format("DD/MM")}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}
