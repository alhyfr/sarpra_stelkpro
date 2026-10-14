/**
 * Bangun URL absolut untuk file di storage API.
 * Menerima: filename, /api/storage/..., /uploads/bangunan/..., atau URL penuh.
 *
 * @param {string|null|undefined} input
 * @param {{ kind?: 'storage' | 'bangunan' }} [options]
 * @returns {string|null}
 */
export function getStorageUrl(input, { kind = 'storage' } = {}) {
  if (!input || typeof input !== 'string') return null

  const trimmed = input.trim()
  if (!trimmed) return null

  if (trimmed.startsWith('http://') || trimmed.startsWith('https://') || trimmed.startsWith('blob:')) {
    return trimmed
  }

  const apiOrigin = (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3002')
    .replace(/\/+$/, '')
    .replace(/\/api$/, '')

  const storageBase = (
    process.env.NEXT_PUBLIC_API_STORAGE || `${apiOrigin}/api/storage`
  ).replace(/\/+$/, '')

  const bangunanBase = (
    process.env.NEXT_PUBLIC_API_STORAGE_BANGUNAN || `${apiOrigin}/uploads/bangunan`
  ).replace(/\/+$/, '')

  let path = trimmed.replace(/^\/+/, '')

  // Strip prefix yang sudah ada agar tidak dobel path
  if (kind === 'bangunan') {
    path = path
      .replace(/^uploads\/bangunan\/?/i, '')
      .replace(/^api\/storage\/?/i, '')
  } else {
    path = path.replace(/^api\/storage\/?/i, '')
  }

  if (!path) return null

  const base = kind === 'bangunan' ? bangunanBase : storageBase
  return `${base}/${path}`
}
