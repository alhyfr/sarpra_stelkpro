'use client'
import { useState, useEffect, useRef } from 'react'
import { Search, ChevronDown, X } from 'lucide-react'

export default function ASearchableSelect({
  id,
  name,
  label,
  placeholder = "Cari...",
  value = "",
  onChange,
  onSelect,
  error = "",
  required = false,
  disabled = false,
  className = "",
  options = [],
  searchFunction,
  displayKey = "label",
  valueKey = "value",
  searchKey = "search",
  loading = false,
  noResultsText = "Tidak ada hasil ditemukan",
  minSearchLength = 2
}) {
  const [isOpen, setIsOpen] = useState(false)
  const [searchTerm, setSearchTerm] = useState("")
  const [filteredOptions, setFilteredOptions] = useState([])
  const [selectedItem, setSelectedItem] = useState(null)
  const [isLoading, setIsLoading] = useState(false)
  const inputRef = useRef(null)
  const dropdownRef = useRef(null)

  // Initialize selected item when value changes - simplified
  useEffect(() => {
    if (value && options && options.length > 0) {
      const item = options.find(option => option[valueKey] == value)
      if (item) {
        setSelectedItem(item)
        setSearchTerm(item[displayKey] || item[searchKey] || "")
      }
    } else if (!value) {
      setSelectedItem(null)
      setSearchTerm("")
    }
  }, [value, options, valueKey, displayKey, searchKey])

  // Handle search with debouncing
  useEffect(() => {
    if (searchTerm.length >= minSearchLength) {
      if (searchFunction) {
        setIsLoading(true)
        
        // Debounce search function calls
        const timeoutId = setTimeout(() => {
          searchFunction(searchTerm)
            .then((results) => {
              setFilteredOptions(results || [])
            })
            .catch((error) => {
              console.error('Search error:', error)
              setFilteredOptions([])
            })
            .finally(() => {
              setIsLoading(false)
            })
        }, 300) // 300ms debounce

        return () => clearTimeout(timeoutId)
      } else if (options && options.length > 0) {
        // Local filtering
        const filtered = options.filter(option => {
          const searchText = option[searchKey] || option[displayKey] || ""
          return searchText.toLowerCase().includes(searchTerm.toLowerCase())
        })
        setFilteredOptions(filtered)
      }
    } else if (searchTerm.length === 0) {
      setFilteredOptions([])
    }
  }, [searchTerm, searchFunction, minSearchLength, searchKey, displayKey])

  // Use filtered options or all options
  const displayOptions = searchTerm.length >= minSearchLength ? filteredOptions : (options || [])

  // Handle input change
  const handleInputChange = (e) => {
    const newSearchTerm = e.target.value
    setSearchTerm(newSearchTerm)
    setIsOpen(true)
    
    // Call onChange for controlled input
    if (onChange) {
      onChange({
        target: {
          name: name,
          value: newSearchTerm
        }
      })
    }
  }

  // Handle option selection
  const handleSelectOption = (option) => {
    setSelectedItem(option)
    setSearchTerm(option[displayKey] || option[searchKey] || "")
    setIsOpen(false)
    
    // Call onSelect callback
    if (onSelect) {
      onSelect(option)
    }
    
    // Call onChange for controlled input
    if (onChange) {
      onChange({
        target: {
          name: name,
          value: option[valueKey]
        }
      })
    }
  }

  // Handle clear selection
  const handleClear = () => {
    setSelectedItem(null)
    setSearchTerm("")
    setIsOpen(false)
    
    if (onChange) {
      onChange({
        target: {
          name: name,
          value: ""
        }
      })
    }
  }

  // Handle input focus
  const handleFocus = () => {
    setIsOpen(true)
    if (searchTerm.length >= minSearchLength && searchFunction) {
      searchFunction(searchTerm)
    }
  }

  // Handle click outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  return (
    <div className={`relative ${className}`}>
      {/* Label */}
      {label && (
        <label 
          htmlFor={id} 
          className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
        >
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}

      {/* Input Container */}
      <div className="relative" ref={dropdownRef}>
        <div className="relative">
          {/* Search Icon */}
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-5 w-5 text-gray-400" />
          </div>

          {/* Input */}
          <input
            ref={inputRef}
            id={id}
            name={name}
            type="text"
            value={searchTerm}
            onChange={handleInputChange}
            onFocus={handleFocus}
            placeholder={placeholder}
            disabled={disabled}
            className={`
              w-full pl-10 pr-20 py-2 border rounded-lg
              focus:ring-2 focus:ring-red-500 focus:border-red-500
              transition-colors duration-200
              ${error 
                ? 'border-red-500 bg-red-50 dark:bg-red-900/20' 
                : 'border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700'
              }
              ${disabled 
                ? 'bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400 cursor-not-allowed' 
                : 'text-gray-900 dark:text-gray-100'
              }
              placeholder-gray-500 dark:placeholder-gray-400
            `}
            autoComplete="off"
          />

          {/* Right Icons */}
          <div className="absolute inset-y-0 right-0 flex items-center">
            {/* Clear Button */}
            {searchTerm && !disabled && (
              <button
                type="button"
                onClick={handleClear}
                className="p-1 mr-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
              >
                <X className="h-4 w-4" />
              </button>
            )}

            {/* Dropdown Arrow */}
            <button
              type="button"
              onClick={() => setIsOpen(!isOpen)}
              disabled={disabled}
              className="p-1 mr-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors disabled:cursor-not-allowed"
            >
              <ChevronDown className={`h-4 w-4 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
            </button>
          </div>
        </div>

        {/* Dropdown */}
        {isOpen && (
          <div className="absolute z-50 w-full mt-1 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg shadow-lg max-h-60 overflow-y-auto">
            {/* Loading State */}
            {(isLoading || loading) && (
              <div className="px-4 py-3 text-center text-gray-500 dark:text-gray-400">
                <div className="flex items-center justify-center">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-red-500 mr-2"></div>
                  Mencari...
                </div>
              </div>
            )}

            {/* No Results */}
            {!isLoading && !loading && displayOptions.length === 0 && searchTerm.length >= minSearchLength && (
              <div className="px-4 py-3 text-center text-gray-500 dark:text-gray-400">
                {noResultsText}
              </div>
            )}

            {/* Options */}
            {!isLoading && !loading && displayOptions.length > 0 && (
              <div className="py-1">
                {displayOptions.map((option, index) => (
                  <button
                    key={option.id || option[valueKey] || `${option[displayKey]}-${index}`}
                    type="button"
                    onClick={() => handleSelectOption(option)}
                    className="w-full px-4 py-2 text-left hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-gray-900 dark:text-gray-100">
                        {option[displayKey] || option[searchKey] || option.nabar || option.name}
                      </span>
                      {option.kode && (
                        <span className="text-xs text-gray-500 dark:text-gray-400 ml-2">
                          {option.kode}
                        </span>
                      )}
                    </div>
                    {option.spec && (
                      <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                        {option.spec}
                      </div>
                    )}
                  </button>
                ))}
              </div>
            )}

            {/* Search Hint */}
            {searchTerm.length > 0 && searchTerm.length < minSearchLength && (
              <div className="px-4 py-3 text-center text-gray-500 dark:text-gray-400 text-sm">
                Ketik minimal {minSearchLength} karakter untuk mencari
              </div>
            )}
          </div>
        )}
      </div>

      {/* Error Message */}
      {error && (
        <p className="mt-1 text-sm text-red-600 dark:text-red-400">
          {error}
        </p>
      )}
    </div>
  )
}
