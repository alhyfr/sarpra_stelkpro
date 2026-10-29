"use client";

import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { X, AlertCircle, CheckCircle, Info, AlertTriangle } from "lucide-react";

const DialogInfo = ({
  show = false,
  onClose = () => {},
  title = "Informasi",
  message = "",
  type = "info", // info, success, warning, error
  size = "sm", // sm, md, lg
  showCloseButton = true,
  autoClose = false,
  autoCloseDelay = 3000,
  confirmLabel = "Tutup",
  /** Di atas Modal app (z-[9999]) agar tidak tertutup form */
  overlayClassName = "z-[10050]",
}) => {
  const [isVisible, setIsVisible] = useState(show);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    setIsVisible(show);
  }, [show]);

  useEffect(() => {
    if (autoClose && isVisible) {
      const timer = setTimeout(() => {
        handleClose();
      }, autoCloseDelay);
      return () => clearTimeout(timer);
    }
  }, [autoClose, isVisible, autoCloseDelay]);

  const handleClose = () => {
    setIsVisible(false);
    onClose();
  };

  const handleOverlayClick = (e) => {
    if (e.target === e.currentTarget) {
      handleClose();
    }
  };

  if (!isVisible || !mounted) return null;

  const getIcon = () => {
    switch (type) {
      case "success":
        return <CheckCircle className="w-6 h-6 text-green-500" />;
      case "warning":
        return <AlertTriangle className="w-6 h-6 text-yellow-500" />;
      case "error":
        return <AlertCircle className="w-6 h-6 text-red-500" />;
      default:
        return <Info className="w-6 h-6 text-blue-500" />;
    }
  };

  const getIconBgColor = () => {
    switch (type) {
      case "success":
        return "bg-green-100 dark:bg-green-900/20";
      case "warning":
        return "bg-yellow-100 dark:bg-yellow-900/20";
      case "error":
        return "bg-red-100 dark:bg-red-900/20";
      default:
        return "bg-blue-100 dark:bg-blue-900/20";
    }
  };

  const getSizeClasses = () => {
    switch (size) {
      case "sm":
        return "max-w-md";
      case "md":
        return "max-w-lg";
      case "lg":
        return "max-w-2xl";
      default:
        return "max-w-md";
    }
  };

  const confirmButtonClass =
    type === "error" || type === "warning"
      ? "bg-slate-900 text-white hover:bg-slate-800 dark:bg-white dark:text-slate-900 dark:hover:bg-gray-100 focus:ring-slate-500"
      : "text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-600 border border-gray-300 dark:border-gray-500 hover:bg-gray-50 dark:hover:bg-gray-500 focus:ring-blue-500";

  const dialog = (
    <div
      className={`fixed inset-0 ${overlayClassName} flex items-center justify-center p-4`}
      onClick={handleOverlayClick}
      role="alertdialog"
      aria-modal="true"
      aria-labelledby="dialog-info-title"
      aria-describedby="dialog-info-message"
    >
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" />

      {/* Dialog */}
      <div
        className={`relative w-full ${getSizeClasses()} bg-white dark:bg-gray-800 rounded-xl shadow-2xl ring-1 ring-black/5 transform transition-all duration-300 ${
          isVisible ? "scale-100 opacity-100" : "scale-95 opacity-0"
        }`}
      >
        {/* Header */}
        <div className="flex items-start gap-4 p-6">
          {/* Icon */}
          <div
            className={`flex-shrink-0 w-12 h-12 rounded-full ${getIconBgColor()} flex items-center justify-center`}
          >
            {getIcon()}
          </div>

          {/* Content */}
          <div className="flex-1 min-w-0">
            <h3
              id="dialog-info-title"
              className="text-lg font-semibold text-gray-900 dark:text-white"
            >
              {title}
            </h3>
            <div className="mt-2">
              <p
                id="dialog-info-message"
                className="text-sm text-gray-600 dark:text-gray-300 whitespace-pre-wrap leading-relaxed"
              >
                {message}
              </p>
            </div>
          </div>

          {/* Close Button */}
          {showCloseButton && (
            <button
              type="button"
              onClick={handleClose}
              className="flex-shrink-0 p-1 rounded-md text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
              aria-label="Tutup"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 px-6 py-4 bg-gray-50 dark:bg-gray-700/50 rounded-b-xl">
          <button
            type="button"
            onClick={handleClose}
            className={`px-4 py-2 text-sm font-medium rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 transition-colors ${confirmButtonClass}`}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );

  return createPortal(dialog, document.body);
};

export default DialogInfo;
