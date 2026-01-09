"use client";
import { useState, useEffect } from "react";
import AInput from "@/components/AInput";
import { useData } from "@/app/context/DataContext";
import { useAuth } from "@/app/context/AuthContext";
import ASearchableSelect from "@/components/ASearchableSelect";
import dayjs from "dayjs";
export default function TambahAtkKeluar({
  onClose = null,
  onSuccess = null,
  postAtkOut = null,
  editingAtkOut = null,
  isEditMode = false,
}) {
  const { user } = useAuth();
  const [formData, setFormData] = useState({
    atk_id: "",
    vol: "",
    tgl: "",
    pengambil: "",
    kategori: "",
    unit: "",
    status: "proses",
    pic: user?.name || "",
  });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [showErrors, setShowErrors] = useState(false);
  const [selectedAtk, setSelectedAtk] = useState(null);
  const [selectedPengambil, setSelectedPengambil] = useState(null);
  const {
    getOpsi,
    getAtkFilter,
    atkFilter,
    AtkFilter,
    getMemberFilter,
    memberFilter,
    MemberFilter,
  } = useData();

  useEffect(() => {
    getOpsi();
    getAtkFilter();
    getMemberFilter();
  }, []);

  // Debug: Log memberFilter data structure

  useEffect(() => {
    if (isEditMode && editingAtkOut) {
      setFormData({
        atk_id: String(editingAtkOut.atk_id || ""),
        vol: String(editingAtkOut.vol || ""),
        tgl: dayjs(editingAtkOut.tgl).format("YYYY-MM-DD"),
        pengambil: String(editingAtkOut.pengambil || ""),
        kategori: String(editingAtkOut.kategori || ""),
        unit: String(editingAtkOut.unit || ""),
        status: String(editingAtkOut.status || "proses"),
        pic: String(editingAtkOut.pic || ""),

      });

      // Set selected items for edit mode
      if (editingAtkOut.atk_id) {
        setSelectedAtk({ id: editingAtkOut.atk_id, nabar: editingAtkOut.nabar });
      }
      if (editingAtkOut.pengambil) {
        setSelectedPengambil({ id: editingAtkOut.pengambil, name: editingAtkOut.pengambil_name });
      }
    }
  }, [isEditMode, editingAtkOut]);
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    // Clear error when user starts typing (jika showErrors aktif)
    if (showErrors && errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: "",
      }));
    }
  };
  // Handler untuk searchable select ATK
  const handleAtkSelect = (selectedItem) => {
    setSelectedAtk(selectedItem);
    setFormData((prev) => ({
      ...prev,
      atk_id: selectedItem.id,
    }));

    // Clear error when user selects
    if (showErrors && errors.atk_id) {
      setErrors((prev) => ({
        ...prev,
        atk_id: "",
      }));
    }
  };

  // Handler untuk searchable select Pengambil
  const handlePengambilSelect = (selectedItem) => {
    setSelectedPengambil(selectedItem);

    // Auto-set kategori dan unit berdasarkan data dari API getMemberFilter
    let autoKategori = "gupeg"; // Default ke guru & pegawai
    let autoUnit = "sarpra"; // Default ke sarpra

    // Ambil kategori dari data API (field: kategori atau category)
    if (selectedItem.kategori) {
      autoKategori = selectedItem.kategori;
    } else if (selectedItem.category) {
      autoKategori = selectedItem.category;
    } else if (selectedItem.role) {
      // Fallback berdasarkan role jika tidak ada field kategori
      const role = selectedItem.role.toLowerCase();
      if (role.includes('siswa') || role.includes('student')) {
        autoKategori = "siswa";
      } else {
        autoKategori = "gupeg";
      }
    }

    // Ambil unit dari data API (field: unit atau department)
    if (selectedItem.unit) {
      autoUnit = selectedItem.unit;
    } else if (selectedItem.department) {
      autoUnit = selectedItem.department;
    } else if (selectedItem.position) {
      // Fallback berdasarkan position jika tidak ada field unit
      const position = selectedItem.position.toLowerCase();
      if (position.includes('kurikulum')) {
        autoUnit = "kurikulum";
      } else if (position.includes('sarpra') || position.includes('sarana')) {
        autoUnit = "sarpra";
      } else if (position.includes('hr') || position.includes('human') || position.includes('capital')) {
        autoUnit = "hc";
      } else if (position.includes('kesiswaan')) {
        autoUnit = "kesiswaan";
      } else if (position.includes('hubinkom') || position.includes('hubungan') || position.includes('komunikasi')) {
        autoUnit = "hubinkom";
      } else if (position.includes('siswa') || position.includes('student')) {
        autoUnit = "siswa";
      }
    }





    setFormData((prev) => ({
      ...prev,
      pengambil: selectedItem.id,
      kategori: autoKategori,
      unit: autoUnit,
    }));

    // Clear error when user selects
    if (showErrors && errors.pengambil) {
      setErrors((prev) => ({
        ...prev,
        pengambil: "",
      }));
    }

    // Clear kategori dan unit errors
    if (showErrors) {
      setErrors((prev) => ({
        ...prev,
        kategori: "",
        unit: "",
      }));
    }
  };
  const handleFileChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    // Clear error for file field
    if (showErrors && errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: "",
      }));
    }
  };
  const validateForm = () => {
    const newErrors = {};
    if (!formData.atk_id) {
      newErrors.atk_id = "Nama barang wajib dipilih";
    }
    if (!formData.vol) {
      newErrors.vol = "Volume wajib diisi";
    } else if (parseInt(formData.vol) <= 0) {
      newErrors.vol = "Volume harus lebih dari 0";
    }
    if (!formData.tgl) {
      newErrors.tgl = "Tanggal wajib diisi";
    }
    if (!formData.pengambil) {
      newErrors.pengambil = "Nama pengambil wajib diisi";
    }
    // Kategori dan unit tidak perlu divalidasi karena auto-set
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  const handleSubmit = async (e) => {
    e.preventDefault();
    // Set showErrors ke true untuk menampilkan error
    setShowErrors(true);

    if (!validateForm()) {
      return;
    }

    setLoading(true);
    setErrors({});
    setShowErrors(false); // Reset setelah validasi sukses

    try {
      let submitData;
      const ensureString = (value) => (value == null ? "" : String(value));
      submitData = {
        atk_id: ensureString(formData.atk_id),
        vol: ensureString(formData.vol),
        tgl: ensureString(formData.tgl),
        pengambil: ensureString(formData.pengambil),
        kategori: ensureString(formData.kategori),
        unit: ensureString(formData.unit),
        status: ensureString(formData.status),
        pic: ensureString(formData.pic),
      };

      if (postAtkOut) {
        await postAtkOut(submitData);
      } else {
        throw new Error("postAtkOut function not provided");
      }

      setFormData({
        atk_id: "",
        vol: "",
        tgl: "",
        pengambil: "",
        kategori: "",
        unit: "",
        status: "proses",
      });
      setSelectedAtk(null);
      setSelectedPengambil(null);

      setShowErrors(false);
      setErrors({});

      if (onSuccess) onSuccess(submitData);
      if (onClose) onClose();
    } catch (error) {
      if (
        error.response?.data?.status === "error" &&
        error.response?.data?.field
      ) {
        const fieldError = error.response.data.field;
        const errorMessage = error.response.data.message;

        setErrors((prev) => ({
          ...prev,
          [fieldError]: errorMessage,
        }));
        setShowErrors(true);
      } else {
        const errorMessage =
          error.response?.data?.message ||
          error.message ||
          "Terjadi kesalahan saat menyimpan data";
        alert(errorMessage);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <form onSubmit={handleSubmit} className="space-y-6" noValidate>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Nama Barang */}
          <ASearchableSelect
            id="atk_id"
            name="atk_id"
            label="NAMA BARANG"
            placeholder="Cari nama barang..."
            value={formData.atk_id}
            onChange={handleInputChange}
            onSelect={handleAtkSelect}
            error={showErrors ? errors.atk_id : ""}
            required
            options={atkFilter || []}
            searchFunction={AtkFilter}
            displayKey="nabar"
            valueKey="id"
            searchKey="nabar"
            minSearchLength={2}
            noResultsText="Barang tidak ditemukan"
          />

          {/* Volume */}
          <AInput
            id="vol"
            name="vol"
            label="VOLUME"
            placeholder="Masukkan volume"
            type="number"
            min="1"
            value={formData.vol}
            onChange={handleInputChange}
            error={showErrors ? errors.vol : ""}
            required
          />

          {/* Tanggal */}
          <AInput
            id="tgl"
            name="tgl"
            label="TANGGAL"
            placeholder="Pilih tanggal"
            type="date"
            value={formData.tgl}
            onChange={handleInputChange}
            error={showErrors ? errors.tgl : ""}
            required
          />
          <AInput
            id="pic"
            name="pic"
            label="PIC (PENANGGUNG JAWAB)"
            placeholder="Masukkan nama PIC"
            value={formData.pic}
            onChange={handleInputChange}
            error={showErrors ? errors.pic : ""}
            required
            readOnly
            className="bg-gray-100 dark:bg-gray-700 text-slate-400"
          />

          {/* Nama Pengambil */}
          <div>
            <ASearchableSelect
              id="pengambil"
              name="pengambil"
              label="NAMA PENGAMBIL"
              placeholder="Cari nama pengambil..."
              value={formData.pengambil}
              onChange={handleInputChange}
              onSelect={handlePengambilSelect}
              error={showErrors ? errors.pengambil : ""}
              required
              options={memberFilter || []}
              searchFunction={MemberFilter}
              displayKey="name"
              valueKey="name"
              searchKey="name"
              minSearchLength={2}
              noResultsText="Pengambil tidak ditemukan"
            />

          </div>



        </div>

        {/* Submit Button */}
        <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-lg transition-colors"
          >
            Batal
          </button>
          <button
            type="submit"
            disabled={loading}
            className="px-6 py-2 bg-red-600 hover:bg-red-700 disabled:bg-red-400 text-white rounded-lg transition-colors flex items-center gap-2"
          >
            {loading && (
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
            )}
            {isEditMode ? "Update" : "Simpan"}
          </button>
        </div>
      </form>
    </div>
  );
}
