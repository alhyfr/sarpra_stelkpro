'use client'
import { useState, useEffect, useCallback } from "react";
import AInput from "@/components/AInput";
import ASelect from "@/components/ASelect";
import { useAuth } from "@/app/context/AuthContext";
import ASearchableSelect from "@/components/ASearchableSelect";
import Aswitch from "@/components/Aswitch";
import Button from "@/components/Button";
import api from "@/app/utils/Api";
export default function TambahBarang({
  onClose = null,
  onSuccess = null,
  postBarangPinjaman = null,
  editingPinjam = null,
  isEditMode = false,
}) {
  const { user } = useAuth();
  const [formData, setFormData] = useState({
    kode: "",
    nabar: "",
    nabar_id: "",
    keterangan: "",
    status: "on",
    kategori: "",
  });
  
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [showErrors, setShowErrors] = useState(false);
  const [selectedNabar, setSelectedNabar] = useState(null);
  const kategoriOptions=[
    { value: "perabotan", label: "Perabotan" },
    { value: "elektronik", label: "Elektronik" },
    { value: "perlengkapan ruangan", label: "Perlengkapan Ruangan" },
    { value: "kendaraan", label: "Kendaraan" },
    { value: "alat laboratorium", label: "Alat Laboratorium" },
    { value: "sistem keamanan", label: "Sistem Keamanan" },
    { value: "perlengkapan pengikat", label: "Perlengkapan Pengikat" },
    { value: "perlengkapan cetak", label: "Perlengkapan Cetak" },
    { value: "perlengkapan kebersihan", label: "Perlengkapan Kebersihan" },
  ]

  // Initialize form data when editing
  useEffect(() => {
    if (isEditMode && editingPinjam) {
      setFormData({
        kode: editingPinjam.kode || "",
        nabar: editingPinjam.nabar || "",
        nabar_id: editingPinjam.nabar_id || editingPinjam.id || "",
        keterangan: editingPinjam.ket || "",
        status: editingPinjam.status || "on",
        kategori: editingPinjam.kategori || "",
      });
      
      // Set selected nabar for searchable select
      setSelectedNabar({
        id: editingPinjam.nabar_id || editingPinjam.id || "",
        nabar: editingPinjam.nabar || "",
        kode: editingPinjam.kode || "",
      });
    }
  }, [isEditMode, editingPinjam]);

  // NabarFilter function for searchable select
  const NabarFilter = useCallback(async (search = "") => {
    try {
      const response = await api.get("/sp/opsi/nabar-filter?search=" + search);
      return response.data.nabar || [];
    } catch (error) {
      console.error('Error fetching Nabar filter:', error);
      return [];
    }
  }, []);

  // Handle input changes
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

  // Handle select changes
  const handleSelectChange = (option) => {
    setFormData((prev) => ({
      ...prev,
      nabar: option.nabar, // Use nabar as the value
      nabar_id: option.id, // Store ID for server
      // Auto-fill kode when nabar is selected
      kode: option.kode || prev.kode,
    }));

    // Set selected nabar for display
    setSelectedNabar(option);

    // Clear error when user selects
    if (showErrors && errors.nabar) {
      setErrors((prev) => ({
        ...prev,
        nabar: "",
      }));
    }
    
    // Clear kode error if it was auto-filled
    if (showErrors && errors.kode && option.kode) {
      setErrors((prev) => ({
        ...prev,
        kode: "",
      }));
    }
  };

  // Handle status change
  const handleStatusChange = (newStatus) => {
    setFormData((prev) => ({
      ...prev,
      status: newStatus,
    }));

    // Clear error when user changes status
    if (showErrors && errors.status) {
      setErrors((prev) => ({
        ...prev,
        status: "",
      }));
    }
  };

  // Form validation
  const validateForm = () => {
    const newErrors = {};
    
    // Kode validation - only required if not auto-filled from nabar
    if (!formData.kode.trim()) {
      newErrors.kode = "Kode barang wajib diisi";
    } else if (formData.kode.trim().length < 3) {
      newErrors.kode = "Kode barang minimal 3 karakter";
    }
    
    if (!formData.nabar) {
      newErrors.nabar = "Nama barang wajib diisi";
    }
    
    if (!formData.status) {
      newErrors.status = "Status wajib diisi";
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle form submission
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
      const submitData = {
        kode: formData.kode.trim(),
        nabar: formData.nabar,
        nabar_id: formData.nabar_id,
        keterangan: formData.keterangan || "",
        status: formData.status,
        kategori: formData.kategori,
      };

      if (postBarangPinjaman) {
        await postBarangPinjaman(submitData);
      } else {
        throw new Error("postBarangPinjaman function not provided");
      }

      // Reset form
      setFormData({
        kode: "",
        nabar: "",
        nabar_id: "",
        keterangan: "",
        status: "on",
        kategori: "",
      });

      setSelectedNabar(null);
      setShowErrors(false);
      setErrors({});

      if (onSuccess) onSuccess(submitData);
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
  };

  return (
    <div>
      <form onSubmit={handleSubmit} className="space-y-6" noValidate>
        {/* Grid Layout untuk Form Fields */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Kolom Kiri */}
          <div className="space-y-4">
            {/* Kode Barang - Auto-filled when nabar is selected */}
            <AInput
              id="kode"
              name="kode"
              label="KODE BARANG"
              placeholder="Kode akan terisi otomatis saat memilih nama barang"
              value={formData.kode}
              onChange={handleInputChange}
              error={showErrors ? errors.kode : ''}
              required
              disabled={true}
            />

            {/* Nama Barang - Searchable Select */}
            <ASearchableSelect
              id="nabar"
              name="nabar"
              label="NAMA BARANG"
              placeholder="Cari nama barang..."
              value={formData.nabar}
              onChange={handleInputChange}
              onSelect={handleSelectChange}
              error={showErrors ? errors.nabar : ''}
              required
              searchFunction={NabarFilter}
              displayKey="nabar"
              valueKey="nabar"
              searchKey="nabar"
              minSearchLength={2}
              noResultsText="Barang tidak ditemukan"
              options={selectedNabar ? [selectedNabar] : []}
            />
          </div>

          {/* Kolom Kanan */}
          <div className="space-y-4">
            {/* Status */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                STATUS <span className="text-red-500">*</span>
              </label>
              <Aswitch
                value={formData.status}
                onChange={handleStatusChange}
                size="md"
                showIcons={true}
                onValue="on"
                offValue="off"
                labels={{
                  on: 'ON',
                  off: 'OFF'
                }}
              />
              {showErrors && errors.status && (
                <p className="mt-1 text-sm text-red-600">{errors.status}</p>
              )}
            </div>

            {/* Keterangan */}
            <AInput
              id="keterangan"
              name="keterangan"
              label="KETERANGAN"
              placeholder="Masukkan keterangan (opsional)"
              value={formData.keterangan}
              onChange={handleInputChange}
              error={showErrors ? errors.keterangan : ''}
            />
            <ASelect
              id="kategori"
              name="kategori"
              label="KATEGORI"
              placeholder="Pilih kategori"
              value={formData.kategori}
              onChange={handleInputChange}
              error={showErrors ? errors.kategori : ''}
              options={kategoriOptions}

            />
          </div>

        </div>

        {/* Action Buttons */}
        <div className="flex justify-end space-x-3 pt-6 border-t">
          <Button
            type="button"
            variant="secondary"
            onClick={onClose}
            disabled={loading}
          >
            Batal
          </Button>
          <Button
            type="submit"
            variant="primary"
            loading={loading}
            disabled={loading}
          >
            {isEditMode ? "Update" : "Simpan"}
          </Button>
        </div>
      </form>
    </div>
  );
}
