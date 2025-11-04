"use client";
import { useState, useEffect } from "react";
import AInput from "@/components/AInput";
import AFile from "@/components/AFile";
import ARadio from "@/components/ARadio";
import ASelect from "@/components/ASelect";
import { User, Briefcase } from "lucide-react";
import Button from "@/components/Button";
import { ValidatorAtkForm } from "./ValidatorAtkForm";
import { useAuth } from "@/app/context/AuthContext";
import { useData } from "@/app/context/DataContext";

export default function TambahAtk({
  onClose = null,
  onSuccess = null,
  postAtk, // Fix: nama yang benar
  editingAtk = null, // Fix: nama yang benar
  isEditMode = false,
}) {
  const { user } = useAuth();
  const { satuan,getOpsi } = useData();
  useEffect(() => {
    getOpsi();
  }, [getOpsi]);
  const [formData, setFormData] = useState({
    kode: "",
    nabar: "",
    spec: "",
    satuan: "",
    stok_awal: "",
    pic: user?.name || "",
    foto: "",
    kategori_atk: "",
  });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [showErrors, setShowErrors] = useState(false); // Kontrol kapan error ditampilkan
  const kategoriAtkOptions = [
    { value: "Baterai", label: "Baterai" },
    { value: "Kertas", label: "Kertas" },
    { value: "Hekter", label: "Hekter" },
    { value: "Gunting", label: "Gunting" },
    { value: "Klip", label: "Klip" },
    { value: "Pelubang", label: "Pelubang" },
    { value: "Sticky", label: "Sticky" },
    { value: "Tinta", label: "Tinta" },
    { value: "Map", label: "Map" },
    { value: "Amplop", label: "Amplop" },
    { value: "Isolasi", label: "Isolasi" },
    { value: "Lem", label: "Lem" },
    { value: "Lainnya", label: "Lainya" },
    { value: "Buku", label: "Buku" },
    { value: "Tulis", label: "Tulis" },
  ]
  useEffect(() => {
    if (isEditMode && editingAtk) {
      const toString = (value) => value == null ? "" : String(value)
      
      setFormData({
        kode: toString(editingAtk.kode),
        nabar: toString(editingAtk.nabar),
        spec: toString(editingAtk.spec),
        satuan: editingAtk.satuan?.satuan || toString(editingAtk.satuan),
        stok_awal: toString(editingAtk.stok_awal),
        pic: toString(editingAtk.pic),
        kategori_atk: toString(editingAtk.kategori_atk),
        foto: toString(editingAtk.foto),
      });
    }
  }, [isEditMode, editingAtk]);
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
  // Handle file remove
  const handleFileRemove = () => {
    setFormData((prev) => ({
      ...prev,
      foto: null,
    }));
  };
  const validateForm = () => {
    const newErrors = ValidatorAtkForm(formData);
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
      const ensureString = (value) => value == null ? "" : String(value)

      if (formData.foto instanceof File) {
        submitData = new FormData();
        submitData.append("kode", ensureString(formData.kode));
        submitData.append("nabar", ensureString(formData.nabar));
        submitData.append("spec", ensureString(formData.spec));
        submitData.append("satuan", ensureString(formData.satuan));
        submitData.append("stok_awal", ensureString(formData.stok_awal));
        submitData.append("pic", ensureString(formData.pic));
        submitData.append("kategori_atk", ensureString(formData.kategori_atk));
        submitData.append("foto", formData.foto);
      } else {
        submitData = {
          kode: ensureString(formData.kode),
          nabar: ensureString(formData.nabar),
          spec: ensureString(formData.spec),
          satuan: ensureString(formData.satuan),
          stok_awal: ensureString(formData.stok_awal),
          kategori_atk: ensureString(formData.kategori_atk),
          pic: ensureString(formData.pic),
          foto: formData.foto || null,
        };
      }
      if (postAtk) {
        await postAtk(submitData);
      } else {
        throw new Error("postAtk function not provided");
      }

      setFormData({
        kode: "",
        nabar: "",
        spec: "",
        satuan: "",
        stok_awal: "",
        pic: "",
        foto: "",
        kategori_atk: "",
      });

      setShowErrors(false);
      setErrors({});

      if (onSuccess) onSuccess(submitData);
      if (onClose) onClose();
    } catch (error) {
      if (error.response?.data?.status === 'error' && error.response?.data?.field) {
        const fieldError = error.response.data.field;
        const errorMessage = error.response.data.message;
        
        setErrors(prev => ({
          ...prev,
          [fieldError]: errorMessage
        }));
        setShowErrors(true);
      } else {
        const errorMessage =
          error.response?.data?.message ||
          error.message ||
          "Terjadi kesalahan saat menyimpan data";
        alert(errorMessage);
      }
    } finally {
      setLoading(false);
    }
  };
  return (
    <div>
      <form onSubmit={handleSubmit} className="space-y-6" noValidate>
        {/* Grid Layout untuk Form Fields */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Kolom Kiri */}
          <div className="space-y-4">
        {/* Kode Barang */}
        <AInput
          id="kode"
          icon={User}
          name="kode"
          label="KODE BARANG"
          placeholder="Masukkan kode barang (contoh: ATK001, PEN-001)"
          value={formData.kode}
          onChange={handleInputChange}
          error={showErrors ? errors.kode : ''}
          required
        />

            {/* Nama Barang */}
            <AInput
              id="nabar"
              icon={Briefcase}
              name="nabar"
              label="NAMA BARANG"
              placeholder="Masukkan nama barang"
              value={formData.nabar}
              onChange={handleInputChange}
              error={showErrors ? errors.nabar : ''}
              required
            />

            {/* Spesifikasi */}
            <AInput
              id="spec"
              name="spec"
              label="SPESIFIKASI"
              placeholder="Masukkan spesifikasi barang (opsional)"
              value={formData.spec}
              onChange={handleInputChange}
              error={showErrors ? errors.spec : ''}
            />
            <ASelect
              id="kategori_atk"
              name="kategori_atk"
              label="KATEGORI ATK"
              placeholder="Pilih kategori ATK"
              value={formData.kategori_atk}
              onChange={handleInputChange}
              error={showErrors ? errors.kategori_atk : ''}
              options={kategoriAtkOptions}
            />
          </div>

          {/* Kolom Kanan */}
          <div className="space-y-4">
            {/* Satuan */}
            <ASelect
              id="satuan"
              name="satuan"
              label="SATUAN"
              placeholder="Pilih satuan"
              value={formData.satuan}
              onChange={handleInputChange}
              error={showErrors ? errors.satuan : ''}
              required
              options={satuan.map(item => ({
                value: item.satuan,
                label: item.satuan,
              }))}
            />

        {/* Stok Awal */}
        <AInput
          id="stok_awal"
          name="stok_awal"
          label="STOK AWAL"
          placeholder="Masukkan stok awal (bilangan bulat)"
          type="number"
          min="0"
          step="1"
          value={formData.stok_awal}
          onChange={handleInputChange}
          error={showErrors ? errors.stok_awal : ''}
          required
        />

            {/* PIC */}
            <AInput
              id="pic"
              name="pic"
              label="PIC (PENANGGUNG JAWAB)"
              placeholder="Masukkan nama PIC"
              value={formData.pic}
              onChange={handleInputChange}
              readOnly
              className="bg-gray-100 dark:bg-gray-700 text-slate-400"
              
            />
          </div>
        </div>

        {/* Foto - Full Width */}
        <div className="w-full">
          <AFile
            id="foto"
            name="foto"
            label="FOTO BARANG"
            accept="image/*"
            value={formData.foto}
            onChange={handleFileChange}
            onRemove={handleFileRemove}
            error={showErrors ? errors.foto : ''}
          />
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
            disabled={loading}
          >
            Batal
          </Button>
          
          <Button
            type="submit"
            variant="primary"
            loading={loading}
            disabled={loading}
          >
            {isEditMode ? 'Update ATK' : 'Simpan ATK'}
          </Button>
        </div>
      </form>
    </div>
  );
}
