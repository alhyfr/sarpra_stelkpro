"use client";
import { useCallback, useEffect, useState } from "react";
import AInput from "@/components/AInput";
import ASearchableSelect from "@/components/ASearchableSelect";
import Button from "@/components/Button";
import { useAuth } from "@/app/context/AuthContext";
import api from "@/app/utils/Api";
import dayjs from "dayjs";

export default function TambahBarangRusak({
  onClose,
  postData,
  editingItem,
  isEditMode,
}) {
  const { user } = useAuth();
  const [form, setForm] = useState({
    id_barang_lab: "",
    nama_barang: "",
    tgl_keluar: dayjs().format("YYYY-MM-DD"),
    jml: "",
    pengambil: "",
    petugas: user?.name || "",
    keterangan: "",
  });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (isEditMode && editingItem) {
      setForm({
        id_barang_lab: String(editingItem.id_barang_lab || ""),
        nama_barang: editingItem.nama_barang || "",
        tgl_keluar: editingItem.tgl_keluar
          ? String(editingItem.tgl_keluar).slice(0, 10)
          : dayjs().format("YYYY-MM-DD"),
        jml: String(editingItem.jml || ""),
        pengambil: editingItem.pengambil || "",
        petugas: editingItem.petugas || user?.name || "",
        keterangan: editingItem.keterangan || "",
      });
    }
  }, [isEditMode, editingItem, user?.name]);

  const searchBahan = useCallback(async (search = "") => {
    const res = await api.get(
      `/sp/opsi/barang-lab-filter?search=${encodeURIComponent(search)}`
    );
    return res.data?.barangLab || res.data?.data || [];
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const next = {};
    if (!form.id_barang_lab) next.id_barang_lab = "Bahan wajib dipilih";
    if (!form.tgl_keluar) next.tgl_keluar = "Tanggal wajib";
    if (!form.jml || Number(form.jml) <= 0) next.jml = "Jumlah harus > 0";
    setErrors(next);
    if (Object.keys(next).length) return;

    setLoading(true);
    try {
      await postData({
        id_barang_lab: form.id_barang_lab,
        tgl_keluar: form.tgl_keluar,
        jml: Number(form.jml),
        jenis: "rusak",
        status: "selesai",
        pengambil: form.pengambil,
        petugas: form.petugas,
        keterangan: form.keterangan,
      });
    } catch (error) {
      alert(error.response?.data?.message || error.message || "Gagal menyimpan");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <p className="rounded-md bg-amber-50 px-3 py-2 text-sm text-amber-800">
        Data ini tersimpan sebagai <strong>Bahan Keluar</strong> dengan jenis{" "}
        <strong>rusak</strong> dan langsung mengurangi stok.
      </p>
      <ASearchableSelect
        id="id_barang_lab"
        name="id_barang_lab"
        label="Nama Bahan"
        placeholder="Cari bahan..."
        value={form.id_barang_lab}
        onChange={() => {}}
        onSelect={(opt) =>
          setForm((prev) => ({
            ...prev,
            id_barang_lab: String(opt.id),
            nama_barang: opt.nama_barang || opt.nama || "",
          }))
        }
        options={
          form.id_barang_lab
            ? [{ id: form.id_barang_lab, nama_barang: form.nama_barang }]
            : []
        }
        searchFunction={searchBahan}
        displayKey="nama_barang"
        valueKey="id"
        searchKey="nama_barang"
        minSearchLength={0}
        error={errors.id_barang_lab}
        required
      />
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <AInput
          id="tgl_keluar"
          name="tgl_keluar"
          type="date"
          label="Tanggal Rusak"
          value={form.tgl_keluar}
          onChange={handleChange}
          error={errors.tgl_keluar}
          required
        />
        <AInput
          id="jml"
          name="jml"
          type="number"
          min="1"
          label="Jumlah Rusak"
          value={form.jml}
          onChange={handleChange}
          error={errors.jml}
          required
        />
        <AInput
          id="pengambil"
          name="pengambil"
          label="Pelapor"
          value={form.pengambil}
          onChange={handleChange}
          placeholder="Nama pelapor (opsional)"
        />
        <AInput
          id="petugas"
          name="petugas"
          label="Petugas"
          value={form.petugas}
          onChange={handleChange}
          readOnly
          className="bg-gray-100"
        />
        <div className="md:col-span-2">
          <AInput
            id="keterangan"
            name="keterangan"
            label="Keterangan / Penyebab"
            value={form.keterangan}
            onChange={handleChange}
            multiline
            rows={2}
            placeholder="Mis. pecah saat praktikum, kadaluarsa, dll."
          />
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
