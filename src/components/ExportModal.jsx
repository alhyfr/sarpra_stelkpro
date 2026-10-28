'use client'
import { useState, useEffect } from 'react'
import { Download, FileText, Table, FileSpreadsheet, X } from 'lucide-react'
import Modal from './Modal'
import { exportData } from '@/app/utils/export'
import { exportInventarisIso } from '@/app/utils/exportInventarisIso'
import dayjs from 'dayjs'

export default function ExportModal({
  show = false,
  onClose = null,
  data = [],
  columns = [],
  title = 'Export Data',
  filename = 'export',
  /** Aktifkan opsi Excel ISO inventaris (STM-SARPRA-FM-006) */
  enableIsoInventaris = false,
  /** Ambil semua data (bukan hanya halaman aktif) untuk export ISO */
  fetchAllData = null,
}) {
  const [exportFormat, setExportFormat] = useState('csv')
  const [exportLoading, setExportLoading] = useState(false)
  const [selectedColumns, setSelectedColumns] = useState([])
  const [isoTahun, setIsoTahun] = useState(dayjs().format('YYYY'))

  useEffect(() => {
    if (show && columns.length > 0) {
      const availableColumns = columns.filter((col) => col.type !== 'actions')
      setSelectedColumns(availableColumns.map((col) => col.key))
      setIsoTahun(dayjs().format('YYYY'))
    }
  }, [show, columns])

  const formatOptions = [
    { value: 'csv', label: 'CSV', icon: FileText, description: 'Comma Separated Values' },
    { value: 'excel', label: 'Excel', icon: Table, description: 'Microsoft Excel Format' },
    ...(enableIsoInventaris
      ? [
          {
            value: 'excel-iso',
            label: 'Excel ISO',
            icon: FileSpreadsheet,
            description: 'Formulir STM-SARPRA-FM-006',
          },
        ]
      : []),
  ]

  const isIso = exportFormat === 'excel-iso'

  const handleColumnToggle = (columnKey) => {
    setSelectedColumns((prev) =>
      prev.includes(columnKey)
        ? prev.filter((key) => key !== columnKey)
        : [...prev, columnKey]
    )
  }

  const handleSelectAllColumns = () => {
    const availableColumns = columns.filter((col) => col.type !== 'actions')
    setSelectedColumns(availableColumns.map((col) => col.key))
  }

  const handleDeselectAllColumns = () => {
    setSelectedColumns([])
  }

  const handleExport = async () => {
    if (!isIso && selectedColumns.length === 0) {
      alert('Pilih minimal satu kolom untuk di-export')
      return
    }

    setExportLoading(true)
    try {
      const timestamp = new Date().toISOString().split('T')[0]

      let rows = data
      if (typeof fetchAllData === 'function') {
        rows = await fetchAllData()
      }
      if (!rows || rows.length === 0) {
        alert('Tidak ada data untuk di-export')
        return
      }

      if (isIso) {
        await exportInventarisIso(rows, {
          tahun: isoTahun,
          filename: `formulir_inventaris_iso_${isoTahun}_${timestamp}`,
          logoUrl: '/ts.png',
        })
      } else {
        await exportData(
          rows,
          columns,
          selectedColumns,
          exportFormat,
          `${filename}_${timestamp}`
        )
      }

      if (onClose) onClose()
    } catch (error) {
      console.error('Export error:', error)
      alert(
        isIso
          ? 'Gagal export Excel ISO. Pastikan library exceljs terinstall.'
          : 'Terjadi kesalahan saat mengexport data.'
      )
    } finally {
      setExportLoading(false)
    }
  }

  if (!show) return null

  return (
    <Modal show={show} onClose={onClose} title={title} width="max-w-2xl">
      <div className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
            Format Export
          </label>
          <div className={`grid gap-3 ${enableIsoInventaris ? 'grid-cols-1 sm:grid-cols-3' : 'grid-cols-2'}`}>
            {formatOptions.map((option) => {
              const Icon = option.icon
              return (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => setExportFormat(option.value)}
                  className={`p-3 border rounded-lg text-left transition-colors ${
                    exportFormat === option.value
                      ? 'border-red-500 bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-300'
                      : 'border-gray-300 dark:border-gray-600 hover:border-gray-400 dark:hover:border-gray-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <Icon className="w-4 h-4 shrink-0" />
                    <div>
                      <div className="font-medium text-sm">{option.label}</div>
                      <div className="text-xs text-gray-500 dark:text-gray-400">
                        {option.description}
                      </div>
                    </div>
                  </div>
                </button>
              )
            })}
          </div>
        </div>

        {isIso ? (
          <div className="space-y-3">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Tahun (Formulir ISO)
            </label>
            <input
              type="number"
              min="2000"
              max="2100"
              value={isoTahun}
              onChange={(e) => setIsoTahun(e.target.value)}
              className="w-full sm:w-40 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
            />
            <p className="text-xs text-gray-500 dark:text-gray-400">
              Format: STM-SARPRA-FM-006 — header sekolah, tabel 16 kolom, dan tanda tangan
              Mengetahui / Pelapor.
              {typeof fetchAllData === 'function'
                ? ' Data yang di-export mengikuti filter/pencarian aktif (semua halaman).'
                : ' Data dari halaman yang sedang ditampilkan.'}
            </p>
          </div>
        ) : (
          <div>
            <div className="flex items-center justify-between mb-3">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Kolom yang akan di-export
              </label>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={handleSelectAllColumns}
                  className="text-xs text-blue-600 dark:text-blue-400 hover:text-blue-800"
                >
                  Pilih Semua
                </button>
                <button
                  type="button"
                  onClick={handleDeselectAllColumns}
                  className="text-xs text-gray-600 dark:text-gray-400 hover:text-gray-800"
                >
                  Hapus Semua
                </button>
              </div>
            </div>

            <div className="max-h-40 overflow-y-auto border border-gray-300 dark:border-gray-600 rounded-lg p-3 bg-white dark:bg-gray-700">
              {columns
                .filter((col) => col.type !== 'actions')
                .map((column) => (
                  <label key={column.key} className="flex items-center gap-2 py-1">
                    <input
                      type="checkbox"
                      checked={selectedColumns.includes(column.key)}
                      onChange={() => handleColumnToggle(column.key)}
                      className="rounded border-gray-300 text-red-600 focus:ring-red-500"
                    />
                    <span className="text-sm text-gray-900 dark:text-gray-100">
                      {column.title}
                    </span>
                  </label>
                ))}
            </div>
          </div>
        )}

        <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-3">
          <div className="text-sm text-blue-800 dark:text-blue-300">
            <strong>Info:</strong>{' '}
            {isIso
              ? `Export formulir ISO tahun ${isoTahun}`
              : `Akan mengexport ${data.length} data dengan ${selectedColumns.length} kolom (${exportFormat.toUpperCase()})`}
          </div>
        </div>

        <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
          <button
            type="button"
            onClick={onClose}
            disabled={exportLoading}
            className="px-4 py-2 text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors flex items-center gap-2 disabled:opacity-50"
          >
            <X className="w-4 h-4" />
            Batal
          </button>
          <button
            type="button"
            onClick={handleExport}
            disabled={exportLoading || (!isIso && selectedColumns.length === 0)}
            className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors flex items-center gap-2 disabled:opacity-50"
          >
            {exportLoading ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Mengexport...
              </>
            ) : (
              <>
                <Download className="w-4 h-4" />
                {isIso ? 'Download Excel ISO' : 'Export'}
              </>
            )}
          </button>
        </div>
      </div>
    </Modal>
  )
}
