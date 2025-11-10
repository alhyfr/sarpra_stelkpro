'use client';
import Link from 'next/link';
import { ChevronRight, Home } from 'lucide-react';

/**
 * Reusable Breadcrumb Component
 * 
 * @param {Array} items - Array of breadcrumb items
 * @param {string} items[].label - Label text untuk breadcrumb item
 * @param {string} items[].href - URL untuk breadcrumb item (optional, jika tidak ada maka tidak clickable)
 * @param {boolean} showHome - Tampilkan home icon di awal (default: false)
 * @param {string} homeHref - URL untuk home icon (default: '/dashboard')
 * @param {string} className - Additional CSS classes
 * 
 * @example
 * <ABreadcrumbs 
 *   items={[
 *     { label: 'Peminjaman Eksternal', href: '/peminjaman/eksternal' },
 *     { label: 'Data Peminjaman Eksternal', href: `/peminjaman/eksternal/${id}` }
 *   ]}
 * />
 */
export default function ABreadcrumbs({ 
  items = [], 
  showHome = false,
  homeHref = '/dashboard',
  className = '' 
}) {
  if (!items || items.length === 0) {
    return null;
  }

  return (
    <nav 
      className={`flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-400 mb-4 ${className}`}
      aria-label="Breadcrumb"
    >
      {showHome && (
        <>
          <Link 
            href={homeHref}
            className="hover:text-gray-900 dark:hover:text-gray-200 transition-colors"
          >
            <Home className="w-4 h-4" />
          </Link>
          <ChevronRight className="w-4 h-4 text-gray-400" />
        </>
      )}
      
      {items.map((item, index) => {
        const isLast = index === items.length - 1;
        
        return (
          <div key={index} className="flex items-center space-x-2">
            {item.href && !isLast ? (
              <Link
                href={item.href}
                className="hover:text-gray-900 dark:hover:text-gray-200 transition-colors"
              >
                {item.label}
              </Link>
            ) : (
              <span className={isLast ? 'text-gray-900 dark:text-gray-200 font-medium' : ''}>
                {item.label}
              </span>
            )}
            
            {!isLast && (
              <ChevronRight className="w-4 h-4 text-gray-400" />
            )}
          </div>
        );
      })}
    </nav>
  );
}

