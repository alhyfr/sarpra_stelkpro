'use client'
import { useState, useEffect } from "react";
import AInput from "@/components/AInput";
import ARadio from "@/components/ARadio";
import Button from "@/components/Button";
import { validateSumberForm } from "@/app/utils/validator";
import { Tag } from "lucide-react";
export default function TambahSumber({
    onClose = null,
    onSuccess = null,
    postSumber = null,
    editingSumber = null,
    isEditMode = false,
}) {
    const [formData, setFormData] = useState({
        sumber: "",
        status: "",
    });
    const [loading, setLoading] = useState(false);
    const [errors, setErrors] = useState({});
    const [showErrors, setShowErrors] = useState(false);
    useEffect(() => {
        if (isEditMode && editingSumber) {
            setFormData({
                sumber: editingSumber.sumber || "",
                status: editingSumber.status || "",
            });
        }
    }, [isEditMode, editingSumber]);
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
      const validateForm = () => {
        const newErrors = validateSumberForm(formData);
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
            sumber: formData.sumber,
            status: formData.status,
          };
          // Fix: gunakan postSatuan bukan postGedung
          if (postSumber) {
            await postSumber(submitData);
          } else {
            throw new Error("postSumber function not provided");
          }
          // Reset form
          setFormData({
            sumber: "",
            status: "",
          });
    
          // Reset error state
          setShowErrors(false);
          setErrors({});
    
          if (onSuccess) onSuccess(submitData);
          if (onClose) onClose();
        } catch (error) {
          console.error("Error saving sumber:", error);
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
                <AInput
                    id="sumber"
                    icon={Tag}
                    name="sumber"
                    label="Sumber"
                    placeholder="Masukkan Sumber"
                    value={formData.sumber}
                    onChange={handleInputChange}
                    error={showErrors ? errors.sumber : ""}
                />
                <ARadio
                    id="status"
                    name="status"
                    label="Status"
                    value={formData.status}
                    onChange={handleInputChange}
                    error={showErrors ? errors.status : ""}
                    options={[
                        { value: "on", label: "ON" },
                        { value: "off", label: "OFF" },
                    ]}
                />
                <div className="flex justify-end gap-2 mt-6">
                    <Button type="submit" disabled={loading}>
                        {loading ? "Menyimpan..." : "Simpan"}
                    </Button>
                </div>
            </form>
        </div>
    )
}