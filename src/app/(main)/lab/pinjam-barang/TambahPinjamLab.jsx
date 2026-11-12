"use client";
import { useCallback, useEffect, useState } from "react";
import AInput from "@/components/AInput";
import ASelect from "@/components/ASelect";
import ASearchableSelect from "@/components/ASearchableSelect";
import Button from "@/components/Button";
import { useAuth } from "@/app/context/AuthContext";
import { useData } from "@/app/context/DataContext";
import api from "@/app/utils/Api";
import dayjs from "dayjs";

export default function TambahPinjamLab({
  onClose,
  postData,
  editingItem,
  isEditMode,
}) {
  const { user } = useAuth();
  const { labs, getOpsi } = useData();
  const [form, setForm] = useState({
    nomor: "",
    lab_id: "",
    jenis: "bahan",
    ref_id: "",
    nama: "",
    kode: "",
    satuan: "",
    jml: "1",
    peminjam: "",
    tgl_pinjam: dayjs().format("YYYY-MM-DD"),
    tgl_rencana_kembali: "",
    tgl_kembali: "",
    status: "proses",
    kondisi_pinjam: "baik",
    kondisi_kembali: "",
    pic: user?.name || "",
    peruntukan: "",
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
        nomor: editingItem.nomor || "",
        lab_id: editingItem.lab_id ? String(editingItem.lab_id) : "",
        jenis: editingItem.jenis || "bahan",
        ref_id: editingItem.ref_id ? String(editingItem.ref_id) : "",
        nama: editingItem.nama || "",
        kode: editingItem.kode || "",
        satuan: editingItem.satuan || "",
        jml: String(editingItem.jml || 1),
        peminjam: editingItem.peminjam || "",
        tgl_pinjam: editingItem.tgl_pinjam
          ? String(editingItem.tgl_pinjam).slice(0, 10)
          : dayjs().format("YYYY-MM-DD"),
        tgl_rencana_kembali: editingItem.tgl_rencana_kembali
          ? String(editingItem.tgl_rencana_kembali).slice(0, 10)
          : "",
        tgl_kembali: editingItem.tgl_kembali
          ? String(editingItem.tgl_kembali).slice(0, 10)
          : "",
        status: editingItem.status || "proses",
        kondisi_pinjam: editingItem.kondisi_pinjam || "baik",
        kondisi_kembali: editingItem.kondisi_kembali || "",
        pic: editingItem.pic || user?.name || "",
        peruntukan: editingItem.peruntukan || "",
        keterangan: editingItem.keterangan || "",
      });
    }
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    const next = {};
    if (!form.lab_id) next.lab_id = "Lab wajib dipilih";
    if (!form.ref_id) next.ref_id = "Barang wajib dipilih";
    if (!form.peminjam.trim()) next.peminjam = "Peminjam wajib diisi";
    if (!form.tgl_pinjam) next.tgl_pinjam = "Tanggal pinjam wajib";
    if (!form.jml || Number(form.jml) <= 0) next.jml = "Jumlah harus > 0";
    if (form.status === "selesai" && !form.tgl_kembali) {
      next.tgl_kembali = "Tanggal kembali wajib jika status selesai";
    }
    setErrors(next);
    if (Object.keys(next).length) return;

    setLoading(true);
    try {
      await postData({
        ...form,
        jml: Number(form.jml) || 1,
      });
    } catch (error) {
      alert(error.response?.data?.message || error.message || "Gagal menyimpan");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <p className="rounded-md bg-sky-50 px-3 py-2 text-sm text-sky-800">
        Peminjaman ke <strong>luar lab</strong> (bisa berhari-hari). Bahan otomatis mengurangi
        stok sampai dikembalikan.
      </p>
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <ASelect
          id="lab_id"
          name="lab_id"
          label="Lab Asal"
          placeholder="Pilih laboratorium"
          value={form.lab_id}
          onChange={(e) => {
            handleChange(e);
            setForm((prev) => ({
              ...prev,
              lab_id: e.target.value,
              ref_id: "",
              nama: "",
              kode: "",
              satuan: "",
            }));
          }}
          error={errors.lab_id}
          required
          options={(labs || []).map((lab) => ({
            value: String(lab.id),
            label: lab.nama_lab,
          }))}
        />
        <ASelect
          id="jenis"
          name="jenis"
          label="Jenis"
          value={form.jenis}
          onChange={(e) =>
            setForm((prev) => ({
              ...prev,
              jenis: e.target.value,
              ref_id: "",
              nama: "",
              kode: "",
              satuan: "",
            }))
          }
          options={[
            { value: "bahan", label: "Bahan praktikum" },
            { value: "alat", label: "Alat (inventaris lab)" },
          ]}
        />
        <div className="md:col-span-2">
          <ASearchableSelect
            id="ref_id"
            name="ref_id"
            label={form.jenis === "alat" ? "Alat Lab" : "Bahan Praktikum"}
            placeholder={form.lab_id ? "Cari..." : "Pilih lab dulu"}
            value={form.ref_id}
            onChange={() => {}}
            onSelect={(opt) =>
              setForm((prev) => ({
                ...prev,
                ref_id: String(opt.id),
                nama: opt.nama || opt.nama_barang || "",
                kode: opt.kode || opt.kode_barang || "",
                satuan: opt.satuan || "",
              }))
            }
            options={
              form.ref_id ? [{ id: form.ref_id, nama: form.nama, kode: form.kode }] : []
            }
            searchFunction={form.jenis === "alat" ? searchAlat : searchBahan}
            displayKey="nama"
            valueKey="id"
            searchKey="nama"
            minSearchLength={0}
            error={errors.ref_id}
            required
          />
        </div>
        <AInput id="jml" name="jml" type="number" min="1" label="Jumlah" value={form.jml} onChange={handleChange} error={errors.jml} required />
        <AInput id="satuan" name="satuan" label="Satuan" value={form.satuan} onChange={handleChange} />
        <AInput id="peminjam" name="peminjam" label="Peminjam" value={form.peminjam} onChange={handleChange} error={errors.peminjam} required />
        <AInput id="pic" name="pic" label="Petugas" value={form.pic} onChange={handleChange} readOnly className="bg-gray-100" />
        <AInput id="tgl_pinjam" name="tgl_pinjam" type="date" label="Tanggal Pinjam" value={form.tgl_pinjam} onChange={handleChange} error={errors.tgl_pinjam} required />
        <AInput id="tgl_rencana_kembali" name="tgl_rencana_kembali" type="date" label="Rencana Kembali" value={form.tgl_rencana_kembali} onChange={handleChange} />
        <ASelect
          id="status"
          name="status"
          label="Status"
          value={form.status}
          onChange={handleChange}
          options={[
            { value: "proses", label: "Dipinjam (proses)" },
            { value: "selesai", label: "Dikembalikan (selesai)" },
          ]}
        />
        <ASelect
          id="kondisi_pinjam"
          name="kondisi_pinjam"
          label="Kondisi saat pinjam"
          value={form.kondisi_pinjam}
          onChange={handleChange}
          options={[
            { value: "baik", label: "Baik" },
            { value: "rusak ringan", label: "Rusak ringan" },
          ]}
        />
        {form.status === "selesai" && (
          <>
            <AInput id="tgl_kembali" name="tgl_kembali" type="date" label="Tanggal Kembali" value={form.tgl_kembali} onChange={handleChange} error={errors.tgl_kembali} required />
            <ASelect
              id="kondisi_kembali"
              name="kondisi_kembali"
              label="Kondisi kembali"
              value={form.kondisi_kembali}
              onChange={handleChange}
              options={[
                { value: "baik", label: "Baik" },
                { value: "rusak", label: "Rusak" },
                { value: "hilang", label: "Hilang" },
              ]}
            />
          </>
        )}
        <div className="md:col-span-2">
          <AInput id="peruntukan" name="peruntukan" label="Peruntukan" value={form.peruntukan} onChange={handleChange} placeholder="Keperluan peminjaman di luar lab" />
        </div>
        <div className="md:col-span-2">
          <AInput id="keterangan" name="keterangan" label="Keterangan" value={form.keterangan} onChange={handleChange} multiline rows={2} />
        </div>
        <AInput id="nomor" name="nomor" label="Nomor" placeholder="Kosongkan untuk otomatis" value={form.nomor} onChange={handleChange} />
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
