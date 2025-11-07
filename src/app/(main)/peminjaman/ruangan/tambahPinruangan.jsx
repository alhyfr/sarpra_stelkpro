"use client";
import { useState, useEffect } from "react";
import AInput from "@/components/AInput";
import ASelect from "@/components/ASelect";
import ADatePicker from "@/components/ADatePicker";
import { useData } from "@/app/context/DataContext";
import { useAuth } from "@/app/context/AuthContext";
import ASearchableSelect from "@/components/ASearchableSelect";
import dayjs from "dayjs";

export default function TambahPinruangan({
  onClose = null,
  onSuccess = null,
  postPinru = null,
  editingPinru = null,
  isEditMode = false,
}) {
  const { user } = useAuth();
  const {
    getOpsi,
    getMemberFilter,
    memberFilter,
    MemberFilter,
    getRuanganFilter,
    ruanganFilter,
    RuanganFilter,
  } = useData();
  useEffect(() => {
    getOpsi();
    getMemberFilter();
    getRuanganFilter();
  }, []);

  const [formData, setFormData] = useState({
    nipnis: "",
    jenis: "",
    peminjam: "",
    ruangan: "",
    tgl: "",
    tgl_end: "",
    kegiatan: "",
    jam_mulai: "",
    jam_selesai: "",
    pic: user?.name || "",
  });

  const [selectedPeminjam, setSelectedPeminjam] = useState(null);
  const [selectedRuangan, setSelectedRuangan] = useState(null);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [showErrors, setShowErrors] = useState(false);

  useEffect(() => {
    getOpsi();
    getMemberFilter();
    getRuanganFilter();
  }, []);

  // Load data when editing
  useEffect(() => {
    if (isEditMode && editingPinru) {
      setFormData({
        nipnis: editingPinru.nipnis || "",
        jenis: editingPinru.jenis || "",
        peminjam: editingPinru.peminjam || "",
        ruangan: editingPinru.ruangan || "",
        tgl: editingPinru.tgl ? dayjs(editingPinru.tgl).format("YYYY-MM-DD") : "",
        tgl_end: editingPinru.tgl_end ? dayjs(editingPinru.tgl_end).format("YYYY-MM-DD") : "",
        kegiatan: editingPinru.kegiatan || "",
        jam_mulai: editingPinru.jam_mulai || "",
        jam_selesai: editingPinru.jam_selesai || "",
        pic: user?.name || "",
      });

      // Set selected items for edit mode
      if (editingPinru.peminjam) {
        setSelectedPeminjam({ id: editingPinru.peminjam, name: editingPinru.peminjam });
      }
      if (editingPinru.ruangan) {
        setSelectedRuangan({ id: editingPinru.ruangan, name: editingPinru.ruangan });
      }
    }
  }, [isEditMode, editingPinru, user]);

  // Auto-select peminjam and ruangan when data is loaded
  useEffect(() => {
    if (isEditMode && editingPinru?.peminjam && memberFilter && memberFilter.length > 0 && !selectedPeminjam) {
      const selectedItem = memberFilter.find(item => item.name === editingPinru.peminjam || item.id === editingPinru.peminjam);
      if (selectedItem) {
        setSelectedPeminjam(selectedItem);
      }
    }
  }, [memberFilter, isEditMode, editingPinru?.peminjam, selectedPeminjam]);

  useEffect(() => {
    if (isEditMode && editingPinru?.ruangan && ruanganFilter && ruanganFilter.length > 0 && !selectedRuangan) {
      const selectedItem = ruanganFilter.find(item => item.name === editingPinru.ruangan || item.id === editingPinru.ruangan);
      if (selectedItem) {
        setSelectedRuangan(selectedItem);
      }
    }
  }, [ruanganFilter, isEditMode, editingPinru?.ruangan, selectedRuangan]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    // Clear error when user starts typing
    if (showErrors && errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: "",
      }));
    }
  };

  const handlePeminjamSelect = (selectedItem) => {
    setSelectedPeminjam(selectedItem);
    
    // Auto-set nipnis dari mid dan jenis dari unit
    const autoNipnis = selectedItem?.mid || selectedItem?.id || "";
    const autoJenis = selectedItem?.unit || "";
    
    setFormData((prev) => ({
      ...prev,
      peminjam: selectedItem?.name || selectedItem?.id || "",
      nipnis: autoNipnis,
      jenis: autoJenis,
    }));

    // Clear error when user selects
    if (showErrors && errors.peminjam) {
      setErrors((prev) => ({
        ...prev,
        peminjam: "",
      }));
    }
    
    // Clear nipnis and jenis errors
    if (showErrors) {
      setErrors((prev) => ({
        ...prev,
        nipnis: "",
        jenis: "",
      }));
    }
  };

  const handleRuanganSelect = (selectedItem) => {
    setSelectedRuangan(selectedItem);
    setFormData((prev) => ({
      ...prev,
      ruangan: selectedItem?.name || selectedItem?.id || "",
    }));

    // Clear error when user selects
    if (showErrors && errors.ruangan) {
      setErrors((prev) => ({
        ...prev,
        ruangan: "",
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.peminjam) {
      newErrors.peminjam = "Peminjam wajib dipilih";
    }
    if (!formData.ruangan) {
      newErrors.ruangan = "Ruangan wajib dipilih";
    }
    if (!formData.tgl) {
      newErrors.tgl = "Tanggal Pinjam wajib diisi";
    }
    if (!formData.kegiatan) {
      newErrors.kegiatan = "Kegiatan wajib diisi";
    }
    if (!formData.jam_mulai) {
      newErrors.jam_mulai = "Jam Mulai wajib diisi";
    }
    if (!formData.jam_selesai) {
      newErrors.jam_selesai = "Jam Selesai wajib diisi";
    }
    
    if (formData.tgl && formData.tgl_end) {
      if (formData.tgl > formData.tgl_end) {
        newErrors.tgl_end = "Tanggal Selesai harus lebih besar atau sama dengan Tanggal Pinjam";
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setShowErrors(true);

    if (!validateForm()) {
      return;
    }

    setLoading(true);
    setErrors({});
    setShowErrors(false);

    try {
      const ensureString = (value) => (value == null ? "" : String(value));
      
      const submitData = {
        nipnis: ensureString(formData.nipnis),
        jenis: ensureString(formData.jenis),
        peminjam: ensureString(formData.peminjam),
        ruangan: ensureString(formData.ruangan),
        tgl: ensureString(formData.tgl),
        tgl_end: ensureString(formData.tgl_end) || null,
        kegiatan: ensureString(formData.kegiatan),
        jam_mulai: ensureString(formData.jam_mulai),
        jam_selesai: ensureString(formData.jam_selesai),
        pic: ensureString(formData.pic),
      };

      if (postPinru) {
        await postPinru(submitData);
      } else {
        throw new Error("postPinru function not provided");
      }

      // Reset form
      setFormData({
        nipnis: "",
        jenis: "",
        peminjam: "",
        ruangan: "",
        tgl: "",
        tgl_end: "",
        kegiatan: "",
        jam_mulai: "",
        jam_selesai: "",
        pic: user?.name || "",
      });
      setSelectedPeminjam(null);
      setSelectedRuangan(null);
      setShowErrors(false);
      setErrors({});

      if (onSuccess) onSuccess(submitData);
      if (onClose) onClose();
    } catch (error) {
      if (error.response?.data?.status === "error" && error.response?.data?.field) {
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
          {/* Kolom Kiri */}
          <div className="space-y-4">
            <ASearchableSelect
              id="peminjam"
              name="peminjam"
              label="PEMINJAM"
              placeholder="Cari nama peminjam..."
              value={formData.peminjam}
              onChange={handleInputChange}
              onSelect={handlePeminjamSelect}
              error={showErrors ? errors.peminjam : ""}
              required
              options={memberFilter || []}
              searchFunction={MemberFilter}
              displayKey="name"
              valueKey="name"
              searchKey="name"
              minSearchLength={2}
              noResultsText="Peminjam tidak ditemukan"
            />

            <ASearchableSelect
              id="ruangan"
              name="ruangan"
              label="RUANGAN"
              placeholder="Cari ruangan..."
              value={formData.ruangan}
              onChange={handleInputChange}
              onSelect={handleRuanganSelect}
              error={showErrors ? errors.ruangan : ""}
              required
              options={ruanganFilter || []}
              searchFunction={RuanganFilter}
              displayKey="ruangan"
              valueKey="ruangan"
              searchKey="ruangan"
              minSearchLength={2}
              noResultsText="Ruangan tidak ditemukan"
            />

            <ADatePicker
              id="tgl"
              name="tgl"
              label="TANGGAL PINJAM"
              placeholder="Pilih tanggal pinjam"
              value={formData.tgl}
              onChange={handleInputChange}
              error={showErrors ? errors.tgl : ""}
              required
              format="YYYY-MM-DD"
              displayFormat="DD/MM/YYYY"
            />

            <ADatePicker
              id="tgl_end"
              name="tgl_end"
              label="TANGGAL SELESAI"
              placeholder="Pilih tanggal selesai (opsional)"
              value={formData.tgl_end}
              onChange={handleInputChange}
              error={showErrors ? errors.tgl_end : ""}
              format="YYYY-MM-DD"
              displayFormat="DD/MM/YYYY"
              minDate={formData.tgl || null}
            />
          </div>

          {/* Kolom Kanan */}
          <div className="space-y-4">
            <AInput
              id="kegiatan"
              name="kegiatan"
              label="KEGIATAN"
              placeholder="Masukkan kegiatan"
              value={formData.kegiatan}
              onChange={handleInputChange}
              error={showErrors ? errors.kegiatan : ""}
              required
            />

            <AInput
              id="jam_mulai"
              name="jam_mulai"
              label="JAM MULAI"
              placeholder="Contoh: 08:00"
              type="time"
              value={formData.jam_mulai}
              onChange={handleInputChange}
              error={showErrors ? errors.jam_mulai : ""}
              required
            />

            <AInput
              id="jam_selesai"
              name="jam_selesai"
              label="JAM SELESAI"
              placeholder="Contoh: 17:00"
              type="time"
              value={formData.jam_selesai}
              onChange={handleInputChange}
              error={showErrors ? errors.jam_selesai : ""}
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
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex justify-end gap-3 pt-6 border-t border-gray-200 dark:border-gray-700">
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
