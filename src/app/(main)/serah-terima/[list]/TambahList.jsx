"use client";
import { useState, useEffect } from "react";
import AInput from "@/components/AInput";
import ARadio from "@/components/ARadio";
import ASelect from "@/components/ASelect";
import ASearchableSelect from "@/components/ASearchableSelect";
import AFile from "@/components/AFile";
import Button from "@/components/Button";
import { useData } from "@/app/context/DataContext";
import { validateListForm } from "@/app/utils/validator";
import { Package, MapPin, Check, Image as ImageIcon } from "lucide-react";

export default function TambahList({
  dataDetail = null,
  onClose = null,
  onSuccess = null,
  postSertiData = null,
  editingItem = null,
  isEditMode = false,
  stbar_id
}) {
  const { 
    getRuanganFilter, 
    RuanganFilter, 
    ruanganFilter,
  } = useData();
  
  const [formData, setFormData] = useState({
    stbar_id: stbar_id || "",
    nabar: "",
    jml: "",
    kondisi: "",
    ruangan: "",
    foto: "",
  });
  
  const [selectedInventaris, setSelectedInventaris] = useState(null);
  const [selectedRuangan, setSelectedRuangan] = useState(null);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [showErrors, setShowErrors] = useState(false);

  useEffect(() => {
    getRuanganFilter();
  }, [getRuanganFilter]);

  // Update stbar_id saat prop berubah
  useEffect(() => {
    if (stbar_id || dataDetail?.id) {
      setFormData((prev) => ({
        ...prev,
        stbar_id: stbar_id || dataDetail?.id || prev.stbar_id,
      }));
    }
  }, [stbar_id, dataDetail?.id]);

  useEffect(() => {
    if (isEditMode && editingItem) {
      const toString = (value) => (value == null ? '' : String(value));
      
      setFormData({
        stbar_id: toString(editingItem.stbar_id || editingItem.inventaris_id || stbar_id || dataDetail?.id),
        nabar: toString(editingItem.nabar),
        jml: toString(editingItem.jml || editingItem.qty),
        kondisi: toString(editingItem.kondisi),
        ruangan: toString(editingItem.ruangan_id || editingItem.ruangan),
        foto: editingItem.foto || "",
      });
    } else if (!isEditMode) {
      setFormData({
        stbar_id: stbar_id || dataDetail?.id || "",
        nabar: "",
        jml: "",
        kondisi: "",
        ruangan: "",
        foto: "",
      });
      setSelectedInventaris(null);
      setSelectedRuangan(null);
    }
  }, [isEditMode, editingItem, stbar_id, dataDetail]);

  // Set selected inventaris when in edit mode


  // Set selected ruangan when in edit mode
  useEffect(() => {
    if (
      isEditMode &&
      (editingItem?.ruangan_id || editingItem?.ruangan) &&
      ruanganFilter &&
      ruanganFilter.length > 0
    ) {
      const selectedItem = ruanganFilter.find(
        (item) => String(item.id) === String(editingItem.ruangan_id || editingItem.ruangan)
      );
      if (selectedItem) {
        setSelectedRuangan(selectedItem);
        setFormData((prev) => ({
          ...prev,
          ruangan: selectedItem.id || editingItem.ruangan_id || editingItem.ruangan,
        }));
      }
    }
  }, [ruanganFilter, isEditMode, editingItem]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    if (showErrors && errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: "",
      }));
    }
  };



  const handleRuanganSelect = (selectedItem) => {
    setSelectedRuangan(selectedItem);
    setFormData((prev) => ({
      ...prev,
      ruangan: selectedItem?.id || "",
    }));

    if (showErrors && errors.ruangan) {
      setErrors((prev) => ({
        ...prev,
        ruangan: "",
      }));
    }
  };

  const handleFileChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

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
      foto: null,
    }));
  };

  const validateForm = () => {
    const newErrors = validateListForm(formData);
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

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
      
      // Jika ada foto (File object), gunakan FormData untuk multipart upload
      if (formData.foto instanceof File) {
        submitData = new FormData();
        submitData.append("stbar_id", formData.stbar_id || stbar_id || dataDetail?.id || "");
        submitData.append("nabar", formData.nabar || "");
        submitData.append("jml", String(parseInt(formData.jml) || formData.jml || ""));
        submitData.append("kondisi", formData.kondisi || "");
        submitData.append("ruangan", formData.ruangan || "");
        submitData.append("foto", formData.foto);
      } else {
        submitData = {
          stbar_id: formData.stbar_id || stbar_id || dataDetail?.id || "",
          nabar: formData.nabar,
          jml: parseInt(formData.jml) || formData.jml,
          kondisi: formData.kondisi,
          ruangan: formData.ruangan,
          foto: formData.foto || null,
        };
      }

      if (postSertiData) {
        await postSertiData(submitData);
      } else {
        throw new Error("postSertiData function not provided");
      }

      // Reset form
      setFormData({
        stbar_id: stbar_id || dataDetail?.id || "",
        nabar: "",
        jml: "",
        kondisi: "",
        ruangan: "",
        foto: "",
      });
      setSelectedInventaris(null);
      setSelectedRuangan(null);
      setShowErrors(false);
      setErrors({});

      if (onSuccess) onSuccess(submitData);
      if (onClose) onClose();
    } catch (error) {
      console.error("Error saving list:", error);
      const errorMessage =
        error.response?.data?.message ||
        error.message ||
        "Terjadi kesalahan saat menyimpan data";
      alert(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    setFormData({
      stbar_id: stbar_id || dataDetail?.id || "",
      nabar: "",
      jml: "",
      kondisi: "",
      ruangan: "",
      foto: "",
    });
    setSelectedInventaris(null);
    setSelectedRuangan(null);
    setShowErrors(false);
    setErrors({});
    if (onClose) onClose();
  };

  return (
    <div>
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Grid Layout untuk form fields */}
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          {/* Nama Barang - Full Width */}
          <div className="md:col-span-2">
            <AInput 
              id="nabar"
              icon={Package}
              name="nabar"
              label="Nama Barang"
              placeholder="Masukkan nama barang"
              value={formData.nabar}
              onChange={handleInputChange}
              error={showErrors ? errors.nabar : ""}
              required
            />
          </div>

          {/* Jumlah */}
          <div>
            <AInput
              id="jml"
              icon={Package}
              name="jml"
              label="Jumlah"
              placeholder="Masukkan jumlah"
              type="number"
              min="1"
              value={formData.jml}
              onChange={handleInputChange}
              error={showErrors ? errors.jml : ""}
              required
            />
          </div>

          {/* Ruangan */}
          <div>
            <ASearchableSelect
              id="ruangan"
              name="ruangan"
              label="Ruangan"
              placeholder="Pilih ruangan..."
              value={selectedRuangan?.id || formData.ruangan || ""}
              onChange={handleInputChange}
              onSelect={handleRuanganSelect}
              error={showErrors ? errors.ruangan : ""}
              required
              options={ruanganFilter || []}
              searchFunction={RuanganFilter}
              displayKey="ruangan"
              valueKey="ruangan"
              searchKey="ruangan"
              minSearchLength={2}
              noResultsText="Ruangan tidak ditemukan"
            />
          </div>

          {/* Kondisi - Full Width */}
          <div className="md:col-span-2">
            <ARadio
              id="kondisi"
              icon={Check}
              name="kondisi"
              label="Kondisi"
              value={formData.kondisi}
              onChange={handleInputChange}
              error={showErrors ? errors.kondisi : ""}
              required
              options={[
                { value: "baik", label: "Baik" },
                { value: "rusak ringan", label: "Rusak Ringan" },
                { value: "rusak berat", label: "Rusak Berat" },
              ]}
            />
          </div>

          {/* Foto - Full Width */}
          <div className="md:col-span-2">
            <AFile
              id="foto"
              name="foto"
              label="Foto Barang"
              accept="image/*"
              maxSize={5}
              value={formData.foto}
              onChange={handleFileChange}
              onRemove={handleFileRemove}
              error={showErrors ? errors.foto : ""}
              helperText="Format: JPG, PNG, JPEG. Maksimal 5MB"
            />
          </div>
        </div>

        {/* Button Actions */}
        <div className="flex justify-end gap-3 pt-2">
          <Button
            type="button"
            variant="outline"
            onClick={handleCancel}
            disabled={loading}
          >
            Batal
          </Button>
          <Button type="submit" disabled={loading}>
            {loading ? "Menyimpan..." : isEditMode ? "Update" : "Simpan"}
          </Button>
        </div>
      </form>
    </div>
  );
}