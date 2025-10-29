"use client";

import { useState, useEffect } from "react";
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
}) => {
  const [isVisible, setIsVisible] = useState(show);

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

  if (!isVisible) return null;

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

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      onClick={handleOverlayClick}
    >
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" />
      
      {/* Dialog */}
      <div
        className={`relative w-full ${getSizeClasses()} bg-white dark:bg-gray-800 rounded-lg shadow-xl transform transition-all duration-300 ${
          isVisible ? "scale-100 opacity-100" : "scale-95 opacity-0"
        }`}
      >
        {/* Header */}
        <div className="flex items-start gap-4 p-6">
          {/* Icon */}
          <div className={`flex-shrink-0 w-12 h-12 rounded-full ${getIconBgColor()} flex items-center justify-center`}>
            {getIcon()}
          </div>
          
          {/* Content */}
          <div className="flex-1 min-w-0">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              {title}
            </h3>
            <div className="mt-2">
              <p className="text-sm text-gray-600 dark:text-gray-300 whitespace-pre-wrap">
                {message}
              </p>
            </div>
          </div>
          
          {/* Close Button */}
          {showCloseButton && (
            <button
              onClick={handleClose}
              className="flex-shrink-0 p-1 rounded-md text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>
        
        {/* Footer */}
        <div className="flex items-center justify-end gap-3 px-6 py-4 bg-gray-50 dark:bg-gray-700/50 rounded-b-lg">
          <button
            onClick={handleClose}
            className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-600 border border-gray-300 dark:border-gray-500 rounded-md hover:bg-gray-50 dark:hover:bg-gray-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
          >
            Tutup
          </button>
        </div>
      </div>
    </div>
  );
};

export default DialogInfo;
