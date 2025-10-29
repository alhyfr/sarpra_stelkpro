/**
 * Validate akun form data
 * @param {Object} formData - Data form yang akan divalidasi
 * @returns {Object} - Object berisi errors (kosong jika valid)
 */
const validateAkunForm = (formData) => {
  const errors = {}
  
  // ============================================
  // 1. VALIDASI UID (Required, Min 5 char, numeric)
  // ============================================
  if (!formData.uid || !formData.uid.trim()) {
    errors.uid = 'uid wajib diisi'
  } else if (formData.uid.trim().length < 5) {
    errors.uid = 'uid minimal 5 karakter'
  } else if (!/^[0-9]+$/.test(formData.uid.trim())) {
    errors.uid = 'uid hanya boleh berisi angka'
  }
  
  // ============================================
  // 2. VALIDASI NAME (Required, Min 3 char)
  // ============================================
  if (!formData.name || !formData.name.trim()) {
    errors.name = 'Nama lengkap wajib diisi'
  } else if (formData.name.trim().length < 3) {
    errors.name = 'Nama minimal 3 karakter'
  }
  
  // ============================================
  // 3. VALIDASI EMAIL (Required, Valid format)
  // ============================================
  if (!formData.email || !formData.email.trim()) {
    errors.email = 'Email wajib diisi'
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email.trim())) {
    errors.email = 'Email tidak valid'
  }
  
  // ============================================
  // 4. VALIDASI PASSWORD (Required, Min 8 char)
  // ============================================
  if (!formData.password || !formData.password.trim()) {
    errors.password = 'Password wajib diisi'
  } else if (formData.password.trim().length < 8) {
    errors.password = 'Password minimal 8 karakter'
  }
  
  // ============================================
  // 5. VALIDASI LEVEL (Required)
  // ============================================
  if (!formData.level || formData.level === '' || 
      (typeof formData.level === 'string' && formData.level.trim() === '')) {
    errors.level = 'Level wajib diisi'
  }
  
  // ============================================
  // 6. VALIDASI POSITION (Required)
  // ============================================
  if (!formData.position || formData.position === '' || 
      (typeof formData.position === 'string' && formData.position.trim() === '')) {
    errors.position = 'Position wajib diisi'
  }
  
  // ============================================
  // 7. VALIDASI STATUS (Required)
  // ============================================
  if (!formData.status || formData.status === '' || 
      (typeof formData.status === 'string' && formData.status.trim() === '')) {
    errors.status = 'Status wajib diisi'
  }
  
  return errors
}

export { validateAkunForm }