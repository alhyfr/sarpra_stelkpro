"use client";
import { useState, useRef, useEffect } from 'react';
import { Calendar, ChevronLeft, ChevronRight } from 'lucide-react';

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
  format = "YYYY-MM-DD", // Format output
  displayFormat = "DD/MM/YYYY", // Format tampilan
  className = "",
  icon = Calendar,
  ...props
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(value ? new Date(value) : null);
  const [dropdownPosition, setDropdownPosition] = useState('bottom');
  const datePickerRef = useRef(null);
  const inputRef = useRef(null);

  // Format tanggal untuk display
  const formatDate = (date, format) => {
    if (!date) return "";
    
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    
    switch (format) {
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

  // Parse tanggal dari string
  const parseDate = (dateString) => {
    if (!dateString) return null;
    
    // Handle format YYYY-MM-DD
    if (dateString.includes('-')) {
      return new Date(dateString);
    }
    
    // Handle format DD/MM/YYYY
    if (dateString.includes('/')) {
      const [day, month, year] = dateString.split('/');
      return new Date(year, month - 1, day);
    }
    
    return new Date(dateString);
  };

  // Generate calendar days
  const generateCalendarDays = () => {
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();
    
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const startDate = new Date(firstDay);
    startDate.setDate(startDate.getDate() - firstDay.getDay());
    
    const days = [];
    const currentDate = new Date(startDate);
    
    // Generate 42 days (6 weeks)
    for (let i = 0; i < 42; i++) {
      days.push(new Date(currentDate));
      currentDate.setDate(currentDate.getDate() + 1);
    }
    
    return days;
  };

  // Check if date is disabled
  const isDateDisabled = (date) => {
    if (disabled) return true;
    
    if (minDate && date < new Date(minDate)) return true;
    if (maxDate && date > new Date(maxDate)) return true;
    
    return false;
  };

  // Check if date is selected
  const isDateSelected = (date) => {
    if (!selectedDate) return false;
    return date.toDateString() === selectedDate.toDateString();
  };

  // Check if date is today
  const isToday = (date) => {
    const today = new Date();
    return date.toDateString() === today.toDateString();
  };

  // Handle date selection
  const handleDateSelect = (date) => {
    if (isDateDisabled(date)) return;
    
    setSelectedDate(date);
    const formattedDate = formatDate(date, format);
    
    // Trigger onChange event
    if (onChange) {
      const event = {
        target: {
          name: name,
          value: formattedDate
        }
      };
      onChange(event);
    }
    
    handleCloseDropdown();
  };

  // Navigate months
  const navigateMonth = (direction) => {
    setCurrentMonth(prev => {
      const newMonth = new Date(prev);
      newMonth.setMonth(prev.getMonth() + direction);
      return newMonth;
    });
  };

  // Handle input change (manual typing)
  const handleInputChange = (e) => {
    const inputValue = e.target.value;
    
    if (onChange) {
      onChange(e);
    }
    
    // Try to parse the input
    const parsedDate = parseDate(inputValue);
    if (parsedDate && !isNaN(parsedDate.getTime())) {
      setSelectedDate(parsedDate);
      setCurrentMonth(parsedDate);
    }
  };

  // Handle open dropdown
  const handleOpenDropdown = () => {
    setIsOpen(true);
    
    // Calculate position to avoid clipping
    setTimeout(() => {
      if (datePickerRef.current && inputRef.current) {
        const inputRect = inputRef.current.getBoundingClientRect();
        const viewportHeight = window.innerHeight;
        const spaceBelow = viewportHeight - inputRect.bottom;
        const spaceAbove = inputRect.top;
        
        // If not enough space below, show above
        if (spaceBelow < 300 && spaceAbove > 300) {
          setDropdownPosition('top');
        } else {
          setDropdownPosition('bottom');
        }
        
        // Scroll to ensure calendar is visible in modal
        datePickerRef.current.scrollIntoView({ 
          behavior: 'smooth', 
          block: 'nearest' 
        });
      }
    }, 100);
  };

  // Handle close dropdown
  const handleCloseDropdown = () => {
    setIsOpen(false);
  };

  // Handle click outside to close dropdown
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (isOpen && datePickerRef.current && !datePickerRef.current.contains(event.target)) {
        handleCloseDropdown();
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  // Update selected date when value prop changes
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

  return (
    <div className={`relative ${className}`} ref={datePickerRef}>
      {/* Label */}
      {label && (
        <label htmlFor={id} className="block text-sm font-medium text-gray-700 mb-1">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}

      {/* Input Field */}
      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <IconComponent className="h-5 w-5 text-gray-400" />
        </div>
        <input
          ref={inputRef}
          id={id}
          name={name}
          type="text"
          value={value ? formatDate(parseDate(value), displayFormat) : ""}
          onChange={handleInputChange}
          onFocus={handleOpenDropdown}
          placeholder={placeholder}
          disabled={disabled}
          className={`
            block w-full pl-10 pr-10 py-2 border rounded-md shadow-sm
            focus:ring-2 focus:ring-red-500 focus:border-red-500
            disabled:bg-gray-50 disabled:text-gray-500 disabled:cursor-not-allowed
            bg-white border-gray-300 text-gray-900
            ${error 
              ? 'border-red-300 focus:ring-red-500 focus:border-red-500' 
              : 'border-gray-300 focus:ring-red-500 focus:border-red-500'
            }
          `}
          {...props}
        />
        <button
          type="button"
          onClick={handleOpenDropdown}
          disabled={disabled}
          className="absolute inset-y-0 right-0 pr-3 flex items-center"
        >
          <Calendar className="h-5 w-5 text-gray-400 hover:text-gray-600" />
        </button>
      </div>

      {/* Error Message */}
      {error && (
        <p className="mt-1 text-sm text-red-600">{error}</p>
      )}

      {/* Calendar Dropdown */}
      {isOpen && (
        <div className={`absolute left-0 z-[9999] w-full min-w-[320px] bg-white border border-gray-300 rounded-md shadow-xl max-h-[400px] overflow-y-auto ${
          dropdownPosition === 'top' 
            ? 'bottom-full mb-1' 
            : 'top-full mt-1'
        }`}>
          {/* Calendar Header */}
          <div className="flex items-center justify-between p-3 border-b border-gray-200">
            <button
              type="button"
              onClick={() => navigateMonth(-1)}
              className="p-1 hover:bg-gray-100 rounded"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <h3 className="text-sm font-medium text-gray-900">
              {monthNames[currentMonth.getMonth()]} {currentMonth.getFullYear()}
            </h3>
            <button
              type="button"
              onClick={() => navigateMonth(1)}
              className="p-1 hover:bg-gray-100 rounded"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>

          {/* Calendar Body */}
          <div className="p-3">
            {/* Day Headers */}
            <div className="grid grid-cols-7 gap-1 mb-2">
              {dayNames.map(day => (
                <div key={day} className="text-center text-xs font-medium text-gray-500 py-1">
                  {day}
                </div>
              ))}
            </div>

            {/* Calendar Days */}
            <div className="grid grid-cols-7 gap-1">
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
                      h-8 w-8 text-xs rounded-md transition-colors
                      ${isCurrentMonth ? 'text-gray-900' : 'text-gray-400'}
                      ${isSelected 
                        ? 'bg-red-600 text-white' 
                        : isTodayDate 
                          ? 'bg-red-100 text-red-600' 
                          : 'hover:bg-gray-100'
                      }
                      ${isDisabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
                    `}
                  >
                    {date.getDate()}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Calendar Footer */}
          <div className="flex justify-between items-center p-3 border-t border-gray-200">
            <button
              type="button"
              onClick={() => {
                const today = new Date();
                handleDateSelect(today);
              }}
              className="text-xs text-red-600 hover:text-red-800"
            >
              Hari ini
            </button>
            <button
              type="button"
              onClick={() => {
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
                handleCloseDropdown();
              }}
              className="text-xs text-gray-500 hover:text-gray-700"
            >
              Hapus
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ADatePicker;
