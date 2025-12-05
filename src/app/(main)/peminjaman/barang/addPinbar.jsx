'use client';
import { useState, useEffect } from "react";
import AInput from "@/components/AInput";
import ASelect from "@/components/ASelect";
import ADatePicker from "@/components/ADatePicker";
import AFile from "@/components/AFile";
import { useData } from "@/app/context/DataContext";
import { useAuth } from "@/app/context/AuthContext";
import ASearchableSelect from "@/components/ASearchableSelect";
import dayjs from "dayjs";
export default function AddPinbar({
  onClose = null,
  onSuccess = null,
  postPinbar = null,
  editingPinbar = null,
  isEditMode = false,
}) {
  const { user } = useAuth();
  const { getOpsi, getPibarFilter, pibarFilter, PibarFilter, getMemberFilter, memberFilter, MemberFilter } = useData();
  const [formData, setFormData] = useState({
    barpin_id: "",
    member_id: "",
    tgl_pinjam: "",
    tgl_kembali: "",
    status: "",
    pic: user?.name || "",
    peruntukan: "",
    kondisi_pinjam: "",
    kondisi_kembali: "",
    keterangan: "",
    foto: "",
    jml:0,
  });
  useEffect(() => {
    getOpsi();
    getPibarFilter();
    getMemberFilter();
  }, []);
  const [selectedBarpin, setSelectedBarpin] = useState(null);
  const [selectedMember, setSelectedMember] = useState(null);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [showErrors, setShowErrors] = useState(false);
  useEffect(() => {
    if (isEditMode && editingPinbar) {
      setFormData({
        barpin_id: editingPinbar.barpin_id || "",
        member_id: editingPinbar.member_id || "",
        tgl_pinjam: editingPinbar.tgl_pinjam || "",
        tgl_kembali: editingPinbar.tgl_kembali || "",
        status: editingPinbar.status || "",
        pic: user?.name || "",
        peruntukan: editingPinbar.peruntukan || "",
        kondisi_pinjam: editingPinbar.kondisi_pinjam || "",
        kondisi_kembali: editingPinbar.kondisi_kembali || "",
        keterangan: editingPinbar.keterangan || "",
        foto: editingPinbar.foto || "",
        jml: editingPinbar.jml || 0,
      });
    }
  }, [isEditMode, editingPinbar]);

  useEffect(() => {
    if (isEditMode && editingPinbar?.barpin_id && pibarFilter && pibarFilter.length > 0 && !selectedBarpin) {
      const selectedItem = pibarFilter.find(item => item.id == editingPinbar.barpin_id);
      if (selectedItem) {
        setSelectedBarpin(selectedItem);
      }
    }
  }, [pibarFilter, isEditMode, editingPinbar?.barpin_id, selectedBarpin]);

  useEffect(() => {
    if (isEditMode && editingPinbar?.member_id && memberFilter && memberFilter.length > 0 && !selectedMember) {
      const selectedItem = memberFilter.find(item => item.id == editingPinbar.member_id);
      if (selectedItem) {
        setSelectedMember(selectedItem);
      }
    }
  }, [memberFilter, isEditMode, editingPinbar?.member_id, selectedMember]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    // Clear error when user starts typing
    if (showErrors && errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: "",
      }));
    }
  };
  const handleBarpinSelect = (selectedItem) => {
    setSelectedBarpin(selectedItem);
    setFormData((prev) => ({
      ...prev,
      barpin_id: selectedItem?.id || "",
    }));
    // Clear error when user selects
    if (showErrors && errors.barpin_id) {
      setErrors((prev) => ({
        ...prev,
        barpin_id: "",
      }));
    }
  }
  const handleMemberSelect = (selectedItem) => {
    setSelectedMember(selectedItem);
    setFormData((prev) => ({
      ...prev,
      member_id: selectedItem?.id || "",
    }));
    // Clear error when user selects
    if (showErrors && errors.member_id) {
      setErrors((prev) => ({
        ...prev,
        member_id: "",
      }));
    }
  }
  const handleFileChange = (e) => {
    const { name, value } = e.target;
    // Value bisa berupa File object atau null dari AFile component
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
  }
  const validateForm = () => {
    const newErrors = {};
    if (!formData.barpin_id) {
      newErrors.barpin_id = "Nama barang wajib dipilih";
    }
    if (!formData.member_id) {
      newErrors.member_id = "Nama peminjam wajib dipilih";
    }
    if (!formData.tgl_pinjam) {
      newErrors.tgl_pinjam = "Tanggal Pinjam wajib diisi";
    }
   
    if (!formData.status) {
      newErrors.status = "Status wajib dipilih";
    }
    if (!formData.pic) {
      newErrors.pic = "PIC wajib diisi";
    }
    if (!formData.peruntukan) {
      newErrors.peruntukan = "Peruntukan wajib diisi";
    }
    if (!formData.kondisi_pinjam) {
      newErrors.kondisi_pinjam = "Kondisi Pinjam wajib dipilih";
    }
    // Validasi foto: bisa File object atau string URL (saat edit)
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }
  const handleFileRemove = () => {
    setFormData((prev) => ({
      ...prev,
      foto: null,
    }));
  }
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
      let submitData;
      const ensureString = (value) => (value == null ? "" : String(value));
      if(formData.foto instanceof File) {
        submitData = new FormData();
        submitData.append("barpin_id", ensureString(formData.barpin_id));
        submitData.append("member_id", ensureString(formData.member_id));
        submitData.append("tgl_pinjam", ensureString(formData.tgl_pinjam));
        submitData.append("tgl_kembali", ensureString(formData.tgl_kembali));
        submitData.append("status", ensureString(formData.status));
        submitData.append("pic", ensureString(formData.pic));
        submitData.append("peruntukan", ensureString(formData.peruntukan));
        submitData.append("kondisi_pinjam", ensureString(formData.kondisi_pinjam));
        submitData.append("kondisi_kembali", ensureString(formData.kondisi_kembali));
        submitData.append("keterangan", ensureString(formData.keterangan));
        submitData.append("foto", formData.foto);
        submitData.append("jml", ensureString(formData.jml));
      }else{
        submitData = {
          barpin_id: ensureString(formData.barpin_id),
          member_id: ensureString(formData.member_id),
          tgl_pinjam: ensureString(formData.tgl_pinjam),
          tgl_kembali: ensureString(formData.tgl_kembali),
          status: ensureString(formData.status),
          pic: ensureString(formData.pic),
          peruntukan: ensureString(formData.peruntukan),
          kondisi_pinjam: ensureString(formData.kondisi_pinjam),
          kondisi_kembali: ensureString(formData.kondisi_kembali),
          keterangan: ensureString(formData.keterangan),
          foto: formData.foto || null,
          jml: ensureString(formData.jml),
        }
      }
      if(postPinbar) {
        await postPinbar(submitData);
      } else {
        throw new Error("postPinbar function not provided");
      }
      setFormData({
        barpin_id: "",
        member_id: "",
        tgl_pinjam: "",
        tgl_kembali: "",
        status: "",
        pic: user?.name || "",
        peruntukan: "",
        kondisi_pinjam: "",
        kondisi_kembali: "",
        keterangan: "",
        foto: "",
        jml: 0,
      });
      setSelectedBarpin(null);
      setSelectedMember(null);
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
  }
  // Opsi untuk status dan kondisi
  const statusOptions = [
    { value: "proses", label: "Proses" },
    { value: "selesai", label: "Selesai" },
  ];

  const kondisiOptions = [
    { value: "baik", label: "Baik" },
    { value: "rusak ringan", label: "Rusak Ringan" },
    { value: "rusak berat", label: "Rusak Berat" },
  ];

  return (
    <div>
      <form onSubmit={handleSubmit} className="space-y-6" noValidate>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Kolom Kiri */}
          <div className="space-y-4">
            <ASearchableSelect
              id="barpin_id"
              name="barpin_id"
              label="NAMA BARANG"
              placeholder="Cari nama barang..."
              value={formData.barpin_id}
              onChange={handleInputChange}
              onSelect={handleBarpinSelect}
              error={showErrors ? errors.barpin_id : ""}
              required
              options={pibarFilter || []}
              searchFunction={PibarFilter}
              displayKey="nabar"
              valueKey="id"
              searchKey="nabar"
              minSearchLength={2}
              noResultsText="Barang tidak ditemukan"
            />

            <ASearchableSelect
              id="member_id"
              name="member_id"
              label="NAMA PEMINJAM"
              placeholder="Cari nama peminjam..."
              value={formData.member_id}
              onChange={handleInputChange}
              onSelect={handleMemberSelect}
              error={showErrors ? errors.member_id : ""}
              required
              options={memberFilter || []}
              searchFunction={MemberFilter}
              displayKey="name"
              valueKey="id"
              searchKey="name"
              minSearchLength={2}
              noResultsText="Member tidak ditemukan"
            />

            <ADatePicker
              id="tgl_pinjam"
              name="tgl_pinjam"
              label="TANGGAL PINJAM"
              placeholder="Pilih tanggal pinjam"
              value={formData.tgl_pinjam}
              onChange={handleInputChange}
              error={showErrors ? errors.tgl_pinjam : ""}
              required
              format="YYYY-MM-DD"
              displayFormat="DD/MM/YYYY"
            />

            <ADatePicker
              id="tgl_kembali"
              name="tgl_kembali"
              label="TANGGAL KEMBALI"
              placeholder="Pilih tanggal kembali"
              value={formData.tgl_kembali}
              onChange={handleInputChange}
              format="YYYY-MM-DD"
              displayFormat="DD/MM/YYYY"
              minDate={formData.tgl_pinjam || null}
            />

            <ASelect
              id="status"
              name="status"
              label="STATUS"
              placeholder="Pilih status"
              value={formData.status}
              onChange={handleInputChange}
              error={showErrors ? errors.status : ""}
              required
              options={statusOptions}
            />
          </div>

          {/* Kolom Kanan */}
          <div className="space-y-4">
            <AInput
              id="pic"
              name="pic"
              label="PIC (PENANGGUNG JAWAB)"
              placeholder="Masukkan nama PIC"
              value={formData.pic}
              onChange={handleInputChange}
              error={showErrors ? errors.pic : ""}
              required
              readOnly
              className="bg-gray-100 dark:bg-gray-700 text-slate-400"
            />

            <AInput
              id="peruntukan"
              name="peruntukan"
              label="PERUNTUKAN"
              placeholder="Masukkan peruntukan"
              value={formData.peruntukan}
              onChange={handleInputChange}
              error={showErrors ? errors.peruntukan : ""}
              required
            />

            <ASelect
              id="kondisi_pinjam"
              name="kondisi_pinjam"
              label="KONDISI PINJAM"
              placeholder="Pilih kondisi pinjam"
              value={formData.kondisi_pinjam}
              onChange={handleInputChange}
              error={showErrors ? errors.kondisi_pinjam : ""}
              required
              options={kondisiOptions}
            />

            <ASelect
              id="kondisi_kembali"
              name="kondisi_kembali"
              label="KONDISI KEMBALI"
              placeholder="Pilih kondisi kembali"
              value={formData.kondisi_kembali}
              onChange={handleInputChange}
              options={kondisiOptions}
            />

            <AInput
              id="jml"
              name="jml"
              label="JUMLAH"
              placeholder="Masukkan jumlah"
              type="number"
              min="1"
              value={formData.jml}
              onChange={handleInputChange}
              error={showErrors ? errors.jml : ""}
            />

            <div>
              <label htmlFor="keterangan" className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">
                KETERANGAN
              </label>
              <textarea
                id="keterangan"
                name="keterangan"
                placeholder="Masukkan keterangan"
                value={formData.keterangan}
                onChange={handleInputChange}
                rows={4}
                className={`
                  block w-full py-3 px-3
                  border-2 rounded-lg
                  transition-all duration-200
                  text-gray-900 dark:text-white
                  placeholder-gray-400 dark:placeholder-gray-500
                  bg-white dark:bg-gray-800
                `}
              />
            </div>

           
          </div>
         
        </div>
        <AFile
              id="foto"
              name="foto"
              label="FOTO"
              value={formData.foto}
              onChange={handleFileChange}
              onRemove={handleFileRemove}
              accept="image/*"
            />

        {/* Action Buttons */}
        <div className="flex justify-end gap-3 pt-6 border-t border-gray-200 dark:border-gray-700">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-lg transition-colors"
          >
            Batal
          </button>
          <button
            type="submit"
            disabled={loading}
            className="px-6 py-2 bg-red-600 hover:bg-red-700 disabled:bg-red-400 text-white rounded-lg transition-colors flex items-center gap-2"
          >
            {loading && (
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
            )}
            {isEditMode ? 'Update' : 'Simpan'}
          </button>
        </div>
      </form>
    </div>
  )
}