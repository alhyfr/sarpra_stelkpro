// ============================================
// TEAM FORM VALIDATOR
// ============================================
// Reusable validation functions untuk form Team

/**
 * Validate team form data
 * @param {Object} formData - Data form yang akan divalidasi
 * @returns {Object} - Object berisi errors (kosong jika valid)
 */
export const validateTeamForm = (formData) => {
  const errors = {}
  
  // ============================================
  // 1. VALIDASI NIP (Required, Min 5 char)
  // ============================================
  if (!formData.nip || !formData.nip.trim()) {
    errors.nip = 'NIP wajib diisi'
  } else if (formData.nip.trim().length < 5) {
    errors.nip = 'NIP minimal 5 karakter'
  } else if (!/^[0-9]+$/.test(formData.nip.trim())) {
    errors.nip = 'NIP hanya boleh berisi angka'
  }
  
  // ============================================
  // 2. VALIDASI NIK (Optional, Min 10 char jika diisi)
  // ============================================
  if (formData.nik && formData.nik.trim().length > 0) {
    if (formData.nik.trim().length < 5) {
      errors.nik = 'NIK minimal 10 karakter'
    } else if (formData.nik.trim().length > 16) {
      errors.nik = 'NIK maksimal 16 karakter'
    } else if (!/^[0-9]+$/.test(formData.nik.trim())) {
      errors.nik = 'NIK hanya boleh berisi angka'
    }
  }
  
  // ============================================
  // 3. VALIDASI NAMA (Required, Min 3 char)
  // ============================================
  if (!formData.nama || !formData.nama.trim()) {
    errors.nama = 'Nama lengkap wajib diisi'
  } else if (formData.nama.trim().length < 3) {
    errors.nama = 'Nama minimal 3 karakter'
  } 
  
  // ============================================
  // 4. VALIDASI NICKNAME (Required, Min 2 char)
  // ============================================
  if (!formData.nikname || !formData.nikname.trim()) {
    errors.nikname = 'Nickname wajib diisi'
  } else if (formData.nikname.trim().length < 2) {
    errors.nikname = 'Nickname minimal 2 karakter'
  } else if (formData.nikname.trim().length > 50) {
    errors.nikname = 'Nickname maksimal 50 karakter'
  }
  
  // ============================================
  // 5. VALIDASI STATUS (Required)
  // ============================================
  if (!formData.status || !formData.status.trim()) {
    errors.status = 'Status kepegawaian wajib diisi'
  } else {
    // Optional: Validasi value harus salah satu dari list
    const validStatuses = ['PEGTAP', 'FULL TIME', 'PART TIME', 'KONTRAK']
    const statusUpper = formData.status.trim().toUpperCase()
    
    // Uncomment jika mau strict validation
    // if (!validStatuses.includes(statusUpper)) {
    //   errors.status = `Status harus salah satu dari: ${validStatuses.join(', ')}`
    // }
  }
  
  // ============================================
  // 6. VALIDASI JABATAN (Required)
  // ============================================
  if (!formData.jabatan || !formData.jabatan.trim()) {
    errors.jabatan = 'Jabatan wajib diisi'
  } else if (formData.jabatan.trim().length < 2) {
    errors.jabatan = 'Jabatan minimal 2 karakter'
  } else if (formData.jabatan.trim().length > 100) {
    errors.jabatan = 'Jabatan maksimal 100 karakter'
  }
  
  // ============================================
  // 7. VALIDASI FOTO (Optional)
  // ============================================
  // Foto optional, validasi dilakukan di component (file type & size)
  // Tidak perlu validasi di sini karena sudah di-handle oleh AFile component
  
  return errors
}

/**
 * Check if form is valid
 * @param {Object} formData - Data form yang akan divalidasi
 * @returns {Boolean} - true jika valid, false jika ada error
 */
export const isTeamFormValid = (formData) => {
  const errors = validateTeamForm(formData)
  return Object.keys(errors).length === 0
}

/**
 * Validate single field
 * @param {String} fieldName - Nama field
 * @param {String} value - Nilai field
 * @returns {String} - Error message atau empty string
 */
export const validateTeamField = (fieldName, value, formData = {}) => {
  const tempData = { ...formData, [fieldName]: value }
  const errors = validateTeamForm(tempData)
  return errors[fieldName] || ''
}

/**
 * Get field requirements untuk display di UI
 */
export const getFieldRequirements = () => {
  return {
    nip: {
      required: true,
      minLength: 5,
      pattern: 'numeric',
      label: 'NIP'
    },
    nik: {
      required: false,
      minLength: 10,
      maxLength: 16,
      pattern: 'numeric',
      label: 'NIK'
    },
    nama: {
      required: true,
      minLength: 3,
      maxLength: 100,
      pattern: 'alphabetic',
      label: 'Nama Lengkap'
    },
    nikname: {
      required: true,
      minLength: 2,
      maxLength: 50,
      label: 'Nickname'
    },
    status: {
      required: true,
      options: ['PEGTAP', 'FULL TIME', 'PART TIME', 'KONTRAK'],
      label: 'Status Kepegawaian'
    },
    jabatan: {
      required: true,
      minLength: 2,
      maxLength: 100,
      label: 'Jabatan'
    }
  }
}

