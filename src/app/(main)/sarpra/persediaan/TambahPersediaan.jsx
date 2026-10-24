"use client";
import { useEffect, useState } from "react";
import AInput from "@/components/AInput";
import ASelect from "@/components/ASelect";
import Button from "@/components/Button";
import { Barcode, Box, Layers, MapPin, NotebookText } from "lucide-react";
import { useData } from "@/app/context/DataContext";

const kategoriOptions = [
  { value: "alat", label: "Alat" },
  { value: "bahan", label: "Bahan habis pakai" },
];

export default function TambahPersediaan({
  onClose,
  postPersediaan,
  editingItem,
  isEditMode,
}) {
  const { satuan, getOpsi } = useData();
  const [form, setForm] = useState({
    kode: "",
    nama: "",
    kategori: "alat",
    satuan_id: "",
    stok_minimal: "0",
    stok_awal: "0",
    lokasi_simpan: "",
    aktif: true,
    keterangan: "",
  });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    getOpsi();
  }, [getOpsi]);

  useEffect(() => {
    if (isEditMode && editingItem) {
      setForm({
        kode: editingItem.kode || "",
        nama: editingItem.nama || "",
        kategori: editingItem.kategori || "alat",
        satuan_id: editingItem.satuan_id ? String(editingItem.satuan_id) : "",
        stok_minimal: String(editingItem.stok_minimal ?? 0),
        stok_awal: String(editingItem.stok_awal ?? editingItem.stok_sekarang ?? 0),
        lokasi_simpan: editingItem.lokasi_simpan || "",
        aktif: editingItem.aktif === 0 || editingItem.aktif === false ? false : true,
        keterangan: editingItem.keterangan || "",
      });
    }
  }, [isEditMode, editingItem]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((prev) => ({ ...prev, [name]: type === "checkbox" ? checked : value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const nextErrors = {};
    if (!form.kode.trim()) nextErrors.kode = "Kode wajib diisi";
    if (!form.nama.trim()) nextErrors.nama = "Nama wajib diisi";
    if (!form.satuan_id) nextErrors.satuan_id = "Satuan wajib dipilih";
    if (Number(form.stok_minimal) < 0) nextErrors.stok_minimal = "Stok minimal tidak boleh negatif";
    if (Number(form.stok_awal) < 0) nextErrors.stok_awal = "Stok gudang tidak boleh negatif";
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length) return;

    setLoading(true);
    try {
      await postPersediaan({
        kode: form.kode.trim(),
        nama: form.nama.trim(),
        kategori: form.kategori,
        satuan_id: form.satuan_id,
        stok_minimal: Number(form.stok_minimal) || 0,
        stok_awal: Number(form.stok_awal) || 0,
        lokasi_simpan: form.lokasi_simpan || null,
        aktif: form.aktif,
        keterangan: form.keterangan || null,
      });
    } catch (error) {
      alert(error.response?.data?.message || error.message || "Gagal menyimpan barang");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <AInput id="kode" name="kode" icon={Barcode} label="Kode" value={form.kode} onChange={handleChange} error={errors.kode} required />
        <AInput id="nama" name="nama" icon={Box} label="Nama Barang" value={form.nama} onChange={handleChange} error={errors.nama} required />
        <ASelect
          id="kategori"
          name="kategori"
          icon={Layers}
          label="Kategori"
          value={form.kategori}
          onChange={handleChange}
          options={kategoriOptions}
          required
        />
        <ASelect
          id="satuan_id"
          name="satuan_id"
          label="Satuan"
          placeholder="Pilih satuan"
          value={form.satuan_id}
          onChange={handleChange}
          error={errors.satuan_id}
          options={(satuan || []).map((item) => ({ value: String(item.id), label: item.satuan }))}
          required
        />
        <AInput id="stok_minimal" name="stok_minimal" type="number" label="Stok Minimal" value={form.stok_minimal} onChange={handleChange} error={errors.stok_minimal} />
        <div>
          <AInput id="stok_awal" name="stok_awal" type="number" label="Stok Gudang" value={form.stok_awal} onChange={handleChange} error={errors.stok_awal} />
          <p className="mt-1 text-xs text-gray-500">Saldo di gudang. Tidak masuk ke kartu persediaan.</p>
        </div>
        <div className="md:col-span-2">
          <AInput id="lokasi_simpan" name="lokasi_simpan" icon={MapPin} label="Lokasi Simpan" value={form.lokasi_simpan} onChange={handleChange} placeholder="Gudang / rak" />
        </div>
        <div className="md:col-span-2">
          <AInput id="keterangan" name="keterangan" icon={NotebookText} label="Keterangan" value={form.keterangan} onChange={handleChange} multiline rows={2} />
        </div>
        <label className="flex items-center gap-2 text-sm text-gray-700 md:col-span-2">
          <input type="checkbox" name="aktif" checked={!!form.aktif} onChange={handleChange} className="rounded border-gray-300" />
          Barang aktif
        </label>
      </div>
      <div className="flex justify-end gap-3">
        <Button type="button" variant="outline" onClick={onClose} disabled={loading}>Batal</Button>
        <Button type="submit" disabled={loading}>{loading ? "Menyimpan..." : isEditMode ? "Update" : "Simpan"}</Button>
      </div>
    </form>
  );
}
