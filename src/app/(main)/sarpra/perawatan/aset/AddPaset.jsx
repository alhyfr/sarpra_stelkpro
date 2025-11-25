'use client'
import { useEffect, useState } from 'react'
import { useAuth } from '@/app/context/AuthContext'
import { useData } from '@/app/context/DataContext'
import validate from 'validate.js'
import { validatePerawtanAsetForm } from '@/app/utils/validator'
import ASearchableSelect from "@/components/ASearchableSelect";
import AInput from "@/components/AInput";
import ADatePicker from "@/components/ADatePicker";
import ASelect from "@/components/ASelect";
import Button from "@/components/Button";
import { X, Check } from 'lucide-react';


export default function AddPaset({
    onClose,
    onSuccess,
    postPaset,
    editingPaset,
    isEditMode,
}) {
    const { user } = useAuth()
    const { inventarisFilter, getInventarisFilter, InventarisFilter } = useData()

    // ============================================
    // STATE MANAGEMENT
    // ============================================
    const [form, setForm] = useState({
        inventaris_id: '',
        jenis_kerusakan: '',
        tindakan: '',
        tgl_masuk: '',
        tgl_selesai: '',
        ket: '',
        pic: user?.name || '',
        status: '',
        desc: ''
    })

    // State untuk loading indicator saat submit form
    const [loading, setLoading] = useState(false);

    // State untuk menyimpan error validasi dari setiap field
    const [errors, setErrors] = useState({});

    // State untuk menyimpan inventaris yang dipilih (untuk ditampilkan di select)
    const [selectedInventaris, setSelectedInventaris] = useState(null);

    // ============================================
    // EFFECTS
    // ============================================

    useEffect(() => {
        getInventarisFilter()
    }, [getInventarisFilter])

    const statusOptions = [
        { value: 'proses', label: 'Proses' },
        { value: 'selesai', label: 'Selesai' },
        { value: 'terjadwal', label: 'Terjadwal' },
    ]

    /**
     * Effect untuk mengisi form dengan data yang sedang diedit
     * Hanya berjalan jika dalam mode edit dan ada data editingPaset
     */
    useEffect(() => {
        if (isEditMode && editingPaset) {
            setForm({
                inventaris_id: editingPaset.inventaris_id,
                jenis_kerusakan: editingPaset.jenis_kerusakan,
                tindakan: editingPaset.tindakan,
                tgl_masuk: editingPaset.tgl_masuk,
                tgl_selesai: editingPaset.tgl_selesai,
                ket: editingPaset.ket,
                pic: editingPaset.pic,
                status: editingPaset.status,
                desc: editingPaset.desc
            })
        }
    }, [isEditMode, editingPaset])

    /**
     * Effect untuk set inventaris yang dipilih saat mode edit
     * Mencari inventaris dari list berdasarkan ID yang ada di editingPaset
     */
    useEffect(() => {
        if (isEditMode && editingPaset) {
            setSelectedInventaris(inventarisFilter.find(item => item.id === editingPaset.inventaris_id))
        }
    }, [isEditMode, editingPaset, inventarisFilter])

    // ============================================
    // EVENT HANDLERS
    // ============================================

    /**
     * Handler untuk perubahan input text biasa
     * Mengupdate state form dan menghapus error jika user mulai mengetik
     * 
     * @param {Event} e - Event dari input element
     */
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

    /**
     * Handler untuk pemilihan inventaris dari searchable select
     * Mengupdate state form dengan ID inventaris yang dipilih
     * 
     * @param {Object} inventaris - Object inventaris yang dipilih
     */
    const handleInventarisSelect = (inventaris) => {
        setSelectedInventaris(inventaris);
        setForm((prev) => ({
            ...prev,
            inventaris_id: inventaris.id,
        }));

        // Hapus error inventaris_id jika ada
        if (errors.inventaris_id) {
            setErrors((prev) => ({
                ...prev,
                inventaris_id: "",
            }));
        }
    };

    /**
     * Fungsi untuk validasi form menggunakan validate.js
     * Menggunakan constraints dari validatePerawtanAsetForm
     * 
     * @returns {boolean} - true jika valid, false jika ada error
     */
    const validateForm = () => {
        const validationErrors = validatePerawtanAsetForm(form);

        // Jika ada error, simpan ke state dan return false
        if (Object.keys(validationErrors).length > 0) {
            setErrors(validationErrors);
            return false;
        }

        // Jika tidak ada error, return true
        return true;
    };

    /**
     * Handler untuk submit form
     * Melakukan validasi, kemudian mengirim data ke API
     * 
     * @param {Event} e - Event dari form submit
     */
    const handleSubmit = async (e) => {
        e.preventDefault(); // Mencegah reload halaman

        // Validasi form terlebih dahulu
        if (!validateForm()) return;

        // Set loading state untuk disable button dan tampilkan loading indicator
        setLoading(true);

        try {
            // Panggil API untuk menyimpan data
            const response = await postPaset(form);

            // Jika berhasil, panggil callback onSuccess
            if (response) {
                onSuccess(response);
            }
        } catch (error) {
            // Log error jika terjadi kesalahan
            console.error('Error submitting form:', error);
        } finally {
            // Set loading ke false setelah selesai (baik sukses maupun error)
            setLoading(false);
        }
    };

    // ============================================
    // RENDER
    // ============================================

    return (
        <div>
            {/* Form dengan noValidate untuk disable browser validation (kita pakai custom validation) */}
            <form onSubmit={handleSubmit} className="space-y-6" noValidate>

                {/* ============================================ */}
                {/* 1. PILIH INVENTARIS/ASET */}
                {/* ============================================ */}
                <div className="field">
                    <label htmlFor="inventaris_id" className="block mb-2 font-semibold">
                        Inventaris/Aset <span className="text-red-500">*</span>
                    </label>
                    <ASearchableSelect
                        id="inventaris_id"
                        name="inventaris_id"
                        value={form.inventaris_id}
                        onChange={handleInputChange}
                        onSelect={handleInventarisSelect}
                        options={inventarisFilter || []}
                        searchFunction={InventarisFilter}
                        displayKey="desc"
                        valueKey="id"
                        searchKey="desc"
                        placeholder="Cari inventaris yang diperbaiki..."
                        error={errors.inventaris_id}
                        disabled={loading}
                        minSearchLength={2}
                        noResultsText="Inventaris tidak ditemukan"
                    />
                </div>

                {/* ============================================ */}
                {/* 2. JENIS KERUSAKAN */}
                {/* ============================================ */}
                <div className="field">
                    <label htmlFor="jenis_kerusakan" className="block mb-2 font-semibold">
                        Jenis Kerusakan
                    </label>
                    <AInput
                        id="jenis_kerusakan"
                        name="jenis_kerusakan"
                        value={form.jenis_kerusakan}
                        onChange={handleInputChange}
                        placeholder="Contoh: Layar pecah, mesin rusak, dll"
                        disabled={loading}
                        multiline // Textarea untuk deskripsi panjang
                        rows={3}
                    />
                </div>

                {/* ============================================ */}
                {/* 3. TINDAKAN PERBAIKAN */}
                {/* ============================================ */}
                <div className="field">
                    <label htmlFor="tindakan" className="block mb-2 font-semibold">
                        Tindakan Perbaikan
                    </label>
                    <AInput
                        id="tindakan"
                        name="tindakan"
                        value={form.tindakan}
                        onChange={handleInputChange}
                        placeholder="Contoh: Ganti layar, servis mesin, dll"
                        disabled={loading}
                        multiline
                        rows={3}
                    />

                </div>

                {/* ============================================ */}
                {/* 4. TANGGAL MASUK & SELESAI (Grid 2 Kolom) */}
                {/* ============================================ */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Tanggal Masuk */}
                    <div className="field">
                        <label htmlFor="tgl_masuk" className="block mb-2 font-semibold">
                            Tanggal Masuk
                        </label>
                        <ADatePicker
                            id="tgl_masuk"
                            name="tgl_masuk"
                            value={form.tgl_masuk}
                            onChange={handleInputChange}
                            error={errors.tgl_masuk}
                            disabled={loading}
                        />
                        {errors.tgl_masuk && (
                            <small className="text-red-500">{errors.tgl_masuk}</small>
                        )}
                    </div>

                    {/* Tanggal Selesai */}
                    <div className="field">
                        <label htmlFor="tgl_selesai" className="block mb-2 font-semibold">
                            Tanggal Selesai
                        </label>
                        <ADatePicker
                            id="tgl_selesai"
                            name="tgl_selesai"
                            value={form.tgl_selesai}
                            onChange={handleInputChange}
                            error={errors.tgl_selesai}
                            disabled={loading}
                        />
                        {errors.tgl_selesai && (
                            <small className="text-red-500">{errors.tgl_selesai}</small>
                        )}
                    </div>
                </div>

                {/* ============================================ */}
                {/* 5. KETERANGAN TAMBAHAN */}
                {/* ============================================ */}
                <div className="field">
                    <label htmlFor="ket" className="block mb-2 font-semibold">
                        Keterangan
                    </label>
                    <AInput
                        id="ket"
                        name="ket"
                        value={form.ket}
                        onChange={handleInputChange}
                        placeholder="Keterangan tambahan (opsional)"
                        disabled={loading}
                        multiline
                        rows={3}
                    />
                </div>
                <div className="field">
                    <label htmlFor="status" className="block mb-2 font-semibold">
                        Status
                    </label>
                    <ASelect
                        id="status"
                        name="status"
                        value={form.status}
                        onChange={handleInputChange}
                        options={statusOptions}
                        error={errors.status}
                        disabled={loading}
                    />
                    {errors.status && (
                        <small className="text-red-500">{errors.status}</small>
                    )}
                </div>

                {/* ============================================ */}
                {/* 6. PENANGGUNG JAWAB (PIC) */}
                {/* ============================================ */}
                <div className="field">
                    <label htmlFor="pic" className="block mb-2 font-semibold">
                        Penanggung Jawab (PIC)
                    </label>
                    <AInput
                        id="pic"
                        name="pic"
                        value={form.pic}
                        onChange={handleInputChange}
                        placeholder="Nama penanggung jawab"
                        error={errors.pic}
                        disabled={true}

                    />
                    {errors.pic && (
                        <small className="text-red-500">{errors.pic}</small>
                    )}
                </div>
                <div className="field">
                    <label htmlFor="desc" className="block mb-2 font-semibold">
                        Deskripsi
                    </label>
                    <AInput
                        id="desc"
                        name="desc"
                        value={form.desc}
                        onChange={handleInputChange}
                        placeholder="Deskripsi"
                        disabled={loading}
                        multiline
                        rows={2}
                    />

                </div>

                {/* ============================================ */}
                {/* TOMBOL AKSI */}
                {/* ============================================ */}
                <div className="flex justify-end gap-2 pt-4">
                    {/* Tombol Batal - menutup dialog tanpa menyimpan */}
                    <Button
                        type="button"
                        variant="secondary"
                        icon={X}
                        onClick={onClose}
                        disabled={loading}
                    >
                        Batal
                    </Button>

                    {/* Tombol Simpan - submit form */}
                    <Button
                        type="submit"
                        variant="success"
                        icon={Check}
                        loading={loading}
                        disabled={loading}
                    >
                        {isEditMode ? "Update" : "Simpan"}
                    </Button>
                </div>
            </form>
        </div>
    )
}