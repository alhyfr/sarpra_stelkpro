'use client'
import { useEffect, useState } from 'react'
import { createPortal } from 'react-dom'
import { X } from 'lucide-react'

export default function Modal({ 
  isOpen = false,
  show = false,      // Alternative prop name (alias for isOpen)
  onClose = null, 
  title = 'Modal', 
  children = null,
  size = 'md', // sm, md, lg, xl
  width = null, // custom width (e.g., '500px', '80%', '600px')
  height = null, // custom height (e.g., '400px', '80vh', 'auto')
  maxWidth = null, // custom max-width
  maxHeight = null, // custom max-height
  position = 'center', // 'center', 'top', 'top-start'
  backdropBlur = 'sm', // backdrop blur intensity ('none', 'sm', 'md', 'lg')
  closeOnOverlayClick = true,
  showCloseButton = true
}) {
  // Support both 'isOpen' and 'show' props for backward compatibility
  const isModalOpen = isOpen || show
  
  const [isVisible, setIsVisible] = useState(false)
  const [isAnimating, setIsAnimating] = useState(false)

  // Handle modal open/close animations
  useEffect(() => {
    if (isModalOpen) {
      setIsVisible(true)
      setIsAnimating(true)
      // Prevent body scroll when modal is open
      document.body.style.overflow = 'hidden'
    } else {
      setIsAnimating(false)
      // Delay hiding to allow close animation
      const timer = setTimeout(() => {
        setIsVisible(false)
        document.body.style.overflow = 'unset'
      }, 300) // Match animation duration
      
      return () => clearTimeout(timer)
    }
  }, [isModalOpen])

  // Handle escape key
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape' && isModalOpen && onClose) {
        onClose()
      }
    }

    if (isModalOpen) {
      document.addEventListener('keydown', handleEscape)
    }

    return () => {
      document.removeEventListener('keydown', handleEscape)
    }
  }, [isModalOpen, onClose])

  // Size classes
  const sizeClasses = {
    sm: 'max-w-md',
    md: 'max-w-lg',
    lg: 'max-w-2xl',
    xl: 'max-w-4xl'
  }

  // Build custom styles
  const customStyles = {}
  if (width) customStyles.width = width
  if (height) customStyles.height = height
  if (maxWidth) customStyles.maxWidth = maxWidth
  if (maxHeight) customStyles.maxHeight = maxHeight

  // Position classes
  const positionClasses = {
    'center': 'items-center',
    'top': 'items-start pt-16',
    'top-start': 'items-start justify-start pt-16 pl-16'
  }

  // Backdrop blur classes
  const backdropBlurClasses = {
    'none': 'backdrop-blur-none',
    'sm': 'backdrop-blur-sm',
    'md': 'backdrop-blur-md',
    'lg': 'backdrop-blur-lg'
  }

  // Build className for modal
  const modalClassName = `relative w-full transform overflow-hidden rounded-lg bg-white dark:bg-gray-800 shadow-xl transition-all ${
    !width && !maxWidth ? sizeClasses[size] : ''
  } ${!height && !maxHeight ? 'max-h-[90vh]' : ''}`

  if (!isVisible) return null

  const modalContent = (
    <div className={`fixed inset-0 z-[9999] flex justify-center p-4 transition-all duration-300 ease-out ${
      isAnimating ? 'opacity-100' : 'opacity-0'
    } ${positionClasses[position]}`}>
      {/* Backdrop with blur */}
      <div 
        className={`fixed inset-0 bg-black/50 dark:bg-black/70 transition-all duration-300 ease-out ${
          isAnimating 
            ? `${backdropBlurClasses[backdropBlur]}` 
            : 'backdrop-blur-none'
        }`}
        onClick={closeOnOverlayClick ? onClose : null}
      />
      
      {/* Modal */}
      <div 
        className={`${modalClassName} overflow-y-auto transition-all duration-300 ease-out transform relative z-10 ${
          isAnimating 
            ? 'opacity-100 scale-100 translate-y-0' 
            : 'opacity-0 scale-95 translate-y-4'
        }`}
        style={customStyles}
        onClick={(e) => e.stopPropagation()}
      >
          {/* Header */}
          <div className="flex items-center justify-between border-b border-gray-200 dark:border-gray-700 px-6 py-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
              {title}
            </h3>
            {showCloseButton && (
              <button
                onClick={onClose}
                className="text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            )}
          </div>

        {/* Content */}
        <div className="px-6 py-4">
          {children}
        </div>
      </div>

      {/* Custom CSS for smooth animations */}
      <style jsx>{`
        @keyframes modalFadeIn {
          from {
            opacity: 0;
            transform: scale(0.95) translateY(20px);
          }
          to {
            opacity: 1;
            transform: scale(1) translateY(0);
          }
        }
        
        @keyframes modalFadeOut {
          from {
            opacity: 1;
            transform: scale(1) translateY(0);
          }
          to {
            opacity: 0;
            transform: scale(0.95) translateY(20px);
          }
        }
        
        .modal-enter {
          animation: modalFadeIn 0.3s cubic-bezier(0.4, 0, 0.2, 1) forwards;
        }
        
        .modal-exit {
          animation: modalFadeOut 0.3s cubic-bezier(0.4, 0, 0.2, 1) forwards;
        }
        
        .modal-backdrop-enter {
          animation: fadeIn 0.3s ease-out forwards;
        }
        
        .modal-backdrop-exit {
          animation: fadeOut 0.3s ease-out forwards;
        }
        
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        
        @keyframes fadeOut {
          from { opacity: 1; }
          to { opacity: 0; }
        }
      `}</style>
    </div>
  )

  return typeof window !== 'undefined' ? createPortal(modalContent, document.body) : null
}
