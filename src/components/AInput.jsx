'use client'

import { useState } from 'react';
import { Eye, EyeOff, Check, X, AlertCircle } from 'lucide-react';

export default function AInput({
  id,
  name,
  type = 'text',
  label,
  placeholder,
  value,
  onChange,
  onBlur,
  required = false,
  disabled = false,
  error,
  valid = false,        // New: untuk indicate valid state
  helperText,
  successText,          // New: text untuk valid feedback (hijau)
  icon: Icon,
  showValidation = true, // New: show/hide validation icons
  className = '',
  inputClassName = '',
  ...props
}) {
  const [showPassword, setShowPassword] = useState(false);
  const [touched, setTouched] = useState(false);
  
  const isPassword = type === 'password';
  const inputType = isPassword ? (showPassword ? 'text' : 'password') : type;
  
  // Determine validation state
  // Error ditampilkan jika ada error (tidak perlu menunggu touched)
  // Ini memungkinkan error langsung terlihat saat form di-submit
  const isInvalid = error && error.trim() !== '';
  const isValid = touched && valid && !error && value;
  
  // Handle blur to mark as touched
  const handleBlur = (e) => {
    setTouched(true);
    if (onBlur) onBlur(e);
  };

  return (
    <div className={`w-full ${className}`}>
      {/* Label */}
      {label && (
        <label 
          htmlFor={id} 
          className={`block text-sm font-medium mb-2 ${
            isInvalid 
              ? 'text-red-600 dark:text-red-400' 
              : isValid 
                ? 'text-green-600 dark:text-green-400'
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
            <Icon className={`h-5 w-5 ${
              isInvalid 
                ? 'text-red-500' 
                : isValid 
                  ? 'text-green-500'
                  : 'text-gray-400'
            }`} />
          </div>
        )}

        {/* Input Field */}
        <input
          id={id}
          name={name}
          type={inputType}
          value={value}
          onChange={onChange}
          onBlur={handleBlur}
          required={required}
          disabled={disabled}
          placeholder={placeholder}
          className={`
            block w-full py-3 px-3
            ${Icon ? 'pl-10' : ''}
            ${isPassword || (showValidation && (isValid || isInvalid)) ? 'pr-10' : ''}
            border-2 rounded-lg
            transition-all duration-200
            text-gray-900 dark:text-white
            placeholder-gray-400 dark:placeholder-gray-500
            bg-white dark:bg-gray-800
            disabled:bg-gray-100 dark:disabled:bg-gray-900 disabled:cursor-not-allowed
            ${isInvalid 
              ? 'border-red-500 focus:ring-2 focus:ring-red-500/20 focus:border-red-500 bg-red-50/50 dark:bg-red-900/10' 
              : isValid
                ? 'border-green-500 focus:ring-2 focus:ring-green-500/20 focus:border-green-500 bg-green-50/50 dark:bg-green-900/10'
                : 'border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-[#B91C1C]/20 focus:border-[#B91C1C]'
            }
            ${inputClassName}
          `}
          {...props}
        />

        {/* Validation Icon (Right) */}
        {showValidation && !isPassword && (
          <>
            {isValid && (
              <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                <div className="w-5 h-5 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center">
                  <Check className="h-3.5 w-3.5 text-green-600 dark:text-green-400" strokeWidth={3} />
                </div>
              </div>
            )}
            {isInvalid && (
              <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                <div className="w-5 h-5 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center">
                  <X className="h-3.5 w-3.5 text-red-600 dark:text-red-400" strokeWidth={3} />
                </div>
              </div>
            )}
          </>
        )}

        {/* Password Toggle */}
        {isPassword && (
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute inset-y-0 right-0 pr-3 flex items-center z-10"
            tabIndex={-1}
          >
            {showPassword ? (
              <EyeOff className="h-5 w-5 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors" />
            ) : (
              <Eye className="h-5 w-5 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors" />
            )}
          </button>
        )}
      </div>

      {/* Invalid Feedback (Error Message) - Bootstrap style */}
      {isInvalid && (
        <div className="mt-2 text-sm text-red-600 dark:text-red-400 flex items-start animate-in fade-in slide-in-from-top-1 duration-200">
          <AlertCircle className="w-4 h-4 mr-1.5 flex-shrink-0 mt-0.5" />
          <span>{error}</span>
        </div>
      )}

      {/* Valid Feedback (Success Message) - Bootstrap style */}
      {isValid && successText && (
        <div className="mt-2 text-sm text-green-600 dark:text-green-400 flex items-start animate-in fade-in slide-in-from-top-1 duration-200">
          <Check className="w-4 h-4 mr-1.5 flex-shrink-0 mt-0.5" />
          <span>{successText}</span>
        </div>
      )}

      {/* Helper Text - Bootstrap form-text style */}
      {helperText && !isInvalid && !isValid && (
        <p className="mt-2 text-sm text-gray-500 dark:text-gray-400 flex items-center">
          <svg className="w-3.5 h-3.5 mr-1.5" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
          </svg>
          {helperText}
        </p>
      )}
    </div>
  );
}

