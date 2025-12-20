"use client";
import { useState, useEffect } from "react";
import AInput from "@/components/AInput";
import ADatePicker from "@/components/ADatePicker";
import ASelect from "@/components/ASelect";
import Button from "@/components/Button";
import { validateSertiForm } from "@/app/utils/validator";
import { User, Calendar, Users, Briefcase, Building2 } from "lucide-react";
import { useData } from "@/app/context/DataContext";

export default function TambahSerti({
  onClose = null,
  onSuccess = null,
  postSerti = null,
  editingSerti = null,
  isEditMode = false,
}) {
  const [formData, setFormData] = useState({
    penerima: "",
    unit: "",
    jabatan: "",
    tgl: "",
    team_id: "",
  });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [showErrors, setShowErrors] = useState(false);
  const { teams, getWaka } = useData();

  useEffect(() => {
    getWaka();
  }, [getWaka]);

  useEffect(() => {
    if (isEditMode && editingSerti) {
      setFormData({
        penerima: editingSerti.penerima || "",
        unit: editingSerti.unit || "",
        jabatan: editingSerti.jabatan || "",
        tgl: editingSerti.tgl || "",
        team_id: editingSerti.team_id || "",
      });
    } else if (!isEditMode) {
      setFormData({
        penerima: "",
        unit: "",
        jabatan: "",
        tgl: "",
        team_id: "",
      });
    }
  }, [isEditMode, editingSerti]);

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

  const handleCancel = () => {
    // Reset form saat cancel
    setFormData({
      penerima: "",
      unit: "",
      jabatan: "",
      tgl: "",
      team_id: "",
    });
    setShowErrors(false);
    setErrors({});
    if (onClose) onClose();
  };

  const validateForm = () => {
    const newErrors = validateSertiForm(formData);
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
      const submitData = {
        penerima: formData.penerima,
        unit: formData.unit,
        jabatan: formData.jabatan,
        tgl: formData.tgl,
        team_id: formData.team_id,
      };

      if (postSerti) {
        await postSerti(submitData);
      } else {
        throw new Error("postSerti function not provided");
      }

      // Reset form
      setFormData({
        penerima: "",
        unit: "",
        jabatan: "",
        tgl: "",
        team_id: "",
      });
      setShowErrors(false);
      setErrors({});

      if (onSuccess) onSuccess(submitData);
      if (onClose) onClose();
    } catch (error) {
      console.error("Error saving serti:", error);
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
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Grid Layout untuk form fields */}
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <div className="md:col-span-2">
            <ASelect
              id="team_id"
              icon={Users}
              name="team_id"
              label="Penyerah"
              placeholder="Pilih Penyerah"
              value={formData.team_id || ""}
              onChange={handleInputChange}
              error={showErrors ? errors.team_id : ""}
              required
              options={
                teams
                  ? teams.map((item) => ({
                      value: String(item.id),
                      label: item.nama || item.jabatan || `Team ${item.id}`,
                    }))
                  : []
              }
            />
          </div>
          {/* Tanggal - Full Width */}
          <div className="md:col-span-2">
            <ADatePicker
              id="tgl"
              icon={Calendar}
              name="tgl"
              label="Tanggal"
              placeholder="Pilih Tanggal"
              value={formData.tgl}
              onChange={handleInputChange}
              error={showErrors ? errors.tgl : ""}
              required
            />
          </div>

          {/* Nama Penerima - Full Width */}
          <div className="md:col-span-2">
            <AInput
              id="penerima"
              icon={User}
              name="penerima"
              label="Nama Penerima"
              placeholder="Masukkan Nama Penerima"
              value={formData.penerima}
              onChange={handleInputChange}
              error={showErrors ? errors.penerima : ""}
              required
            />
          </div>

          {/* Unit */}
          <div>
            <AInput
              id="unit"
              icon={Building2}
              name="unit"
              label="Unit"
              placeholder="Masukkan Unit"
              value={formData.unit}
              onChange={handleInputChange}
              error={showErrors ? errors.unit : ""}
              required
            />
          </div>

          {/* Jabatan */}
          <div>
            <AInput
              id="jabatan"
              icon={Briefcase}
              name="jabatan"
              label="Jabatan"
              placeholder="Masukkan Jabatan"
              value={formData.jabatan}
              onChange={handleInputChange}
              error={showErrors ? errors.jabatan : ""}
              required
            />
          </div>

          {/* Penyerah (Team) - Full Width */}
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
