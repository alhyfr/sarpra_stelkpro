"use client";
import { useState, useEffect } from "react";
import AInput from "@/components/AInput";
import ASearchableSelect from "@/components/ASearchableSelect";
import ADatePicker from "@/components/ADatePicker";
import Button from "@/components/Button";
import { validateEventForm } from "@/app/utils/validator";
import {
  NotebookText,
  Calendar,
  Users,
} from "lucide-react";
import { useData } from "@/app/context/DataContext";

export default function TambahEx({
  onClose = null,
  onSuccess = null,
  postEvent = null,
  editingEvent = null,
  isEditMode = false,
}) {
  const { getRuanganFilter, RuanganFilter, ruanganFilter } = useData();
  useEffect(() => {
    getRuanganFilter();
  }, [getRuanganFilter]);
  const [formData, setFormData] = useState({
    kegiatan: "",
    tgl_mulai: "",
    tgl_selesai: "",
    ruangan_id: "",
    penyelenggara: "",
  });
  const [selectedRuangan, setSelectedRuangan] = useState(null);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [showErrors, setShowErrors] = useState(false);
  useEffect(() => {
    if (isEditMode && editingEvent) {
      setFormData({
        kegiatan: editingEvent.kegiatan || "",
        tgl_mulai: editingEvent.tgl_mulai || "",
        tgl_selesai: editingEvent.tgl_selesai || "",
        ruangan_id: editingEvent.ruangan_id || "",
        penyelenggara: editingEvent.ket || "",
      });
    } else if (!isEditMode) {
      // Reset form when not in edit mode
      setFormData({
        kegiatan: "",
        tgl_mulai: "",
        tgl_selesai: "",
        ruangan_id: "",
        penyelenggara: "",
      });
      setSelectedRuangan(null);
    }
  }, [isEditMode, editingEvent]);
  // Set selected ruangan from ruanganFilter when in edit mode
  useEffect(() => {
    if (
      isEditMode &&
      editingEvent?.ruangan_id &&
      ruanganFilter &&
      ruanganFilter.length > 0
    ) {
      // Find the ruangan by id
      const selectedItem = ruanganFilter.find(
        (item) => String(item.id) === String(editingEvent.ruangan_id)
      );

      // Only update if we found a match and it's different from current selection
      if (selectedItem) {
        const currentId = selectedRuangan?.id;
        const newId = selectedItem.id;

        if (String(currentId) !== String(newId)) {
          setSelectedRuangan(selectedItem);
          setFormData((prev) => ({
            ...prev,
            ruangan_id: selectedItem.id || editingEvent.ruangan_id,
          }));
        }
      }
    }
  }, [ruanganFilter, isEditMode, editingEvent?.ruangan_id]);
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
    const newErrors = validateEventForm(formData);
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
        kegiatan: formData.kegiatan,
        tgl_mulai: formData.tgl_mulai,
        tgl_selesai: formData.tgl_selesai,
        ruangan_id: formData.ruangan_id,
        penyelenggara: formData.penyelenggara,
      };
      if (postEvent) {
        await postEvent(submitData);
      } else {
        throw new Error("postEvent function not provided");
      }
      // Reset form
      setFormData({
        kegiatan: "",
        tgl_mulai: "",
        tgl_selesai: "",
        ruangan_id: "",
        penyelenggara: "",
      });

      // Reset error state
      setShowErrors(false);
      setErrors({});
      setSelectedRuangan(null);

      if (onSuccess) onSuccess(submitData);
      if (onClose) onClose();
    } catch (error) {
      console.error("Error saving event:", error);
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
      ruangan_id: selectedItem?.id || "",
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
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Grid Layout untuk form fields */}
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          {/* Ruangan - Full Width */}
          <div className="md:col-span-2">
            <ASearchableSelect
              id="ruangan_id"
              name="ruangan_id"
              label="Ruangan"
              placeholder="Pilih Ruangan"
              value={selectedRuangan?.id || formData.ruangan_id || ""}
              onChange={handleInputChange}
              onSelect={handleRuanganSelect}
              error={showErrors ? errors.ruangan_id : ""}
              required
              options={ruanganFilter || []}
              searchFunction={RuanganFilter}
              displayKey="ruangan"
              valueKey="id"
              searchKey="ruangan"
              minSearchLength={2}
              noResultsText="Ruangan tidak ditemukan"
            />
          </div>

          {/* Kegiatan - Full Width */}
          <div className="md:col-span-2">
            <AInput
              id="kegiatan"
              icon={NotebookText}
              name="kegiatan"
              label="Kegiatan"
              placeholder="Masukkan Kegiatan"
              value={formData.kegiatan}
              onChange={handleInputChange}
              error={showErrors ? errors.kegiatan : ""}
              required
            />
          </div>

          {/* Penyelenggara - Full Width */}
          <div className="md:col-span-2">
            <AInput
              id="penyelenggara"
              icon={Users}
              name="penyelenggara"
              label="Penyelenggara"
              placeholder="Masukkan Penyelenggara"
              value={formData.penyelenggara}
              onChange={handleInputChange}
              error={showErrors ? errors.penyelenggara : ""}
              required
            />
          </div>

          {/* Tanggal Mulai */}
          <ADatePicker
            id="tgl_mulai"
            icon={Calendar}
            name="tgl_mulai"
            label="Tanggal Mulai"
            placeholder="Pilih Tanggal Mulai"
            value={formData.tgl_mulai}
            onChange={handleInputChange}
            error={showErrors ? errors.tgl_mulai : ""}
            required
          />

          {/* Tanggal Selesai */}
          <ADatePicker
            id="tgl_selesai"
            icon={Calendar}
            name="tgl_selesai"
            label="Tanggal Selesai"
            placeholder="Pilih Tanggal Selesai"
            value={formData.tgl_selesai}
            onChange={handleInputChange}
            error={showErrors ? errors.tgl_selesai : ""}
            required
          />
        </div>
       

        {/* Button Actions */}
        <div className="flex justify-end gap-3 pt-2">
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
            disabled={loading}
          >
            Batal
          </Button>
          <Button type="submit" disabled={loading}>
            {loading ? "Menyimpan..." : isEditMode ? "Update" : "Simpan"}
          </Button>
        </div>
      </form>
    </div>
  );
}
