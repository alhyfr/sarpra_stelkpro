import validate from "validate.js";

/**
 * ============================================
 * KONFIGURASI DATETIME VALIDATOR
 * ============================================
 * 
 * validate.js memerlukan fungsi parse dan format untuk datetime validator.
 * Kita perlu mengkonfigurasinya sebelum menggunakan datetime validator.
 */

// Fungsi untuk parse string tanggal ke Date object
// Input format: YYYY-MM-DD (format dari input type="date")
validate.validators.datetime.parse = function (value, options) {
  // Jika value sudah berupa Date object, return langsung
  if (value instanceof Date) {
    return value;
  }

  // Jika value adalah string kosong atau null/undefined, return null
  if (!value || typeof value !== 'string') {
    return null;
  }

  // Parse string YYYY-MM-DD ke Date object
  // Input type="date" mengembalikan format YYYY-MM-DD
  const dateMatch = value.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (dateMatch) {
    const year = parseInt(dateMatch[1], 10);
    const month = parseInt(dateMatch[2], 10) - 1; // Month dimulai dari 0
    const day = parseInt(dateMatch[3], 10);

    // PERBAIKAN: Gunakan Date.UTC untuk menghindari timezone issues
    // Kemudian buat Date object dari UTC timestamp
    const date = new Date(Date.UTC(year, month, day));

    // Validasi apakah tanggal valid menggunakan UTC methods
    if (date.getUTCFullYear() === year &&
      date.getUTCMonth() === month &&
      date.getUTCDate() === day) {
      return date;
    }
  }

  // Jika format tidak sesuai, coba parse dengan Date constructor
  const parsedDate = new Date(value);
  if (!isNaN(parsedDate.getTime())) {
    return parsedDate;
  }

  return null;
};

