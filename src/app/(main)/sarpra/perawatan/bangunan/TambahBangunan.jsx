'use client'
import { useState, useEffect } from 'react'
import AInput from "@/components/AInput";
import ADatePicker from "@/components/ADatePicker";
import ASelect from "@/components/ASelect";
import Button from "@/components/Button";
import { X, Check } from 'lucide-react';
import { useAuth } from '@/app/context/AuthContext';
import { validateBangunanForm } from '@/app/utils/validator';
export default function TambahBangunan({
    onClose,
    onSuccess,
    postBangunan,
    editingBangunan,
    isEditMode,
}) {
    const { user } = useAuth()
    const [form, setForm] = useState({
        nama_bagian: '',
        jenis_kerusakan: '',
        tindakan: '',
        tgl_masuk: '',
        tgl_selesai: '',
        ket: '',
        pic: user?.name || '',
        status: '',
        desc: '',
    })
    const [loading, setLoading] = useState(false);
    const [errors, setErrors] = useState({});
    const [selectedInventaris, setSelectedInventaris] = useState(null);
    useEffect(() => {
        if (isEditMode && editingBangunan) {
            setForm({
                nama_bagian: editingBangunan.nama_bagian,
                jenis_kerusakan: editingBangunan.jenis_kerusakan,
                tindakan: editingBangunan.tindakan,
                tgl_masuk: editingBangunan.tgl_masuk,
                tgl_selesai: editingBangunan.tgl_selesai,
                ket: editingBangunan.ket,
                pic: editingBangunan.pic,
                status: editingBangunan.status,
                desc: editingBangunan.desc,
            })
        }
    }, [isEditMode, editingBangunan])
    const statusOptions = [
        { value: 'proses', label: 'Proses' },
        { value: 'selesai', label: 'Selesai' },
        { value: 'pending', label: 'Pending' },
    ];
    const handleInputChange = (e) => {
        const { name, value } = e.target;
        // Update nilai form sesuai dengan field yang berubah
        setForm((prev) => ({
            ...prev,
            [name]: value,
        }));
        // Hapus error untuk field ini jika ada
        // Memberikan feedback langsung bahwa user sedang memperbaiki input
        if (errors[name]) {
            setErrors((prev) => ({
                ...prev,
                [name]: "",
            }));
        }
    };
    const validateForm = () => {
        const validationErrors = validateBangunanForm(form);
        if (Object.keys(validationErrors).length > 0) {
            setErrors(validationErrors);
            return false;
        }
        return true;
    };
    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!validateForm()) return;
        setLoading(true);
        try {
            const response = await postBangunan(form);
            if (response) {
                onSuccess(response);
            }
        } catch (error) {
            console.error('Error submitting form:', error);
        } finally {
            setLoading(false);
        }
    };
    return (
        <div>
            <form onSubmit={handleSubmit}>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <AInput
                        label="Nama Bangunan"
                        name="nama_bagian"
                        value={form.nama_bagian}
                        onChange={handleInputChange}
                        error={errors.nama_bagian}
                        className="md:col-span-2"
                    />
                    <AInput
                        label="Jenis Kerusakan"
                        name="jenis_kerusakan"
                        value={form.jenis_kerusakan}
                        onChange={handleInputChange}
                        error={errors.jenis_kerusakan}
                    />
                    <AInput
                        label="Tindakan"
                        name="tindakan"
                        value={form.tindakan}
                        onChange={handleInputChange}
                        error={errors.tindakan}
                        multiline
                        rows={2}
                    />
                    <ADatePicker
                        label="Tanggal Masuk"
                        name="tgl_masuk"
                        value={form.tgl_masuk}
                        onChange={handleInputChange}
                        error={errors.tgl_masuk}
                    />
                    <ADatePicker
                        label="Tanggal Selesai"
                        name="tgl_selesai"
                        value={form.tgl_selesai}
                        onChange={handleInputChange}
                    />
                    <AInput
                        label="PIC"
                        name="pic"
                        value={form.pic}
                        onChange={handleInputChange}
                        error={errors.pic}
                        disabled
                    />
                    <ASelect
                        label="Status"
                        name="status"
                        value={form.status}
                        onChange={handleInputChange}
                        error={errors.status}
                        options={statusOptions}
                    />
                    <AInput
                        label="Ket"
                        name="ket"
                        value={form.ket}
                        onChange={handleInputChange}
                        error={errors.ket}
                        className="md:col-span-2"
                        multiline
                        rows={2}
                    />
                    <AInput
                        label="Deskripsi"
                        name="desc"
                        value={form.desc}
                        onChange={handleInputChange}
                        className="md:col-span-2"
                        multiline
                        rows={2}
                    />
                </div>
                <div className="flex justify-end gap-2 mt-6">
                    <Button
                        variant="outline"
                        onClick={onClose}
                        disabled={loading}
                    >
                        <X className="w-4 h-4" />
                        Batal
                    </Button>
                    <Button
                        type="submit"
                        disabled={loading}
                    >
                        <Check className="w-4 h-4" />
                        {isEditMode ? 'Update' : 'Simpan'}
                    </Button>
                </div>
            </form>

        </div>
    )
}