"use client";
import { useState, useEffect } from "react";
import AInput from "@/components/AInput";
import ARadio from "@/components/ARadio";
import ASelect from "@/components/ASelect";
import Button from "@/components/Button";
import { useData } from "@/app/context/DataContext";
import ASearchableSelect from "@/components/ASearchableSelect";
import { validateInventarisLabForm } from "@/app/utils/validator";
export default function TambahInv({
  labs,
  postInventarisLab,
  editingInventarisLab,
  isEditMode,
  onClose,
  onSuccess,
}) {
  const { inventarisFilter, getInventarisFilter, InventarisFilter } = useData();
  useEffect(() => {
    getInventarisFilter();
  }, [getInventarisFilter]);
  const [formData, setFormData] = useState({
    lab_id: "",
    inventaris_id: "",
    kondisi: "",
    ket: "",
  });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [showErrors, setShowErrors] = useState(false);
  const [selectedInventaris, setSelectedInventaris] = useState(null);
  useEffect(() => {
    if (isEditMode && editingInventarisLab) {
      setFormData({
        lab_id: editingInventarisLab.lab_id || editingInventarisLab.lab?.id || "",
        inventaris_id: editingInventarisLab.inventaris_id || editingInventarisLab.inventaris?.id || "",
        kondisi: editingInventarisLab.kondisi || "",
        ket: editingInventarisLab.ket || "",
      });
    } else if (!isEditMode) {
      setFormData({
        lab_id: "",
        inventaris_id: "",
        kondisi: "",
        ket: "",
      });
      setSelectedInventaris(null);
    }
  }, [isEditMode, editingInventarisLab]);
  // Set selected inventaris from inventarisFilter when in edit mode
  useEffect(() => {
    if (
      isEditMode &&
      editingInventarisLab?.inventaris_id &&
      inventarisFilter &&
      inventarisFilter.length > 0
    ) {
      const inventarisId = editingInventarisLab.inventaris_id || editingInventarisLab.inventaris?.id;
      
      if (inventarisId) {
        const selectedItem = inventarisFilter.find(
          (item) =>
            String(item.id) === String(inventarisId) ||
            String(item.inventaris_id) === String(inventarisId)
        );
        
        if (selectedItem) {
          const currentId = selectedInventaris?.id || selectedInventaris?.inventaris_id;
          const newId = selectedItem.id || selectedItem.inventaris_id;
          
          if (String(currentId) !== String(newId)) {
            setSelectedInventaris(selectedItem);
            setFormData((prev) => ({
              ...prev,
              inventaris_id: selectedItem.id || selectedItem.inventaris_id || inventarisId,
            }));
          }
        }
      }
    }
  }, [inventarisFilter, isEditMode, editingInventarisLab?.inventaris_id]);

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

  const handleInventarisSelect = (selectedItem) => {
    setSelectedInventaris(selectedItem);
    setFormData((prev) => ({
      ...prev,
      inventaris_id: selectedItem?.id || selectedItem?.inventaris_id || "",
    }));

    // Clear error when user selects
    if (showErrors && errors.inventaris_id) {
      setErrors((prev) => ({
        ...prev,
        inventaris_id: "",
      }));
    }
  };
  const validateForm = () => {
    const newErrors = validateInventarisLabForm(formData);
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
      // Jika ada foto (File object), gunakan FormData untuk multipart upload
      let submitData;
      submitData = {
        lab_id: formData.lab_id,
        inventaris_id: formData.inventaris_id,
        kondisi: formData.kondisi,
        ket: formData.ket,
      };
      if (postInventarisLab) {
        await postInventarisLab(submitData);
      } else {
        throw new Error("postInventarisLab function not provided");
      }
      // Reset form
      setFormData({
        lab_id: "",
        inventaris_id: "",
        kondisi: "",
        ket: "",
      });

      // Reset error state
      setShowErrors(false);
      setErrors({});
      setSelectedInventaris(null);

      if (onSuccess) onSuccess(submitData);
      if (onClose) onClose();
    } catch (error) {
      console.error("Error saving inventaris lab:", error);
      // Show error via alert instead of form error
      const errorMessage =
        error.response?.data?.message ||
        error.message ||
        "Terjadi kesalahan saat menyimpan data";
      alert(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
        <form onSubmit={handleSubmit}>
            <ASelect
                id="lab_id"
                name="lab_id"
                label="Lab"
                value={formData.lab_id}
                onChange={handleInputChange}
                error={showErrors ? errors.lab_id : ""}
                required
                options={labs.map((item) => ({
                    value: item.id,
                    label: item.nama_lab,
                }))}
            />
            <ASearchableSelect
                id="inventaris_id"
                name="inventaris_id"
                label="Inventaris"
                placeholder="Cari inventaris..."
                value={selectedInventaris?.id || selectedInventaris?.inventaris_id || formData.inventaris_id || ""}
                onChange={handleInputChange}
                onSelect={handleInventarisSelect}
                error={showErrors ? errors.inventaris_id : ""}
                required
                options={inventarisFilter || []}
                searchFunction={InventarisFilter}
                displayKey="desc"
                valueKey="id"
                searchKey="desc"
                minSearchLength={2}
                noResultsText="Inventaris tidak ditemukan"
            />
            <ARadio
                id="kondisi"
                name="kondisi"
                label="Kondisi"
                value={formData.kondisi}
                onChange={handleInputChange}
                error={showErrors ? errors.kondisi : ""}
                required
                options={[
                    { value: "baik", label: "Baik" },
                    { value: "rusak", label: "Rusak" },
                ]}
            />
            <AInput
                id="ket"
                name="ket"
                label="Keterangan"
                value={formData.ket}
                onChange={handleInputChange}
                multiline={true}
            />
           <div className="flex justify-end gap-2 mt-6">
           <Button type="submit" loading={loading} >
                Simpan
            </Button>
           </div>
        </form>
    </div>
  );
}
