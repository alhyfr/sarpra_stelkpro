"use client";
import { useState, useEffect } from "react";
import AInput from "@/components/AInput";
import ASearchableSelect from "@/components/ASearchableSelect";
import ASelect from "@/components/ASelect";
import { useData } from "@/app/context/DataContext";
import { useAuth } from "@/app/context/AuthContext";
import AFile from "@/components/AFile";

export default function TambahAtkMasuk({
  onClose = null,
  onSuccess = null,
  postAtkMasuk, // Fix: nama yang benar
  editingAtkMasuk = null, // Fix: nama yang benar
  isEditMode = false,
}) {
  const { user } = useAuth();
  const { dana, getOpsi, getAtkFilter, atkFilter, AtkFilter } = useData();
  useEffect(() => {
    getOpsi();
    getAtkFilter();
  }, []); // Remove getOpsi dependency to prevent infinite loop
  const [formData, setFormData] = useState({
    id: "",
    atk_id: "",
    jml: "",
    tgl: "",
    pic: user?.name || "",
    sumber: "",
    nota: "",
  });
  const [selectedAtk, setSelectedAtk] = useState(null);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [showErrors, setShowErrors] = useState(false);
  // Separate useEffect for form data initialization
  useEffect(() => {
    if (isEditMode && editingAtkMasuk) {
      const toString = (value) => (value == null ? "" : String(value));

      setFormData({
        id: toString(editingAtkMasuk.id),
        atk_id: toString(editingAtkMasuk.atk_id),
        jml: toString(editingAtkMasuk.jml),
        tgl: toString(editingAtkMasuk.tgl),
        sumber: toString(editingAtkMasuk.sumber),
        pic: toString(editingAtkMasuk.pic),
        nota: toString(editingAtkMasuk.nota),
      });
    }
  }, [isEditMode, editingAtkMasuk]);

  // Separate useEffect for setting selected ATK - only run when atkFilter changes and we have data
  useEffect(() => {
    if (isEditMode && editingAtkMasuk?.atk_id && atkFilter && atkFilter.length > 0 && !selectedAtk) {
      const selectedItem = atkFilter.find(item => item.id == editingAtkMasuk.atk_id);
      if (selectedItem) {
        setSelectedAtk(selectedItem);
      }
    }
  }, [atkFilter, isEditMode, editingAtkMasuk?.atk_id, selectedAtk]);
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

  // Handler untuk searchable select ATK
  const handleAtkSelect = (selectedItem) => {
    setSelectedAtk(selectedItem);
    setFormData((prev) => ({
      ...prev,
      atk_id: selectedItem.id,
    }));

    // Clear error when user selects
    if (showErrors && errors.atk_id) {
      setErrors((prev) => ({
        ...prev,
        atk_id: "",
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
  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.atk_id) {
      newErrors.atk_id = 'Nama barang wajib dipilih';
    }
    if (!formData.jml) {
      newErrors.jml = 'Jumlah wajib diisi';
    } else if (isNaN(formData.jml) || parseFloat(formData.jml) <= 0) {
      newErrors.jml = 'Jumlah harus berupa angka positif';
    }
    if (!formData.tgl) {
      newErrors.tgl = 'Tanggal wajib diisi';
    }
    if (!formData.sumber) {
      newErrors.sumber = 'Sumber wajib diisi';
    }
    if (!formData.pic) {
      newErrors.pic = 'PIC wajib diisi';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  // Handle file remove
  const handleFileRemove = () => {
    setFormData((prev) => ({
      ...prev,
      nota: null,
    }));
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
      const ensureString = (value) => (value == null ? "" : String(value));

      if (formData.nota instanceof File) {
        submitData = new FormData();
        submitData.append("atk_id", ensureString(formData.atk_id));
        submitData.append("jml", ensureString(formData.jml));
        submitData.append("tgl", ensureString(formData.tgl));
        submitData.append("sumber", ensureString(formData.sumber));
        submitData.append("pic", ensureString(formData.pic));
        submitData.append("nota", formData.nota);
      } else {
        submitData = {
          atk_id: ensureString(formData.atk_id),
          jml: ensureString(formData.jml),
          tgl: ensureString(formData.tgl),
          sumber: ensureString(formData.sumber),
          pic: ensureString(formData.pic),
          nota: formData.nota || null,
        };
      }
      if (postAtkMasuk) {
        await postAtkMasuk(submitData);
      } else {
        throw new Error("postAtkMasuk function not provided");
      }

      setFormData({
        atk_id: "",
        jml: "",
        tgl: "",
        sumber: "",
        pic: user?.name || "",
        nota: "",
      });
      setSelectedAtk(null);

      setShowErrors(false);
      setErrors({});

      if (onSuccess) onSuccess(submitData);
      if (onClose) onClose();
    } catch (error) {
      if (
        error.response?.data?.status === "error" &&
        error.response?.data?.field
      ) {
        const fieldError = error.response.data.field;
        const errorMessage = error.response.data.message;

        setErrors((prev) => ({
          ...prev,
          [fieldError]: errorMessage,
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
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="space-y-4">
            <ASearchableSelect
              id="atk_id"
              name="atk_id"
              label="NAMA BARANG"
              placeholder="Cari nama barang..."
              value={formData.atk_id}
              onChange={handleInputChange}
              onSelect={handleAtkSelect}
              error={showErrors ? errors.atk_id : ""}
              required
              options={atkFilter || []}
              searchFunction={AtkFilter}
              displayKey="nabar"
              valueKey="id"
              searchKey="nabar"
              minSearchLength={2}
              noResultsText="Barang tidak ditemukan"
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
              required
            />
            
            <AInput
              id="tgl"
              name="tgl"
              label="TANGGAL"
              placeholder="Pilih tanggal"
              type="date"
              value={formData.tgl}
              onChange={handleInputChange}
              error={showErrors ? errors.tgl : ""}
              required
            />
          </div>
          
          <div className="space-y-4">
           <ASelect
              id="sumber"
              name="sumber"
              label="SUMBER"
              placeholder="Pilih sumber"
              value={formData.sumber}
              onChange={handleInputChange}
              error={showErrors ? errors.sumber : ""}
              required
              options={dana.map(item => ({
                value: item.sumber,
                label: item.sumber,
              }))}
            />
            
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
            
            <AFile
              id="nota"
              name="nota"
              label="NOTA"
              value={formData.nota}
              onChange={handleFileChange}
              onRemove={handleFileRemove}
              error={showErrors ? errors.nota : ""}
            />
          </div>
        </div>
        
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
  );
}
