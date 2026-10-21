"use client";
import { useState, useEffect } from "react";
import AInput from "@/components/AInput";
import ASelect from "@/components/ASelect";
import ADatePicker from "@/components/ADatePicker";
import Button from "@/components/Button";
import { validateTahunanForm } from "@/app/utils/validator";
import {
  NotebookText,
  Calendar,
  MapPin,
  Check,
  Users,
  FileText,
  StickyNote,
  Building2,
} from "lucide-react";
import { useData } from "@/app/context/DataContext";

const unitOptions = [
  { value: "it", label: "IT" },
  { value: "lab", label: "Lab" },
  { value: "sarpra", label: "Sarpra" },
];

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
    status: "planning",
    team_id: "",
    unit: "it",
    auto_status: true,
    catatan: "",
    keterangan: "",
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
        status: editingTahunan.status || "planning",
        team_id: editingTahunan.team_id
          ? String(editingTahunan.team_id)
          : "",
        unit: editingTahunan.unit || "it",
        auto_status:
          editingTahunan.auto_status === 0 ||
          editingTahunan.auto_status === false
            ? false
            : true,
        catatan: editingTahunan.catatan || "",
        keterangan: editingTahunan.keterangan || "",
      });
    }
  }, [isEditMode, editingTahunan]);

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
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
    setShowErrors(true);

    if (!validateForm()) {
      return;
    }

    setLoading(true);
    setErrors({});
    setShowErrors(false);

    try {
      const submitData = {
        kegiatan: form.kegiatan,
        tgl: form.tgl,
        end: form.end,
        lokasi: form.lokasi,
        status: form.status,
        team_id: form.team_id,
        unit: form.unit,
        auto_status: form.auto_status,
        catatan: form.catatan || null,
        keterangan: form.status === "batal" ? form.keterangan : form.keterangan || null,
      };
      if (postTahunan) {
        await postTahunan(submitData);
      } else {
        throw new Error("postTahunan function not provided");
      }
      setForm({
        kegiatan: "",
        tgl: "",
        end: "",
        lokasi: "",
        status: "planning",
        team_id: "",
        unit: "it",
        auto_status: true,
        catatan: "",
        keterangan: "",
      });
      setShowErrors(false);
      setErrors({});

      if (onSuccess) onSuccess(submitData);
      if (onClose) onClose();
    } catch (error) {
      console.error("Error saving tahunan:", error);
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
    { value: "planning", label: "Planning" },
    { value: "terlaksana", label: "Terlaksana" },
    { value: "tertunda", label: "Tertunda" },
    { value: "batal", label: "Batal" },
  ];

  return (
    <div>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
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

          <ASelect
            id="unit"
            icon={Building2}
            name="unit"
            label="Unit"
            placeholder="Pilih Unit"
            value={form.unit}
            onChange={handleInputChange}
            error={showErrors ? errors.unit : ""}
            options={unitOptions}
            required
          />

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
                label:
                  item.nama ||
                  item.nama_team ||
                  item.jabatan ||
                  `Team ${item.id}`,
              }))}
              required
            />
          </div>

          <div className="md:col-span-2">
            <label className="flex items-center gap-2 text-sm text-gray-700">
              <input
                type="checkbox"
                name="auto_status"
                checked={!!form.auto_status}
                onChange={handleInputChange}
                className="rounded border-gray-300"
              />
              Update status otomatis berdasarkan tanggal
            </label>
          </div>

          <div className="md:col-span-2">
            <AInput
              id="catatan"
              icon={StickyNote}
              name="catatan"
              label="Catatan Pelaksanaan"
              placeholder="Catatan umum pelaksanaan (opsional)"
              value={form.catatan}
              onChange={handleInputChange}
              multiline
              rows={2}
            />
          </div>

          {form.status === "batal" && (
            <div className="md:col-span-2">
              <AInput
                id="keterangan"
                icon={FileText}
                name="keterangan"
                label="Keterangan Tidak Terlaksana"
                placeholder="Alasan kegiatan tidak terlaksana"
                value={form.keterangan}
                onChange={handleInputChange}
                error={showErrors ? errors.keterangan : ""}
                multiline
                rows={3}
                required
              />
            </div>
          )}
        </div>

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
