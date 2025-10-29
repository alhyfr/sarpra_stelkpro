'use client'

import { Loader2 } from 'lucide-react'

// ============================================
// REUSABLE BUTTON COMPONENT
// ============================================
// Button component dengan berbagai variant, size, dan state
// Support: primary, secondary, success, danger, ghost, outline
// Sizes: xs, sm, md, lg, xl
// States: loading, disabled, full width

export default function Button({
  children,
  variant = 'primary',
  size = 'md',
  type = 'button',
  onClick,
  onMouseEnter,
  onMouseLeave,
  disabled = false,
  loading = false,
  icon: Icon,
  iconPosition = 'left',
  fullWidth = false,
  className = '',
  ...props
}) {
  // ============================================
  // VARIANT STYLES
  // ============================================
  const variants = {
    primary: 'bg-[#B91C1C] text-white hover:bg-[#991B1B] focus:ring-[#B91C1C] shadow-sm hover:shadow-md',
    secondary: 'bg-gray-600 dark:bg-gray-700 text-white hover:bg-gray-700 dark:hover:bg-gray-600 focus:ring-gray-500 shadow-sm hover:shadow-md',
    success: 'bg-green-600 text-white hover:bg-green-700 focus:ring-green-500 shadow-sm hover:shadow-md',
    danger: 'bg-red-600 text-white hover:bg-red-700 focus:ring-red-500 shadow-sm hover:shadow-md',
    warning: 'bg-yellow-500 text-white hover:bg-yellow-600 focus:ring-yellow-400 shadow-sm hover:shadow-md',
    info: 'bg-blue-600 text-white hover:bg-blue-700 focus:ring-blue-500 shadow-sm hover:shadow-md',
    
    // Outline variants
    outline: 'border-2 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 hover:border-gray-400 dark:hover:border-gray-500 focus:ring-gray-500',
    outlinePrimary: 'border-2 border-[#B91C1C] text-[#B91C1C] hover:bg-red-50 dark:hover:bg-red-900/20 focus:ring-[#B91C1C]',
    outlineSecondary: 'border-2 border-gray-600 dark:border-gray-500 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 focus:ring-gray-500',
    
    // Ghost variants
    ghost: 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 focus:ring-gray-500',
    ghostPrimary: 'text-[#B91C1C] hover:bg-red-50 dark:hover:bg-red-900/20 focus:ring-[#B91C1C]',
    ghostDanger: 'text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 focus:ring-red-500',
    
    // Link variant
    link: 'text-[#B91C1C] hover:text-[#991B1B] hover:underline focus:ring-0',
  }

  // ============================================
  // SIZE STYLES
  // ============================================
  const sizes = {
    xs: 'px-2.5 py-1.5 text-xs',
    sm: 'px-3 py-2 text-sm',
    md: 'px-4 py-2.5 text-sm',
    lg: 'px-5 py-3 text-base',
    xl: 'px-6 py-3.5 text-base',
  }

  // ============================================
  // ICON SIZES
  // ============================================
  const iconSizes = {
    xs: 'w-3 h-3',
    sm: 'w-4 h-4',
    md: 'w-4 h-4',
    lg: 'w-5 h-5',
    xl: 'w-5 h-5',
  }

  // ============================================
  // BASE STYLES
  // ============================================
  const baseStyles = `
    inline-flex items-center justify-center
    font-medium
    rounded-lg
    transition-all duration-200
    focus:outline-none focus:ring-2 focus:ring-offset-2
    disabled:opacity-50 disabled:cursor-not-allowed disabled:pointer-events-none
    ${fullWidth ? 'w-full' : ''}
  `

  // ============================================
  // COMBINE STYLES
  // ============================================
  const buttonClasses = `
    ${baseStyles}
    ${variants[variant] || variants.primary}
    ${sizes[size] || sizes.md}
    ${className}
  `.trim().replace(/\s+/g, ' ')

  // ============================================
  // RENDER ICON
  // ============================================
  const renderIcon = () => {
    if (loading) {
      return <Loader2 className={`${iconSizes[size]} animate-spin`} />
    }
    if (Icon) {
      return <Icon className={iconSizes[size]} />
    }
    return null
  }

  // ============================================
  // HANDLE CLICK
  // ============================================
  const handleClick = (e) => {
    if (disabled || loading) {
      e.preventDefault()
      return
    }
    if (onClick) {
      onClick(e)
    }
  }

  // ============================================
  // RENDER BUTTON
  // ============================================
  return (
    <button
      type={type}
      onClick={handleClick}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
      disabled={disabled || loading}
      className={buttonClasses}
      {...props}
    >
      {/* Icon Left */}
      {iconPosition === 'left' && renderIcon() && (
        <span className={children ? 'mr-2' : ''}>{renderIcon()}</span>
      )}

      {/* Button Text */}
      {loading && !Icon ? (
        <span className="flex items-center gap-2">
          <Loader2 className={`${iconSizes[size]} animate-spin`} />
          {children}
        </span>
      ) : (
        children
      )}

      {/* Icon Right */}
      {iconPosition === 'right' && renderIcon() && (
        <span className={children ? 'ml-2' : ''}>{renderIcon()}</span>
      )}
    </button>
  )
}

