/**
 * Validate akun form data
 * @param {Object} formData
 * @param {{ isEditMode?: boolean }} options
 */
const validateAkunForm = (formData, options = {}) => {
  const { isEditMode = false } = options;
  const errors = {};

  if (!formData.uid || !String(formData.uid).trim()) {
    errors.uid = "UID wajib diisi";
  } else if (String(formData.uid).trim().length < 5) {
    errors.uid = "UID minimal 5 karakter";
  } else if (!/^[0-9]+$/.test(String(formData.uid).trim())) {
    errors.uid = "UID hanya boleh berisi angka";
  }

  if (!formData.name || !String(formData.name).trim()) {
    errors.name = "Nama lengkap wajib diisi";
  } else if (String(formData.name).trim().length < 3) {
    errors.name = "Nama minimal 3 karakter";
  }

  if (!formData.email || !String(formData.email).trim()) {
    errors.email = "Email wajib diisi";
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(formData.email).trim())) {
    errors.email = "Email tidak valid";
  }

  const password = formData.password ? String(formData.password).trim() : "";
  if (!isEditMode) {
    if (!password) {
      errors.password = "Password wajib diisi";
    } else if (password.length < 8) {
      errors.password = "Password minimal 8 karakter";
    }
  } else if (password && password.length < 8) {
    errors.password = "Password minimal 8 karakter";
  }

  if (
    formData.level === undefined ||
    formData.level === null ||
    String(formData.level).trim() === ""
  ) {
    errors.level = "Level hak akses wajib dipilih";
  }

  if (
    formData.position === undefined ||
    formData.position === null ||
    String(formData.position).trim() === ""
  ) {
    errors.position = "Jabatan wajib dipilih";
  }

  if (
    !formData.status ||
    (typeof formData.status === "string" && formData.status.trim() === "")
  ) {
    errors.status = "Status akun wajib dipilih";
  }

  return errors;
};

export { validateAkunForm };
