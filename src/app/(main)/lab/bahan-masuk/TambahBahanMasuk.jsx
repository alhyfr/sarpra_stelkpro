'use client'
import { useState, useEffect, useCallback } from 'react'
import AInput from '@/components/AInput'
import AFile from '@/components/AFile'
import { User, NotebookText, CalendarDays, Package, Gauge } from 'lucide-react'
import Button from '@/components/Button'
import { validateBahanMasukForm } from '@/app/utils/validator'
import ASearchableSelect from '@/components/ASearchableSelect'
import { useAuth } from '@/app/context/AuthContext'
import api from '@/app/utils/Api'

export default function TambahBahanMasuk({
    onClose = null,
    onSuccess = null,
    postDataBahanMasuk,
    editingBahanMasuk,
    isEditMode = false,
}) {
    const { user } = useAuth()
    const [formData, setFormData] = useState({
        id_barang_lab: '',
        nama_barang: '',   // untuk display di searchable select
        tgl_masuk: '',
        jml: '',
        petugas: user.name,
        keterangan: '',
        foto: '',
    })

    const [loading, setLoading] = useState(false)
    const [errors, setErrors] = useState({})
    const [showErrors, setShowErrors] = useState(false)
    const [selectedBahan, setSelectedBahan] = useState(null)

    // Initialize form data when editing
    useEffect(() => {
        if (isEditMode && editingBahanMasuk) {
            setFormData({
                id_barang_lab: editingBahanMasuk.id_barang_lab || editingBahanMasuk.barang_lab_id || '',
                nama_barang: editingBahanMasuk.nama_barang || '',
                tgl_masuk: editingBahanMasuk.tgl_masuk ? editingBahanMasuk.tgl_masuk.substring(0, 10) : '',
                jml: editingBahanMasuk.jml || editingBahanMasuk.jumlah || '',
                petugas: editingBahanMasuk.petugas || '',
                keterangan: editingBahanMasuk.keterangan || editingBahanMasuk.ket || '',
                foto: editingBahanMasuk.foto || '',
            })
            // Set selected bahan for searchable select display
            if (editingBahanMasuk.nama_barang) {
                setSelectedBahan({
                    id: editingBahanMasuk.id_barang_lab || editingBahanMasuk.barang_lab_id || '',
                    nama_barang: editingBahanMasuk.nama_barang || '',
                    kode_barang: editingBahanMasuk.kode_barang || '',
                })
            }
        }
    }, [isEditMode, editingBahanMasuk])

    // Search function for bahan lab
    const bahanFilter = useCallback(async (search = '') => {
        try {
            const response = await api.get('/sp/opsi/barang-lab-filter?search=' + search)
            return response.data.barangLab || response.data.data || []
        } catch (error) {
            console.error('Error fetching bahan filter:', error)
            return []
        }
    }, [])

    // Handle text input changes
    const handleInputChange = (e) => {
        const { name, value } = e.target
        setFormData(prev => ({
            ...prev,
            [name]: value
        }))
        if (showErrors && errors[name]) {
            setErrors(prev => ({ ...prev, [name]: '' }))
        }
    }

    // Handle file input change
    const handleFileChange = (e) => {
        const { name, value } = e.target
        setFormData(prev => ({ ...prev, [name]: value }))
        if (showErrors && errors[name]) {
            setErrors(prev => ({ ...prev, [name]: '' }))
        }
    }

    const handleFileRemove = () => {
        setFormData(prev => ({ ...prev, foto: null }))
    }

    // Handle bahan selection from searchable select
    const handleBahanSelect = (option) => {
        setFormData(prev => ({
            ...prev,
            id_barang_lab: option.id,
            nama_barang: option.nama_barang,
        }))
        setSelectedBahan(option)
        if (showErrors && errors.id_barang_lab) {
            setErrors(prev => ({ ...prev, id_barang_lab: '' }))
        }
    }

    // Validate form using validator
    const validateForm = () => {
        const dataToValidate = {
            id_barang_lab: formData.id_barang_lab,
            tgl_masuk: formData.tgl_masuk,
            jml: formData.jml,
            petugas: formData.petugas,
            keterangan: formData.keterangan,
        }
        // Foto hanya wajib saat tambah baru
        if (!isEditMode) {
            dataToValidate.foto = formData.foto
        }
        const newErrors = validateBahanMasukForm(dataToValidate)
        setErrors(newErrors)
        return Object.keys(newErrors).length === 0
    }

    // Handle form submission
    const handleSubmit = async (e) => {
        e.preventDefault()
        setShowErrors(true)

        if (!validateForm()) {
            return
        }

        setLoading(true)
        setErrors({})
        setShowErrors(false)

        try {
            let submitData

            if (formData.foto instanceof File) {
                submitData = new FormData()
                submitData.append('id_barang_lab', formData.id_barang_lab)
                submitData.append('tgl_masuk', formData.tgl_masuk)
                submitData.append('jml', formData.jml)
                submitData.append('petugas', formData.petugas)
                submitData.append('keterangan', formData.keterangan)
                submitData.append('foto', formData.foto)
            } else {
                let fotoValue = formData.foto || null
                if (isEditMode && editingBahanMasuk && (!fotoValue || fotoValue === '')) {
                    fotoValue = editingBahanMasuk.foto || null
                }
                submitData = {
                    id_barang_lab: formData.id_barang_lab,
                    tgl_masuk: formData.tgl_masuk,
                    jml: formData.jml,
                    petugas: formData.petugas,
                    keterangan: formData.keterangan,
                    foto: fotoValue,
                }
            }

            if (postDataBahanMasuk) {
                await postDataBahanMasuk(submitData)
            } else {
                throw new Error('postDataBahanMasuk function not provided')
            }

            // Reset form
            setFormData({
                id_barang_lab: '',
                nama_barang: '',
                tgl_masuk: '',
                jml: '',
                petugas: '',
                keterangan: '',
                foto: '',
            })
            setSelectedBahan(null)
            setShowErrors(false)
            setErrors({})

            if (onSuccess) onSuccess(submitData)
            if (onClose) onClose()

        } catch (error) {
            console.error('Error saving bahan masuk:', error)
            if (error.response?.data?.status === 'error' && error.response?.data?.field) {
                const fieldError = error.response.data.field
                const errorMessage = error.response.data.message
                setErrors(prev => ({ ...prev, [fieldError]: errorMessage }))
                setShowErrors(true)
            } else {
                const errorMessage =
                    error.response?.data?.message ||
                    error.message ||
                    'Terjadi kesalahan saat menyimpan data'
                alert(errorMessage)
            }
        } finally {
            setLoading(false)
        }
    }

    return (
        <div>
            <form onSubmit={handleSubmit}>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

                    {/* Pilih Bahan - Searchable Select (full width) */}
                    <div className="md:col-span-2">
                        <ASearchableSelect
                            id="id_barang_lab"
                            name="id_barang_lab"
                            label="Nama Bahan"
                            placeholder="Cari nama bahan..."
                            value={formData.id_barang_lab}
                            onSelect={handleBahanSelect}
                            error={showErrors ? errors.id_barang_lab : ''}
                            required
                            searchFunction={bahanFilter}
                            displayKey="nama_barang"
                            valueKey="id"
                            searchKey="nama_barang"
                            minSearchLength={0}
                            noResultsText="Bahan tidak ditemukan"
                            options={selectedBahan ? [selectedBahan] : []}
                        />
                    </div>

                    {/* Tanggal Masuk */}
                    <AInput
                        id="tgl_masuk"
                        icon={CalendarDays}
                        name="tgl_masuk"
                        label="Tanggal Masuk"
                        type="date"
                        value={formData.tgl_masuk}
                        onChange={handleInputChange}
                        error={showErrors ? errors.tgl_masuk : ''}
                        required
                    />

                    {/* Jumlah */}
                    <AInput
                        id="jml"
                        icon={Gauge}
                        name="jml"
                        label="Jumlah"
                        placeholder="Masukkan jumlah"
                        type="number"
                        min="1"
                        value={formData.jml}
                        onChange={handleInputChange}
                        error={showErrors ? errors.jml : ''}
                        required
                    />

                    {/* Petugas */}
                    <AInput
                        id="petugas"
                        icon={User}
                        name="petugas"
                        label="Petugas"
                        placeholder="Masukkan nama petugas"
                        value={formData.petugas}
                        onChange={handleInputChange}
                        error={showErrors ? errors.petugas : ''}
                        disabled
                        required
                    />

                    {/* Keterangan */}
                    <AInput
                        id="keterangan"
                        icon={NotebookText}
                        name="keterangan"
                        label="Keterangan"
                        placeholder="Masukkan keterangan"
                        value={formData.keterangan}
                        onChange={handleInputChange}
                    />

                    {/* Foto - Full Width */}
                    <div className="md:col-span-2">
                        <AFile
                            id="foto"
                            name="foto"
                            label="Foto"
                            placeholder="Pilih Foto"
                            value={formData.foto}
                            onChange={handleFileChange}
                            onRemove={handleFileRemove}
                            accept="image/*"
                            maxSize={2}
                            helperText="Format: JPG, PNG, JPEG. Maksimal 2MB"
                        />
                    </div>

                    {/* Info wajib */}
                    <div className="md:col-span-2">
                        <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 text-blue-700 dark:text-blue-300 px-4 py-3 rounded-lg">
                            <p className="text-xs">
                                <span className="text-red-600 font-bold">*</span> = Wajib diisi
                            </p>
                        </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="md:col-span-2 flex justify-end gap-3 pt-2">
                        {onClose && (
                            <Button
                                type="button"
                                onClick={onClose}
                                variant="secondary"
                                disabled={loading}
                            >
                                Batal
                            </Button>
                        )}
                        <Button
                            type="submit"
                            loading={loading}
                            disabled={loading}
                        >
                            {isEditMode ? 'Update Data' : 'Simpan Data'}
                        </Button>
                    </div>
                </div>
            </form>
        </div>
    )
}