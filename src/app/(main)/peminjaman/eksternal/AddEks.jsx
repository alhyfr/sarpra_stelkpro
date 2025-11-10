'use client';
import { useState, useEffect } from "react";
import AInput from "@/components/AInput";
import ADatePicker from "@/components/ADatePicker";
import { useData } from "@/app/context/DataContext";
import ASearchableSelect from "@/components/ASearchableSelect";
export default function AddEks({
  onClose = null,
  onSuccess = null,
  postPineks = null,
  editingPineks = null,
  isEditMode = false,
}) {
  const { getOpsi,getMemberFilter, memberFilter, MemberFilter } = useData();
  const [formData, setFormData] = useState({
    nik: "",
    nama: "",
    kegiatan: "",
    tempat: "",
    tgl_pinjam: "",
    tgl_kembali: "",
  });
  const [selectedMember, setSelectedMember] = useState(null);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [showErrors, setShowErrors] = useState(false);

  useEffect(() => {
    getOpsi();
    getMemberFilter();
  }, []);
  useEffect(() => {
    if (isEditMode && editingPineks) {
      setFormData({
        nik: editingPineks.nik || "",
        nama: editingPineks.nama || "",
        kegiatan: editingPineks.kegiatan || "",
        tempat: editingPineks.tempat || "",
        tgl_pinjam: editingPineks.tgl_pinjam || "",
        tgl_kembali: editingPineks.tgl_kembali || "",
      });
    }
  }, [isEditMode, editingPineks]);
  useEffect(() => {
    if (isEditMode && memberFilter && memberFilter.length > 0 && !selectedMember) {
      // Cari member berdasarkan nama
      if (editingPineks?.nama) {
        const selectedItem = memberFilter.find(item => item.name === editingPineks.nama);
        if (selectedItem) {
          setSelectedMember(selectedItem);
        }
      }
    }
  }, [memberFilter, isEditMode, editingPineks?.nama, selectedMember]);
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

  const handleMemberSelect = (selectedItem) => {
    setSelectedMember(selectedItem);
    setFormData((prev) => ({
      ...prev,
      nama: selectedItem?.name || "",
      nik: selectedItem?.mid || selectedItem?.nik || "",
    }));
    // Clear nama and nik errors
    if (showErrors) {
      setErrors((prev) => ({
        ...prev,
        nama: "",
        nik: "",
      }));
    }
  }
  const validateForm = () => {
    const newErrors = {};
    if (!formData.nama || !selectedMember) {
      newErrors.nama = "Nama peminjam wajib dipilih";
    }
    if (!formData.nik) {
      newErrors.nik = "NIK wajib diisi";
    }
    if (!formData.tgl_pinjam) {
      newErrors.tgl_pinjam = "Tanggal Pinjam wajib diisi";
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }
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
      // Hanya kirim nama dan nik, tidak ada member_id
      if(postPineks) {
        await postPineks(formData);
      } else {
        throw new Error("postPineks function not provided");
      }
      setFormData({
        nik: "",
        nama: "",
        kegiatan: "",
        tempat: "",
        tgl_pinjam: "",
        tgl_kembali: "",
      });
      setSelectedMember(null);
      setShowErrors(false);
      setErrors({});
      if (onSuccess) onSuccess(formData);
      if (onClose) onClose();
    } catch (error) {
      if (error.response?.data?.status === 'error' && error.response?.data?.field) {
        const fieldError = error.response.data.field;
        const errorMessage = error.response.data.message;
        setErrors(prev => ({
          ...prev,
          [fieldError]: errorMessage
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
  }
  return (
    <div>
       <form onSubmit={handleSubmit} className="space-y-6" noValidate>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Kolom Kiri */}
          <div className="space-y-4">
            <ASearchableSelect
              id="member_id"
              name="member_id"
              label="NAMA PEMINJAM"
              placeholder="Cari nama peminjam..."
              value={selectedMember?.id || ""}
              onChange={handleInputChange}
              onSelect={handleMemberSelect}
              error={showErrors ? errors.nama : ""}
              required
              options={memberFilter || []}
              searchFunction={MemberFilter}
              displayKey="name"
              valueKey="id"
              searchKey="name"
              minSearchLength={2}
              noResultsText="Member tidak ditemukan"
            />

            <AInput
              id="nik"
              name="nik"
              label="NIK"
              placeholder="NIK akan terisi otomatis"
              value={formData.nik}
              onChange={handleInputChange}
              error={showErrors ? errors.nik : ""}
              required
              readOnly
              className="bg-gray-100 dark:bg-gray-700 text-slate-400"
            />
             <ADatePicker
              id="tgl_pinjam"
              name="tgl_pinjam"
              label="TANGGAL PINJAM"
              placeholder="Pilih tanggal pinjam"
              value={formData.tgl_pinjam}
              onChange={handleInputChange}
              error={showErrors ? errors.tgl_pinjam : ""}
              format="YYYY-MM-DD"
              displayFormat="DD/MM/YYYY"
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
            />

            <AInput
              id="tempat"
              name="tempat"
              label="TEMPAT"
              placeholder="Masukkan tempat"
              value={formData.tempat}
              onChange={handleInputChange}
              error={showErrors ? errors.tempat : ""}
            />

           

            <ADatePicker
              id="tgl_kembali"
              name="tgl_kembali"
              label="TANGGAL KEMBALI"
              placeholder="Pilih tanggal kembali"
              value={formData.tgl_kembali}
              onChange={handleInputChange}
              format="YYYY-MM-DD"
              displayFormat="DD/MM/YYYY"
              minDate={formData.tgl_pinjam || null}
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
            {isEditMode ? 'Update' : 'Simpan'}
          </button>
        </div>
       </form>
    </div>
  );
}