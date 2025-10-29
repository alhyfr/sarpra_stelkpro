'use client'

import { useEffect, useState } from 'react'
import { createPortal } from 'react-dom'
import { X, ZoomIn, ZoomOut, Download, ChevronLeft, ChevronRight } from 'lucide-react'

/**
 * ImageView Component - Reusable image viewer/lightbox
 * 
 * @param {boolean} show - Show/hide modal
 * @param {function} onClose - Callback when modal is closed
 * @param {string|array} images - Single image URL or array of image URLs
 * @param {number} initialIndex - Initial image index (for multiple images)
 * @param {string} alt - Alt text for image
 * @param {string} title - Title text to display
 * @param {string} description - Description text to display
 * 
 * @example
 * // Single image
 * <ImageView 
 *   show={showImage} 
 *   onClose={() => setShowImage(false)} 
 *   images="https://example.com/image.jpg"
 *   title="Profile Photo"
 * />
 * 
 * @example
 * // Multiple images with navigation
 * <ImageView 
 *   show={showImage} 
 *   onClose={() => setShowImage(false)} 
 *   images={['image1.jpg', 'image2.jpg', 'image3.jpg']}
 *   initialIndex={0}
 *   title="Photo Gallery"
 * />
 */
export default function ImageView({ 
  show = false, 
  onClose, 
  images, 
  initialIndex = 0,
  alt = 'Image',
  title,
  description
}) {
  const [mounted, setMounted] = useState(false)
  const [currentIndex, setCurrentIndex] = useState(initialIndex)
  const [scale, setScale] = useState(1)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)

  // Convert single image to array
  const imageArray = Array.isArray(images) ? images : images ? [images] : []
  const currentImage = imageArray[currentIndex]
  const hasMultipleImages = imageArray.length > 1

  useEffect(() => {
    setMounted(true)
    return () => setMounted(false)
  }, [])

  useEffect(() => {
    setCurrentIndex(initialIndex)
  }, [initialIndex])

  useEffect(() => {
    if (show) {
      setScale(1)
      setLoading(true)
      setError(false)
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = 'unset'
    }

    return () => {
      document.body.style.overflow = 'unset'
    }
  }, [show])

  // Keyboard navigation
  useEffect(() => {
    if (!show) return

    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        onClose?.()
      } else if (e.key === 'ArrowLeft' && hasMultipleImages) {
        handlePrev()
      } else if (e.key === 'ArrowRight' && hasMultipleImages) {
        handleNext()
      } else if (e.key === '+' || e.key === '=') {
        handleZoomIn()
      } else if (e.key === '-') {
        handleZoomOut()
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [show, currentIndex, hasMultipleImages, scale])

  const handlePrev = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1)
      setScale(1)
      setLoading(true)
      setError(false)
    }
  }

  const handleNext = () => {
    if (currentIndex < imageArray.length - 1) {
      setCurrentIndex(currentIndex + 1)
      setScale(1)
      setLoading(true)
      setError(false)
    }
  }

  const handleZoomIn = () => {
    setScale(prev => Math.min(prev + 0.25, 3))
  }

  const handleZoomOut = () => {
    setScale(prev => Math.max(prev - 0.25, 0.5))
  }

  const handleDownload = () => {
    if (!currentImage) return
    
    const link = document.createElement('a')
    link.href = currentImage
    link.download = `image-${currentIndex + 1}.jpg`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  const handleImageLoad = () => {
    setLoading(false)
    setError(false)
  }

  const handleImageError = () => {
    setLoading(false)
    setError(true)
  }

  if (!mounted || !show) return null

  return createPortal(
    <div 
      className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/90 backdrop-blur-sm animate-fadeIn"
      onClick={onClose}
    >
      {/* Header */}
      <div className="absolute top-0 left-0 right-0 z-10 bg-gradient-to-b from-black/50 to-transparent p-4">
        <div className="max-w-7xl mx-auto flex items-start justify-between">
          <div className="flex-1 mr-4">
            {title && (
              <h3 className="text-white text-lg font-semibold mb-1">{title}</h3>
            )}
            {description && (
              <p className="text-gray-300 text-sm">{description}</p>
            )}
            {hasMultipleImages && (
              <p className="text-gray-400 text-sm mt-1">
                {currentIndex + 1} / {imageArray.length}
              </p>
            )}
          </div>
          
          {/* Close Button */}
          <button
            onClick={onClose}
            className="p-2 rounded-lg bg-white/10 hover:bg-white/20 text-white transition-colors"
            aria-label="Close"
          >
            <X size={24} />
          </button>
        </div>
      </div>

      {/* Image Container */}
      <div 
        className="relative w-full h-full flex items-center justify-center p-20"
        onClick={(e) => e.stopPropagation()}
      >
        {loading && !error && (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-12 h-12 border-4 border-white/30 border-t-white rounded-full animate-spin" />
          </div>
        )}

        {error ? (
          <div className="text-center text-white">
            <div className="text-6xl mb-4">🖼️</div>
            <p className="text-xl font-semibold mb-2">Gambar tidak dapat dimuat</p>
            <p className="text-gray-400">File mungkin tidak ditemukan atau rusak</p>
          </div>
        ) : (
          currentImage && (
            <img
              src={currentImage}
              alt={alt}
              className="max-w-full max-h-full object-contain transition-transform duration-200 select-none"
              style={{ transform: `scale(${scale})` }}
              onLoad={handleImageLoad}
              onError={handleImageError}
              onClick={(e) => e.stopPropagation()}
            />
          )
        )}
      </div>

      {/* Navigation Arrows (for multiple images) */}
      {hasMultipleImages && !error && (
        <>
          <button
            onClick={(e) => {
              e.stopPropagation()
              handlePrev()
            }}
            disabled={currentIndex === 0}
            className={`absolute left-4 top-1/2 -translate-y-1/2 p-3 rounded-full bg-white/10 hover:bg-white/20 text-white transition-all ${
              currentIndex === 0 ? 'opacity-30 cursor-not-allowed' : ''
            }`}
            aria-label="Previous image"
          >
            <ChevronLeft size={32} />
          </button>
          
          <button
            onClick={(e) => {
              e.stopPropagation()
              handleNext()
            }}
            disabled={currentIndex === imageArray.length - 1}
            className={`absolute right-4 top-1/2 -translate-y-1/2 p-3 rounded-full bg-white/10 hover:bg-white/20 text-white transition-all ${
              currentIndex === imageArray.length - 1 ? 'opacity-30 cursor-not-allowed' : ''
            }`}
            aria-label="Next image"
          >
            <ChevronRight size={32} />
          </button>
        </>
      )}

      {/* Bottom Controls */}
      {!error && (
        <div className="absolute bottom-0 left-0 right-0 z-10 bg-gradient-to-t from-black/50 to-transparent p-4">
          <div className="max-w-7xl mx-auto flex items-center justify-center gap-2">
            {/* Zoom Out */}
            <button
              onClick={(e) => {
                e.stopPropagation()
                handleZoomOut()
              }}
              disabled={scale <= 0.5}
              className={`p-2 rounded-lg bg-white/10 hover:bg-white/20 text-white transition-colors ${
                scale <= 0.5 ? 'opacity-30 cursor-not-allowed' : ''
              }`}
              aria-label="Zoom out"
            >
              <ZoomOut size={20} />
            </button>

            {/* Scale Indicator */}
            <div className="px-4 py-2 rounded-lg bg-white/10 text-white text-sm font-medium min-w-[80px] text-center">
              {Math.round(scale * 100)}%
            </div>

            {/* Zoom In */}
            <button
              onClick={(e) => {
                e.stopPropagation()
                handleZoomIn()
              }}
              disabled={scale >= 3}
              className={`p-2 rounded-lg bg-white/10 hover:bg-white/20 text-white transition-colors ${
                scale >= 3 ? 'opacity-30 cursor-not-allowed' : ''
              }`}
              aria-label="Zoom in"
            >
              <ZoomIn size={20} />
            </button>

            {/* Download */}
            <button
              onClick={(e) => {
                e.stopPropagation()
                handleDownload()
              }}
              className="p-2 rounded-lg bg-white/10 hover:bg-white/20 text-white transition-colors ml-2"
              aria-label="Download image"
            >
              <Download size={20} />
            </button>
          </div>
        </div>
      )}
    </div>,
    document.body
  )
}

