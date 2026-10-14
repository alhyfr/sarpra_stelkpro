'use client'

import { getStorageUrl } from '@/helper/storageUrl'

// Build absolute PDF/file URL from various possible inputs:
// - string filename (e.g., "file_123.pdf")
// - string relative path (e.g., "/api/storage/file_123.pdf")
// - absolute URL (e.g., "http://localhost:3002/api/storage/file_123.pdf")
// - object with fields: file_url | file | kode | id
export function toPdfUrl(input) {
  if (!input) return ''

  const build = (value) => {
    if (!value) return ''
    if (typeof value !== 'string') return ''
    return getStorageUrl(value) || ''
  }

  if (typeof input === 'string') {
    return build(input)
  }

  // object support
  if (input.file_url) return build(input.file_url)
  if (input.file) return build(input.file)
  if (input.kode || input.id) return build(`${input.kode || input.id}.pdf`)

  return ''
}
