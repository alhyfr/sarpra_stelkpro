'use client'
import { useState, useEffect } from "react";
import AInput from "@/components/AInput";
import ASelect from "@/components/ASelect";
import Button from "@/components/Button";
import { Tag } from "lucide-react";

const TIPE_OPTIONS = [
  { value: "fisik", label: "Fisik" },
  { value: "layanan", label: "Layanan" },
  { value: "keduanya", label: "Keduanya" },
];

const STATUS_OPTIONS = [
  { value: "on", label: "On" },
  { value: "off", label: "Off" },
];

export default function TambahKategoriIt({
  onClose = null,
  onSuccess = null,
  postKategoriIt = null,
  editingKategori = null,
  isEditMode = false,
}) {
  const [formData, setFormData] = useState({
    kode: "",
    nama: "",
    tipe: "keduanya",
    status: "on",
  });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [showErrors, setShowErrors] = useState(false);

  useEffect(() => {
    if (isEditMode && editingKategori) {
      setFormData({
        kode: editingKategori.kode || "",
        nama: editingKategori.nama || "",
        tipe: editingKategori.tipe || "keduanya",
        status: editingKategori.status || "on",
      });
    }
  }, [isEditMode, editingKategori]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === "kode" ? String(value).toUpperCase() : value,
    }));
    if (showErrors && errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.kode?.trim()) newErrors.kode = "Kode wajib diisi";
    if (!formData.nama?.trim()) newErrors.nama = "Nama wajib diisi";
    if (!formData.tipe) newErrors.tipe = "Tipe wajib dipilih";
    if (!formData.status) newErrors.status = "Status wajib dipilih";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setShowErrors(true);
    if (!validateForm()) return;

    setLoading(true);
    setErrors({});
    setShowErrors(false);

    try {
      const submitData = {
        kode: formData.kode.trim().toUpperCase(),
        nama: formData.nama.trim(),
        tipe: formData.tipe,
        status: formData.status,
      };

      if (!postKategoriIt) {
        throw new Error("postKategoriIt function not provided");
      }
      await postKategoriIt(submitData);

      setFormData({ kode: "", nama: "", tipe: "keduanya", status: "on" });
      setShowErrors(false);
      setErrors({});
      if (onSuccess) onSuccess(submitData);
      if (onClose) onClose();
    } catch (error) {
      console.error("Error saving kategori IT:", error);
      if (error.field) {
        setErrors((prev) => ({ ...prev, [error.field]: error.message }));
        setShowErrors(true);
      } else {
        alert(
          error.response?.data?.message ||
            error.message ||
            "Terjadi kesalahan saat menyimpan data"
        );
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <form onSubmit={handleSubmit}>
        <AInput
          id="kode"
          icon={Tag}
          name="kode"
          label="Kode"
          placeholder="Contoh: INTERNET, CCTV"
          value={formData.kode}
          onChange={handleInputChange}
          error={showErrors ? errors.kode : ""}
        />
        <AInput
          id="nama"
          name="nama"
          label="Nama"
          placeholder="Masukkan nama kategori"
          value={formData.nama}
          onChange={handleInputChange}
          error={showErrors ? errors.nama : ""}
        />
        <ASelect
          id="tipe"
          name="tipe"
          label="Tipe"
          value={formData.tipe}
          onChange={handleInputChange}
          options={TIPE_OPTIONS}
          error={showErrors ? errors.tipe : ""}
        />
        <ASelect
          id="status"
          name="status"
          label="Status"
          value={formData.status}
          onChange={handleInputChange}
          options={STATUS_OPTIONS}
          error={showErrors ? errors.status : ""}
        />
        <div className="flex justify-end gap-2 mt-6">
          <Button type="submit" disabled={loading}>
            {loading ? "Menyimpan..." : isEditMode ? "Update" : "Simpan"}
          </Button>
        </div>
      </form>
    </div>
  );
}
