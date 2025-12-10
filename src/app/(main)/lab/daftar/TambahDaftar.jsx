"use client";
import { useState, useEffect } from "react";
import AInput from "@/components/AInput";
import ARadio from "@/components/ARadio";
import ASelect from "@/components/ASelect";
import Button from "@/components/Button";
import { validateDaftarLabForm } from "@/app/utils/validator";
import { FlaskConical, NotebookText, User, Book } from "lucide-react";
import { useData } from "@/app/context/DataContext";
import ASearchableSelect from "@/components/ASearchableSelect";
export default function TambahDaftar({
  onClose,
  onSuccess,
  postDaftarLab,
  editingDaftar,
  isEditMode,
}) {
  const { ruanganFilter, getRuanganFilter, RuanganFilter } = useData();
  useEffect(() => {
    getRuanganFilter();
  }, [getRuanganFilter]);
  const [formData, setFormData] = useState({
    nama_lab: "",
    jurusan: "",
    laboran: "",
    ruangan_id: "",
    ket: "",
  });
  const [selectedRuangan, setSelectedRuangan] = useState(null);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [showErrors, setShowErrors] = useState(false);
  useEffect(() => {
    if (isEditMode && editingDaftar) {
      setFormData({
        nama_lab: editingDaftar.nama_lab || "",
        jurusan: editingDaftar.jurusan || "",
        laboran: editingDaftar.laboran || "",
        ruangan_id: editingDaftar.ruangan_id || "",
        ket: editingDaftar.ket || "",
      });
    } else if (!isEditMode) {
      // Reset form when not in edit mode
      setFormData({
        nama_lab: "",
        jurusan: "",
        laboran: "",
        ruangan_id: "",
        ket: "",
      });
      setSelectedRuangan(null);
      }
  }, [isEditMode, editingDaftar]);

  // Set selected ruangan from ruanganFilter when in edit mode
  useEffect(() => {
    if (
      isEditMode &&
      editingDaftar?.ruangan_id &&
      ruanganFilter &&
      ruanganFilter.length > 0
    ) {
      // Find the ruangan by id, ruangan_id, ruangan, or name
      const selectedItem = ruanganFilter.find(
        (item) =>
          String(item.id) === String(editingDaftar.ruangan_id) ||
          String(item.ruangan_id) === String(editingDaftar.ruangan_id) ||
          String(item.ruangan) === String(editingDaftar.ruangan_id) ||
          item.name === editingDaftar.ruangan_id ||
          String(item.name) === String(editingDaftar.ruangan_id)
      );
      
      // Only update if we found a match and it's different from current selection
      if (selectedItem) {
        const currentId = selectedRuangan?.id || selectedRuangan?.ruangan_id || selectedRuangan?.ruangan;
        const newId = selectedItem.id || selectedItem.ruangan_id || selectedItem.ruangan;
        
        if (String(currentId) !== String(newId)) {
        setSelectedRuangan(selectedItem);
          setFormData((prev) => ({
            ...prev,
            ruangan_id: selectedItem.id || selectedItem.ruangan_id || selectedItem.ruangan || editingDaftar.ruangan_id,
          }));
        }
      }
    }
  }, [ruanganFilter, isEditMode, editingDaftar?.ruangan_id]);
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
    const newErrors = validateDaftarLabForm(formData);
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
        nama_lab: formData.nama_lab,
        jurusan: formData.jurusan,
        laboran: formData.laboran,
        ruangan_id: formData.ruangan_id,
        ket: formData.ket,
      };
      if (postDaftarLab) {
        await postDaftarLab(submitData);
      } else {
        throw new Error("postDaftarLab function not provided");
      }
      // Reset form
      setFormData({
        nama_lab: "",
        jurusan: "",
        laboran: "",
        ruangan_id: "",
        ket: "",
      });

      // Reset error state
      setShowErrors(false);
      setErrors({});
      setSelectedRuangan(null);

      if (onSuccess) onSuccess(submitData);
      if (onClose) onClose();
    } catch (error) {
      console.error("Error saving daftar lab:", error);
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
  const handleRuanganSelect = (selectedItem) => {
    setSelectedRuangan(selectedItem);
    setFormData((prev) => ({
      ...prev,
      ruangan_id: selectedItem?.id || selectedItem?.ruangan_id || selectedItem?.ruangan || "",
    }));

    // Clear error when user selects
    if (showErrors && errors.ruangan_id) {
      setErrors((prev) => ({
        ...prev,
        ruangan_id: "",
      }));
    }
  };
  return (
    <div>
      <form onSubmit={handleSubmit}>
        <AInput
          id="nama_lab"
          icon={FlaskConical}
          name="nama_lab"
          label="Nama Lab"
          placeholder="Masukkan Nama Lab"
          value={formData.nama_lab}
          onChange={handleInputChange}
          error={showErrors ? errors.nama_lab : ""}
        />
        <ASearchableSelect
              id="ruangan"
              name="ruangan"
              label="RUANGAN"
              placeholder="Cari ruangan..."
          value={selectedRuangan?.ruangan || selectedRuangan?.id || selectedRuangan?.ruangan_id || formData.ruangan_id || ""}
              onChange={handleInputChange}
              onSelect={handleRuanganSelect}
          error={showErrors ? errors.ruangan_id : ""}
              required
              options={ruanganFilter || []}
              searchFunction={RuanganFilter}
              displayKey="ruangan"
              valueKey="ruangan"
              searchKey="ruangan"
              minSearchLength={2}
              noResultsText="Ruangan tidak ditemukan"
            />
        <AInput
          id="laboran"
          icon={User}
          name="laboran"
          label="Laboran"
          placeholder="Masukkan Laboran"
          value={formData.laboran}
          onChange={handleInputChange}
          error={showErrors ? errors.laboran : ""}
        />
        <AInput
          id="jurusan"
          icon={Book}
          name="jurusan"
          label="Jurusan"
          placeholder="Masukkan Jurusan"
          value={formData.jurusan}
          onChange={handleInputChange}
          error={showErrors ? errors.jurusan : ""}
        />
        <AInput
          id="ket"
          icon={NotebookText}
          name="ket"
          label="Keterangan"
          placeholder="Masukkan Keterangan"
          value={formData.ket}
          onChange={handleInputChange}
          error={showErrors ? errors.ket : ""}
        />
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
