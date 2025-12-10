"use client";
import { useState, useEffect } from "react";
import AInput from "@/components/AInput";
import ARadio from "@/components/ARadio";
import ASelect from "@/components/ASelect";
import ADatePicker from "@/components/ADatePicker";
import Button from "@/components/Button";
import { validateTahunanForm } from "@/app/utils/validator";
import { Package, NotebookText, Calendar, MapPin, Check, Users } from "lucide-react";
import { useData } from "@/app/context/DataContext";
export default function TambahTahunan({
  onClose,
  onSuccess,
  postTahunan,
  editingTahunan,
  isEditMode,
}) {
  const { teams, getWaka } = useData();
  useEffect(() => {
    getWaka();
  }, [getWaka]);
  const [form, setForm] = useState({
    kegiatan: "",
    tgl: "",
    end: "",
    lokasi: "",
    status: "incoming",
    team_id: "",
  });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [showErrors, setShowErrors] = useState(false);
  useEffect(() => {
    if (isEditMode && editingTahunan) {
      setForm({
        kegiatan: editingTahunan.kegiatan || "",
        tgl: editingTahunan.tgl || "",
        end: editingTahunan.end || "",
        lokasi: editingTahunan.lokasi || "",
        status: editingTahunan.status || "",
        team_id: editingTahunan.team_id || "",
      });
    }
  }, [isEditMode, editingTahunan]);
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({
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
    const newErrors = validateTahunanForm(form);
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
        kegiatan: form.kegiatan,
        tgl: form.tgl,
        end: form.end,
        lokasi: form.lokasi,
        status: form.status,
        team_id: form.team_id,
      };
      // Fix: gunakan postSatuan bukan postGedung
      if (postTahunan) {
        await postTahunan(submitData);
      } else {
        throw new Error("postTahunan function not provided");
      }
      // Reset form
      setForm({
        kegiatan: "",
        tgl: "",
        end: "",
        lokasi: "",
        status: "incoming",
        team_id: "",
      });

      // Reset error state
      setShowErrors(false);
      setErrors({});

      if (onSuccess) onSuccess(submitData);
      if (onClose) onClose();
    } catch (error) {
      console.error("Error saving tahunan:", error);
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
  const statusOptions = [
    { value: "incoming", label: "Incoming" },
    { value: "selesai", label: "Selesai" },
    { value: "cancel", label: "Cancel" },
  ];

  return (
    <div>
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Grid Layout untuk form fields */}
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          {/* Kegiatan - Full Width */}
          <div className="md:col-span-2">
        <AInput
          id="kegiatan"
          icon={NotebookText}
          name="kegiatan"
          label="Kegiatan"
          placeholder="Masukkan Kegiatan"
          value={form.kegiatan}
          onChange={handleInputChange}
          error={showErrors ? errors.kegiatan : ""}
              required
        />
          </div>

          {/* Tanggal Mulai */}
        <ADatePicker
          id="tgl"
          icon={Calendar}
          name="tgl"
            label="Tanggal Mulai"
            placeholder="Pilih Tanggal Mulai"
          value={form.tgl}
          onChange={handleInputChange}
          error={showErrors ? errors.tgl : ""}
            required
        />

          {/* Tanggal Selesai */}
        <ADatePicker
          id="end"
          icon={Calendar}
          name="end"
          label="Tanggal Selesai"
          placeholder="Pilih Tanggal Selesai"
          value={form.end}
          onChange={handleInputChange}
          error={showErrors ? errors.end : ""}
            required
        />

          {/* Lokasi */}
        <AInput
          id="lokasi"
          icon={MapPin}
          name="lokasi"
          label="Lokasi"
          placeholder="Masukkan Lokasi"
          value={form.lokasi}
          onChange={handleInputChange}
          error={showErrors ? errors.lokasi : ""}
            required
        />

          {/* Status */}
        <ASelect
          id="status"
          icon={Check}
          name="status"
          label="Status"
          placeholder="Pilih Status"
          value={form.status}
          onChange={handleInputChange}
          error={showErrors ? errors.status : ""}
            options={statusOptions}
            required
        />

          {/* Team - Full Width */}
          <div className="md:col-span-2">
        <ASelect
          id="team_id"
          icon={Users}
          name="team_id"
          label="Team"
          placeholder="Pilih Team"
          value={form.team_id}
          onChange={handleInputChange}
          error={showErrors ? errors.team_id : ""}
              options={teams.map((item) => ({
                value: String(item.id),
                label: item.nama || item.nama_team || item.jabatan || `Team ${item.id}`,
              }))}
              required
            />
          </div>
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
