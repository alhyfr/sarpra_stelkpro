'use client'

import { AlertCircle, CheckCircle } from 'lucide-react'

// ============================================
// REUSABLE RADIO BUTTON COMPONENT
// ============================================
// Radio button group dengan validation & styling Bootstrap-like

export default function ARadio({
  id,
  name,
  label,
  value,
  onChange,
  options = [],      // Array of { value, label, description }
  required = false,
  disabled = false,
  error,
  helperText,
  className = '',
  inline = false,    // Horizontal layout
  ...props
}) {
  
  return (
    <div className={`w-full ${className}`}>
      {/* Label */}
      {label && (
        <label 
          className={`block text-sm font-medium mb-3 ${
            error 
              ? 'text-red-600 dark:text-red-400' 
              : 'text-gray-700 dark:text-gray-300'
          }`}
        >
          {label}
          {required && <span className="text-red-600 ml-1">*</span>}
        </label>
      )}

      {/* Radio Options */}
      <div className={`space-y-3 ${inline ? 'sm:flex sm:space-y-0 sm:space-x-4' : ''}`}>
        {options.map((option, index) => {
          const isSelected = value === option.value
          const optionId = `${id || name}-${index}`
          
          return (
            <label
              key={option.value}
              htmlFor={optionId}
              className={`
                relative flex items-start p-4 cursor-pointer
                border-2 rounded-lg transition-all duration-200
                ${disabled ? 'opacity-50 cursor-not-allowed' : 'hover:border-[#B91C1C]'}
                ${isSelected 
                  ? error
                    ? 'border-red-500 bg-red-50 dark:bg-red-900/10'
                    : 'border-[#B91C1C] bg-red-50 dark:bg-red-900/10'
                  : error
                    ? 'border-red-300 bg-red-50/30'
                    : 'border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800'
                }
                ${inline ? 'flex-1' : ''}
              `}
            >
              <div className="flex items-center h-5">
                <input
                  id={optionId}
                  name={name}
                  type="radio"
                  value={option.value}
                  checked={isSelected}
                  onChange={(e) => onChange && onChange(e)}
                  disabled={disabled}
                  className={`
                    w-4 h-4 cursor-pointer
                    ${error 
                      ? 'text-red-600 focus:ring-red-500' 
                      : 'text-[#B91C1C] focus:ring-[#B91C1C]'
                    }
                    border-gray-300 dark:border-gray-600
                  `}
                  {...props}
                />
              </div>
              
              <div className="ml-3 flex-1">
                <div className={`text-sm font-medium ${
                  isSelected 
                    ? 'text-[#B91C1C] dark:text-red-400' 
                    : 'text-gray-900 dark:text-white'
                }`}>
                  {option.label}
                </div>
                
                {option.description && (
                  <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    {option.description}
                  </div>
                )}
              </div>

              {/* Selected Indicator */}
              {isSelected && (
                <div className="ml-2">
                  <CheckCircle className="w-5 h-5 text-[#B91C1C]" />
                </div>
              )}
            </label>
          )
        })}
      </div>

      {/* Error Message */}
      {error && (
        <div className="mt-2 text-sm text-red-600 dark:text-red-400 flex items-start animate-in fade-in slide-in-from-top-1 duration-200">
          <AlertCircle className="w-4 h-4 mr-1.5 flex-shrink-0 mt-0.5" />
          <span>{error}</span>
        </div>
      )}

      {/* Helper Text */}
      {helperText && !error && (
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

