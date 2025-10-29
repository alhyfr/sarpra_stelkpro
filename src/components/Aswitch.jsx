'use client'
import { Check, Clock } from "lucide-react"
import { useState } from "react"

export default function Aswitch({ 
    value = 'proses', 
    onChange, 
    disabled = false,
    size = 'md',
    showIcons = true,
    onValue = 'selesai',      // Nilai ketika switch ON
    offValue = 'proses',      // Nilai ketika switch OFF
    labels = {
        on: 'ON',
        off: 'OFF'
    }
}) {
    const [isChecked, setIsChecked] = useState(value === onValue)

    const handleToggle = () => {
        if (disabled) return
        
        const newValue = isChecked ? offValue : onValue
        setIsChecked(!isChecked)
        
        if (onChange) {
            onChange(newValue)
        }
    }

    const sizeClasses = {
        sm: {
            container: 'w-12 h-6',
            thumb: 'w-5 h-5',
            icon: 'w-3 h-3',
            text: 'text-xs'
        },
        md: {
            container: 'w-16 h-8',
            thumb: 'w-7 h-7',
            icon: 'w-4 h-4',
            text: 'text-sm'
        },
        lg: {
            container: 'w-20 h-10',
            thumb: 'w-9 h-9',
            icon: 'w-5 h-5',
            text: 'text-base'
        }
    }

    const currentSize = sizeClasses[size] || sizeClasses.md

    return (
        <div className="flex items-center gap-2">
            {/* Switch Toggle */}
            <button
                type="button"
                onClick={handleToggle}
                disabled={disabled}
                className={`
                    relative inline-flex items-center rounded-full transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500
                    ${isChecked 
                        ? 'bg-green-500 hover:bg-green-600' 
                        : 'bg-gray-300 hover:bg-gray-400'
                    }
                    ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
                    ${currentSize.container}
                `}
            >
                {/* Thumb */}
                <span
                    className={`
                        inline-block rounded-full bg-white shadow-lg transform transition-transform duration-200 ease-in-out
                        ${isChecked ? 'translate-x-8' : 'translate-x-0.5'}
                        ${currentSize.thumb}
                    `}
                >
                    {/* Icon di dalam thumb */}
                    {showIcons && (
                        <div className="flex items-center justify-center h-full">
                            {isChecked ? (
                                <Check className={`${currentSize.icon} text-green-600`} />
                            ) : (
                                <Clock className={`${currentSize.icon} text-gray-500`} />
                            )}
                        </div>
                    )}
                </span>
            </button>

            {/* Label */}
            <span className={`${currentSize.text} font-medium ${isChecked ? 'text-green-600' : 'text-gray-600'}`}>
                {isChecked ? labels.on : labels.off}
            </span>
        </div>
    )
}
