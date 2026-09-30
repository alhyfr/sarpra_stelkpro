/**
 * Kompresi gambar di browser via Canvas API (tanpa dependency).
 * Dipakai oleh AFile agar semua upload gambar otomatis mengecil.
 */

const DEFAULT_OPTIONS = {
  maxWidth: 1600,
  maxHeight: 1600,
  quality: 0.75,
  // Lewati kompresi jika file sudah kecil
  skipIfUnderKB: 300,
  // Output JPEG untuk hasil paling efisien (kecuali GIF animated tidak disentuh)
  convertToJpeg: true,
}

const isImageFile = (file) =>
  file instanceof File && typeof file.type === 'string' && file.type.startsWith('image/')

const isGif = (file) => file.type === 'image/gif'
const isSvg = (file) => file.type === 'image/svg+xml' || file.name?.toLowerCase().endsWith('.svg')

const loadImage = (file) =>
  new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file)
    const img = new Image()
    img.onload = () => {
      URL.revokeObjectURL(url)
      resolve(img)
    }
    img.onerror = (err) => {
      URL.revokeObjectURL(url)
      reject(err || new Error('Gagal memuat gambar untuk kompresi'))
    }
    img.src = url
  })

const canvasToBlob = (canvas, type, quality) =>
  new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (!blob) {
          reject(new Error('Gagal mengompres gambar'))
          return
        }
        resolve(blob)
      },
      type,
      quality
    )
  })

const buildFileName = (originalName, outputType) => {
  const base = originalName.replace(/\.[^/.]+$/, '') || 'image'
  if (outputType === 'image/jpeg') return `${base}.jpg`
  if (outputType === 'image/png') return `${base}.png`
  if (outputType === 'image/webp') return `${base}.webp`
  return originalName
}

/**
 * Kompres file gambar.
 * @param {File} file
 * @param {object} options
 * @returns {Promise<File>} File terkompres, atau file asli jika tidak cocok / gagal
 */
export async function compressImage(file, options = {}) {
  if (!isImageFile(file)) return file

  // GIF & SVG tidak dikompres (animasi / vektor)
  if (isGif(file) || isSvg(file)) return file

  const opts = { ...DEFAULT_OPTIONS, ...options }
  const sizeKB = file.size / 1024

  // File kecil: tetap resize jika resolusi sangat besar, tapi skip kalau kecil & dimensi wajar
  try {
    const img = await loadImage(file)
    const { naturalWidth: width, naturalHeight: height } = img

    const needsResize = width > opts.maxWidth || height > opts.maxHeight
    const needsCompress = sizeKB > opts.skipIfUnderKB

    if (!needsResize && !needsCompress) {
      return file
    }

    let targetWidth = width
    let targetHeight = height

    if (needsResize) {
      const ratio = Math.min(opts.maxWidth / width, opts.maxHeight / height)
      targetWidth = Math.max(1, Math.round(width * ratio))
      targetHeight = Math.max(1, Math.round(height * ratio))
    }

    const canvas = document.createElement('canvas')
    canvas.width = targetWidth
    canvas.height = targetHeight
    const ctx = canvas.getContext('2d')

    // Latar putih agar transparan PNG tidak jadi hitam saat ke JPEG
    if (opts.convertToJpeg) {
      ctx.fillStyle = '#ffffff'
      ctx.fillRect(0, 0, targetWidth, targetHeight)
    }

    ctx.drawImage(img, 0, 0, targetWidth, targetHeight)

    const outputType = opts.convertToJpeg ? 'image/jpeg' : (file.type || 'image/jpeg')
    const blob = await canvasToBlob(canvas, outputType, opts.quality)

    // Jika hasil malah lebih besar, pakai file asli
    if (blob.size >= file.size && !needsResize) {
      return file
    }

    return new File([blob], buildFileName(file.name, outputType), {
      type: outputType,
      lastModified: Date.now(),
    })
  } catch (error) {
    console.warn('Kompresi gambar gagal, memakai file asli:', error)
    return file
  }
}

export function formatFileSize(bytes) {
  if (!bytes && bytes !== 0) return ''
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`
}

export default compressImage
