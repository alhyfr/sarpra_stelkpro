"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import AInput from "@/components/AInput";
import AFile from "@/components/AFile";
import ADatePicker from "@/components/ADatePicker";
import ASelect from "@/components/ASelect";
import DialogInfo from "@/components/DialogInfo";
import { User, Briefcase } from "lucide-react";
import Button from "@/components/Button";
import { validateHabisForm } from "./validatorHabis";
import { useData } from "@/app/context/DataContext";

// ============================================
// UTILITY FUNCTIONS (Extract ke utils jika perlu)
// ============================================
const normalizeValue = (value) => (value == null ? "" : String(value));

const normalizeFormData = (data, isEditMode = false) => ({
  kode: normalizeValue(data.kode),
  nabar: normalizeValue(data.nabar),
  deskripsi: normalizeValue(data.deskripsi),
  stok: normalizeValue(data.stok),
  lokasi_penyimpanan: normalizeValue(data.lokasi_penyimpanan),
  harga: normalizeValue(data.harga),
  satuan: data.satuan?.id || normalizeValue(data.satuan),
  kategori: normalizeValue(data.kategori),
  tgl: normalizeValue(data.tgl),
  foto: normalizeValue(data.foto),
});

const buildFormDataPayload = (formData) => {
  const formDataPayload = new FormData();
  Object.entries(formData).forEach(([key, value]) => {
    if (value instanceof File) {
      formDataPayload.append(key, value);
    } else {
      formDataPayload.append(key, normalizeValue(value));
    }
  });
  return formDataPayload;
};

const buildJsonPayload = (formData) => {
  const payload = {};
  Object.entries(formData).forEach(([key, value]) => {
    payload[key] = normalizeValue(value);
  });
  return payload;
};

// ============================================
// INITIAL STATE
// ============================================
const INITIAL_FORM_STATE = {
  kode: "",
  nabar: "",
  deskripsi: "",
  stok: "",
  lokasi_penyimpanan: "",
  harga: "",
  satuan: "",
  kategori: "",
  tgl: "",
  foto: "",
};

