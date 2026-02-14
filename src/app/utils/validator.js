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
 */
export const constraints = {
  kode: {
    presence: {
      allowEmpty: false,
      message: "^Kode aset wajib diisi"
    }
  },
  desc: {
    presence: {
      allowEmpty: false,
      message: "^Deskripsi aset wajib diisi"
    }
  },
  gedung_id: {
    presence: {
      allowEmpty: false,
      message: "^Gedung wajib dipilih"
    }
  },
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
  satuan: {
    presence: {
      allowEmpty: false,
      message: "^Satuan wajib diisi"
    }
  },
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
  sumber_dana_id: {
    presence: {
      allowEmpty: false,
      message: "^Sumber dana wajib dipilih"
    }
  },
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
  pic: {
    presence: {
      allowEmpty: false,
      message: "^PIC wajib diisi"
    }
  },
  kategori: {
    presence: {
      allowEmpty: false,
      message: "^Kategori wajib dipilih"
    }
  }
};

/**
 * ============================================
 * HELPER FUNCTION - FORMAT ERROR MESSAGES
 * ============================================
 */
const formatValidationErrors = (validationErrors) => {
  if (!validationErrors) {
    return {};
  }

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

    if (errorMessage.startsWith('^')) {
      errorMessage = errorMessage.substring(1);
    }

    formattedErrors[field] = errorMessage;
  });

  return formattedErrors;
};

/**
 * ============================================
 * HELPER FUNCTION - CREATE VALIDATOR
 * ============================================
 */
const createValidator = (constraints) => {
  return (formData) => {
    const validationErrors = validate(formData, constraints);
    return formatValidationErrors(validationErrors);
  };
};

/**
 * ============================================
 * VALIDATORS
 * ============================================
 */

// Validator untuk form Aset/Inventaris
export const validateAsetForm = createValidator(constraints);

// Validator untuk form Perawatan Aset
export const validatePerawtanAsetForm = createValidator({
  inventaris_id: {
    presence: {
      allowEmpty: false,
      message: "^Inventaris wajib dipilih"
    }
  }
});

// Validator untuk form Bangunan
export const validateBangunanForm = createValidator({
  nama_bagian: {
    presence: {
      allowEmpty: false,
      message: "^Nama bagian wajib diisi"
    }
  },
  jenis_kerusakan: {
    presence: {
      allowEmpty: false,
      message: "^Jenis kerusakan wajib diisi"
    }
  },
  tindakan: {
    presence: {
      allowEmpty: false,
      message: "^Tindakan wajib diisi"
    }
  },
  tgl_masuk: {
    presence: {
      allowEmpty: false,
      message: "^Tanggal masuk wajib diisi"
    }
  },
  pic: {
    presence: {
      allowEmpty: false,
      message: "^PIC wajib diisi"
    }
  },
  status: {
    presence: {
      allowEmpty: false,
      message: "^Status wajib diisi"
    }
  }
});

// Validator untuk form Gedung
export const validateGedungForm = createValidator({
  gedung: {
    presence: {
      allowEmpty: false,
      message: "^Gedung wajib diisi"
    }
  },
  ket: {
    presence: {
      allowEmpty: false,
      message: "^Keterangan wajib diisi"
    }
  }
});

export const validateRuanganForm = createValidator({
  ruangan: {
    presence: {
      allowEmpty: false,
      message: "^Ruangan wajib diisi"
    }
  },
  gedung_id: {
    presence: {
      allowEmpty: false,
      message: "^Gedung wajib dipilih"
    }
  },
  status: {
    presence: {
      allowEmpty: false,
      message: "^Status wajib diisi"
    }
  }
});


export const validateSatuanForm = createValidator({
  satuan: {
    presence: {
      allowEmpty: false,
      message: "^Satuan wajib diisi"
    }
  }
});

export const validateKategoriForm = createValidator({
  kategori: {
    presence: {
      allowEmpty: false,
      message: "^Kategori wajib diisi"
    }
  }
});

export const validateSumberForm = createValidator({
  sumber: {
    presence: {
      allowEmpty: false,
      message: "^Sumber wajib diisi"
    }
  },
  status: {
    presence: {
      allowEmpty: false,
      message: "^Status wajib diisi"
    }
  }
});

