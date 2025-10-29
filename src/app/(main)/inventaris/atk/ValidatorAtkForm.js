/**
 * Validate ATK form data
 * @param {Object} formData - Data form yang akan divalidasi
 * @returns {Object} - Object berisi errors (kosong jika valid)
 */
const ValidatorAtkForm = (formData) => {
  const errors = {}
  
  // Helper function untuk convert value ke string dan trim
  const getStringValue = (value) => {
    if (value === null || value === undefined) return ''
    return String(value).trim()
  }
  
  // ============================================
  // 1. VALIDASI KODE (Required, Min 3 char, Alphanumeric)
  // ============================================
  const kodeValue = getStringValue(formData.kode)
  if (!kodeValue) {
    errors.kode = 'Kode barang wajib diisi'
  } else if (kodeValue.length < 3) {
    errors.kode = 'Kode barang minimal 3 karakter'
  } else if (!/^[A-Za-z0-9_-]+$/.test(kodeValue)) {
    errors.kode = 'Kode hanya boleh berisi huruf, angka, underscore (_), dan dash (-)'
  }
  
  // ============================================
  // 2. VALIDASI NAMA BARANG (Required, Min 3 char)
  // ============================================
  const nabarValue = getStringValue(formData.nabar)
  if (!nabarValue) {
    errors.nabar = 'Nama barang wajib diisi'
  } else if (nabarValue.length < 3) {
    errors.nabar = 'Nama barang minimal 3 karakter'
  }
  
  // ============================================
  // 3. VALIDASI SPESIFIKASI (Optional)
  // ============================================
  // Spesifikasi bersifat opsional, tidak perlu validasi khusus
  
  // ============================================
  // 4. VALIDASI SATUAN (Required)
  // ============================================
  const satuanValue = getStringValue(formData.satuan)
  if (!satuanValue) {
    errors.satuan = 'Satuan wajib diisi'
  }
  
  // ============================================
  // 5. VALIDASI STOK AWAL (Required, Numeric, Min 0)
  // ============================================
  const stokValue = getStringValue(formData.stok_awal)
  if (!stokValue) {
    errors.stok_awal = 'Stok awal wajib diisi'
  } else {
    const stok = parseFloat(stokValue)
    if (isNaN(stok)) {
      errors.stok_awal = 'Stok awal harus berupa angka'
    } else if (stok < 0) {
      errors.stok_awal = 'Stok awal tidak boleh negatif'
    } else if (!Number.isInteger(stok)) {
      errors.stok_awal = 'Stok awal harus berupa bilangan bulat'
    }
  }
  
  // ============================================
  // 6. VALIDASI PIC (Required, Min 3 char)
  // ============================================
  const picValue = getStringValue(formData.pic)
  if (!picValue) {
    errors.pic = 'PIC wajib diisi'
  } else if (picValue.length < 3) {
    errors.pic = 'Nama PIC minimal 3 karakter'
  }
  
  // ============================================
  // 7. VALIDASI FOTO (Optional)
  // ============================================
  // Foto bersifat opsional, tidak perlu validasi khusus
  
  return errors
}

export { ValidatorAtkForm }