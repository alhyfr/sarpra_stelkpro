"use client";
import { useState, useEffect } from "react";
import AInput from "@/components/AInput";
import ASelect from "@/components/ASelect";
import Button from "@/components/Button";
import { validateMemberForm } from "@/app/utils/validator";
import {
    User,
    Hash,
    Briefcase,
    Tag,
    Activity,
} from "lucide-react";

export default function TambahMember({
    onClose = null,
    onSuccess = null,
    postMember = null,
    editingMember = null,
    isEditMode = false,
}) {
    const [formData, setFormData] = useState({
        mid: "",
        name: "",
        unit: "",
        kategori: "",
        keterangan: "",
        status: "on",
    });
    const [loading, setLoading] = useState(false);
    const [errors, setErrors] = useState({});
    const [showErrors, setShowErrors] = useState(false);

    useEffect(() => {
        if (isEditMode && editingMember) {
            setFormData({
                mid: editingMember.mid || "",
                name: editingMember.name || "",
                unit: editingMember.unit || "",
                kategori: editingMember.kategori || "",
                keterangan: editingMember.keterangan || "",
                status: editingMember.status || "on",
            });
        } else if (!isEditMode) {
            // Reset form when not in edit mode
            setFormData({
                mid: "",
                name: "",
                unit: "",
                kategori: "",
                keterangan: "",
                status: "on",
            });
        }
    }, [isEditMode, editingMember]);

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
        const newErrors = validateMemberForm(formData);
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
            let submitData = {
                mid: formData.mid,
                name: formData.name,
                unit: formData.unit,
                kategori: formData.kategori,
                status: formData.status,
                keterangan: formData.keterangan,
            };

            if (postMember) {
                await postMember(submitData);
            } else {
                throw new Error("postMember function not provided");
            }
            // Reset form
            setFormData({
                mid: "",
                name: "",
                unit: "",
                kategori: "",
                keterangan: "",
                status: "on",
            });

            // Reset error state
            setShowErrors(false);
            setErrors({});

            if (onSuccess) onSuccess(submitData);
            if (onClose) onClose();
        } catch (error) {
            console.error("Error saving member:", error);
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
            <form onSubmit={handleSubmit} className="space-y-4">
                {/* Grid Layout untuk form fields */}
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                    {/* Kode Member */}
                    <div className="md:col-span-2">
                        <AInput
                            id="mid"
                            icon={Hash}
                            name="mid"
                            label="Kode Member"
                            placeholder="Masukkan Kode Member"
                            value={formData.mid}
                            onChange={handleInputChange}
                            error={showErrors ? errors.mid : ""}
                            required
                        />
                    </div>

                    {/* Nama Member */}
                    <div className="md:col-span-2">
                        <AInput
                            id="name"
                            icon={User}
                            name="name"
                            label="Nama Member"
                            placeholder="Masukkan Nama Member"
                            value={formData.name}
                            onChange={handleInputChange}
                            error={showErrors ? errors.name : ""}
                            required
                        />
                    </div>

                    {/* Unit */}
                    <div className="md:col-span-2">
                        <AInput
                            id="unit"
                            icon={Briefcase}
                            name="unit"
                            label="Unit"
                            placeholder="Masukkan Unit Member"
                            value={formData.unit}
                            onChange={handleInputChange}
                            error={showErrors ? errors.unit : ""}
                            required
                        />
                    </div>

                    {/* Keterangan */}
                    <div className="md:col-span-2">
                        <AInput
                            id="keterangan"
                            icon={Tag}
                            name="keterangan"
                            label="Keterangan"
                            placeholder="Masukkan Keterangan Member"
                            value={formData.keterangan}
                            onChange={handleInputChange}
                        />
                    </div>

                    {/* Kategori */}
                    <div>
                        <ASelect
                            id="kategori"
                            icon={Tag}
                            name="kategori"
                            label="Kategori"
                            placeholder="Pilih Kategori"
                            value={formData.kategori}
                            onChange={handleInputChange}
                            error={showErrors ? errors.kategori : ""}
                            required
                            options={[
                                { value: "gupeg", label: "GURU & PEGAWAI" },
                                { value: "siswa", label: "SISWA" },
                            ]}
                        />
                    </div>

                    {/* Status */}
                    <div>
                        <ASelect
                            id="status"
                            icon={Activity}
                            name="status"
                            label="Status"
                            placeholder="Pilih Status"
                            value={formData.status}
                            onChange={handleInputChange}
                            error={showErrors ? errors.status : ""}
                            required
                            options={[
                                { value: "on", label: "Aktif" },
                                { value: "off", label: "Banned" },
                            ]}
                        />
                    </div>
                </div>

                {/* Button Actions */}
                <div className="flex justify-end gap-3 pt-2">
                    <Button
                        type="button"
                        variant="outline"
                        onClick={onClose}
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