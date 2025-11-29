"use client";
import { useState, useEffect } from "react";
import AInput from "@/components/AInput";
import ARadio from "@/components/ARadio";
import ASelect from "@/components/ASelect";
import Button from "@/components/Button";
import { validateSatuanForm } from "@/app/utils/validator";
import { Package, NotebookText } from "lucide-react";
export default function TambahSatuan({
  onClose,
  onSuccess,
  postSatuan,
  editingSatuan,
  isEditMode,
}) {
  const [formData, setFormData] = useState({
    satuan: "",
    ket: "",
  });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [showErrors, setShowErrors] = useState(false);

  useEffect(() => {
    if (isEditMode && editingSatuan) {
      setFormData({
        satuan: editingSatuan.satuan || "",
        ket: editingSatuan.ket || "",
      });
    }
  }, [isEditMode, editingSatuan]);
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
    const newErrors = validateSatuanForm(formData);
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
        satuan: formData.satuan,
        ket: formData.ket,
      };
      // Fix: gunakan postSatuan bukan postGedung
      if (postSatuan) {
        await postSatuan(submitData);
      } else {
        throw new Error("postSatuan function not provided");
      }
      // Reset form
      setFormData({
        satuan: "",
        ket: "",
      });

      // Reset error state
      setShowErrors(false);
      setErrors({});

      if (onSuccess) onSuccess(submitData);
      if (onClose) onClose();
    } catch (error) {
      console.error("Error saving satuan:", error);
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
          id="satuan"
          icon={Package}
          name="satuan"
          label="Satuan"
          placeholder="Masukkan Satuan"
          value={formData.satuan}
          onChange={handleInputChange}
          error={showErrors ? errors.satuan : ""}
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
  );
}
