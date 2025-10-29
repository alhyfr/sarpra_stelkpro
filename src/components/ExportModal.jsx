'use client'
import { useState, useEffect } from 'react'
import { Download, FileText, Table, X } from 'lucide-react'
import Modal from './Modal'
import { exportData } from '@/app/utils/export'

export default function ExportModal({ 
  show = false,      // Changed from isOpen to show
  onClose = null,
  data = [],
  columns = [],
  title = 'Export Data',
  filename = 'export'
}) {
  const [exportFormat, setExportFormat] = useState('csv')
  const [exportLoading, setExportLoading] = useState(false)
  const [selectedColumns, setSelectedColumns] = useState([])

  // Initialize selected columns when modal opens
  useEffect(() => {  // Changed from useState to useEffect
    if (show && columns.length > 0) {
      // Select all columns except actions by default
      const availableColumns = columns.filter(col => col.type !== 'actions')
      setSelectedColumns(availableColumns.map(col => col.key))
    }
  }, [show, columns])

  const formatOptions = [
    { value: 'csv', label: 'CSV', icon: FileText, description: 'Comma Separated Values' },
    { value: 'excel', label: 'Excel', icon: Table, description: 'Microsoft Excel Format' }
  ]

  const handleColumnToggle = (columnKey) => {
    setSelectedColumns(prev => 
      prev.includes(columnKey) 
        ? prev.filter(key => key !== columnKey)
        : [...prev, columnKey]
    )
  }

  const handleSelectAllColumns = () => {
    const availableColumns = columns.filter(col => col.type !== 'actions')
    setSelectedColumns(availableColumns.map(col => col.key))
  }

  const handleDeselectAllColumns = () => {
    setSelectedColumns([])
  }

  const handleExport = async () => {
    if (selectedColumns.length === 0) {
      alert('Pilih minimal satu kolom untuk di-export')
      return
    }

    if (!data || data.length === 0) {
      alert('Tidak ada data untuk di-export')
      return
    }

    setExportLoading(true)
    try {
      const timestamp = new Date().toISOString().split('T')[0]
      const exportFilename = `${filename}_${timestamp}`
      
      console.log('📤 Exporting...', {
        data: data.length,
        columns: selectedColumns.length,
        format: exportFormat
      })
      
      await exportData(data, columns, selectedColumns, exportFormat, exportFilename)
      
      console.log('✅ Export successful')
      
      if (onClose) {
        onClose()
      }
    } catch (error) {
      console.error('❌ Export error:', error)
      alert('Terjadi kesalahan saat mengexport data. Pastikan library xlsx sudah terinstall untuk format Excel.')
    } finally {
      setExportLoading(false)
    }
  }

  const getColumnTitle = (columnKey) => {
    const column = columns.find(col => col.key === columnKey)
    return column ? column.title : columnKey
  }

  // Don't render if not shown
  if (!show) return null

  return (
    <Modal
      show={show}      // Changed from isOpen to show
      onClose={onClose}
      title={title}
      width="max-w-2xl"
    >
      <div className="space-y-6">
        {/* Export Format Selection */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
            Format Export
          </label>
          <div className="grid grid-cols-2 gap-3">
            {formatOptions.map(option => {
              const Icon = option.icon
              return (
                <button
                  key={option.value}
                  onClick={() => setExportFormat(option.value)}
                  className={`p-3 border rounded-lg text-left transition-colors ${
                    exportFormat === option.value
                      ? 'border-red-500 bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-300'
                      : 'border-gray-300 dark:border-gray-600 hover:border-gray-400 dark:hover:border-gray-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <Icon className="w-4 h-4" />
                    <div>
                      <div className="font-medium">{option.label}</div>
                      <div className="text-xs text-gray-500 dark:text-gray-400">{option.description}</div>
                    </div>
                  </div>
                </button>
              )
            })}
          </div>
        </div>

        {/* Column Selection */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Kolom yang akan di-export
            </label>
            <div className="flex gap-2">
              <button
                onClick={handleSelectAllColumns}
                className="text-xs text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300"
              >
                Pilih Semua
              </button>
              <button
                onClick={handleDeselectAllColumns}
                className="text-xs text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-300"
              >
                Hapus Semua
              </button>
            </div>
          </div>
          
          <div className="max-h-40 overflow-y-auto border border-gray-300 dark:border-gray-600 rounded-lg p-3 bg-white dark:bg-gray-700">
            {columns.filter(col => col.type !== 'actions').map(column => (
              <label key={column.key} className="flex items-center gap-2 py-1">
                <input
                  type="checkbox"
                  checked={selectedColumns.includes(column.key)}
                  onChange={() => handleColumnToggle(column.key)}
                  className="rounded border-gray-300 dark:border-gray-600 text-red-600 focus:ring-red-500 bg-white dark:bg-gray-800"
                />
                <span className="text-sm text-gray-900 dark:text-gray-100">{column.title}</span>
              </label>
            ))}
          </div>
        </div>

        {/* Export Info */}
        <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-3">
          <div className="text-sm text-blue-800 dark:text-blue-300">
            <strong>Info:</strong> Akan mengexport {data.length} data dengan {selectedColumns.length} kolom dalam format {exportFormat.toUpperCase()}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
          <button
            type="button"
            onClick={onClose}
            disabled={exportLoading}
            className="px-4 py-2 text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <X className="w-4 h-4" />
            Batal
          </button>
          <button
            type="button"
            onClick={handleExport}
            disabled={exportLoading || selectedColumns.length === 0}
            className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {exportLoading ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Mengexport...
              </>
            ) : (
              <>
                <Download className="w-4 h-4" />
                Export
              </>
            )}
          </button>
        </div>
      </div>
    </Modal>
  )
}
