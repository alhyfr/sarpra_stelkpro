'use client'
import { Trash2, AlertTriangle, X } from 'lucide-react'
import Modal from './Modal'
import Button from './Button'

export default function DeleteModal({ 
  isOpen = false,
  show = false,      // Support both props for backward compatibility
  onClose = null,
  onConfirm = null,
  title = 'Konfirmasi Hapus',
  message = 'Apakah Anda yakin ingin menghapus data ini?',
  itemName = '',
  loading = false,
  confirmText = 'Ya, Hapus',
  cancelText = 'Batal',
  size = 'sm'        // sm, md, lg, xl - default small
}) {
  // Support both 'isOpen' and 'show' props
  const isModalOpen = isOpen || show

  const handleConfirm = async () => {
    if (onConfirm) {
      await onConfirm()
    }
  }

  // Don't render if not shown
  if (!isModalOpen) return null

  return (
    <Modal
      show={isModalOpen}
      onClose={onClose}
      title={title}
      size={size}
    >
      <div className="space-y-6">
        {/* Icon dan Pesan */}
        <div className="flex items-start space-x-4">
          <div className="flex-shrink-0">
            <div className="w-12 h-12 bg-red-100 dark:bg-red-900/20 rounded-full flex items-center justify-center">
              <AlertTriangle className="w-6 h-6 text-red-600 dark:text-red-400" />
            </div>
          </div>
          <div className="flex-1">
            <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
              {title}
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              {message}
            </p>
            {itemName && (
              <div className="mt-3 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                  Item yang akan dihapus:
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                  {itemName}
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Warning */}
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-3">
          <div className="flex items-start">
            <AlertTriangle className="w-4 h-4 text-red-600 dark:text-red-400 mr-2 flex-shrink-0 mt-0.5" />
            <div className="text-sm text-red-700 dark:text-red-300">
              <p>
                Tindakan ini tidak dapat dibatalkan. Data akan dihapus secara permanen.
              </p>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
          <Button
            variant="outline"
            onClick={onClose}
            disabled={loading}
            icon={X}
          >
            {cancelText}
          </Button>
          
          <Button
            variant="danger"
            onClick={handleConfirm}
            loading={loading}
            icon={Trash2}
          >
            {loading ? 'Menghapus...' : confirmText}
          </Button>
        </div>
      </div>
    </Modal>
  )
}