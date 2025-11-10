"use client";

import { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { Calendar, ChevronLeft, ChevronRight, X } from 'lucide-react';

const ADatePicker = ({
  id,
  name,
  label,
  placeholder = "Pilih tanggal",
  value = "",
  onChange,
  error = "",
  required = false,
  disabled = false,
  minDate = null,
  maxDate = null,
  format = "YYYY-MM-DD",
  displayFormat = "DD/MM/YYYY",
  className = "",
  icon = Calendar,
  ...props
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(value ? new Date(value) : null);
  const [position, setPosition] = useState({ top: 0, left: 0, width: 0 });
  const [isMobile, setIsMobile] = useState(false);
  const [mounted, setMounted] = useState(false);

  const datePickerRef = useRef(null);
  const inputRef = useRef(null);
  const calendarRef = useRef(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const formatDate = (date, formatType) => {
    if (!date) return "";
    
    const d = date instanceof Date ? date : new Date(date);
    if (isNaN(d.getTime())) return "";

    const day = String(d.getDate()).padStart(2, '0');
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const year = d.getFullYear();

    switch (formatType) {
      case "DD/MM/YYYY":
        return `${day}/${month}/${year}`;
      case "MM/DD/YYYY":
        return `${month}/${day}/${year}`;
      case "YYYY-MM-DD":
        return `${year}-${month}-${day}`;
      default:
        return `${day}/${month}/${year}`;
    }
  };

  const parseDate = (dateString) => {
    if (!dateString) return null;

    if (dateString.includes('-')) {
      const date = new Date(dateString);
      return isNaN(date.getTime()) ? null : date;
    }

    if (dateString.includes('/')) {
      const parts = dateString.split('/');
      if (parts.length !== 3) return null;
      
      let day, month, year;
      if (displayFormat === "DD/MM/YYYY") {
        [day, month, year] = parts;
      } else if (displayFormat === "MM/DD/YYYY") {
        [month, day, year] = parts;
      }
      
      const date = new Date(year, month - 1, day);
      return isNaN(date.getTime()) ? null : date;
    }

    const date = new Date(dateString);
    return isNaN(date.getTime()) ? null : date;
  };

  const generateCalendarDays = () => {
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const startDate = new Date(firstDay);
    startDate.setDate(startDate.getDate() - firstDay.getDay());

    const days = [];
    const currentDate = new Date(startDate);

    for (let i = 0; i < 42; i++) {
      days.push(new Date(currentDate));
      currentDate.setDate(currentDate.getDate() + 1);
    }

    return days;
  };

  const isDateDisabled = (date) => {
    if (disabled) return true;
    
    const checkDate = new Date(date);
    checkDate.setHours(0, 0, 0, 0);

    if (minDate) {
      const min = new Date(minDate);
      min.setHours(0, 0, 0, 0);
      if (checkDate < min) return true;
    }

    if (maxDate) {
      const max = new Date(maxDate);
      max.setHours(0, 0, 0, 0);
      if (checkDate > max) return true;
    }

    return false;
  };

  const isDateSelected = (date) => {
    if (!selectedDate) return false;
    return date.toDateString() === selectedDate.toDateString();
  };

  const isToday = (date) => {
    const today = new Date();
    return date.toDateString() === today.toDateString();
  };

  const handleDateSelect = (date) => {
    if (isDateDisabled(date)) return;

    setSelectedDate(date);
    const formattedDate = formatDate(date, format);

    if (onChange) {
      const event = {
        target: {
          name: name,
          value: formattedDate
        }
      };
      onChange(event);
    }

    setIsOpen(false);
  };

  const navigateMonth = (direction) => {
    setCurrentMonth(prev => {
      const newMonth = new Date(prev);
      newMonth.setMonth(prev.getMonth() + direction);
      return newMonth;
    });
  };

  const handleInputChange = (e) => {
    const inputValue = e.target.value;
    
    if (onChange) {
      onChange(e);
    }

    const parsedDate = parseDate(inputValue);
    if (parsedDate && !isNaN(parsedDate.getTime())) {
      setSelectedDate(parsedDate);
      setCurrentMonth(parsedDate);
    }
  };

  const handleOpenCalendar = () => {
    if (disabled) return;
    setIsOpen(true);
  };

  const handleCloseCalendar = () => {
    setIsOpen(false);
  };

  const handleToday = () => {
    const today = new Date();
    if (!isDateDisabled(today)) {
      handleDateSelect(today);
      setCurrentMonth(today);
    }
  };

  const handleClear = () => {
    setSelectedDate(null);
    if (onChange) {
      const event = {
        target: {
          name: name,
          value: ""
        }
      };
      onChange(event);
    }
    setIsOpen(false);
  };

  useEffect(() => {
    if (isOpen && inputRef.current && !isMobile) {
      const calculatePosition = () => {
        const inputRect = inputRef.current.getBoundingClientRect();
        const calendarHeight = 400;
        const viewportHeight = window.innerHeight;
        const spaceBelow = viewportHeight - inputRect.bottom;

        let top;
        if (spaceBelow >= calendarHeight) {
          top = inputRect.bottom + window.scrollY + 4;
        } else {
          top = inputRect.top + window.scrollY - calendarHeight - 4;
        }

        setPosition({
          top,
          left: inputRect.left + window.scrollX,
          width: inputRect.width
        });
      };

      calculatePosition();
      
      const handleScroll = () => calculatePosition();
      const handleResize = () => calculatePosition();

      window.addEventListener('scroll', handleScroll, true);
      window.addEventListener('resize', handleResize);

      return () => {
        window.removeEventListener('scroll', handleScroll, true);
        window.removeEventListener('resize', handleResize);
      };
    }
  }, [isOpen, isMobile]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        isOpen &&
        calendarRef.current &&
        !calendarRef.current.contains(event.target) &&
        inputRef.current &&
        !inputRef.current.contains(event.target)
      ) {
        handleCloseCalendar();
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [isOpen]);

  useEffect(() => {
    if (value) {
      const parsedDate = parseDate(value);
      if (parsedDate && !isNaN(parsedDate.getTime())) {
        setSelectedDate(parsedDate);
        setCurrentMonth(parsedDate);
      }
    } else {
      setSelectedDate(null);
    }
  }, [value]);

  const IconComponent = icon;
  const calendarDays = generateCalendarDays();
  const monthNames = [
    "Januari", "Februari", "Maret", "April", "Mei", "Juni",
    "Juli", "Agustus", "September", "Oktober", "November", "Desember"
  ];
  const dayNames = ["Min", "Sen", "Sel", "Rab", "Kam", "Jum", "Sab"];

  const CalendarContent = () => (
    <div
      ref={calendarRef}
      className={`
        bg-white rounded-lg shadow-2xl border border-gray-200
        ${isMobile ? 'w-full max-w-sm' : 'w-80'}
      `}
      style={
        isMobile
          ? {}
          : {
              position: 'absolute',
              top: `${position.top}px`,
              left: `${position.left}px`,
              minWidth: `${Math.max(position.width, 320)}px`,
              zIndex: 10000,
            }
      }
    >
      <div className="flex items-center justify-between p-4 border-b border-gray-200">
        <button
          type="button"
          onClick={() => navigateMonth(-1)}
          className="p-2 hover:bg-gray-100 rounded-lg transition-colors touch-manipulation"
          aria-label="Bulan sebelumnya"
        >
          <ChevronLeft className="w-5 h-5 text-gray-600" />
        </button>

        <div className="text-center">
          <div className="font-semibold text-gray-900">
            {monthNames[currentMonth.getMonth()]} {currentMonth.getFullYear()}
          </div>
        </div>

        <button
          type="button"
          onClick={() => navigateMonth(1)}
          className="p-2 hover:bg-gray-100 rounded-lg transition-colors touch-manipulation"
          aria-label="Bulan berikutnya"
        >
          <ChevronRight className="w-5 h-5 text-gray-600" />
        </button>
      </div>

      <div className={`grid grid-cols-7 gap-1 ${isMobile ? 'p-4' : 'p-3'}`}>
        {dayNames.map((day) => (
          <div
            key={day}
            className={`text-center font-medium text-gray-500 ${
              isMobile ? 'text-sm py-2' : 'text-xs py-1'
            }`}
          >
            {day}
          </div>
        ))}
      </div>

      <div className={`grid grid-cols-7 gap-1 ${isMobile ? 'px-4 pb-4' : 'px-3 pb-3'}`}>
        {calendarDays.map((date, index) => {
          const isCurrentMonth = date.getMonth() === currentMonth.getMonth();
          const isSelected = isDateSelected(date);
          const isTodayDate = isToday(date);
          const isDisabled = isDateDisabled(date);

          return (
            <button
              key={index}
              type="button"
              onClick={() => handleDateSelect(date)}
              disabled={isDisabled}
              className={`
                aspect-square rounded-lg flex items-center justify-center
                transition-all touch-manipulation
                ${isMobile ? 'text-base min-h-[44px]' : 'text-sm min-h-[36px]'}
                ${isCurrentMonth ? 'text-gray-900' : 'text-gray-400'}
                ${
                  isSelected
                    ? 'bg-red-600 text-white font-semibold shadow-md'
                    : isTodayDate
                    ? 'bg-red-100 text-red-600 font-semibold'
                    : 'hover:bg-gray-100'
                }
                ${
                  isDisabled
                    ? 'opacity-40 cursor-not-allowed hover:bg-transparent'
                    : 'cursor-pointer'
                }
              `}
              aria-label={formatDate(date, displayFormat)}
            >
              {date.getDate()}
            </button>
          );
        })}
      </div>

      <div className={`flex gap-2 border-t border-gray-200 ${isMobile ? 'p-4' : 'p-3'}`}>
        <button
          type="button"
          onClick={handleToday}
          className={`
            flex-1 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg
            hover:bg-gray-200 transition-colors font-medium touch-manipulation
            ${isMobile ? 'min-h-[44px]' : ''}
          `}
        >
          Hari ini
        </button>
        <button
          type="button"
          onClick={handleClear}
          className={`
            flex-1 px-4 py-2 bg-red-50 text-red-600 rounded-lg
            hover:bg-red-100 transition-colors font-medium touch-manipulation
            ${isMobile ? 'min-h-[44px]' : ''}
          `}
        >
          Hapus
        </button>
      </div>
    </div>
  );

  return (
    <div className={`relative ${className}`} ref={datePickerRef}>
      {label && (
        <label htmlFor={id} className="block text-sm font-medium text-gray-700 mb-2">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}

      <div className="relative" ref={inputRef}>
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <IconComponent className="h-5 w-5 text-gray-400" />
        </div>
        <input
          id={id}
          name={name}
          type="text"
          value={value ? formatDate(parseDate(value), displayFormat) : ""}
          onChange={handleInputChange}
          onFocus={handleOpenCalendar}
          placeholder={placeholder}
          disabled={disabled}
          className={`
            block w-full pl-10 pr-10 py-2 border rounded-lg shadow-sm
            focus:ring-2 focus:ring-red-500 focus:border-red-500
            disabled:bg-gray-50 disabled:text-gray-500 disabled:cursor-not-allowed
            bg-white text-gray-900 transition-all
            ${isMobile ? 'min-h-[44px]' : ''}
            ${
              error
                ? 'border-red-300 focus:ring-red-500 focus:border-red-500'
                : 'border-gray-300 focus:ring-red-500 focus:border-red-500'
            }
          `}
          {...props}
        />
        <button
          type="button"
          onClick={handleOpenCalendar}
          disabled={disabled}
          className="absolute inset-y-0 right-0 pr-3 flex items-center touch-manipulation"
          aria-label="Buka kalender"
        >
          <Calendar className="h-5 w-5 text-gray-400 hover:text-gray-600 transition-colors" />
        </button>
      </div>

      {error && <p className="mt-1 text-sm text-red-600">{error}</p>}

      {mounted && isOpen && createPortal(
        <>
          {isMobile && (
            <div
              className="fixed inset-0 bg-black bg-opacity-50 z-[9999] flex items-center justify-center p-4 animate-fadeIn"
              onClick={handleCloseCalendar}
            >
              <div
                onClick={(e) => e.stopPropagation()}
                className="relative animate-slideUp"
              >
                <button
                  onClick={handleCloseCalendar}
                  className="absolute -top-2 -right-2 p-2 bg-white rounded-full shadow-lg z-10 touch-manipulation"
                  aria-label="Tutup"
                >
                  <X className="w-5 h-5 text-gray-600" />
                </button>
                <CalendarContent />
              </div>
            </div>
          )}

          {!isMobile && <CalendarContent />}
        </>,
        document.body
      )}

      <style jsx>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }

        @keyframes slideUp {
          from {
            transform: translateY(20px);
            opacity: 0;
          }
          to {
            transform: translateY(0);
            opacity: 1;
          }
        }

        .animate-fadeIn {
          animation: fadeIn 0.2s ease-out;
        }

        .animate-slideUp {
          animation: slideUp 0.3s ease-out;
        }

        .touch-manipulation {
          touch-action: manipulation;
          -webkit-tap-highlight-color: transparent;
        }
      `}</style>
    </div>
  );
};

export default ADatePicker;