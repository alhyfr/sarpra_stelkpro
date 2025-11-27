"use client";

import { useState } from 'react';
import { Calendar, AlertCircle } from 'lucide-react';

const ADatePicker = ({
  id,
  name,
  label,
  placeholder,
  value = "",
  onChange,
  onBlur,
  error = "",
  required = false,
  disabled = false,
  minDate = null,
  maxDate = null,
  className = "",
  inputClassName = "",
  icon: Icon = Calendar,
  format, // Custom prop - tidak diteruskan ke DOM
  displayFormat, // Custom prop - tidak diteruskan ke DOM
  ...props
}) => {
  const [touched, setTouched] = useState(false);

  // Error ditampilkan jika ada error (tidak perlu menunggu touched)
  // Ini memungkinkan error langsung terlihat saat form di-submit
  const isInvalid = error && error.trim() !== '';

  // Handle blur to mark as touched
  const handleBlur = (e) => {
    setTouched(true);
    if (onBlur) onBlur(e);
  };

  // Format value untuk input type="date" (harus YYYY-MM-DD)
  const formatValueForInput = (val) => {
    if (!val) return "";

    // Jika sudah format YYYY-MM-DD, return langsung
    if (typeof val === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(val)) {
      return val;
    }

    // Jika format ISO 8601 (2024-11-27T16:00:00.000Z), ambil bagian tanggal saja
    if (typeof val === 'string' && /^\d{4}-\d{2}-\d{2}T/.test(val)) {
      return val.split('T')[0];
    }

    // Jika format lain, coba parse dengan UTC untuk menghindari timezone shift
    try {
      const date = new Date(val);
      if (!isNaN(date.getTime())) {
        // Gunakan UTC methods untuk menghindari timezone conversion
        const year = date.getUTCFullYear();
        const month = String(date.getUTCMonth() + 1).padStart(2, '0');
        const day = String(date.getUTCDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
      }
    } catch (e) {
      // ignore
    }

    return "";
  };

  const formattedValue = formatValueForInput(value);

  return (
    <div className={`w-full ${className}`}>
      {/* Label */}
      {label && (
        <label
          htmlFor={id}
          className={`block text-sm font-medium mb-2 ${isInvalid
            ? 'text-red-600 dark:text-red-400'
            : 'text-gray-700 dark:text-gray-300'
            }`}
        >
          {label}
          {required && <span className="text-red-600 ml-1">*</span>}
        </label>
      )}

      {/* Input Container */}
      <div className="relative">
        {/* Left Icon */}
        {Icon && (
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Icon className={`h-5 w-5 ${isInvalid
              ? 'text-red-500'
              : 'text-gray-400'
              }`} />
          </div>
        )}

        {/* Input Field */}
        <input
          id={id}
          name={name}
          type="date"
          value={formattedValue}
          onChange={onChange}
          onBlur={handleBlur}
          required={required}
          disabled={disabled}
          min={minDate ? formatValueForInput(minDate) : undefined}
          max={maxDate ? formatValueForInput(maxDate) : undefined}
          className={`
            date-picker-input
            block w-full py-3 px-3
            ${Icon ? 'pl-10' : ''}
            pr-10
            border-2 rounded-lg
            transition-all duration-200
            text-gray-900 dark:text-white
            bg-white dark:bg-gray-800
            disabled:bg-gray-100 dark:disabled:bg-gray-900 disabled:cursor-not-allowed
            ${isInvalid
              ? 'border-red-500 focus:ring-2 focus:ring-red-500/20 focus:border-red-500 bg-red-50/50 dark:bg-red-900/10'
              : 'border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-[#B91C1C]/20 focus:border-[#B91C1C]'
            }
            ${inputClassName}
          `}
          {...props}
        />

        {/* Calendar Icon di Kanan */}
        <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
          <Calendar className={`h-5 w-5 ${isInvalid
            ? 'text-red-500'
            : 'text-gray-400'
            }`} />
        </div>
      </div>

      {/* Error Message */}
      {isInvalid && (
        <div className="mt-2 text-sm text-red-600 dark:text-red-400 flex items-start animate-in fade-in slide-in-from-top-1 duration-200">
          <AlertCircle className="w-4 h-4 mr-1.5 flex-shrink-0 mt-0.5" />
          <span>{error}</span>
        </div>
      )}

      {/* Custom CSS untuk Date Picker */}
      <style jsx global>{`
        /* Styling untuk input date */
        input[type="date"].date-picker-input {
          cursor: pointer;
          font-size: 0.9375rem;
          line-height: 1.5;
        }

        /* Sembunyikan calendar picker indicator default dan buat klikable */
        input[type="date"]::-webkit-calendar-picker-indicator {
          cursor: pointer;
            opacity: 0;
          position: absolute;
          right: 0;
          width: 100%;
          height: 100%;
          z-index: 1;
        }

        /* Styling untuk date picker popup calendar - bagian input field */
        input[type="date"]::-webkit-datetime-edit {
          padding: 0;
          color: inherit;
        }

        input[type="date"]::-webkit-datetime-edit-fields-wrapper {
          padding: 0;
        }

        input[type="date"]::-webkit-datetime-edit-text {
          color: #6b7280;
          padding: 0 0.25rem;
          font-weight: 500;
        }

        input[type="date"]::-webkit-datetime-edit-month-field,
        input[type="date"]::-webkit-datetime-edit-day-field,
        input[type="date"]::-webkit-datetime-edit-year-field {
          color: inherit;
          padding: 0.125rem 0.25rem;
          border-radius: 0.25rem;
          transition: all 0.2s;
        }

        input[type="date"]::-webkit-datetime-edit-month-field:hover,
        input[type="date"]::-webkit-datetime-edit-day-field:hover,
        input[type="date"]::-webkit-datetime-edit-year-field:hover {
          background-color: rgba(0, 0, 0, 0.05);
        }

        .dark input[type="date"]::-webkit-datetime-edit-month-field:hover,
        .dark input[type="date"]::-webkit-datetime-edit-day-field:hover,
        .dark input[type="date"]::-webkit-datetime-edit-year-field:hover {
          background-color: rgba(255, 255, 255, 0.1);
        }

        input[type="date"]::-webkit-datetime-edit-month-field:focus,
        input[type="date"]::-webkit-datetime-edit-day-field:focus,
        input[type="date"]::-webkit-datetime-edit-year-field:focus {
          background-color: rgba(185, 28, 28, 0.15);
          border-radius: 0.25rem;
          color: #B91C1C;
          outline: none;
        }

        .dark input[type="date"]::-webkit-datetime-edit-month-field:focus,
        .dark input[type="date"]::-webkit-datetime-edit-day-field:focus,
        .dark input[type="date"]::-webkit-datetime-edit-year-field:focus {
          background-color: rgba(185, 28, 28, 0.3);
          color: #fca5a5;
        }

        /* Styling untuk calendar popup (Chrome/Edge) - mempercantik popup */
        input[type="date"]::-webkit-calendar-picker-indicator:hover {
            opacity: 0;
          }

        /* Firefox - color scheme */
        input[type="date"] {
          color-scheme: light dark;
        }

        .dark input[type="date"] {
          color-scheme: dark;
        }

        /* Memperbaiki tampilan saat disabled */
        input[type="date"]:disabled {
          cursor: not-allowed;
        }

        input[type="date"]:disabled::-webkit-calendar-picker-indicator {
          cursor: not-allowed;
        }

        /* Styling untuk popup calendar (hanya bisa sedikit diubah) */
        @media (prefers-color-scheme: dark) {
          input[type="date"] {
            color-scheme: dark;
          }
        }
      `}</style>
    </div>
  );
};

export default ADatePicker;
