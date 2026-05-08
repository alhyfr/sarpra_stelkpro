"use client";
import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { X, Warehouse, CheckCircle2, AlertCircle, Loader2 } from "lucide-react";

export default function DialogPenghapusan({ show = false, onClose, onSuccess, item }) {
  const [deskripsi, setDeskripsi] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [isVisible, setIsVisible] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);

  // Sync animation states with show prop
  useEffect(() => {
    if (show) {
      setIsVisible(true);
      setIsAnimating(true);
      setError("");
      setDeskripsi("");
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

  // Escape key handler
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === "Escape" && show && !loading) onClose();
    };
    if (show) document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, [show, loading, onClose]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!deskripsi.trim()) {
      setError("Deskripsi lelang wajib diisi.");
      return;
    }
    setError("");
    setLoading(true);
    try {
      await onSuccess(item, {
        status_lelang: "ya",
        deskripsi_lelang: deskripsi.trim(),
      });
      onClose();
    } catch (err) {
      setError(err?.response?.data?.message || err?.message || "Terjadi kesalahan.");
    } finally {
      setLoading(false);
    }
  };

  if (!isVisible) return null;

  const content = (
    <div
      className={`fixed inset-0 z-[9999] flex items-center justify-center p-4 transition-all duration-300 ${
        isAnimating ? "opacity-100" : "opacity-0"
      }`}
    >
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/50 backdrop-blur-sm transition-all duration-300"
        onClick={!loading ? onClose : undefined}
      />

      {/* Dialog */}
      <div
        className={`relative z-10 w-full max-w-md bg-white dark:bg-gray-800 rounded-2xl shadow-2xl overflow-hidden transition-all duration-300 transform ${
          isAnimating ? "opacity-100 scale-100 translate-y-0" : "opacity-0 scale-95 translate-y-4"
        }`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 dark:border-gray-700 bg-gradient-to-r from-amber-50 to-orange-50 dark:from-gray-800 dark:to-gray-750">
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center w-9 h-9 rounded-xl bg-amber-100 dark:bg-amber-900/40">
              <Warehouse className="w-5 h-5 text-amber-600 dark:text-amber-400" />
            </div>
            <div>
              <h3 className="text-base font-semibold text-gray-900 dark:text-gray-100">
                Status Penghapusan
              </h3>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                Tandai aset sebagai dilelang
              </p>
            </div>
          </div>
          {!loading && (
            <button
              onClick={onClose}
              className="flex items-center justify-center w-8 h-8 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700 dark:hover:text-gray-300 transition-all"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Body */}
        <form onSubmit={handleSubmit} className="px-6 py-5 space-y-5">
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
                <p className="text-xs text-gray-500 dark:text-gray-400">{item.kode}</p>
              )}
            </div>
          )}

          {/* Status badge preview */}
          <div className="flex items-center gap-2 text-sm">
            <span className="text-gray-600 dark:text-gray-400">Status akan diubah menjadi:</span>
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300 ring-1 ring-amber-200 dark:ring-amber-800">
              <CheckCircle2 className="w-3.5 h-3.5" />
              Dilelang
            </span>
          </div>

          {/* Deskripsi field */}
          <div className="space-y-1.5">
            <label
              htmlFor="deskripsi_lelang"
              className="block text-sm font-medium text-gray-700 dark:text-gray-300"
            >
              Deskripsi Lelang <span className="text-red-500">*</span>
            </label>
            <textarea
              id="deskripsi_lelang"
              rows={4}
              value={deskripsi}
              onChange={(e) => {
                setDeskripsi(e.target.value);
                if (error) setError("");
              }}
              placeholder="Tuliskan alasan atau keterangan lelang aset ini..."
              disabled={loading}
              className={`w-full px-3.5 py-2.5 text-sm rounded-xl border transition-all resize-none
                bg-white dark:bg-gray-700/50
                text-gray-900 dark:text-gray-100
                placeholder:text-gray-400 dark:placeholder:text-gray-500
                focus:outline-none focus:ring-2 focus:ring-amber-400/60 focus:border-amber-400
                disabled:opacity-60 disabled:cursor-not-allowed
                ${
                  error
                    ? "border-red-400 dark:border-red-500 ring-1 ring-red-300"
                    : "border-gray-200 dark:border-gray-600"
                }
              `}
            />
            {error && (
              <p className="flex items-center gap-1.5 text-xs text-red-500 dark:text-red-400 mt-1">
                <AlertCircle className="w-3.5 h-3.5 flex-shrink-0" />
                {error}
              </p>
            )}
          </div>

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
              type="submit"
              disabled={loading}
              className="inline-flex items-center gap-2 px-5 py-2 text-sm font-semibold rounded-xl bg-amber-500 hover:bg-amber-600 active:bg-amber-700 text-white shadow-sm shadow-amber-200 dark:shadow-none disabled:opacity-60 disabled:cursor-not-allowed transition-all"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Menyimpan...
                </>
              ) : (
                <>
                  <Warehouse className="w-4 h-4" />
                  Simpan Status
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );

  return typeof window !== "undefined" ? createPortal(content, document.body) : null;
}