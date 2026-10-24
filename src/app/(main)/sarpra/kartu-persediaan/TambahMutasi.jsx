"use client";
import { useEffect, useState } from "react";
import AInput from "@/components/AInput";
import ASelect from "@/components/ASelect";
import ADatePicker from "@/components/ADatePicker";
import Button from "@/components/Button";
import api from "@/app/utils/Api";
import { useData } from "@/app/context/DataContext";
import dayjs from "dayjs";

const jenisOptions = [
  { value: "keluar", label: "Distribusi ke ruangan" },
  { value: "masuk", label: "Tambah stok gudang" },
  { value: "rusak", label: "Rusak" },
  { value: "opname", label: "Opname" },
];

export default function TambahMutasi({ onClose, postMutasi, editingItem, isEditMode }) {
  const { ruanganFilter, getRuanganFilter } = useData();
  const [barangOptions, setBarangOptions] = useState([]);
  const [form, setForm] = useState({
    barang_id: "",
    tanggal: dayjs().format("YYYY-MM-DD"),
    jenis: "keluar",
    jumlah: "",
    stok_fisik: "",
    ruangan_id: "",
    tgl_kadaluarsa: "",
    referensi: "",
    keterangan: "",
  });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    getRuanganFilter();
    api.get("/sp/persediaan/options").then((res) => {
      if (res.data.status === "success") setBarangOptions(res.data.data || []);
    }).catch(() => setBarangOptions([]));
  }, [getRuanganFilter]);

  useEffect(() => {
    if (isEditMode && editingItem) {
      setForm({
        barang_id: String(editingItem.barang_id || ""),
        tanggal: editingItem.tanggal ? dayjs(editingItem.tanggal).format("YYYY-MM-DD") : "",
        jenis: editingItem.jenis || "masuk",
        jumlah: editingItem.jenis === "opname" ? "" : String(editingItem.jumlah ?? ""),
        stok_fisik: editingItem.jenis === "opname" ? String(editingItem.stok_sesudah ?? "") : "",
        ruangan_id: editingItem.ruangan_id ? String(editingItem.ruangan_id) : "",
        tgl_kadaluarsa: editingItem.tgl_kadaluarsa ? dayjs(editingItem.tgl_kadaluarsa).format("YYYY-MM-DD") : "",
        referensi: editingItem.referensi || "",
        keterangan: editingItem.keterangan || "",
      });
    }
  }, [isEditMode, editingItem]);

  const selected = barangOptions.find((item) => String(item.id) === String(form.barang_id));

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const nextErrors = {};
    if (!form.barang_id) nextErrors.barang_id = "Barang wajib dipilih";
    if (!form.tanggal) nextErrors.tanggal = "Tanggal wajib diisi";
    if (form.jenis === "opname") {
      if (form.stok_fisik === "" || Number(form.stok_fisik) < 0) nextErrors.stok_fisik = "Stok fisik wajib diisi";
    } else if (!form.jumlah || Number(form.jumlah) <= 0) {
      nextErrors.jumlah = "Jumlah harus lebih dari 0";
    }
    if (form.jenis === "keluar" && !form.ruangan_id) nextErrors.ruangan_id = "Ruangan tujuan wajib dipilih";
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length) return;

    setLoading(true);
    try {
      await postMutasi({
        barang_id: form.barang_id,
        tanggal: form.tanggal,
        jenis: form.jenis,
        jumlah: form.jenis === "opname" ? 0 : Number(form.jumlah),
        stok_fisik: form.jenis === "opname" ? Number(form.stok_fisik) : undefined,
        ruangan_id: form.jenis === "keluar" ? form.ruangan_id : null,
        tgl_kadaluarsa: form.jenis === "masuk" && selected?.kategori === "bahan" ? form.tgl_kadaluarsa || null : null,
        referensi: form.referensi || null,
        keterangan: form.keterangan || null,
      });
    } catch (error) {
      alert(error.message || "Gagal menyimpan mutasi");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <div className="md:col-span-2">
          <ASelect
            id="barang_id"
            name="barang_id"
            label="Barang"
            placeholder="Pilih barang"
            value={form.barang_id}
            onChange={handleChange}
            error={errors.barang_id}
            options={barangOptions.map((item) => ({
              value: String(item.id),
              label: `${item.kode} - ${item.nama} (stok ${item.stok_sekarang} ${item.satuan || ""})`,
            }))}
            required
          />
          {selected && (
            <p className="mt-1 text-xs text-gray-500">
              Stok sekarang: {selected.stok_sekarang} {selected.satuan}. Minimal: {selected.stok_minimal}. Kategori: {selected.kategori}.
            </p>
          )}
        </div>
        <ADatePicker id="tanggal" name="tanggal" label="Tanggal" value={form.tanggal} onChange={handleChange} error={errors.tanggal} required />
        <ASelect id="jenis" name="jenis" label="Jenis" value={form.jenis} onChange={handleChange} options={jenisOptions} required />
        {form.jenis === "opname" ? (
          <AInput id="stok_fisik" name="stok_fisik" type="number" label="Stok Fisik Hasil Hitung" value={form.stok_fisik} onChange={handleChange} error={errors.stok_fisik} required />
        ) : (
          <AInput id="jumlah" name="jumlah" type="number" label="Jumlah" value={form.jumlah} onChange={handleChange} error={errors.jumlah} required />
        )}
        {form.jenis === "keluar" && (
          <ASelect
            id="ruangan_id"
            name="ruangan_id"
            label="Ruangan Tujuan"
            placeholder="Pilih ruangan"
            value={form.ruangan_id}
            onChange={handleChange}
            error={errors.ruangan_id}
            options={(ruanganFilter || []).map((item) => ({ value: String(item.id), label: item.ruangan }))}
            required
          />
        )}
        {form.jenis === "masuk" && selected?.kategori === "bahan" && (
          <ADatePicker id="tgl_kadaluarsa" name="tgl_kadaluarsa" label="Tanggal Kadaluarsa" value={form.tgl_kadaluarsa} onChange={handleChange} />
        )}
        <AInput id="referensi" name="referensi" label="Referensi / Nota" value={form.referensi} onChange={handleChange} />
        <div className="md:col-span-2">
          <AInput id="keterangan" name="keterangan" label="Keterangan" value={form.keterangan} onChange={handleChange} multiline rows={2} />
        </div>
      </div>
      <div className="flex justify-end gap-3">
        <Button type="button" variant="outline" onClick={onClose} disabled={loading}>Batal</Button>
        <Button type="submit" disabled={loading}>{loading ? "Menyimpan..." : isEditMode ? "Update" : "Simpan"}</Button>
      </div>
    </form>
  );
}
