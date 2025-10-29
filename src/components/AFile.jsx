'use client'

import { useState, useRef, useEffect } from 'react'
import { Upload, X, FileIcon, ImageIcon, AlertCircle, FileText } from 'lucide-react'
import Image from 'next/image'

// ============================================
// REUSABLE FILE UPLOAD COMPONENT
// ============================================
// Component untuk upload file dengan preview, drag & drop, validasi

export default function AFile({
  id,
  name,
  label,
  value,           // File object atau URL string
  onChange,        // Function(file)
  onRemove,        // Function()
  accept = '*/*',  // File types yang diterima
  maxSize = 5,     // Max file size in MB
  required = false,
  disabled = false,
  error,
  helperText,
  preview = true,  // Show image preview
  className = '',
  ...props
}) {
  const [isDragging, setIsDragging] = useState(false)
  const [previewUrl, setPreviewUrl] = useState(null)
  const fileInputRef = useRef(null)

  // Cleanup URL object on unmount
  useEffect(() => {
    return () => {
      if (previewUrl) {
        try {
          URL.revokeObjectURL(previewUrl)
        } catch (error) {
          console.warn('Error revoking URL on cleanup:', error)
        }
      }
    }
  }, [previewUrl])

  // Get file type info
  const getFileType = () => {
    if (value instanceof File) {
      return {
        type: value.type,
        name: value.name,
        isImage: value.type.startsWith('image/'),
        isPdf: value.type === 'application/pdf',
        extension: value.name.split('.').pop()?.toLowerCase()
      }
    }
    
    if (typeof value === 'string' && value) {
      const extension = value.split('.').pop()?.toLowerCase()
      return {
        type: 'url',
        name: value,
        isImage: ['jpg', 'jpeg', 'png', 'gif', 'webp'].includes(extension),
        isPdf: extension === 'pdf',
        extension
      }
    }
    
    return null
  }

  // Get preview URL
  const getPreviewUrl = () => {
    if (previewUrl) return previewUrl
    
    // Handle File object
    if (value instanceof File) {
      try {
        return URL.createObjectURL(value)
      } catch (error) {
        console.error('Error creating object URL:', error)
        return null
      }
    }
    
    // Check if value is valid URL string
    if (typeof value === 'string' && value) {
      // If it's already a full URL (http/https), return as is
      if (value.startsWith('http://') || value.startsWith('https://')) {
        return value
      }
      
      // If it's a relative path or filename, construct full URL
      if (value.startsWith('/') || value.includes('.')) {
        const baseURL = process.env.NEXT_PUBLIC_API_STORAGE || 'http://localhost:8000/api'
        return value.startsWith('/') ? `${baseURL}${value}` : `${baseURL}/${value}`
      }
      
      // Try to create URL object to validate
      try {
        new URL(value)
        return value  // Valid URL from server
      } catch {
        console.warn('Invalid URL for preview:', value)
        return null  // Invalid, no preview
      }
    }
    
    return null
  }

  // Handle file selection
  const handleFileSelect = (file) => {
    if (!file) return

    // Validate file type
    if (accept && accept !== '*/*') {
      const acceptedTypes = accept.split(',').map(t => t.trim())
      const fileType = file.type
      const fileExtension = '.' + file.name.split('.').pop()
      
      const isAccepted = acceptedTypes.some(type => {
        if (type.startsWith('.')) {
          return fileExtension === type
        }
        return fileType.match(type.replace('*', '.*'))
      })

      if (!isAccepted) {
        alert(`File type tidak diperbolehkan. Hanya menerima: ${accept}`)
        return
      }
    }

    // Validate file size
    const fileSizeMB = file.size / (1024 * 1024)
    if (fileSizeMB > maxSize) {
      alert(`Ukuran file terlalu besar. Maksimal ${maxSize}MB`)
      return
    }

    // Create preview for images and PDFs
    if (file.type.startsWith('image/') || file.type === 'application/pdf') {
      try {
        const url = URL.createObjectURL(file)
        setPreviewUrl(url)
      } catch (error) {
        console.error('Error creating preview URL:', error)
      }
    }

    // Call onChange handler
    if (onChange) {
      onChange({ target: { name, value: file } })
    }
  }

  // Handle input change
  const handleChange = (e) => {
    const file = e.target.files?.[0]
    handleFileSelect(file)
  }

  // Handle drag events
  const handleDragOver = (e) => {
    e.preventDefault()
    setIsDragging(true)
  }

  const handleDragLeave = (e) => {
    e.preventDefault()
    setIsDragging(false)
  }

  const handleDrop = (e) => {
    e.preventDefault()
    setIsDragging(false)
    
    const file = e.dataTransfer.files?.[0]
    handleFileSelect(file)
  }

  // Handle remove file
  const handleRemove = (e) => {
    e.stopPropagation()
    
    // Revoke preview URL
    if (previewUrl) {
      try {
        URL.revokeObjectURL(previewUrl)
      } catch (error) {
        console.warn('Error revoking URL:', error)
      }
      setPreviewUrl(null)
    }

    // Reset input
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }

    // Call handlers
    if (onRemove) {
      onRemove()
    }
    if (onChange) {
      onChange({ target: { name, value: null } })
    }
  }

  // Click handler
  const handleClick = () => {
    if (!disabled) {
      fileInputRef.current?.click()
    }
  }

  const currentPreview = getPreviewUrl()
  const fileType = getFileType()
  const hasFile = value || currentPreview

  return (
    <div className={`w-full ${className}`}>
      {/* Label */}
      {label && (
        <label 
          htmlFor={id}
          className={`block text-sm font-medium mb-2 ${
            error 
              ? 'text-red-600 dark:text-red-400' 
              : 'text-gray-700 dark:text-gray-300'
          }`}
        >
          {label}
          {required && <span className="text-red-600 ml-1">*</span>}
        </label>
      )}

      {/* Upload Area */}
      <div
        onClick={handleClick}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={`
          relative border-2 border-dashed rounded-lg p-4
          transition-all duration-200 cursor-pointer
          ${disabled ? 'opacity-50 cursor-not-allowed' : 'hover:border-[#B91C1C]'}
          ${isDragging ? 'border-[#B91C1C] bg-red-50 dark:bg-red-900/10' : ''}
          ${error 
            ? 'border-red-500 bg-red-50/50 dark:bg-red-900/10' 
            : 'border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800'
          }
        `}
      >
        {/* Hidden File Input */}
        <input
          ref={fileInputRef}
          type="file"
          id={id}
          name={name}
          accept={accept}
          onChange={handleChange}
          disabled={disabled}
          className="hidden"
          {...props}
        />

        {/* Preview or Upload Prompt */}
        {hasFile && preview && currentPreview ? (
          <div className="space-y-3">
            {/* File Preview */}
            <div className="relative w-full h-48 bg-gray-100 dark:bg-gray-800 rounded-lg overflow-hidden">
              {fileType?.isImage ? (
                <Image
                  src={currentPreview}
                  alt="Preview"
                  fill
                  className="object-contain"
                  onError={(e) => {
                    console.warn('Error loading image preview')
                    e.target.style.display = 'none'
                  }}
                />
              ) : fileType?.isPdf ? (
                <div className="flex flex-col items-center justify-center h-full text-gray-500 dark:text-gray-400">
                  <FileText className="w-16 h-16 mb-2" />
                  <p className="text-sm font-medium">PDF Preview</p>
                  <p className="text-xs">Klik untuk membuka</p>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center h-full text-gray-500 dark:text-gray-400">
                  <FileIcon className="w-16 h-16 mb-2" />
                  <p className="text-sm font-medium">File Preview</p>
                  <p className="text-xs">Klik untuk membuka</p>
                </div>
              )}
            </div>

            {/* File Info & Remove Button */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                {fileType?.isImage ? (
                  <ImageIcon className="w-4 h-4" />
                ) : fileType?.isPdf ? (
                  <FileText className="w-4 h-4" />
                ) : (
                  <FileIcon className="w-4 h-4" />
                )}
                <span className="truncate">
                  {value?.name || 'File terpilih'}
                </span>
                {value?.size && (
                  <span className="text-xs">
                    ({(value.size / 1024).toFixed(1)} KB)
                  </span>
                )}
              </div>
              <button
                type="button"
                onClick={handleRemove}
                className="p-1.5 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
        ) : (
          <div className="text-center py-6">
            {/* Upload Icon */}
            <div className="mx-auto w-12 h-12 mb-3 flex items-center justify-center rounded-full bg-gray-100 dark:bg-gray-700">
              <Upload className={`w-6 h-6 ${
                isDragging ? 'text-[#B91C1C]' : 'text-gray-400'
              }`} />
            </div>

            {/* Upload Text */}
            <div className="text-sm">
              <p className="font-medium text-gray-900 dark:text-white mb-1">
                {isDragging ? 'Drop file di sini' : 'Klik untuk upload atau drag & drop'}
              </p>
              <p className="text-gray-500 dark:text-gray-400 text-xs">
                {accept === 'image/*' ? 'PNG, JPG, JPEG' : 
                 accept === 'application/pdf' ? 'PDF' :
                 accept === '*/*' ? 'Semua file' : accept} (Max {maxSize}MB)
              </p>
            </div>
          </div>
        )}
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

