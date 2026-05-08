"use client";
import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { Undo2, X, AlertTriangle, Loader2 } from "lucide-react";

export default function KembalikanModal({
  show = false,
  onClose,
  onConfirm,
  item,
  loading = false,
}) {
  const [isVisible, setIsVisible] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);

  useEffect(() => {
    if (show) {
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
  }, [show]);

  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === "Escape" && show && !loading) onClose();
    };
    if (show) document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, [show, loading, onClose]);

  if (!isVisible) return null;

  const content = (
    <div
      className={`fixed inset-0 z-[9999] flex items-center justify-center p-4 transition-all duration-300 ${
        isAnimating ? "opacity-100" : "opacity-0"
      }`}
    >
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/50 backdrop-blur-sm"
        onClick={!loading ? onClose : undefined}
      />

      {/* Dialog */}
      <div
        className={`relative z-10 w-full max-w-sm bg-white dark:bg-gray-800 rounded-2xl shadow-2xl overflow-hidden transition-all duration-300 transform ${
          isAnimating
            ? "opacity-100 scale-100 translate-y-0"
            : "opacity-0 scale-95 translate-y-4"
        }`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 dark:border-gray-700 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-gray-800 dark:to-gray-750">
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center w-9 h-9 rounded-xl bg-blue-100 dark:bg-blue-900/40">
              <Undo2 className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <h3 className="text-base font-semibold text-gray-900 dark:text-gray-100">
                Kembalikan Status
              </h3>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                Batalkan penghapusan aset
              </p>
            </div>
          </div>
          {!loading && (
            <button
              onClick={onClose}
              className="flex items-center justify-center w-8 h-8 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700 transition-all"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Body */}
        <div className="px-6 py-5 space-y-4">
          {/* Warning */}
          <div className="flex gap-3 p-3 rounded-xl bg-amber-50 dark:bg-amber-900/20 border border-amber-100 dark:border-amber-800">
            <AlertTriangle className="w-4 h-4 text-amber-500 flex-shrink-0 mt-0.5" />
            <p className="text-sm text-amber-700 dark:text-amber-300">
              Status penghapusan aset ini akan dikembalikan ke kondisi normal.
              Keterangan lelang akan dihapus.
            </p>
          </div>

          {/* Aset info */}
          {item && (
            <div className="rounded-xl bg-gray-50 dark:bg-gray-700/50 px-4 py-3 space-y-1">
              <p className="text-xs font-medium text-gray-400 dark:text-gray-500 uppercase tracking-wide">
                Aset
              </p>
              <p className="text-sm font-semibold text-gray-800 dark:text-gray-100">
                {item.desc || item.kode || "-"}
              </p>
              {item.kode && item.desc && (
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  {item.kode}
                </p>
              )}
              {item.deskripsi_lelang && (
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 italic">
                  Keterangan: {item.deskripsi_lelang}
                </p>
              )}
            </div>
          )}

          {/* Actions */}
          <div className="flex items-center justify-end gap-3 pt-1">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="px-4 py-2 text-sm font-medium rounded-xl border border-gray-200 dark:border-gray-600 text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
            >
              Batal
            </button>
            <button
              type="button"
              onClick={onConfirm}
              disabled={loading}
              className="inline-flex items-center gap-2 px-5 py-2 text-sm font-semibold rounded-xl bg-blue-500 hover:bg-blue-600 active:bg-blue-700 text-white shadow-sm shadow-blue-200 dark:shadow-none disabled:opacity-60 disabled:cursor-not-allowed transition-all"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Memproses...
                </>
              ) : (
                <>
                  <Undo2 className="w-4 h-4" />
                  Ya, Kembalikan
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  return typeof window !== "undefined"
    ? createPortal(content, document.body)
    : null;
}
