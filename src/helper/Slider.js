'use client'
import { useState, useEffect, useRef } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import Image from 'next/image'
import { motion, AnimatePresence } from 'framer-motion'

// Base URL untuk menggabungkan relative path dari foto_url
const STORAGE_URL = process.env.NEXT_PUBLIC_API_STORAGE || process.env.NEXT_PUBLIC_API_URL || ''

// Helper function untuk mendapatkan full URL dari foto_url
const getImageUrl = (url) => {
    if (!url) return ''

    // Jika sudah full URL (http/https), gunakan langsung
    if (url.startsWith('http://') || url.startsWith('https://')) {
        return url
    }

    // Jika tidak ada STORAGE_URL, return url as is
    if (!STORAGE_URL) {
        return url
    }

    // Normalisasi STORAGE_URL (hapus trailing slash)
    const baseUrl = STORAGE_URL.replace(/\/+$/, '')

    // Jika foto_url dimulai dengan /api/storage/, dan baseUrl sudah berakhir dengan /api/storage
    // Maka gunakan baseUrl + sisa path setelah /api/storage/
    if (url.startsWith('/api/storage/') && baseUrl.endsWith('/api/storage')) {
        const remainingPath = url.substring('/api/storage/'.length)
        return `${baseUrl}/${remainingPath}`
    }

    // Jika foto_url dimulai dengan /api/, dan baseUrl berakhir dengan /api
    // Maka gunakan baseUrl + sisa path setelah /api/
    if (url.startsWith('/api/') && baseUrl.endsWith('/api')) {
        const remainingPath = url.substring('/api/'.length)
        return `${baseUrl}/${remainingPath}`
    }

    // Jika foto_url dimulai dengan /api/, gabungkan langsung (baseUrl mungkin tidak berakhir dengan /api)
    if (url.startsWith('/api/')) {
        return `${baseUrl}${url}`
    }

    // Jika url tidak dimulai dengan /api/, normalisasi dan gabungkan
    const path = url.startsWith('/') ? url.substring(1) : url
    return `${baseUrl}/${path}`
}