// Fungsi untuk format Date object ke string
// Output format: YYYY-MM-DD (format untuk input type="date")
validate.validators.datetime.format = function (value, options) {
  if (!value) {
    return null;
  }

  // Jika value adalah Date object, format ke YYYY-MM-DD menggunakan UTC
  if (value instanceof Date) {
    const year = value.getUTCFullYear();
    const month = String(value.getUTCMonth() + 1).padStart(2, '0');
    const day = String(value.getUTCDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  // Jika sudah string, return langsung
  return value;
};

/**
 * ============================================
 * CONSTRAINTS UNTUK VALIDASI FORM ASET/INVENTARIS
 * ============================================
 * 
 * Constraints ini digunakan oleh library validate.js untuk memvalidasi form data.
 * Setiap field memiliki aturan validasi yang berbeda sesuai kebutuhan.
 */
export const constraints = {
  // 1. KODE ASET - Wajib diisi
  kode: {
    presence: {
      allowEmpty: false,
      message: "^Kode aset wajib diisi"
    }
  },

  // 2. DESKRIPSI - Wajib diisi
  desc: {
    presence: {
      allowEmpty: false,
      message: "^Deskripsi aset wajib diisi"
    }
  },

  // 3. GEDUNG ID - Wajib dipilih (harus ada nilai)
  gedung_id: {
    presence: {
      allowEmpty: false,
      message: "^Gedung wajib dipilih"
    }
  },

  // 4. JUMLAH - Wajib diisi dan harus berupa angka
  // validate.js otomatis mengkonversi string numerik ke number
  jml: {
    presence: {
      allowEmpty: false,
      message: "^Jumlah wajib diisi"
    },
    numericality: {
      onlyInteger: false,
      greaterThan: 0,
      message: "^Jumlah harus berupa angka dan lebih dari 0"
    }
  },

  // 5. SATUAN - Wajib diisi
  satuan: {
    presence: {
      allowEmpty: false,
      message: "^Satuan wajib diisi"
    }
  },

  // 6. HARGA - Wajib diisi dan harus berupa angka
  // validate.js otomatis mengkonversi string numerik ke number
  harga: {
    presence: {
      allowEmpty: false,
      message: "^Harga wajib diisi"
    },
    numericality: {
      onlyInteger: false,
      greaterThanOrEqualTo: 0,
      message: "^Harga harus berupa angka dan tidak boleh negatif"
    }
  },

  // 7. TANGGAL - Wajib diisi dan harus format tanggal yang valid
  tgl: {
    presence: {
      allowEmpty: false,
      message: "^Tanggal wajib diisi"
    },
    datetime: {
      dateOnly: true,
      message: "^Format tanggal tidak valid"
    }
  },

  // 8. SUMBER DANA ID - Wajib dipilih (harus ada nilai)
  sumber_dana_id: {
    presence: {
      allowEmpty: false,
      message: "^Sumber dana wajib dipilih"
    }
  },

  // 9. STATUS - Wajib dipilih (harus ada nilai)
  status: {
    presence: {
      allowEmpty: false,
      message: "^Status wajib dipilih"
    },
    inclusion: {
      within: ["on", "off"],
      message: "^Status harus dipilih (ON atau OFF)"
    }
  },

  // 10. PIC (Penanggung Jawab) - Wajib diisi
  pic: {
    presence: {
      allowEmpty: false,
      message: "^PIC wajib diisi"
    }
  },

  // 11. KATEGORI - Wajib dipilih (harus ada nilai)
  kategori: {
    presence: {
      allowEmpty: false,
      message: "^Kategori wajib dipilih"
    }
  }

  // CATATAN: Field berikut bersifat OPSIONAL, tidak perlu validasi:
  // - spec (Spesifikasi)
  // - ruang (Ruangan - bisa kosong)
  // - noseri (Nomor Seri)
  // - merk (Merk)
  // - type (Type)
  // - color (Warna)
  // - bukti (Bukti Pembelian)
  // - gambar (Gambar Aset)
  // - kode_ypt (Kode YPT)
  // - kode_sim (Kode SIMKUG)
  // - ket (Keterangan)
};

/**
 * ============================================
 * FUNGSI VALIDASI FORM ASET/INVENTARIS
 * ============================================
 * 
 * Fungsi ini menggunakan library validate.js untuk memvalidasi form data aset.
 * 
 * @param {Object} formData - Data form yang akan divalidasi
 * @returns {Object} - Object berisi errors (kosong jika valid)
 * 
 * Contoh penggunaan:
 * const errors = validateAsetForm(formData);
 * if (Object.keys(errors).length === 0) {
 *   // Form valid, lanjutkan submit
 * } else {
 *   // Ada error, tampilkan pesan error
 * }
 */
export const validateAsetForm = (formData) => {
  // Validasi menggunakan validate.js
  // validate.js akan otomatis memvalidasi sesuai dengan constraints yang didefinisikan
  const validationErrors = validate(formData, constraints);

  // Jika tidak ada error, return object kosong
  // validate.js mengembalikan undefined jika tidak ada error
  if (!validationErrors) {
    return {};
  }

  // Format error dari validate.js agar sesuai dengan format yang diharapkan
  // validate.js mengembalikan object dengan field sebagai key dan array error sebagai value
  // Kita ambil pesan error pertama dari setiap array dan hapus prefix "^" jika ada
  const formattedErrors = {};

  Object.keys(validationErrors).forEach((field) => {
    let errorMessage = '';

    // Ambil pesan error pertama dari array
    if (Array.isArray(validationErrors[field])) {
      errorMessage = validationErrors[field][0] || '';
    } else if (typeof validationErrors[field] === 'string') {
      errorMessage = validationErrors[field];
    } else {
      errorMessage = String(validationErrors[field]);
    }

    // Hapus prefix "^" jika ada (validate.js menggunakan "^" untuk custom message)
    if (errorMessage.startsWith('^')) {
      errorMessage = errorMessage.substring(1);
    }

    formattedErrors[field] = errorMessage;
  });

  return formattedErrors;
};
export const validatePerawtanAsetForm = (formData) => {
  const constraints = {
    inventaris_id: {
      presence: {
        allowEmpty: false,
        message: "^Inventaris wajib dipilih"
      }
    }
  };

  // Validasi menggunakan validate.js
  const validationErrors = validate(formData, constraints);

  // Jika tidak ada error, return object kosong
  if (!validationErrors) {
    return {};
  }

  // Format error dari validate.js
  const formattedErrors = {};
  Object.keys(validationErrors).forEach((field) => {
    let errorMessage = '';

    if (Array.isArray(validationErrors[field])) {
      errorMessage = validationErrors[field][0] || '';
    } else if (typeof validationErrors[field] === 'string') {
      errorMessage = validationErrors[field];
    } else {
      errorMessage = String(validationErrors[field]);
    }

    // Hapus prefix "^" jika ada
    if (errorMessage.startsWith('^')) {
      errorMessage = errorMessage.substring(1);
    }

    formattedErrors[field] = errorMessage;
  });

  return formattedErrors;
};