// ============================================
// MAIN COMPONENT
// ============================================
export default function TambahHabis({
  onClose,
  onSuccess,
  postHabisPakai,
  editingHabis = null,
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
    type: "info"
  });

  const { satuan, kategoriAset, getOpsi } = useData();

  // ============================================
  // MEMOIZED OPTIONS
  // ============================================
  const satuanOptions = useMemo(
    () => satuan.map((item) => ({ value: item.id, label: item.satuan })),
    [satuan]
  );

  const kategoriOptions = useMemo(
    () => kategoriAset.map((item) => ({ value: item.kategori, label: item.kategori })),
    [kategoriAset]
  );

  // ============================================
  // EFFECTS
  // ============================================
  // Load options only once
  useEffect(() => {
    getOpsi();
  }, []); // ✅ Empty dependency - run once

  // Populate form when editing
  useEffect(() => {
    if (isEditMode && editingHabis) {
      const toString = (value) => value == null ? "" : String(value)
      
      setFormData({
        kode: toString(editingHabis.kode),
        nabar: toString(editingHabis.nabar),
        deskripsi: toString(editingHabis.deskripsi),
        stok: toString(editingHabis.stok),
        lokasi_penyimpanan: toString(editingHabis.lokasi_penyimpanan),
        harga: toString(editingHabis.harga),
        satuan: editingHabis.satuan?.satuan || toString(editingHabis.satuan),
        kategori: toString(editingHabis.kategori),
        tgl: toString(editingHabis.tgl),
        foto: "", // Foto dikosongkan pada mode edit, sama seperti TambahAtk.jsx
      });
    }
  }, [isEditMode, editingHabis]);

  // ============================================
  // HANDLERS
  // ============================================
  const handleInputChange = useCallback((e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    
    // Clear error for this field
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
    
    // Clear error for file field
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
      foto: null,
    }));
  }, []);

  const validateForm = useCallback(() => {
    const newErrors = validateHabisForm(formData);
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [formData]);

  const resetForm = useCallback(() => {
    setFormData(INITIAL_FORM_STATE);
    setErrors({});
    setShowErrors(false);
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    // Set showErrors ke true untuk menampilkan error
    setShowErrors(true);

    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);
    setErrors({});
    setShowErrors(false); // Reset setelah validasi sukses

    try {
      let submitData;
      const ensureString = (value) => value == null ? "" : String(value)

      if (formData.foto instanceof File) {
        submitData = new FormData();
        submitData.append("kode", ensureString(formData.kode));
        submitData.append("nabar", ensureString(formData.nabar));
        submitData.append("deskripsi", ensureString(formData.deskripsi));
        submitData.append("stok", ensureString(formData.stok));
        submitData.append("lokasi_penyimpanan", ensureString(formData.lokasi_penyimpanan));
        submitData.append("harga", ensureString(formData.harga));
        submitData.append("satuan", ensureString(formData.satuan));
        submitData.append("kategori", ensureString(formData.kategori));
        submitData.append("tgl", ensureString(formData.tgl));
        submitData.append("foto", formData.foto);
      } else {
        submitData = {
          kode: ensureString(formData.kode),
          nabar: ensureString(formData.nabar),
          deskripsi: ensureString(formData.deskripsi),
          stok: ensureString(formData.stok),
          lokasi_penyimpanan: ensureString(formData.lokasi_penyimpanan),
          harga: ensureString(formData.harga),
          satuan: ensureString(formData.satuan),
          kategori: ensureString(formData.kategori),
          tgl: ensureString(formData.tgl),
          foto: formData.foto || null,
        };
      }
      if (postHabisPakai) {
        await postHabisPakai(submitData);
      } else {
        throw new Error("postHabisPakai function not provided");
      }

      setFormData({
        kode: "",
        nabar: "",
        deskripsi: "",
        stok: "",
        lokasi_penyimpanan: "",
        harga: "",
        satuan: "",
        kategori: "",
        tgl: "",
        foto: "",
      });

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
        
        setDialogInfo({
          show: true,
          title: "Error",
          message: errorMessage,
          type: "error"
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
          <ADatePicker
            id="tgl"
            name="tgl"
            label="TANGGAL TERIMA"
            placeholder="Pilih tanggal"
            value={formData.tgl}
            onChange={handleInputChange}
            error={showErrors ? errors.tgl : ""}
          />

          <AInput
            id="kode"
            icon={User}
            name="kode"
            label="KODE BARANG"
            placeholder="Masukkan kode barang (contoh: HP001, PEN-001)"
            value={formData.kode}
            onChange={handleInputChange}
            error={showErrors ? errors.kode : ""}
            required
          />

          <AInput
            id="nabar"
            icon={Briefcase}
            name="nabar"
            label="NAMA BARANG"
            placeholder="Masukkan nama barang"
            value={formData.nabar}
            onChange={handleInputChange}
            error={showErrors ? errors.nabar : ""}
            required
          />

          <AInput
            id="deskripsi"
            name="deskripsi"
            label="DESKRIPSI"
            placeholder="Masukkan deskripsi barang"
            value={formData.deskripsi}
            onChange={handleInputChange}
            error={showErrors ? errors.deskripsi : ""}
            required
          />

          <AInput
            id="stok"
            name="stok"
            label="STOK"
            placeholder="Masukkan jumlah stok"
            type="number"
            min="0"
            step="1"
            value={formData.stok}
            onChange={handleInputChange}
            error={showErrors ? errors.stok : ""}
            required
          />
        </div>

        {/* Kolom Kanan */}
        <div className="space-y-4">
          <AInput
            id="lokasi_penyimpanan"
            name="lokasi_penyimpanan"
            label="LOKASI PENYIMPANAN"
            placeholder="Masukkan lokasi penyimpanan"
            value={formData.lokasi_penyimpanan}
            onChange={handleInputChange}
            error={showErrors ? errors.lokasi_penyimpanan : ""}
            required
          />

          <AInput
            id="harga"
            name="harga"
            label="HARGA"
            placeholder="Masukkan harga barang"
            type="number"
            min="0"
            step="0.01"
            value={formData.harga}
            onChange={handleInputChange}
            error={showErrors ? errors.harga : ""}
            required
          />

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

          <ASelect
            id="kategori"
            name="kategori"
            label="KATEGORI"
            placeholder="Pilih kategori"
            value={formData.kategori}
            onChange={handleInputChange}
            error={showErrors ? errors.kategori : ""}
            required
            options={kategoriOptions}
          />
        </div>
      </div>

      {/* Foto - Full Width */}
      <div className="w-full">
        <AFile
          id="foto"
          name="foto"
          label="FOTO BARANG"
          accept="image/*"
          value={formData.foto}
          onChange={handleFileChange}
          onRemove={handleFileRemove}
          error={showErrors ? errors.foto : ""}
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
          {isEditMode ? "Update Barang" : "Simpan Barang"}
        </Button>
      </div>
    </form>

    {/* Dialog Info */}
    <DialogInfo
      show={dialogInfo.show}
      onClose={() => setDialogInfo(prev => ({ ...prev, show: false }))}
      title={dialogInfo.title}
      message={dialogInfo.message}
      type={dialogInfo.type}
      size="sm"
    />
    </div>
  );
}