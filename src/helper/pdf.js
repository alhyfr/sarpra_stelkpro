'use client'

// Build absolute PDF URL from various possible inputs:
// - string filename (e.g., "file_123.pdf")
// - string relative path (e.g., "/api/storage/file_123.pdf")
// - absolute URL (e.g., "http://localhost:3005/api/storage/file_123.pdf")
// - object with fields: file_url | file | kode | id
export function toPdfUrl(input) {
  if (!input) return ''

  // Get base URL from environment variable
  const baseUrl = process.env.NEXT_PUBLIC_API_URL || process.env.NEXT_PUBLIC_API_STORAGE_URL || 'http://localhost:3005'

  const build = (value) => {
    if (!value) return ''
    if (typeof value !== 'string') return ''
    if (value.startsWith('http')) return value
    const cleaned = value
      .replace(/^\/?api\/storage\/?/, '') // strip leading api/storage
      .replace(/^\//, '') // strip any other leading slash
    return `${baseUrl}/api/storage/${cleaned}`
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


