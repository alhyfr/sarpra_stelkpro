"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import AInput from "@/components/AInput";
import AFile from "@/components/AFile";
import ASelect from "@/components/ASelect";
import DialogInfo from "@/components/DialogInfo";
import { Package, Briefcase } from "lucide-react";
import Button from "@/components/Button";
import { useData } from "@/app/context/DataContext";

// ============================================
// UTILITY FUNCTIONS
// ============================================
const normalizeValue = (value) => (value == null ? "" : String(value));

const INITIAL_FORM_STATE = {
  nama_material: "",
  satuan: "",
  kategori_id: "",
  stok_sekarang: "",
  stok_minimal: "",
  foto_material: "",
};

// ============================================
// MAIN COMPONENT
// ============================================
export default function TambahMatrial({
  onClose = null,
  onSuccess = null,
  postMaterial,
  editingMaterial = null,
  isEditMode = false,
}) {
  const [formData, setFormData] = useState(INITIAL_FORM_STATE);
  const [errors, setErrors] = useState({});
  const [showErrors, setShowErrors] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [dialogInfo, setDialogInfo] = useState({
    show: false,
    title: "",
    message: "",
    type: "info",
  });

  const { satuan, kategoriAset, getOpsi } = useData();

  // ============================================
  // MEMOIZED OPTIONS
  // ============================================
  const satuanOptions = useMemo(
    () => satuan.map((item) => ({ value: item.satuan, label: item.satuan })),
    [satuan]
  );

  const kategoriOptions = useMemo(
    () => kategoriAset.map((item) => ({ value: item.id, label: item.kategori })),
    [kategoriAset]
  );

  // ============================================
  // EFFECTS
  // ============================================
  useEffect(() => {
    getOpsi();
  }, []);

  // Populate form saat mode edit
  useEffect(() => {
    if (isEditMode && editingMaterial) {
      setFormData({
        nama_material: normalizeValue(editingMaterial.nama_material),
        satuan: normalizeValue(editingMaterial.satuan),
        kategori_id: normalizeValue(editingMaterial.kategori_id),
        stok_sekarang: normalizeValue(editingMaterial.stok_sekarang),
        stok_minimal: normalizeValue(editingMaterial.stok_minimal),
        foto_material: "",
      });
    }
  }, [isEditMode, editingMaterial]);

  // ============================================
  // HANDLERS
  // ============================================
  const handleInputChange = useCallback((e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));

    setErrors((prev) => {
      if (!prev[name]) return prev;
      const newErrors = { ...prev };
      delete newErrors[name];
      return newErrors;
    });
  }, []);

  const handleFileChange = useCallback((e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));

    setErrors((prev) => {
      if (!prev[name]) return prev;
      const newErrors = { ...prev };
      delete newErrors[name];
      return newErrors;
    });
  }, []);

  const handleFileRemove = useCallback(() => {
    setFormData((prev) => ({
      ...prev,
      foto_material: null,
    }));
  }, []);

  const validateForm = useCallback(() => {
    const newErrors = {};

    if (!formData.nama_material.trim()) {
      newErrors.nama_material = "Nama material wajib diisi";
    }
    if (!formData.satuan.trim()) {
      newErrors.satuan = "Satuan wajib dipilih";
    }
    if (!formData.kategori_id.toString().trim()) {
      newErrors.kategori_id = "Kategori wajib dipilih";
    }
    if (!formData.stok_sekarang && formData.stok_sekarang !== "0") {
      newErrors.stok_sekarang = "Stok sekarang wajib diisi";
    }
    if (!formData.stok_minimal && formData.stok_minimal !== "0") {
      newErrors.stok_minimal = "Stok minimal wajib diisi";
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
      let submitData;

      if (formData.foto_material instanceof File) {
        submitData = new FormData();
        submitData.append("nama_material", normalizeValue(formData.nama_material));
        submitData.append("satuan", normalizeValue(formData.satuan));
        submitData.append("kategori_id", normalizeValue(formData.kategori_id));
        submitData.append("stok_sekarang", normalizeValue(formData.stok_sekarang));
        submitData.append("stok_minimal", normalizeValue(formData.stok_minimal));
        submitData.append("foto_material", formData.foto_material);
      } else {
        submitData = {
          nama_material: normalizeValue(formData.nama_material),
          satuan: normalizeValue(formData.satuan),
          kategori_id: normalizeValue(formData.kategori_id),
          stok_sekarang: normalizeValue(formData.stok_sekarang),
          stok_minimal: normalizeValue(formData.stok_minimal),
          foto_material: formData.foto_material || null,
        };
      }

      if (postMaterial) {
        await postMaterial(submitData);
      } else {
        throw new Error("postMaterial function not provided");
      }

      setFormData(INITIAL_FORM_STATE);
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
        {/* Grid Layout untuk Form Fields */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Kolom Kiri */}
          <div className="space-y-4">
            {/* Nama Material */}
            <AInput
              id="nama_material"
              icon={Briefcase}
              name="nama_material"
              label="NAMA MATERIAL"
              placeholder="Masukkan nama material"
              value={formData.nama_material}
              onChange={handleInputChange}
              error={showErrors ? errors.nama_material : ""}
              required
            />

            {/* Satuan - dari DataContext */}
            <ASelect
              id="satuan"
              name="satuan"
              label="SATUAN"
              placeholder="Pilih satuan"
              value={formData.satuan}
              onChange={handleInputChange}
              error={showErrors ? errors.satuan : ""}
              required
              options={satuanOptions}
            />

            {/* Kategori - dari kategoriAset di DataContext */}
            <ASelect
              id="kategori_id"
              name="kategori_id"
              label="KATEGORI"
              placeholder="Pilih kategori"
              value={formData.kategori_id}
              onChange={handleInputChange}
              error={showErrors ? errors.kategori_id : ""}
              required
              options={kategoriOptions}
            />
          </div>

          {/* Kolom Kanan */}
          <div className="space-y-4">
            {/* Stok Sekarang */}
            <AInput
              id="stok_sekarang"
              name="stok_sekarang"
              label="STOK SEKARANG"
              placeholder="Masukkan jumlah stok sekarang"
              type="number"
              min="0"
              step="1"
              value={formData.stok_sekarang}
              onChange={handleInputChange}
              error={showErrors ? errors.stok_sekarang : ""}
              required
            />

            {/* Stok Minimal */}
            <AInput
              id="stok_minimal"
              name="stok_minimal"
              label="STOK MINIMAL"
              placeholder="Masukkan stok minimal"
              type="number"
              min="0"
              step="1"
              value={formData.stok_minimal}
              onChange={handleInputChange}
              error={showErrors ? errors.stok_minimal : ""}
              required
            />
          </div>
        </div>

        {/* Foto Material - Full Width */}
        <div className="w-full">
          <AFile
            id="foto_material"
            name="foto_material"
            label="FOTO MATERIAL"
            accept="image/*"
            value={formData.foto_material}
            onChange={handleFileChange}
            onRemove={handleFileRemove}
            error={showErrors ? errors.foto_material : ""}
          />
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
            {isEditMode ? "Update Material" : "Simpan Material"}
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