"use client";

import { useState, useEffect, useCallback } from "react";
import AInput from "@/components/AInput";
import ADatePicker from "@/components/ADatePicker";
import ASelect from "@/components/ASelect";
import ASearchableSelect from "@/components/ASearchableSelect";
import DialogInfo from "@/components/DialogInfo";
import Button from "@/components/Button";
import { Package, MapPin, User } from "lucide-react";
import { useData } from "@/app/context/DataContext";
import dayjs from "dayjs";

// ============================================
// UTILITY FUNCTIONS
// ============================================
const normalizeValue = (value) => (value == null ? "" : String(value));

const INITIAL_FORM_STATE = {
  material_id: "",
  nama_material: "",
  tgl_pakai: "",
  jumlah_pakai: "",
  lokasi_pakai: "",
  teknisi: "",
};

// ============================================
// MAIN COMPONENT
// ============================================
export default function TambahMaterialKeluar({
  onClose = null,
  onSuccess = null,
  postMaterialKeluar,
  editingMaterialKeluar = null,
  isEditMode = false,
}) {
  const {
    materialKeluarFilter,
    getMaterialKeluarFilter,
    MaterialKeluarFilter,
    teams,
    getWaka,
  } = useData();

  const [formData, setFormData] = useState(INITIAL_FORM_STATE);
  const [selectedMaterial, setSelectedMaterial] = useState(null);
  const [errors, setErrors] = useState({});
  const [showErrors, setShowErrors] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [dialogInfo, setDialogInfo] = useState({
    show: false,
    title: "",
    message: "",
    type: "info",
  });

  // ============================================
  // EFFECTS
  // ============================================
  useEffect(() => {
    getMaterialKeluarFilter();
    getWaka();
  }, [getMaterialKeluarFilter]);

  // Populate form saat mode edit
  useEffect(() => {
    if (isEditMode && editingMaterialKeluar) {
      setFormData({
        material_id: normalizeValue(editingMaterialKeluar.material_id),
        nama_material: normalizeValue(editingMaterialKeluar.nama_material),
        tgl_pakai: editingMaterialKeluar.tgl_pakai
          ? dayjs(editingMaterialKeluar.tgl_pakai).format("YYYY-MM-DD")
          : "",
        jumlah_pakai: normalizeValue(editingMaterialKeluar.jumlah_pakai),
        lokasi_pakai: normalizeValue(editingMaterialKeluar.lokasi_pakai),
        teknisi: normalizeValue(editingMaterialKeluar.teknisi),
      });
      setSelectedMaterial({
        id: editingMaterialKeluar.material_id,
        nama_material: editingMaterialKeluar.nama_material,
      });
    } else if (!isEditMode) {
      setFormData(INITIAL_FORM_STATE);
      setSelectedMaterial(null);
    }
  }, [isEditMode, editingMaterialKeluar]);

  // ============================================
  // HANDLERS
  // ============================================
  const clearFieldError = useCallback((name) => {
    setErrors((prev) => {
      if (!prev[name]) return prev;
      const newErrors = { ...prev };
      delete newErrors[name];
      return newErrors;
    });
  }, []);

  const handleInputChange = useCallback(
    (e) => {
      const { name, value } = e.target;
      setFormData((prev) => ({ ...prev, [name]: value }));
      clearFieldError(name);
    },
    [clearFieldError]
  );

  const handleMaterialSelect = useCallback(
    (item) => {
      setSelectedMaterial(item);
      setFormData((prev) => ({
        ...prev,
        material_id: item?.id || item?.material_id || "",
        nama_material: item?.nama_material || "",
      }));
      clearFieldError("material_id");
    },
    [clearFieldError]
  );

  const validateForm = useCallback(() => {
    const newErrors = {};

    if (!normalizeValue(formData.material_id).trim()) {
      newErrors.material_id = "Material wajib dipilih";
    }
    if (!formData.tgl_pakai) {
      newErrors.tgl_pakai = "Tanggal pakai wajib diisi";
    }
    if (!formData.jumlah_pakai && formData.jumlah_pakai !== "0") {
      newErrors.jumlah_pakai = "Jumlah pakai wajib diisi";
    } else if (Number(formData.jumlah_pakai) <= 0) {
      newErrors.jumlah_pakai = "Jumlah pakai harus lebih dari 0";
    }
    if (!formData.lokasi_pakai.trim()) {
      newErrors.lokasi_pakai = "Lokasi pakai wajib diisi";
    }
    if (!formData.teknisi.trim()) {
      newErrors.teknisi = "Pengambil wajib diisi";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [formData]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setShowErrors(true);

    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);
    setErrors({});
    setShowErrors(false);

    try {
      const submitData = {
        material_id: normalizeValue(formData.material_id),
        tgl_pakai: normalizeValue(formData.tgl_pakai),
        jumlah_pakai: normalizeValue(formData.jumlah_pakai),
        lokasi_pakai: normalizeValue(formData.lokasi_pakai),
        teknisi: normalizeValue(formData.teknisi),
      };

      if (postMaterialKeluar) {
        await postMaterialKeluar(submitData);
      } else {
        throw new Error("postMaterialKeluar function not provided");
      }

      setFormData(INITIAL_FORM_STATE);
      setSelectedMaterial(null);
      setShowErrors(false);
      setErrors({});

      if (onSuccess) onSuccess(submitData);
      if (onClose) onClose();
    } catch (error) {
      if (error.response?.data?.status === "error" && error.response?.data?.field) {
        setErrors((prev) => ({
          ...prev,
          [error.response.data.field]: error.response.data.message,
        }));
        setShowErrors(true);
      } else {
        const errorMessage =
          error.response?.data?.message ||
          error.message ||
          "Terjadi kesalahan saat menyimpan data";

        setDialogInfo({
          show: true,
          title: "Error",
          message: errorMessage,
          type: "error",
        });
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  // ============================================
  // RENDER
  // ============================================
  return (
    <div>
      <form onSubmit={handleSubmit} className="space-y-6" noValidate>
        {/* Material - dari MaterialKeluarFilter */}
        <ASearchableSelect
          id="material_id"
          name="material_id"
          label="MATERIAL"
          placeholder="Cari material..."
          value={
            selectedMaterial?.id ||
            selectedMaterial?.material_id ||
            formData.material_id ||
            ""
          }
          onChange={handleInputChange}
          onSelect={handleMaterialSelect}
          error={showErrors ? errors.material_id : ""}
          required
          options={materialKeluarFilter || []}
          searchFunction={MaterialKeluarFilter}
          displayKey="nama_material"
          valueKey="id"
          searchKey="nama_material"
          minSearchLength={2}
          noResultsText="Material tidak ditemukan"
        />

        {/* Grid Layout untuk Form Fields */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Kolom Kiri */}
          <div className="space-y-4">
            {/* Tanggal Pakai */}
            <ADatePicker
              id="tgl_pakai"
              name="tgl_pakai"
              label="TANGGAL PAKAI"
              placeholder="Pilih tanggal pakai"
              value={formData.tgl_pakai}
              onChange={handleInputChange}
              error={showErrors ? errors.tgl_pakai : ""}
              required
            />

            {/* Jumlah Pakai */}
            <AInput
              id="jumlah_pakai"
              icon={Package}
              name="jumlah_pakai"
              label="JUMLAH PAKAI"
              placeholder="Masukkan jumlah pakai"
              type="number"
              min="1"
              step="1"
              value={formData.jumlah_pakai}
              onChange={handleInputChange}
              error={showErrors ? errors.jumlah_pakai : ""}
              required
            />
          </div>

          {/* Kolom Kanan */}
          <div className="space-y-4">
            {/* Lokasi Pakai */}
            <AInput
              id="lokasi_pakai"
              icon={MapPin}
              name="lokasi_pakai"
              label="LOKASI PAKAI"
              placeholder="Masukkan lokasi pakai"
              value={formData.lokasi_pakai}
              onChange={handleInputChange}
              error={showErrors ? errors.lokasi_pakai : ""}
              required
            />

            {/* Pengambil / Teknisi - dari teams di DataContext */}
            <ASelect
              id="teknisi"
              icon={User}
              name="teknisi"
              label="PENGAMBIL"
              placeholder="Pilih pengambil"
              value={formData.teknisi}
              onChange={handleInputChange}
              error={showErrors ? errors.teknisi : ""}
              required
              options={(teams || []).map((item) => ({
                value: item.nama,
                label: item.nama || item.jabatan || `Team ${item.id}`,
              }))}
            />
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
            disabled={isSubmitting}
          >
            Batal
          </Button>
          <Button
            type="submit"
            variant="primary"
            loading={isSubmitting}
            disabled={isSubmitting}
          >
            {isEditMode ? "Update Material Keluar" : "Simpan Material Keluar"}
          </Button>
        </div>
      </form>

      {/* Dialog Info */}
      <DialogInfo
        show={dialogInfo.show}
        onClose={() => setDialogInfo((prev) => ({ ...prev, show: false }))}
        title={dialogInfo.title}
        message={dialogInfo.message}
        type={dialogInfo.type}
        size="sm"
      />
    </div>
  );
}