export default function Slider({
    images = [],
    autoPlay = false,
    interval = 3000,
    showDots = true,
    showArrows = true,
    height = 'h-48', // Default height, bisa berupa Tailwind class atau number (px)
    objectFit = 'cover', // 'cover', 'contain', 'fill', 'none', 'scale-down'
    className = '',
    onSlideChange = null // Callback untuk memberitahu parent saat slide berubah
}) {
    const [currentIndex, setCurrentIndex] = useState(0)
    const [isHovered, setIsHovered] = useState(false)
    const intervalRef = useRef(null)

    // Notify parent when currentIndex changes
    useEffect(() => {
        if (onSlideChange && typeof onSlideChange === 'function') {
            onSlideChange(currentIndex)
        }
    }, [currentIndex, onSlideChange])

    // Auto-play functionality
    useEffect(() => {
        if (autoPlay && !isHovered && images.length > 1) {
            intervalRef.current = setInterval(() => {
                setCurrentIndex((prevIndex) =>
                    prevIndex === images.length - 1 ? 0 : prevIndex + 1
                )
            }, interval)
        }

        return () => {
            if (intervalRef.current) {
                clearInterval(intervalRef.current)
            }
        }
    }, [autoPlay, interval, images.length, isHovered])

    const [direction, setDirection] = useState(0) // 1 untuk next, -1 untuk previous

    const goToPrevious = () => {
        setDirection(-1)
        setCurrentIndex((prevIndex) =>
            prevIndex === 0 ? images.length - 1 : prevIndex - 1
        )
    }

    const goToNext = () => {
        setDirection(1)
        setCurrentIndex((prevIndex) =>
            prevIndex === images.length - 1 ? 0 : prevIndex + 1
        )
    }

    const goToSlide = (index) => {
        setDirection(index > currentIndex ? 1 : -1)
        setCurrentIndex(index)
    }

    // Variants untuk animasi slide
    const slideVariants = {
        enter: (direction) => ({
            x: direction > 0 ? 1000 : -1000,
            opacity: 0,
            scale: 0.8
        }),
        center: {
            zIndex: 1,
            x: 0,
            opacity: 1,
            scale: 1
        },
        exit: (direction) => ({
            zIndex: 0,
            x: direction < 0 ? 1000 : -1000,
            opacity: 0,
            scale: 0.8
        })
    }

    const transition = {
        x: { type: "spring", stiffness: 300, damping: 30 },
        opacity: { duration: 0.4 },
        scale: { duration: 0.4 }
    }

    // Convert height to className and style
    const heightStyle = typeof height === 'number' ? { height: `${height}px` } : {}
    const heightClassName = typeof height === 'number'
        ? ''
        : (height.startsWith('h-') ? height : `h-${height}`)

    if (!images || images.length === 0) {
        return (
            <div
                className={`flex items-center justify-center bg-gray-100 dark:bg-gray-700 rounded-lg ${heightClassName}`}
                style={heightStyle}
            >
                <p className="text-gray-500 dark:text-gray-400">Tidak ada gambar</p>
            </div>
        )
    }

    if (images.length === 1) {
        const rawUrl = typeof images[0] === 'string'
            ? images[0]
            : images[0].url || images[0]
        const imageUrl = getImageUrl(rawUrl)

        return (
            <div
                className={`relative w-full rounded-lg overflow-hidden ${heightClassName} ${className}`}
                style={heightStyle}
            >
                <Image
                    src={imageUrl}
                    alt={typeof images[0] === 'string' ? 'Slide image' : (images[0].alt || 'Slide image')}
                    fill
                    className={`object-${objectFit}`}
                    unoptimized
                />
            </div>
        )
    }

    return (
        <div
            className={`relative w-full rounded-lg overflow-hidden group ${heightClassName} ${className}`}
            style={heightStyle}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
        >
            {/* Images dengan Framer Motion */}
            <div className="relative w-full h-full">
                <AnimatePresence initial={false} custom={direction}>
                    <motion.div
                        key={currentIndex}
                        custom={direction}
                        variants={slideVariants}
                        initial="enter"
                        animate="center"
                        exit="exit"
                        transition={transition}
                        className="absolute inset-0"
                    >
                        <Image
                            src={getImageUrl(
                                typeof images[currentIndex] === 'string'
                                    ? images[currentIndex]
                                    : images[currentIndex]?.url || images[currentIndex]
                            )}
                            alt={typeof images[currentIndex] === 'string'
                                ? `Slide ${currentIndex + 1}`
                                : (images[currentIndex]?.alt || `Slide ${currentIndex + 1}`)}
                            fill
                            className={`object-${objectFit}`}
                            unoptimized
                        />
                    </motion.div>
                </AnimatePresence>
            </div>

            {/* Navigation Arrows dengan Framer Motion */}
            {showArrows && (
                <>
                    <motion.button
                        onClick={goToPrevious}
                        className="absolute left-2 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white p-2 rounded-full backdrop-blur-sm z-10 opacity-0 group-hover:opacity-100"
                        whileHover={{ scale: 1.1, backgroundColor: "rgba(0,0,0,0.7)" }}
                        whileTap={{ scale: 0.9 }}
                        transition={{ duration: 0.2 }}
                        aria-label="Previous slide"
                    >
                        <ChevronLeft className="w-5 h-5" />
                    </motion.button>
                    <motion.button
                        onClick={goToNext}
                        className="absolute right-2 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white p-2 rounded-full backdrop-blur-sm z-10 opacity-0 group-hover:opacity-100"
                        whileHover={{ scale: 1.1, backgroundColor: "rgba(0,0,0,0.7)" }}
                        whileTap={{ scale: 0.9 }}
                        transition={{ duration: 0.2 }}
                        aria-label="Next slide"
                    >
                        <ChevronRight className="w-5 h-5" />
                    </motion.button>
                </>
            )}

            {/* Dots Indicator dengan Framer Motion */}
            {showDots && (
                <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2 z-10">
                    {images.map((_, index) => (
                        <motion.button
                            key={index}
                            onClick={() => goToSlide(index)}
                            className={`h-2 rounded-full ${index === currentIndex
                                    ? 'bg-white'
                                    : 'bg-white/50 hover:bg-white/75'
                                }`}
                            initial={false}
                            animate={{
                                width: index === currentIndex ? 32 : 8,
                                opacity: index === currentIndex ? 1 : 0.5
                            }}
                            whileHover={{ scale: 1.2, opacity: 0.8 }}
                            whileTap={{ scale: 0.9 }}
                            transition={{ duration: 0.3, ease: "easeInOut" }}
                            aria-label={`Go to slide ${index + 1}`}
                        />
                    ))}
                </div>
            )}
        </div>
    )
}

