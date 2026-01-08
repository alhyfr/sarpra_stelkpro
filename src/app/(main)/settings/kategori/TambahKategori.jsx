'use client'
import { useState, useEffect } from "react";
import AInput from "@/components/AInput";
import Button from "@/components/Button";
import { validateKategoriForm } from "@/app/utils/validator";
import { Tag } from "lucide-react";
export default function TambahKategori({
  onClose = null,
  onSuccess = null,
  postKategori = null,
  editingKategori = null,
  isEditMode = false,
}) {
  const [formData, setFormData] = useState({
    kategori: "",
    ket: "",
  });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [showErrors, setShowErrors] = useState(false);
  useEffect(() => {
    if (isEditMode && editingKategori) {
      setFormData({
        kategori: editingKategori.kategori || "",
        ket: editingKategori.ket || "",
      });
    }
  }, [isEditMode, editingKategori]);
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    if (showErrors && errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: "",
      }));
    }
  };
  const validateForm = () => {
    const newErrors = validateKategoriForm(formData);
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
      // Jika ada foto (File object), gunakan FormData untuk multipart upload
      let submitData;
      submitData = {
        kategori: formData.kategori,
        ket: formData.ket,
      };
      // Fix: gunakan postSatuan bukan postGedung
      if (postKategori) {
        await postKategori(submitData);
      } else {
        throw new Error("postKategori function not provided");
      }
      // Reset form
      setFormData({
        kategori: "",
        ket: "",
      });

      // Reset error state
      setShowErrors(false);
      setErrors({});

      if (onSuccess) onSuccess(submitData);
      if (onClose) onClose();
    } catch (error) {
      console.error("Error saving kategori:", error);
      // Show error via alert instead of form error
      const errorMessage =
        error.response?.data?.message ||
        error.message ||
        "Terjadi kesalahan saat menyimpan data";
      alert(errorMessage);
    } finally {
      setLoading(false);
    }
  };
  return (
    <div>
      <form onSubmit={handleSubmit}>
        <AInput
          id="kategori"
          icon={Tag}
          name="kategori"
          label="Kategori"
          placeholder="Masukkan Kategori"
          value={formData.kategori}
          onChange={handleInputChange}
          error={showErrors ? errors.kategori : ""}
        />
        <AInput
          id="ket"
          name="ket"
          label="Keterangan"
          placeholder="Masukkan Keterangan"
          value={formData.ket}
          onChange={handleInputChange}
          multiline={true}
        />
        <div className="flex justify-end gap-2 mt-6">
          <Button type="submit" disabled={loading}>
            {loading ? "Menyimpan..." : "Simpan"}
          </Button>
        </div>
      </form>
    </div>
  )
}