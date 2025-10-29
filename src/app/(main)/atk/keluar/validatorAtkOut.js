/**
 * Validate ATK form data
 * @param {Object} formData - Data form yang akan divalidasi
 * @returns {Object} - Object berisi errors (kosong jika valid)
 */
const ValidatorAtkOut = (formData) => {
  const errors = {}
  
  // ============================================
  // 1. VALIDASI NABAR (Required, Min 3 char)
  // ============================================
  if (!formData.nabar || !formData.nabar.trim()) {
    errors.nabar = 'Nama barang wajib diisi'
  } else if (formData.nabar.trim().length < 3) {
    errors.nabar = 'Nama barang minimal 3 karakter'
  }
}
export default ValidatorAtkOut;
