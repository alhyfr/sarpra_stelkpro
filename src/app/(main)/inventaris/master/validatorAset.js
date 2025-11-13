/**
 * Validate aset/inventaris form data
 * @param {Object} formData - Data form yang akan divalidasi
 * @returns {Object} - Object berisi errors (kosong jika valid)
 */
const validateAsetForm = (formData) => {
  const errors = {}
  
  // ============================================
  // 1. VALIDASI KODE (Required, Min 3 char)
  // ============================================
  if (!formData.kode || !formData.kode.trim()) {
    errors.kode = 'Kode aset wajib diisi'
  }
  
  // ============================================
  // 2. VALIDASI DESKRIPSI (Required, Min 5 char)
  // ============================================
  if (!formData.desc || !formData.desc.trim()) {
    errors.desc = 'Deskripsi aset wajib diisi'
  } 
  
  // ============================================
  // 3. VALIDASI SPESIFIKASI (Optional)
  // ============================================
  // Spesifikasi bersifat opsional, tidak perlu validasi khusus
  
  // ============================================
  // 4. VALIDASI GEDUNG ID (Required)
  // ============================================
  if (!formData.gedung_id || formData.gedung_id === '' || 
      (typeof formData.gedung_id === 'string' && formData.gedung_id.trim() === '')) {
    errors.gedung_id = 'Gedung wajib dipilih'
  }
  
  // ============================================
  // 5. VALIDASI RUANG (Required, Min 2 char)
  // ============================================
  // if (!formData.ruang || !formData.ruang.trim()) {
  //   errors.ruang = 'Ruang wajib diisi'
  // } else if (formData.ruang.trim().length < 5) {
  //   errors.ruang = 'Nama ruang minimal 5 karakter'
  // }
  
  // ============================================
  // 6. VALIDASI NOMOR SERI (Optional)
  // ============================================
  // Nomor seri bersifat opsional
  
  // ============================================
  // 7. VALIDASI MERK (Optional)
  // ============================================
  // Merk bersifat opsional
  
  // ============================================
  // 8. VALIDASI TYPE (Optional)
  // ============================================
  // Type bersifat opsional
  
  // ============================================
  // 9. VALIDASI COLOR (Optional)
  // ============================================
  // Color bersifat opsional
  
  // ============================================
  // 10. VALIDASI JUMLAH (Required, Numeric, Min 1)
  // ============================================
  if (!formData.jml || formData.jml === '' || 
      (typeof formData.jml === 'string' && formData.jml.trim() === '')) {
    errors.jml = 'Jumlah wajib diisi'
  } else {
    const jumlah = parseFloat(formData.jml)
    if (isNaN(jumlah)) {
      errors.jml = 'Jumlah harus berupa angka'
    } 
  }
  
  // ============================================
  // 11. VALIDASI SATUAN (Required)
  // ============================================
  if (!formData.satuan || !formData.satuan.trim()) {
    errors.satuan = 'Satuan wajib diisi'
  }
  
  // ============================================
  // 12. VALIDASI HARGA (Required, Numeric, Min 0)
  // ============================================
  if (!formData.harga || formData.harga === '' || 
      (typeof formData.harga === 'string' && formData.harga.trim() === '')) {
    errors.harga = 'Harga wajib diisi'
  } else {
    const harga = parseFloat(formData.harga)
    if (isNaN(harga)) {
      errors.harga = 'Harga harus berupa angka'
    } 
  }
  
  // ============================================
  // 13. VALIDASI TANGGAL (Required, Valid Date)
  // ============================================
  // if (!formData.tgl || !formData.tgl.trim()) {
  //   errors.tgl = 'Tanggal wajib diisi'
  // } else {
  //   const tanggal = new Date(formData.tgl)
  //   if (isNaN(tanggal.getTime())) {
  //     errors.tgl = 'Format tanggal tidak valid'
  //   }
  // }
  
  // ============================================
  // 14. VALIDASI SUMBER DANA ID (Required)
  // ============================================
  if (!formData.sumber_dana_id || formData.sumber_dana_id === '' || 
      (typeof formData.sumber_dana_id === 'string' && formData.sumber_dana_id.trim() === '')) {
    errors.sumber_dana_id = 'Sumber dana wajib dipilih'
  }
  
  // ============================================
  // 15. VALIDASI BUKTI (Optional)
  // ============================================
  // Bukti bersifat opsional
  
  // ============================================
  // 16. VALIDASI GAMBAR (Optional)
  // ============================================
  // Gambar bersifat opsional
  
  // ============================================
  // 17. VALIDASI STATUS (Required)
  // ============================================
  if (!formData.status || formData.status === '' || 
      (typeof formData.status === 'string' && formData.status.trim() === '')) {
    errors.status = 'Status wajib dipilih'
  }
  
  // ============================================
  // 18. VALIDASI PIC (Required, Min 3 char)
  // ============================================
  if (!formData.pic || !formData.pic.trim()) {
    errors.pic = 'PIC wajib diisi'
  } 
  
  // ============================================
  // 19. VALIDASI KODE YPT (Optional)
  // ============================================
  // Kode YPT bersifat opsional
  
  // ============================================
  // 20. VALIDASI KODE SIM (Optional)
  // ============================================
  // Kode SIM bersifat opsional
  
  // ============================================
  // 21. VALIDASI KETERANGAN (Optional)
  // ============================================
  // Keterangan bersifat opsional
  
  // ============================================
  // 22. VALIDASI KATEGORI (Required)
  // ============================================
  if (!formData.kategori || formData.kategori === '' || 
      (typeof formData.kategori === 'string' && formData.kategori.trim() === '')) {
    errors.kategori = 'Kategori wajib dipilih'
  }
  
  return errors
}

export { validateAsetForm }
