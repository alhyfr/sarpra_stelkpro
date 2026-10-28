"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { Archive, X, AlertTriangle, Loader2 } from "lucide-react";
import dayjs from "dayjs";

const METODE_OPTIONS = [
  { value: "lelang", label: "Lelang" },
  { value: "hibah", label: "Hibah" },
  { value: "musnah", label: "Pemusnahan" },
  { value: "dijual", label: "Dijual" },
  { value: "hilang", label: "Hilang / tidak ditemukan" },
  { value: "lainnya", label: "Lainnya" },
];

const EMPTY_FORM = {
  tgl_penghapusan: dayjs().format("YYYY-MM-DD"),
  no_ba: "",
  metode_penghapusan: "lelang",
  keterangan_penghapusan: "",
};

export default function ArsipkanModal({
  show = false,
  onClose,
  onConfirm,
  item = null,
  count = 1,
  loading = false,
}) {
  const [isVisible, setIsVisible] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);
  const [form, setForm] = useState(EMPTY_FORM);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (show) {
      setForm({
        ...EMPTY_FORM,
        tgl_penghapusan: dayjs().format("YYYY-MM-DD"),
        keterangan_penghapusan: item?.deskripsi_lelang || "",
      });
      setErrors({});
      setIsVisible(true);
      setIsAnimating(true);
      document.body.style.overflow = "hidden";
    } else {
      setIsAnimating(false);
      const timer = setTimeout(() => {
        setIsVisible(false);
        document.body.style.overflow = "unset";
      }, 300);
      return () => clearTimeout(timer);
    }
  }, [show, item]);

  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === "Escape" && show && !loading) onClose?.();
    };
    if (show) document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, [show, loading, onClose]);

  if (!isVisible) return null;

  const setField = (key) => (event) => {
    setForm((current) => ({ ...current, [key]: event.target.value }));
    setErrors((current) => ({ ...current, [key]: "" }));
  };

  const handleSubmit = async () => {
    const nextErrors = {};
    if (!form.tgl_penghapusan) nextErrors.tgl_penghapusan = "Tanggal penghapusan wajib diisi";
    if (!form.metode_penghapusan) nextErrors.metode_penghapusan = "Metode penghapusan wajib diisi";
    if (Object.keys(nextErrors).length) {
      setErrors(nextErrors);
      return;
    }
    await onConfirm?.({
      tgl_penghapusan: form.tgl_penghapusan,
      no_ba: form.no_ba.trim(),
      metode_penghapusan: form.metode_penghapusan,
      keterangan_penghapusan: form.keterangan_penghapusan.trim(),
    });
  };

  const titleLabel =
    count > 1
      ? `${count} aset`
      : `"${item?.desc || item?.kode || "aset"}"`;

  const content = (
    <div
      className={`fixed inset-0 z-[9999] flex items-center justify-center p-4 transition-all duration-300 ${
        isAnimating ? "opacity-100" : "opacity-0"
      }`}
    >
      <div
        className="fixed inset-0 bg-black/50 backdrop-blur-sm"
        onClick={!loading ? onClose : undefined}
      />
      <div
        className={`relative z-10 w-full max-w-lg bg-white dark:bg-gray-800 rounded-2xl shadow-2xl overflow-hidden transition-all duration-300 transform ${
          isAnimating ? "opacity-100 scale-100 translate-y-0" : "opacity-0 scale-95 translate-y-4"
        }`}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 dark:border-gray-700">
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center w-9 h-9 rounded-xl bg-red-100 dark:bg-red-900/40">
              <Archive className="w-5 h-5 text-red-600 dark:text-red-400" />
            </div>
            <div>
              <h3 className="text-base font-semibold text-gray-900 dark:text-gray-100">
                Arsipkan Aset
              </h3>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                Isi data penghapusan sebelum dipindah ke arsip
              </p>
            </div>
          </div>
          {!loading && (
            <button
              type="button"
              onClick={onClose}
              className="flex items-center justify-center w-8 h-8 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        <div className="px-6 py-5 space-y-4 max-h-[70vh] overflow-y-auto">
          <div className="flex gap-3 p-3 rounded-xl bg-amber-50 dark:bg-amber-900/20 border border-amber-100 dark:border-amber-800">
            <AlertTriangle className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
            <p className="text-sm text-amber-700 dark:text-amber-300">
              {titleLabel} akan dihapus dari tabel inventaris aktif dan dipindahkan ke Arsip
              Penghapusan. Tindakan ini tidak bisa dibatalkan dari daftar penghapusan.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <label className="block text-xs font-medium text-gray-600 dark:text-gray-300 sm:col-span-1">
              Tanggal penghapusan <span className="text-red-500">*</span>
              <input
                type="date"
                value={form.tgl_penghapusan}
                onChange={setField("tgl_penghapusan")}
                disabled={loading}
                className="mt-1 w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 rounded-lg"
              />
              {errors.tgl_penghapusan && (
                <span className="text-xs text-red-500">{errors.tgl_penghapusan}</span>
              )}
            </label>
            <label className="block text-xs font-medium text-gray-600 dark:text-gray-300">
              Metode penghapusan <span className="text-red-500">*</span>
              <select
                value={form.metode_penghapusan}
                onChange={setField("metode_penghapusan")}
                disabled={loading}
                className="mt-1 w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 rounded-lg"
              >
                {METODE_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
              {errors.metode_penghapusan && (
                <span className="text-xs text-red-500">{errors.metode_penghapusan}</span>
              )}
            </label>
          </div>

          <label className="block text-xs font-medium text-gray-600 dark:text-gray-300">
            Nomor BA / SK penghapusan
            <input
              type="text"
              value={form.no_ba}
              onChange={setField("no_ba")}
              disabled={loading}
              placeholder="Contoh: BA/012/SARPRAS/2026"
              className="mt-1 w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 rounded-lg"
            />
          </label>

          <label className="block text-xs font-medium text-gray-600 dark:text-gray-300">
            Keterangan penghapusan
            <textarea
              value={form.keterangan_penghapusan}
              onChange={setField("keterangan_penghapusan")}
              disabled={loading}
              rows={3}
              placeholder="Ringkasan alasan atau catatan resmi penghapusan"
              className="mt-1 w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 rounded-lg"
            />
          </label>
        </div>

        <div className="flex justify-end gap-2 px-6 py-4 border-t border-gray-100 dark:border-gray-700">
          <button
            type="button"
            onClick={onClose}
            disabled={loading}
            className="px-3 py-2 text-sm rounded-lg border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-200 disabled:opacity-60"
          >
            Batal
          </button>
          <button
            type="button"
            onClick={handleSubmit}
            disabled={loading}
            className="inline-flex items-center gap-2 px-3 py-2 text-sm rounded-lg bg-[#B91C1C] text-white hover:bg-[#991B1B] disabled:opacity-60"
          >
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Archive className="w-4 h-4" />}
            Arsipkan
          </button>
        </div>
      </div>
    </div>
  );

  return typeof document !== "undefined" ? createPortal(content, document.body) : null;
}
