/**
 * Validate habis pakai form data
 * @param {Object} formData - Data form yang akan divalidasi
 * @returns {Object} - Object berisi errors (kosong jika valid)
 */

const getStringValue = (value) => {
  if (value === null || value === undefined) return ''
  return String(value).trim()
}

const validateHabisForm = (formData) => {
  const errors = {}

  // Validasi Kode
  const kodeValue = getStringValue(formData.kode)
  if (!kodeValue) {
    errors.kode = 'Kode barang wajib diisi'
  } else if (kodeValue.length < 3) {
    errors.kode = 'Kode barang minimal 3 karakter'
  } else if (!/^[A-Za-z0-9_-]+$/.test(kodeValue)) {
    errors.kode = 'Kode hanya boleh berisi huruf, angka, underscore (_), dan dash (-)'
  }

  // Validasi Nama Barang
  const nabarValue = getStringValue(formData.nabar)
  if (!nabarValue) {
    errors.nabar = 'Nama barang wajib diisi'
  } else if (nabarValue.length < 3) {
    errors.nabar = 'Nama barang minimal 3 karakter'
  }

  // Validasi Deskripsi
  const deskripsiValue = getStringValue(formData.deskripsi)
  if (!deskripsiValue) {
    errors.deskripsi = 'Deskripsi wajib diisi'
  } else if (deskripsiValue.length < 10) {
    errors.deskripsi = 'Deskripsi minimal 10 karakter'
  }

  // Validasi Stok
  const stokValue = getStringValue(formData.stok)
  if (!stokValue) {
    errors.stok = 'Stok wajib diisi'
  } else {
    const stokNum = parseInt(stokValue)
    if (isNaN(stokNum) || !Number.isInteger(stokNum)) {
      errors.stok = 'Stok harus berupa bilangan bulat'
    } else if (stokNum < 0) {
      errors.stok = 'Stok tidak boleh negatif'
    }
  }

  // Validasi Lokasi Penyimpanan
  const lokasiValue = getStringValue(formData.lokasi_penyimpanan)
  if (!lokasiValue) {
    errors.lokasi_penyimpanan = 'Lokasi penyimpanan wajib diisi'
  } else if (lokasiValue.length < 3) {
    errors.lokasi_penyimpanan = 'Lokasi penyimpanan minimal 3 karakter'
  }

  // Validasi Harga
  const hargaValue = getStringValue(formData.harga)
  if (!hargaValue) {
    errors.harga = 'Harga wajib diisi'
  } else {
    const hargaNum = parseFloat(hargaValue)
    if (isNaN(hargaNum)) {
      errors.harga = 'Harga harus berupa angka'
    } else if (hargaNum < 0) {
      errors.harga = 'Harga tidak boleh negatif'
    }
  }

  // Validasi Satuan
  const satuanValue = getStringValue(formData.satuan)
  if (!satuanValue) {
    errors.satuan = 'Satuan wajib diisi'
  }

  // Validasi Kategori
  const kategoriValue = getStringValue(formData.kategori)
  if (!kategoriValue) {
    errors.kategori = 'Kategori wajib diisi'
  }

  // Validasi Tanggal
  const tglValue = getStringValue(formData.tgl)
  if (!tglValue) {
    errors.tgl = 'Tanggal wajib diisi'
  } else {
    const tglDate = new Date(tglValue)
    if (isNaN(tglDate.getTime())) {
      errors.tgl = 'Format tanggal tidak valid'
    }
  }

  return errors
}

export { validateHabisForm }