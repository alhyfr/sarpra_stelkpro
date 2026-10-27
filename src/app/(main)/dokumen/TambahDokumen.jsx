"use client";
import { useEffect, useState } from "react";
import AInput from "@/components/AInput";
import ASelect from "@/components/ASelect";
import AFile from "@/components/AFile";
import Button from "@/components/Button";
import { FileText, Hash, NotebookText } from "lucide-react";
import { useAuth } from "@/app/context/AuthContext";
import api from "@/app/utils/Api";
import { getStorageUrl } from "@/helper/storageUrl";

export default function TambahDokumen({
  onClose,
  postDokumen,
  editingItem,
  isEditMode,
}) {
  const { user } = useAuth();
  const [kategoriOptions, setKategoriOptions] = useState([]);
  const [form, setForm] = useState({
    kode: "",
    judul: "",
    kategori_id: "",
    nomor_dokumen: "",
    nomor_revisi: "",
    tgl_dokumen: "",
    tgl_berlaku: "",
    keterangan: "",
    aktif: true,
    pic: user?.name || "",
    file: null,
  });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    const load = async () => {
      try {
        const res = await api.get("/sp/dokumen/kategori");
        const rows = res.data?.data || [];
        setKategoriOptions(rows.map((item) => ({ value: String(item.id), label: item.nama })));
      } catch {
        setKategoriOptions([]);
      }
    };
    load();
  }, []);

  useEffect(() => {
    if (isEditMode && editingItem) {
      setForm({
        kode: editingItem.kode || "",
        judul: editingItem.judul || "",
        kategori_id: editingItem.kategori_id ? String(editingItem.kategori_id) : "",
        nomor_dokumen: editingItem.nomor_dokumen || "",
        nomor_revisi: editingItem.nomor_revisi || "",
        tgl_dokumen: editingItem.tgl_dokumen ? String(editingItem.tgl_dokumen).slice(0, 10) : "",
        tgl_berlaku: editingItem.tgl_berlaku ? String(editingItem.tgl_berlaku).slice(0, 10) : "",
        keterangan: editingItem.keterangan || "",
        aktif: editingItem.aktif === 0 || editingItem.aktif === false ? false : true,
        pic: editingItem.pic || user?.name || "",
        file: editingItem.file_path || null,
      });
    }
  }, [isEditMode, editingItem, user?.name]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((prev) => ({ ...prev, [name]: type === "checkbox" ? checked : value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const nextErrors = {};
    if (!form.judul.trim()) nextErrors.judul = "Judul wajib diisi";
    if (!form.kategori_id) nextErrors.kategori_id = "Kategori wajib dipilih";
    if (!isEditMode && !(form.file instanceof File)) nextErrors.file = "File PDF wajib diunggah";
    if (form.file instanceof File) {
      const isPdf =
        form.file.type === "application/pdf" || /\.pdf$/i.test(form.file.name || "");
      if (!isPdf) nextErrors.file = "Hanya file PDF yang diizinkan";
    }
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length) return;

    setLoading(true);
    try {
      const payload = new FormData();
      payload.append("kode", form.kode.trim());
      payload.append("judul", form.judul.trim());
      payload.append("kategori_id", form.kategori_id);
      payload.append("nomor_dokumen", form.nomor_dokumen || "");
      payload.append("nomor_revisi", form.nomor_revisi || "");
      payload.append("tgl_dokumen", form.tgl_dokumen || "");
      payload.append("tgl_berlaku", form.tgl_berlaku || "");
      payload.append("keterangan", form.keterangan || "");
      payload.append("aktif", form.aktif ? "1" : "0");
      payload.append("pic", form.pic || user?.name || "");
      if (form.file instanceof File) {
        payload.append("file", form.file);
      }
      await postDokumen(payload);
    } catch (error) {
      alert(error.response?.data?.message || error.message || "Gagal menyimpan dokumen");
    } finally {
      setLoading(false);
    }
  };

  const existingFileLabel =
    typeof form.file === "string" && form.file
      ? getStorageUrl(form.file) || form.file
      : form.file;

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <AInput
          id="judul"
          name="judul"
          icon={FileText}
          label="Judul"
          value={form.judul}
          onChange={handleChange}
          error={errors.judul}
          required
        />
        <ASelect
          id="kategori_id"
          name="kategori_id"
          label="Kategori"
          placeholder="Pilih kategori"
          value={form.kategori_id}
          onChange={handleChange}
          error={errors.kategori_id}
          options={kategoriOptions}
          required
        />
        <AInput
          id="kode"
          name="kode"
          icon={Hash}
          label="Kode"
          placeholder="Kosongkan untuk otomatis"
          value={form.kode}
          onChange={handleChange}
        />
        <AInput
          id="nomor_dokumen"
          name="nomor_dokumen"
          label="Nomor Dokumen"
          placeholder="Opsional"
          value={form.nomor_dokumen}
          onChange={handleChange}
        />
        <AInput
          id="nomor_revisi"
          name="nomor_revisi"
          label="Nomor Revisi"
          placeholder="Opsional, mis. 00"
          value={form.nomor_revisi}
          onChange={handleChange}
        />
        <AInput
          id="tgl_dokumen"
          name="tgl_dokumen"
          type="date"
          label="Tanggal Dokumen"
          value={form.tgl_dokumen}
          onChange={handleChange}
        />
        <AInput
          id="tgl_berlaku"
          name="tgl_berlaku"
          type="date"
          label="Tanggal Berlaku"
          value={form.tgl_berlaku}
          onChange={handleChange}
        />
        <AInput
          id="pic"
          name="pic"
          label="PIC"
          value={form.pic}
          onChange={handleChange}
          readOnly
          className="bg-gray-100 dark:bg-gray-700 text-slate-400"
        />
        <div className="md:col-span-2">
          <AInput
            id="keterangan"
            name="keterangan"
            icon={NotebookText}
            label="Keterangan"
            value={form.keterangan}
            onChange={handleChange}
            multiline
            rows={2}
          />
        </div>
        <div className="md:col-span-2">
          <AFile
            id="file"
            name="file"
            label="File Dokumen"
            value={existingFileLabel}
            onChange={(file) => setForm((prev) => ({ ...prev, file }))}
            onRemove={() => setForm((prev) => ({ ...prev, file: null }))}
            accept=".pdf,application/pdf"
            maxSize={9}
            required={!isEditMode}
            error={errors.file}
            helperText={isEditMode ? "Kosongkan jika tidak mengganti file. Hanya PDF." : "Hanya file PDF, maks 9MB"}
            compress={false}
          />
        </div>
        <label className="flex items-center gap-2 text-sm text-gray-700 md:col-span-2">
          <input
            type="checkbox"
            name="aktif"
            checked={!!form.aktif}
            onChange={handleChange}
            className="rounded border-gray-300"
          />
          Dokumen aktif
        </label>
      </div>
      <div className="flex justify-end gap-3">
        <Button type="button" variant="outline" onClick={onClose} disabled={loading}>
          Batal
        </Button>
        <Button type="submit" disabled={loading}>
          {loading ? "Menyimpan..." : isEditMode ? "Update" : "Simpan"}
        </Button>
      </div>
    </form>
  );
}
