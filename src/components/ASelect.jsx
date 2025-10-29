'use client'

import { useState } from 'react'
import { ChevronDown, AlertCircle, Check } from 'lucide-react'

// ============================================
// REUSABLE SELECT/DROPDOWN COMPONENT
// ============================================
// Select dropdown dengan validation & styling Bootstrap-like

export default function ASelect({
  id,
  name,
  label,
  value,
  onChange,
  onBlur,
  options = [],      // Array of { value, label, description }
  placeholder = 'Pilih...',
  required = false,
  disabled = false,
  error,
  valid = false,
  helperText,
  successText,
  icon: Icon,
  showValidation = true,
  className = '',
  selectClassName = '',
  ...props
}) {
  const [touched, setTouched] = useState(false)
  const [isFocused, setIsFocused] = useState(false)
  
  // Determine validation state
  const isInvalid = touched && error
  const isValid = touched && valid && !error && value
  
  // Handle blur to mark as touched
  const handleBlur = (e) => {
    setTouched(true)
    setIsFocused(false)
    if (onBlur) onBlur(e)
  }

  const handleFocus = () => {
    setIsFocused(true)
  }

  // Get label dari value
  const getSelectedLabel = () => {
    if (!value) return placeholder
    const selected = options.find(opt => opt.value === value)
    return selected ? selected.label : value
  }

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

      {/* Select Container */}
      <div className="relative">
        {/* Left Icon */}
        {Icon && (
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none z-10">
            <Icon className={`h-5 w-5 ${
              isInvalid 
                ? 'text-red-500' 
                : isValid 
                  ? 'text-green-500'
                  : 'text-gray-400'
            }`} />
          </div>
        )}

        {/* Select Field */}
        <select
          id={id}
          name={name}
          value={value}
          onChange={onChange}
          onBlur={handleBlur}
          onFocus={handleFocus}
          disabled={disabled}
          className={`
            block w-full py-3 px-3
            ${Icon ? 'pl-10' : ''}
            pr-10
            border-2 rounded-lg
            transition-all duration-200
            text-gray-900 dark:text-white
            bg-white dark:bg-gray-800
            disabled:bg-gray-100 dark:disabled:bg-gray-900 disabled:cursor-not-allowed
            appearance-none
            ${isInvalid 
              ? 'border-red-500 focus:ring-2 focus:ring-red-500/20 focus:border-red-500 bg-red-50/50 dark:bg-red-900/10' 
              : isValid
                ? 'border-green-500 focus:ring-2 focus:ring-green-500/20 focus:border-green-500 bg-green-50/50 dark:bg-green-900/10'
                : 'border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-[#B91C1C]/20 focus:border-[#B91C1C]'
            }
            ${!value ? 'text-gray-400' : ''}
            ${selectClassName}
          `}
          {...props}
        >
          {/* Placeholder Option */}
          <option value="" disabled hidden>
            {placeholder}
          </option>
          
          {/* Options */}
          {options.map((option) => (
            <option 
              key={option.value} 
              value={option.value}
              className="text-gray-900"
            >
              {option.label}
            </option>
          ))}
        </select>

        {/* Chevron Icon */}
        <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
          <ChevronDown className={`h-5 w-5 transition-transform duration-200 ${
            isFocused ? 'rotate-180' : ''
          } ${
            isInvalid 
              ? 'text-red-500' 
              : isValid 
                ? 'text-green-500'
                : 'text-gray-400'
          }`} />
        </div>

        {/* Validation Icon (overlaps with chevron when needed) */}
        {showValidation && !isFocused && (
          <>
            {isValid && (
              <div className="absolute inset-y-0 right-8 pr-3 flex items-center pointer-events-none">
                <div className="w-5 h-5 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center">
                  <Check className="h-3.5 w-3.5 text-green-600 dark:text-green-400" strokeWidth={3} />
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* Invalid Feedback (Error Message) */}
      {isInvalid && (
        <div className="mt-2 text-sm text-red-600 dark:text-red-400 flex items-start animate-in fade-in slide-in-from-top-1 duration-200">
          <AlertCircle className="w-4 h-4 mr-1.5 flex-shrink-0 mt-0.5" />
          <span>{error}</span>
        </div>
      )}

      {/* Valid Feedback (Success Message) */}
      {isValid && successText && (
        <div className="mt-2 text-sm text-green-600 dark:text-green-400 flex items-start animate-in fade-in slide-in-from-top-1 duration-200">
          <Check className="w-4 h-4 mr-1.5 flex-shrink-0 mt-0.5" />
          <span>{successText}</span>
        </div>
      )}

      {/* Helper Text */}
      {helperText && !isInvalid && !isValid && (
        <p className="mt-2 text-sm text-gray-500 dark:text-gray-400 flex items-center">
          <svg className="w-3.5 h-3.5 mr-1.5" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
          </svg>
          {helperText}
        </p>
      )}
    </div>
  )
}

