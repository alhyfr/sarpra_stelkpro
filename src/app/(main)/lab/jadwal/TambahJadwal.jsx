"use client";
import { useState, useEffect } from "react";
import AInput from "@/components/AInput";
import AFile from "@/components/AFile";
import ARadio from "@/components/ARadio";
import ASelect from "@/components/ASelect";
import ADatePicker from "@/components/ADatePicker";
import { 
  User, 
  Book, 
  File as FileIcon, 
  Calendar, 
  Clock, 
  FlaskConical, 
  GraduationCap, 
  Activity, 
  CheckCircle 
} from 'lucide-react';
import Button from "@/components/Button";
import { validateJadwalLabForm } from "@/app/utils/validator";
export default function TambahJadwal({
  onClose,
  onSuccess,
  postJadwalLab,
  editingJadwal,
  isEditMode,
  labs = [],
}) {
  const [formData, setFormData] = useState({
    lab_id: "",
    tgl: "",
    jam_mulai: "",
    jam_selesai: "",
    kelas: "",
    mapel: "",
    kegiatan: "",
    topik: "",
    lkpd: "",
    pj: "",
    ket: "",
    status: "",
  });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [showErrors, setShowErrors] = useState(false);
  useEffect(() => {
    if (isEditMode && editingJadwal) {
      // Handle lab_id dari berbagai format: langsung atau dari relasi object
      const labId = editingJadwal.lab_id || editingJadwal.lab?.id || "";
      const labIdString = labId ? String(labId) : "";
      
      setFormData({
        lab_id: labIdString,
        tgl: editingJadwal.tgl || "",
        jam_mulai: editingJadwal.jam_mulai || "",
        jam_selesai: editingJadwal.jam_selesai || "",
        kelas: editingJadwal.kelas || "",
        mapel: editingJadwal.mapel || "",
        kegiatan: editingJadwal.kegiatan || "",
        topik: editingJadwal.topik || "",
        lkpd: editingJadwal.lkpd || "",
        pj: editingJadwal.pj || "",
        ket: editingJadwal.ket || "",
        status: editingJadwal.status || "",
      });
    }
  }, [isEditMode, editingJadwal]);
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    // Clear error when user starts typing (jika showErrors aktif)
    if (showErrors && errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: "",
      }));
    }
  };
  const handleFileChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    // Clear error for file field
    if (showErrors && errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: "",
      }));
    }
  };
  const handleFileRemove = () => {
    setFormData((prev) => ({
      ...prev,
      lkpd: null,
    }));
  };
  const validateForm = () => {
    const newErrors = validateJadwalLabForm(formData);
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
      let submitData;

      // Check if lkpd is a File object
      const isFile = formData.lkpd && typeof formData.lkpd === 'object' && formData.lkpd.constructor === File;
      
      if (isFile) {
        submitData = new FormData();
        submitData.append("lab_id", formData.lab_id);
        submitData.append("tgl", formData.tgl);
        submitData.append("jam_mulai", formData.jam_mulai);
        submitData.append("jam_selesai", formData.jam_selesai);
        submitData.append("kelas", formData.kelas);
        submitData.append("mapel", formData.mapel);
        submitData.append("kegiatan", formData.kegiatan);
        submitData.append("topik", formData.topik);
        submitData.append("lkpd", formData.lkpd);
        submitData.append("pj", formData.pj);
        submitData.append("ket", formData.ket);
        submitData.append("status", formData.status);
      } else {
        // Jika mode edit dan gambar tidak diubah (null atau kosong), gunakan gambar yang sudah ada
        let lkpdValue = formData.lkpd || null;
        if (isEditMode && editingJadwal && (!lkpdValue || lkpdValue === "")) {
          lkpdValue = editingJadwal.lkpd || null;
        }

        submitData = {
          lab_id: formData.lab_id,
          tgl: formData.tgl,
          jam_mulai: formData.jam_mulai,
          jam_selesai: formData.jam_selesai,
          kelas: formData.kelas,
          mapel: formData.mapel,
          kegiatan: formData.kegiatan,
          topik: formData.topik,
          lkpd: lkpdValue,
          pj: formData.pj,
          ket: formData.ket,
          status: formData.status,
        };
      }

      // Fix: gunakan postGedung bukan postUser
      if (postJadwalLab) {
        await postJadwalLab(submitData);
      } else {
        throw new Error("postJadwalLab function not provided");
      }

      // Reset form
      setFormData({
        lab_id: "",
        tgl: "",
        jam_mulai: "",
        jam_selesai: "",
        kelas: "",
        mapel: "",
        kegiatan: "",
        topik: "",
        lkpd: "",
        pj: "",
        ket: "",
        status: "",
      });

      // Reset error state
      setShowErrors(false);
      setErrors({});

      if (onSuccess) onSuccess(submitData);
      if (onClose) onClose();
    } catch (error) {
      console.error("Error saving jadwal lab:", error);
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
    { value: "0", label: "Terjadwal" },
    { value: "1", label: "Terlaksana" },
  ];
  return (
    <div>
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Grid Layout untuk form fields */}
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          {/* Lab Selection */}
          <ASelect
            id="lab_id"
            icon={FlaskConical}
            name="lab_id"
            label="Laboratorium"
            placeholder="Pilih Laboratorium"
            value={formData.lab_id}
            onChange={handleInputChange}
            error={showErrors ? errors.lab_id : ""}
            options={labs.map((item) => ({
              value: String(item.id),
              label: item.nama_lab || item.name || item.label,
            }))}
            required
          />

          {/* Tanggal */}
          <ADatePicker
            id="tgl"
            icon={Calendar}
            name="tgl"
            label="Tanggal"
            placeholder="Pilih Tanggal"
            value={formData.tgl}
            onChange={handleInputChange}
            error={showErrors ? errors.tgl : ""}
            required
          />

          {/* Jam Mulai */}
          <AInput
            id="jam_mulai"
            icon={Clock}
            name="jam_mulai"
            label="Jam Mulai"
            type="time"
            placeholder="Contoh: 08:00"
            value={formData.jam_mulai}
            onChange={handleInputChange}
            error={showErrors ? errors.jam_mulai : ""}
            required
          />

          {/* Jam Selesai */}
          <AInput
            id="jam_selesai"
            icon={Clock}
            name="jam_selesai"
            label="Jam Selesai"
            placeholder="Contoh: 10:00"
            type="time"
            value={formData.jam_selesai}
            onChange={handleInputChange}
            error={showErrors ? errors.jam_selesai : ""}
            required
          />

          {/* Fasilitator */}
          <AInput
            id="pj"
            icon={User}
            name="pj"
            label="Fasilitator"
            placeholder="Masukkan Nama Fasilitator"
            value={formData.pj}
            onChange={handleInputChange}
            error={showErrors ? errors.pj : ""}
            required
          />

          {/* Status */}
          <ASelect
            id="status"
            icon={CheckCircle}
            name="status"
            label="Status"
            placeholder="Pilih Status"
            value={formData.status}
            onChange={handleInputChange}
            error={showErrors ? errors.status : ""}
            options={statusOptions}
            required
          />

          {/* Mata Pelajaran */}
          <AInput
            id="mapel"
            icon={Book}
            name="mapel"
            label="Mata Pelajaran"
            placeholder="Masukkan Mata Pelajaran"
            value={formData.mapel}
            onChange={handleInputChange}
            error={showErrors ? errors.mapel : ""}
            required
          />

          {/* Kelas */}
          <AInput
            id="kelas"
            icon={GraduationCap}
            name="kelas"
            label="Kelas"
            placeholder="Masukkan Kelas"
            value={formData.kelas}
            onChange={handleInputChange}
            error={showErrors ? errors.kelas : ""}
            required
          />

          {/* Topik - Full Width */}
          <div className="md:col-span-2">
            <AInput 
              id="topik"
              icon={Book}
              name="topik"
              label="Topik"
              placeholder="Masukkan Topik"
              value={formData.topik}
              onChange={handleInputChange}
              error={showErrors ? errors.topik : ""}
              multiline
              rows={3}
              required
            />
          </div>

          {/* Kegiatan - Full Width */}
          <div className="md:col-span-2">
            <AInput
              id="kegiatan"
              icon={Activity}
              name="kegiatan"
              label="Kegiatan"
              placeholder="Masukkan Kegiatan"
              value={formData.kegiatan}
              onChange={handleInputChange}
              error={showErrors ? errors.kegiatan : ""}
              multiline
              rows={3}
              required
            />
          </div>

          {/* LKPD - Full Width */}
          <div className="md:col-span-2">
            <AFile
              id="lkpd"
              icon={FileIcon}
              name="lkpd"
              label="LKPD"
              placeholder="Pilih File LKPD"
              value={formData.lkpd}
              onChange={handleFileChange}
              onRemove={handleFileRemove}
              error={showErrors ? errors.lkpd : ""}
              accept="application/pdf,.doc,.docx"
              helperText="Format: PDF, DOC, DOCX (Maks. 5MB)"
            />
          </div>

          {/* Keterangan - Full Width (jika ada) */}
          {formData.ket !== undefined && (
            <div className="md:col-span-2">
              <AInput
                id="ket"
                icon={Book}
                name="ket"
                label="Keterangan"
                placeholder="Masukkan Keterangan (Opsional)"
                value={formData.ket}
                onChange={handleInputChange}
                error={showErrors ? errors.ket : ""}
                multiline
                rows={2}
              />
            </div>
          )}
        </div>

        {/* Action Buttons - Full Width */}
        <div className="flex justify-end gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
          {onClose && (
            <Button 
              type="button" 
              onClick={onClose}
              variant="secondary"
            >
              Batal
            </Button>
          )}
          <Button 
            type="submit" 
            loading={loading}
          >
            {isEditMode ? 'Update Data' : 'Simpan Data'}
          </Button>
        </div>
      </form>
    </div>
  );
}