export const validateSupportForm = createValidator({
  kode: {
    presence: {
      allowEmpty: false,
      message: "^Nama wajib diisi"
    }
  },
  nama: {
    presence: {
      allowEmpty: false,
      message: "^Alamat wajib diisi"
    }
  },
  alamat: {
    presence: {
      allowEmpty: false,
      message: "^Email wajib diisi"
    }
  },
  jk: {
    presence: {
      allowEmpty: false,
      message: "^Jenis kelamin wajib diisi"
    }
  },
  status: {
    presence: {
      allowEmpty: false,
      message: "^Status wajib diisi"
    }
  },
  hp: {
    presence: {
      allowEmpty: false,
      message: "^Keterangan wajib diisi"
    }
  }
});
export const validateDaftarLabForm = createValidator({
  nama_lab: {
    presence: {
      allowEmpty: false,
      message: "^Nama lab wajib diisi"
    }
  },
  jurusan: {
    presence: {
      allowEmpty: false,
      message: "^Jurusan wajib diisi"
    }
  },
  laboran: {
    presence: {
      allowEmpty: false,
      message: "^Laboran wajib diisi"
    }
  },
  ruangan_id: {
    presence: {
      allowEmpty: false,
      message: "^Ruangan wajib dipilih"
    }
  }
});
export const validateInventarisLabForm = createValidator({
  lab_id: {
    presence: {
      allowEmpty: false,
      message: "^Lab wajib dipilih"
    }
  },
  inventaris_id: {
    presence: {
      allowEmpty: false,
      message: "^Inventaris wajib dipilih"
    }
  },
});
export const validateBahanForm = createValidator({
  nama_barang: {
    presence: {
      allowEmpty: false,
      message: "^Nama bahan wajib diisi"
    }
  },
  kategori: {
    presence: {
      allowEmpty: false,
      message: "^Kategori wajib diisi"
    }
  },
  satuan: {
    presence: {
      allowEmpty: false,
      message: "^Satuan wajib diisi"
    }
  },
  stok_awal: {
    presence: {
      allowEmpty: false,
      message: "^Stok awal wajib diisi"
    }
  },
  stok_minimum: {
    presence: {
      allowEmpty: false,
      message: "^Stok minimum wajib diisi"
    }
  },
  lokasi: {
    presence: {
      allowEmpty: false,
      message: "^Lokasi wajib diisi"
    }
  },
  kondisi: {
    presence: {
      allowEmpty: false,
      message: "^Kondisi wajib diisi"
    }
  },
});
export const validateJadwalLabForm = createValidator({
  lab_id: {
    presence: {
      allowEmpty: false,
      message: "^Lab wajib dipilih"
    }
  },
  mapel: {
    presence: {
      allowEmpty: false,
      message: "^Mapel wajib diisi"
    }
  },
  topik: {
    presence: {
      allowEmpty: false,
      message: "^Topik wajib diisi"
    }
  },
  pj: {
    presence: {
      allowEmpty: false,
      message: "^Fasilitator wajib dipilih"
    }
  }
});
export const validateTahunanForm = createValidator({
  kegiatan: {
    presence: {
      allowEmpty: false,
      message: "^Kegiatan wajib diisi"
    }
  },
  tgl: {
    presence: {
      allowEmpty: false,
      message: "^Tanggal wajib diisi"
    }
  },
  end: {
    presence: {
      allowEmpty: false,
      message: "^Tanggal selesai wajib diisi"
    }
  },
  lokasi: {
    presence: {
      allowEmpty: false,
      message: "^Lokasi wajib diisi"
    }
  },
  status: {
    presence: {
      allowEmpty: false,
      message: "^Status wajib diisi"
    }
  },
  team_id: {
    presence: {
      allowEmpty: false,
      message: "^Team wajib dipilih"
    }
  }
});
export const validateEventForm = createValidator({
  kegiatan: {
    presence: {
      allowEmpty: false,
      message: "^Kegiatan wajib diisi"
    }
  },
  tgl_mulai: {
    presence: {
      allowEmpty: false,
      message: "^Tanggal mulai wajib diisi"
    }
  },
  tgl_selesai: {
    presence: {
      allowEmpty: false,
      message: "^Tanggal selesai wajib diisi"
    }
  },
  ruangan_id: {
    presence: {
      allowEmpty: false,
      message: "^Ruangan wajib dipilih"
    }
  }
});

// Validator untuk form Member
export const validateMemberForm = createValidator({
  mid: {
    presence: {
      allowEmpty: false,
      message: "^Kode Member wajib diisi"
    }
  },
  name: {
    presence: {
      allowEmpty: false,
      message: "^Nama Member wajib diisi"
    }
  },
  unit: {
    presence: {
      allowEmpty: false,
      message: "^Unit wajib diisi"
    }
  },
  kategori: {
    presence: {
      allowEmpty: false,
      message: "^Kategori wajib dipilih"
    }
  },
  status: {
    presence: {
      allowEmpty: false,
      message: "^Status wajib dipilih"
    }
  }
});

export const validateSertiForm = createValidator({
  penerima: {
    presence: {
      allowEmpty: false,
      message: "^Penerima wajib diisi"
    }
  },
  unit: {
    presence: {
      allowEmpty: false,
      message: "^Unit wajib diisi"
    }
  },
  jabatan: {
    presence: {
      allowEmpty: false,
      message: "^Jabatan wajib diisi"
    }
  },
  team_id: {
    presence: {
      allowEmpty: false,
      message: "^Team wajib dipilih"
    }
  },
  nip: {
    presence: {
      allowEmpty: false,
      message: "^NIP wajib diisi"
    }
  }
});

export const validateListForm = createValidator({
  stbar_id: {
    presence: {
      allowEmpty: false,
      message: "^Stbar wajib dipilih"
    }
  },
  nabar: {
    presence: {
      allowEmpty: false,
      message: "^Nabar wajib diisi"
    }
  },
  jml: {
    presence: {
      allowEmpty: false,
      message: "^Jml wajib diisi"
    }
  },
  kondisi: {
    presence: {
      allowEmpty: false,
      message: "^Kondisi wajib diisi"
    }
  },
  ruangan: {
    presence: {
      allowEmpty: false,
      message: "^Ruangan wajib dipilih"
    }
  }
});

export const validateTokenForm = createValidator({
  app_name: {
    presence: {
      allowEmpty: false,
      message: "^Nama Aplikasi wajib diisi"
    }
  },
  permissions: {
    presence: {
      allowEmpty: false,
      message: "^Permissions wajib diisi"
    }
  },
  is_active: {
    presence: {
      allowEmpty: false,
      message: "^Status wajib diisi"
    }
  }
})




