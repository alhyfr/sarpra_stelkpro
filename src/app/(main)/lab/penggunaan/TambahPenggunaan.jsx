"use client";
import { useCallback, useEffect, useState } from "react";
import AInput from "@/components/AInput";
import ASelect from "@/components/ASelect";
import ASearchableSelect from "@/components/ASearchableSelect";
import Button from "@/components/Button";
import { Plus, Trash2 } from "lucide-react";
import { useAuth } from "@/app/context/AuthContext";
import { useData } from "@/app/context/DataContext";
import api from "@/app/utils/Api";
import dayjs from "dayjs";

const statusOptions = [
  { value: "draft", label: "Draft" },
  { value: "dipinjam", label: "Dipinjam" },
  { value: "sebagian", label: "Sebagian dikembalikan" },
  { value: "dikembalikan", label: "Dikembalikan" },
  { value: "batal", label: "Batal" },
];

const emptyItem = () => ({
  key: `${Date.now()}-${Math.random()}`,
  jenis: "bahan",
  ref_id: "",
  nama: "",
  kode: "",
  satuan: "",
  jumlah: "1",
  keterangan: "",
});

export default function TambahPenggunaan({
  onClose,
  postPenggunaan,
  editingItem,
  isEditMode,
}) {
  const { user } = useAuth();
  const { labs, getOpsi } = useData();
  const [form, setForm] = useState({
    nomor: "",
    tgl: dayjs().format("YYYY-MM-DD"),
    lab_id: "",
    mapel: "",
    kelas: "",
    kegiatan: "",
    peminjam: "",
    petugas: user?.name || "",
    status: "draft",
    keterangan: "",
  });
  const [items, setItems] = useState([emptyItem()]);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    getOpsi();
  }, [getOpsi]);

  useEffect(() => {
    const loadDetail = async () => {
      if (!isEditMode || !editingItem?.id) return;
      try {
        const res = await api.get(`/sp/penggunaan-lab/${editingItem.id}`);
        const row = res.data?.data;
        if (!row) return;
        setForm({
          nomor: row.nomor || "",
          tgl: row.tgl ? String(row.tgl).slice(0, 10) : dayjs().format("YYYY-MM-DD"),
          lab_id: row.lab_id ? String(row.lab_id) : "",
          mapel: row.mapel || "",
          kelas: row.kelas || "",
          kegiatan: row.kegiatan || "",
          peminjam: row.peminjam || "",
          petugas: row.petugas || user?.name || "",
          status: row.status || "draft",
          keterangan: row.keterangan || "",
        });
        setItems(
          (row.items || []).map((item) => ({
            key: `item-${item.id}`,
            id: item.id,
            jenis: item.jenis || "bahan",
            ref_id: String(item.ref_id || ""),
            nama: item.nama || "",
            kode: item.kode || "",
            satuan: item.satuan || "",
            jumlah: String(item.jumlah || 1),
            jumlah_kembali: String(item.jumlah_kembali || 0),
            status: item.status || "dipinjam",
            keterangan: item.keterangan || "",
          }))
        );
      } catch (error) {
        alert(error.response?.data?.message || "Gagal memuat detail dokumen");
      }
    };
    loadDetail();
  }, [isEditMode, editingItem, user?.name]);

  const searchAlat = useCallback(
    async (search = "") => {
      if (!form.lab_id) return [];
      const res = await api.get(
        `/sp/penggunaan-lab/options/alat?lab_id=${form.lab_id}&search=${encodeURIComponent(search)}`
      );
      return res.data?.data || [];
    },
    [form.lab_id]
  );

  const searchBahan = useCallback(
    async (search = "") => {
      const q = form.lab_id
        ? `/sp/penggunaan-lab/options/bahan?lab_id=${form.lab_id}&search=${encodeURIComponent(search)}`
        : `/sp/penggunaan-lab/options/bahan?search=${encodeURIComponent(search)}`;
      const res = await api.get(q);
      return res.data?.data || [];
    },
    [form.lab_id]
  );

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const updateItem = (index, patch) => {
    setItems((prev) => prev.map((row, i) => (i === index ? { ...row, ...patch } : row)));
  };

  const addItem = () => setItems((prev) => [...prev, emptyItem()]);
  const removeItem = (index) => {
    setItems((prev) => (prev.length <= 1 ? prev : prev.filter((_, i) => i !== index)));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const nextErrors = {};
    if (!form.lab_id) nextErrors.lab_id = "Laboratorium wajib dipilih";
    if (!form.tgl) nextErrors.tgl = "Tanggal wajib diisi";
    if (!form.peminjam.trim()) nextErrors.peminjam = "Peminjam wajib diisi";
    if (!items.length || items.some((item) => !item.ref_id || Number(item.jumlah) <= 0)) {
      nextErrors.items = "Setiap baris wajib punya item dan jumlah > 0";
    }
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length) return;

    setLoading(true);
    try {
      await postPenggunaan({
        ...form,
        items: items.map((item) => ({
          jenis: item.jenis,
          ref_id: item.ref_id,
          kode: item.kode,
          nama: item.nama,
          satuan: item.satuan,
          jumlah: Number(item.jumlah) || 1,
          jumlah_kembali: Number(item.jumlah_kembali) || 0,
          status: item.status || "dipinjam",
          keterangan: item.keterangan || null,
        })),
      });
    } catch (error) {
      alert(error.response?.data?.message || error.message || "Gagal menyimpan");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <ASelect
          id="lab_id"
          name="lab_id"
          label="Laboratorium"
          placeholder="Pilih laboratorium"
          value={form.lab_id}
          onChange={(e) => {
            handleChange(e);
            setItems([emptyItem()]);
          }}
          error={errors.lab_id}
          required
          options={(labs || []).map((lab) => ({
            value: String(lab.id),
            label: lab.nama_lab,
          }))}
        />
        <AInput id="tgl" name="tgl" type="date" label="Tanggal" value={form.tgl} onChange={handleChange} error={errors.tgl} required />
        <AInput id="nomor" name="nomor" label="Nomor Dokumen" placeholder="Kosongkan untuk otomatis" value={form.nomor} onChange={handleChange} />
        <ASelect id="status" name="status" label="Status" value={form.status} onChange={handleChange} options={statusOptions} />
        <AInput id="peminjam" name="peminjam" label="Peminjam / Guru" value={form.peminjam} onChange={handleChange} error={errors.peminjam} required />
        <AInput id="petugas" name="petugas" label="Petugas / Laboran" value={form.petugas} onChange={handleChange} readOnly className="bg-gray-100" />
        <AInput id="mapel" name="mapel" label="Mapel" value={form.mapel} onChange={handleChange} />
        <AInput id="kelas" name="kelas" label="Kelas" value={form.kelas} onChange={handleChange} />
        <div className="md:col-span-2">
          <AInput id="kegiatan" name="kegiatan" label="Kegiatan / Praktikum" value={form.kegiatan} onChange={handleChange} />
        </div>
        <div className="md:col-span-2">
          <AInput id="keterangan" name="keterangan" label="Keterangan" value={form.keterangan} onChange={handleChange} multiline rows={2} />
        </div>
      </div>

      <div className="rounded-lg border border-gray-200 p-3">
        <div className="mb-3 flex items-center justify-between">
          <h4 className="font-semibold text-gray-800">Daftar Alat & Bahan</h4>
          <Button type="button" variant="outline" onClick={addItem}>
            <Plus className="mr-1 h-4 w-4" /> Tambah Item
          </Button>
        </div>
        {errors.items && <p className="mb-2 text-sm text-rose-600">{errors.items}</p>}
        <div className="space-y-3">
          {items.map((item, index) => (
            <div key={item.key} className="grid grid-cols-1 gap-3 rounded-md bg-slate-50 p-3 md:grid-cols-12">
              <div className="md:col-span-2">
                <ASelect
                  id={`jenis-${index}`}
                  name="jenis"
                  label="Jenis"
                  value={item.jenis}
                  onChange={(e) =>
                    updateItem(index, {
                      jenis: e.target.value,
                      ref_id: "",
                      nama: "",
                      kode: "",
                      satuan: "",
                    })
                  }
                  options={[
                    { value: "bahan", label: "Bahan" },
                    { value: "alat", label: "Alat" },
                  ]}
                />
              </div>
              <div className="md:col-span-5">
                <ASearchableSelect
                  id={`ref-${index}`}
                  name="ref_id"
                  label={item.jenis === "alat" ? "Alat Lab" : "Bahan Praktikum"}
                  placeholder={form.lab_id ? "Cari..." : "Pilih lab dulu"}
                  value={item.ref_id}
                  onChange={() => {}}
                  onSelect={(opt) =>
                    updateItem(index, {
                      ref_id: String(opt.id),
                      nama: opt.nama || opt.nama_barang || "",
                      kode: opt.kode || opt.kode_barang || "",
                      satuan: opt.satuan || "",
                    })
                  }
                  options={
                    item.ref_id
                      ? [{ id: item.ref_id, nama: item.nama, kode: item.kode }]
                      : []
                  }
                  searchFunction={item.jenis === "alat" ? searchAlat : searchBahan}
                  displayKey="nama"
                  valueKey="id"
                  searchKey="nama"
                  minSearchLength={0}
                  noResultsText="Tidak ditemukan"
                />
              </div>
              <div className="md:col-span-2">
                <AInput
                  id={`jumlah-${index}`}
                  name="jumlah"
                  type="number"
                  min="1"
                  label="Jumlah"
                  value={item.jumlah}
                  onChange={(e) => updateItem(index, { jumlah: e.target.value })}
                />
              </div>
              <div className="md:col-span-2">
                <AInput
                  id={`satuan-${index}`}
                  name="satuan"
                  label="Satuan"
                  value={item.satuan}
                  onChange={(e) => updateItem(index, { satuan: e.target.value })}
                />
              </div>
              <div className="flex items-end md:col-span-1">
                <button
                  type="button"
                  onClick={() => removeItem(index)}
                  className="mb-1 rounded-lg p-2 text-rose-600 hover:bg-rose-50"
                  title="Hapus baris"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
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
