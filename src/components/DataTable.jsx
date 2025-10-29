'use client'
import { useState, useMemo, useEffect } from 'react'
import { 
  Search, 
  Filter, 
  Download, 
  Plus, 
  Edit, 
  Trash2, 
  Eye, 
  ChevronLeft,
  ChevronRight,
  ArrowUpDown,
  ArrowUp,
  ArrowDown
} from 'lucide-react'

export default function DataTable({ 
  data = [],
  columns = [],
  onAdd = null,
  onExport = null,
  onBulkDelete = null,
  onStiker = null,
  searchable = true,
  filterable = true,
  sortable = true,
  selectable = true,
  pagination = true,
  itemsPerPageOptions = [5, 10, 25, 50],
  defaultItemsPerPage = 10,
  className = '',
  hideAddButton = false,
  // Title props
  title = "Data Table",
  subtitle = "Kelola data dengan mudah",
  // Server-side props
  serverSide = false,
  onDataChange = null,
  total = 0,
  loading = false,
  // Server-side state props
  currentPage: propCurrentPage = 1,
  currentItemsPerPage: propCurrentItemsPerPage = 10,
  currentSearch: propCurrentSearch = '',
  currentFilters: propCurrentFilters = {},
  currentSortField: propCurrentSortField = '',
  currentSortDirection: propCurrentSortDirection = 'asc'
}) {
  // State management
  const [searchTerm, setSearchTerm] = useState(serverSide ? propCurrentSearch : '')
  const [sortField, setSortField] = useState(serverSide ? propCurrentSortField : '')
  const [sortDirection, setSortDirection] = useState(serverSide ? propCurrentSortDirection : 'asc')
  const [currentPage, setCurrentPage] = useState(serverSide ? propCurrentPage : 1)
  const [itemsPerPage, setItemsPerPage] = useState(serverSide ? propCurrentItemsPerPage : defaultItemsPerPage)
  const [selectedItems, setSelectedItems] = useState([])
  const [showFilters, setShowFilters] = useState(false)
  const [filters, setFilters] = useState(serverSide ? propCurrentFilters : {})
  const [isTyping, setIsTyping] = useState(false)

  // Get searchable columns
  const searchableColumns = columns.filter(col => col.searchable !== false)

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (window.searchTimeout) {
        clearTimeout(window.searchTimeout)
      }
    }
  }, [])

  // Client-side sorting only (filters are server-side)
  const filteredData = useMemo(() => {
    let filtered = data

    // Apply search filter (client-side for both server-side and client-side modes)
    if (searchTerm) {
      filtered = filtered.filter(item => {
        return searchableColumns.some(col => {
          const value = item[col.key]
          return value && value.toString().toLowerCase().includes(searchTerm.toLowerCase())
        })
      })
    }

    // Apply sorting (always client-side)
    if (sortField && sortable) {
      filtered.sort((a, b) => {
        const aVal = a[sortField]
        const bVal = b[sortField]
        
        if (aVal === null || aVal === undefined) return 1
        if (bVal === null || bVal === undefined) return -1
        
        if (typeof aVal === 'string') {
          return sortDirection === 'asc' 
            ? aVal.localeCompare(bVal)
            : bVal.localeCompare(aVal)
        }
        
        if (sortDirection === 'asc') {
          return aVal > bVal ? 1 : -1
        } else {
          return aVal < bVal ? 1 : -1
        }
      })
    }

    return filtered
  }, [data, searchTerm, sortField, sortDirection, searchableColumns, sortable])

  // Pagination handling
  const totalPages = serverSide ? Math.ceil(total / itemsPerPage) : Math.ceil(filteredData.length / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const endIndex = serverSide ? Math.min(currentPage * itemsPerPage, total) : Math.min(currentPage * itemsPerPage, filteredData.length)
  const currentData = serverSide ? data : filteredData.slice(startIndex, endIndex)

  // Handlers
  const handleSort = (field) => {
    if (!sortable) return
    
    const newDirection = sortField === field ? (sortDirection === 'asc' ? 'desc' : 'asc') : 'asc'
    setSortField(field)
    setSortDirection(newDirection)
    
    // No server-side call needed for sorting - it's client-side only
    // Sorting is handled by the filteredData useMemo
  }

  const handleSearch = (value) => {
    setSearchTerm(value)
    setCurrentPage(1) // Reset to first page on search
    
    // Show typing state immediately
    if (value.trim() !== '') {
      setIsTyping(true)
    } else {
      setIsTyping(false)
    }
    
    // Trigger server-side data change
    if (serverSide && onDataChange) {
      // Clear existing timeout
      if (window.searchTimeout) {
        clearTimeout(window.searchTimeout)
      }
      
      // If search is empty, trigger immediately (no debounce)
      if (value === '' || value.trim() === '') {
        setIsTyping(false)
        onDataChange({
          page: 1,
          per_page: itemsPerPage,
          search: '', // Explicitly send empty string
          filters: filters
        })
      } else {
        // Set new timeout for non-empty search
        window.searchTimeout = setTimeout(() => {
          setIsTyping(false)
          onDataChange({
            page: 1,
            per_page: itemsPerPage,
            search: value,
            filters: filters
          })
        }, 500) // 500ms debounce
      }
    }
  }

  const handleFilterChange = (key, value, column) => {
    let filterValue = value
    
    // Handle dateRange with getValue function
    if (column?.type === 'dateRange' && value && value !== '') {
      const option = column.filterOptions?.find(opt => opt.value === value)
      if (option?.getValue && typeof option.getValue === 'function') {
        filterValue = option.getValue()
      }
    }
    
    const newFilters = { ...filters, [key]: filterValue }
    setFilters(newFilters)
    setCurrentPage(1) // Reset to first page on filter
    
    // Trigger server-side data change with filters
    if (serverSide && onDataChange) {
      onDataChange({
        page: 1,
        per_page: itemsPerPage,
        search: searchTerm,
        filters: newFilters
        // No sort parameters - sorting is client-side
      })
    }
  }

  const handlePageChange = (page) => {
    setCurrentPage(page)
    
    // Trigger server-side data change (no sort parameters)
    if (serverSide && onDataChange) {
      onDataChange({
        page: page,
        per_page: itemsPerPage,
        search: searchTerm,
        filters: filters
        // No sort parameters - sorting is client-side
      })
    }
  }

  const handleItemsPerPageChange = (newItemsPerPage) => {
    setItemsPerPage(newItemsPerPage)
    setCurrentPage(1) // Reset to first page
    
    // Trigger server-side data change (no sort parameters)
    if (serverSide && onDataChange) {
      onDataChange({
        page: 1,
        per_page: newItemsPerPage,
        search: searchTerm,
        filters: filters
        // No sort parameters - sorting is client-side
      })
    }
  }

  const handleSelectAll = (checked) => {
    if (!selectable) return
    
    if (checked) {
      setSelectedItems(currentData.map(item => item.id))
    } else {
      setSelectedItems([])
    }
  }

  const handleSelectItem = (id, checked) => {
    if (!selectable) return
    
    if (checked) {
      setSelectedItems([...selectedItems, id])
    } else {
      setSelectedItems(selectedItems.filter(item => item !== id))
    }
  }

  const handleBulkDelete = () => {
    if (onBulkDelete && selectedItems.length > 0) {
      onBulkDelete(selectedItems)
      setSelectedItems([])
    }
  }

  const handleStiker = () => {
    if (onStiker && selectedItems.length > 0) {
      onStiker(selectedItems)
      setSelectedItems([])
    }
  }

  const getSortIcon = (field) => {
    if (!sortable) return null
    
    if (sortField !== field) {
      return <ArrowUpDown className="w-4 h-4 text-gray-400 dark:text-gray-500" />
    }
    return sortDirection === 'asc' 
      ? <ArrowUp className="w-4 h-4 text-red-600" />
      : <ArrowDown className="w-4 h-4 text-red-600" />
  }

  const renderCell = (item, column) => {
    if (column.render) {
      return column.render(item[column.key], item)
    }
    
    if (column.type === 'badge') {
      const status = item[column.key]
      const baseClasses = "px-2 py-1 rounded-full text-xs font-medium"
      const statusClasses = column.badgeClasses?.[status] || "bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200"
      return (
        <span className={`${baseClasses} ${statusClasses}`}>
          {status}
        </span>
      )
    }
    
    if (column.type === 'date') {
      return new Date(item[column.key]).toLocaleDateString()
    }
    
    if (column.type === 'actions') {
      return (
        <div className="flex items-center justify-end gap-2">
          {column.actions?.map((action, index) => {
            // Check if action should be shown
            const shouldShow = typeof action.show === 'function' ? action.show(item) : (action.show !== false)
            
            if (!shouldShow) return null
            
            // Handle dynamic icon, title, and className
            const Icon = typeof action.icon === 'function' ? action.icon(item) : action.icon
            const title = typeof action.title === 'function' ? action.title(item) : action.title
            const className = typeof action.className === 'function' ? action.className(item) : action.className
            
            return (
              <button
                key={index}
                onClick={() => action.onClick(item)}
                className={`p-1 transition-colors ${className || 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'}`}
                title={title}
              >
                {typeof Icon === 'function' ? Icon() : <Icon className="w-4 h-4" />}
              </button>
            )
          })}
        </div>
      )
    }
    
    return item[column.key]
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">{title}</h2>
          <p className="text-gray-600 dark:text-gray-400">{subtitle}</p>
        </div>
        <div className="flex items-center gap-2">
          {onExport && (
            <button 
              onClick={onExport}
              className="px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors flex items-center gap-2"
            >
              <Download className="w-4 h-4" />
              Export
            </button>
          )}
          {onAdd && !hideAddButton && (
            <button 
              onClick={onAdd}
              className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              Tambah Data
            </button>
          )}
        </div>
      </div>

      {/* Search and Filters */}
      {(searchable || filterable) && (
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4">
          <div className="flex flex-col lg:flex-row gap-4">
            {/* Search */}
            {searchable && (
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-gray-500 w-4 h-4" />
                  <input
                    type="text"
                    placeholder="Cari data..."
                    value={searchTerm}
                    onChange={(e) => handleSearch(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 placeholder-gray-500 dark:placeholder-gray-400"
                  />
                </div>
              </div>
            )}

            {/* Filter Toggle */}
            {filterable && (
              <button
                onClick={() => setShowFilters(!showFilters)}
                className="px-4 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-600 flex items-center gap-2"
              >
                <Filter className="w-4 h-4" />
                Filter
              </button>
            )}
          </div>

          {/* Advanced Filters */}
          {showFilters && filterable && (
            <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {columns.filter(col => col.filterable !== false && col.filterOptions).map(column => (
                  <div key={column.key}>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      {column.title}
                    </label>
                    
                    {/* Date Range Filter */}
                    {column.type === 'dateRange' ? (
                      <div className="space-y-2">
                        <select
                          value={filters[column.key] || ''}
                          onChange={(e) => handleFilterChange(column.key, e.target.value, column)}
                          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
                        >
                          <option value="">Semua {column.title}</option>
                          {column.filterOptions?.map(option => (
                            <option key={option.value} value={option.value}>
                              {option.label}
                            </option>
                          ))}
                        </select>
                        
                        {/* Custom Date Range Input */}
                        {filters[column.key] === 'custom' && (
                          <div className="flex gap-2">
                            <input
                              type="date"
                              placeholder="Dari Tanggal"
                              value={filters[`${column.key}_from`] || ''}
                              className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
                              onChange={(e) => {
                                const fromDate = e.target.value
                                // Store from date in a separate filter key
                                const newFilters = { ...filters, [`${column.key}_from`]: fromDate }
                                setFilters(newFilters)
                                
                                // If we have both dates, trigger the filter
                                const toDate = filters[`${column.key}_to`] || ''
                                if (fromDate && toDate) {
                                  handleFilterChange(column.key, `${fromDate},${toDate}`, column)
                                }
                              }}
                            />
                            <input
                              type="date"
                              placeholder="Sampai Tanggal"
                              value={filters[`${column.key}_to`] || ''}
                              className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
                              onChange={(e) => {
                                const toDate = e.target.value
                                // Store to date in a separate filter key
                                const newFilters = { ...filters, [`${column.key}_to`]: toDate }
                                setFilters(newFilters)
                                
                                // If we have both dates, trigger the filter
                                const fromDate = filters[`${column.key}_from`] || ''
                                if (fromDate && toDate) {
                                  handleFilterChange(column.key, `${fromDate},${toDate}`, column)
                                }
                              }}
                            />
                          </div>
                        )}
                      </div>
                    ) : (
                      /* Regular Select Filter */
                      <select
                        value={filters[column.key] || ''}
                        onChange={(e) => handleFilterChange(column.key, e.target.value, column)}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
                      >
                        <option value="">Semua {column.title}</option>
                        {column.filterOptions?.map(option => (
                          <option key={option.value} value={option.value}>
                            {option.label}
                          </option>
                        ))}
                      </select>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Bulk Actions */}
      {selectedItems.length > 0 && selectable && (onBulkDelete || onStiker) && (
        <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <span className="text-blue-800 dark:text-blue-300 font-medium">
              {selectedItems.length} item dipilih
            </span>
            <div className="flex items-center gap-2">
              {onStiker && (
                <button
                  onClick={handleStiker}
                  className="px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors flex items-center gap-1"
                >
                  <Download className="w-4 h-4" />
                  Cetak Stiker
                </button>
              )}
              {onBulkDelete && (
                <button
                  onClick={handleBulkDelete}
                  className="px-3 py-1 bg-red-600 text-white rounded hover:bg-red-700 transition-colors flex items-center gap-1"
                >
                  <Trash2 className="w-4 h-4" />
                  Hapus Semua
                </button>
              )}
              <button
                onClick={() => setSelectedItems([])}
                className="px-3 py-1 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
              >
                Batal
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Data Table */}
      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden relative">
        {(loading || isTyping) && (
          <div className="absolute inset-0 bg-white dark:bg-gray-800 bg-opacity-90 dark:bg-opacity-90 flex items-center justify-center py-16 z-10">
            <div className="flex flex-col items-center space-y-4">
              <div className="relative">
                <div className="w-10 h-10 border-4 border-red-100 rounded-full"></div>
                <div className="w-10 h-10 border-4 border-red-600 border-t-transparent rounded-full animate-spin absolute top-0 left-0"></div>
              </div>
              <div className="text-center">
                <span className="text-gray-600 dark:text-gray-400 text-sm font-medium block">
                  {isTyping ? 'Mencari data...' : 'Memuat data...'}
                </span>
                <span className="text-gray-400 dark:text-gray-500 text-xs mt-1">
                  {isTyping ? 'Sedang mencari...' : 'Mohon tunggu sebentar'}
                </span>
              </div>
            </div>
          </div>
        )}
        <div className={`overflow-x-auto ${(loading || isTyping) ? 'blur-sm opacity-50' : ''}`}>
          <table className="w-full">
            <thead className="bg-gray-50 dark:bg-gray-700">
              <tr>
                {selectable && (
                  <th className="px-6 py-3 text-left">
                    <input
                      type="checkbox"
                      checked={selectedItems.length === currentData.length && currentData.length > 0}
                      onChange={(e) => handleSelectAll(e.target.checked)}
                      className="rounded border-gray-300 dark:border-gray-600 text-red-600 focus:ring-red-500 bg-white dark:bg-gray-800"
                    />
                  </th>
                )}
                {columns.map((column) => (
                  <th 
                    key={column.key}
                    className={`px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider ${
                      sortable && column.sortable !== false ? 'cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-600' : ''
                    } ${column.type === 'actions' ? 'text-right' : ''}`}
                    onClick={() => sortable && column.sortable !== false && column.type !== 'actions' && handleSort(column.key)}
                  >
                    <div className="flex items-center gap-1">
                      {column.title}
                      {sortable && column.sortable !== false && column.type !== 'actions' && getSortIcon(column.key)}
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
              {currentData.map((item, index) => (
                <tr 
                  key={item.id} 
                  className="hover:bg-gray-50 dark:hover:bg-gray-700"
                >
                  {selectable && (
                    <td className="px-6 py-4">
                      <input
                        type="checkbox"
                        checked={selectedItems.includes(item.id)}
                        onChange={(e) => handleSelectItem(item.id, e.target.checked)}
                        className="rounded border-gray-300 dark:border-gray-600 text-red-600 focus:ring-red-500 bg-white dark:bg-gray-800"
                      />
                    </td>
                  )}
                  {columns.map((column) => (
                    <td 
                      key={column.key} 
                      className={`px-6 py-4 ${column.wrap ? 'whitespace-normal break-words' : 'whitespace-nowrap'} ${column.type === 'actions' ? 'text-right' : ''}`}
                      style={{
                        ...(column.minWidth && { minWidth: column.minWidth }),
                        ...(column.maxWidth && { maxWidth: column.maxWidth })
                      }}
                    >
                      {renderCell(item, column)}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {pagination && (
          <div className="bg-white dark:bg-gray-800 px-4 py-3 flex items-center justify-between border-t border-gray-200 dark:border-gray-700 sm:px-6">
            <div className="flex-1 flex justify-between sm:hidden">
                  <button
                    onClick={() => handlePageChange(Math.max(1, currentPage - 1))}
                    disabled={currentPage === 1}
                    className="relative inline-flex items-center px-4 py-2 border border-gray-300 dark:border-gray-600 text-sm font-medium rounded-md text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Previous
                  </button>
                  <button
                    onClick={() => handlePageChange(Math.min(totalPages, currentPage + 1))}
                    disabled={currentPage === totalPages}
                    className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 dark:border-gray-600 text-sm font-medium rounded-md text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Next
                  </button>
            </div>
            <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
              <div>
                <p className="text-sm text-gray-700 dark:text-gray-300">
                  Menampilkan <span className="font-medium">{startIndex + 1}</span> sampai{' '}
                  <span className="font-medium">{endIndex}</span> dari{' '}
                  <span className="font-medium">{serverSide ? total : filteredData.length}</span> hasil
                </p>
              </div>
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-2">
                  <span className="text-sm text-gray-700 dark:text-gray-300">Items per page:</span>
                  <select
                    value={itemsPerPage}
                    onChange={(e) => handleItemsPerPageChange(Number(e.target.value))}
                    className="px-2 py-1 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 rounded text-sm"
                  >
                    {itemsPerPageOptions.map(option => (
                      <option key={option} value={option}>{option}</option>
                    ))}
                  </select>
                </div>
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => handlePageChange(Math.max(1, currentPage - 1))}
                    disabled={currentPage === 1}
                    className="p-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded hover:bg-gray-50 dark:hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  {(() => {
                    const maxVisiblePages = 4;
                    const pages = [];
                    
                    if (totalPages <= maxVisiblePages) {
                      // Show all pages if total pages <= maxVisiblePages
                      for (let i = 1; i <= totalPages; i++) {
                        pages.push(i);
                      }
                    } else {
                      // Show limited pages with ellipsis
                      if (currentPage <= 2) {
                        // Show first 3 pages + ellipsis + last page
                        pages.push(1, 2, 3);
                        if (totalPages > 4) {
                          pages.push('...');
                        }
                        pages.push(totalPages);
                      } else if (currentPage >= totalPages - 1) {
                        // Show first page + ellipsis + last 3 pages
                        pages.push(1);
                        if (totalPages > 4) {
                          pages.push('...');
                        }
                        pages.push(totalPages - 2, totalPages - 1, totalPages);
                      } else {
                        // Show first page + ellipsis + current-1, current, current+1 + ellipsis + last page
                        pages.push(1);
                        pages.push('...');
                        pages.push(currentPage - 1, currentPage, currentPage + 1);
                        pages.push('...');
                        pages.push(totalPages);
                      }
                    }
                    
                    return pages.map((page, index) => (
                      <button
                        key={index}
                        onClick={() => typeof page === 'number' ? handlePageChange(page) : null}
                        disabled={page === '...'}
                        className={`px-3 py-2 text-sm border rounded ${
                          page === currentPage
                            ? 'bg-red-600 text-white border-red-600'
                            : page === '...'
                            ? 'bg-white dark:bg-gray-700 text-gray-500 dark:text-gray-400 border-gray-300 dark:border-gray-600 cursor-default'
                            : 'bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-600'
                        }`}
                      >
                        {page}
                      </button>
                    ));
                  })()}
                  <button
                    onClick={() => handlePageChange(Math.min(totalPages, currentPage + 1))}
                    disabled={currentPage === totalPages}
                    className="p-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded hover:bg-gray-50 dark:hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Custom CSS for smooth animations */}
      <style jsx>{`
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        @keyframes fadeIn {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }
        
        @keyframes slideIn {
          from {
            transform: translateX(-10px);
            opacity: 0;
          }
          to {
            transform: translateX(0);
            opacity: 1;
          }
        }
        
        .table-row-enter {
          animation: fadeInUp 0.3s ease-out forwards;
        }
        
        .table-row-exit {
          animation: fadeIn 0.2s ease-out reverse;
        }
        
        .smooth-transition {
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        }
      `}</style>
    </div>
  )
}
