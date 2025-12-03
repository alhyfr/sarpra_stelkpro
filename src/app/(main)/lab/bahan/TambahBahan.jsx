'use client'
import { useState, useEffect } from 'react'
import AInput from '@/components/AInput'
import AFile from '@/components/AFile'
import ARadio from '@/components/ARadio'
import ASelect from '@/components/ASelect'
import { User, NotebookText, Briefcase, Gauge, MapPin } from 'lucide-react'
import Button from '@/components/Button'
import { validateBahanForm } from '@/app/utils/validator'
export default function TambahBahan({
    onClose = null,
    onSuccess = null,
    postDataBahan,
    editingBahan,
    isEditMode = false,
    labs = []
}) {
    const [formData, setFormData] = useState({
        kode_barang: '',
        nama_barang: '',
        kategori: '',
        satuan:'',
        stok_awal:'',
        stok_minimum:'',
        lokasi:'',
        kondisi:'',
        ket:'',
        gambar: '',
    })
    const [loading, setLoading] = useState(false)
    const [errors, setErrors] = useState({})
    const [showErrors, setShowErrors] = useState(false)

    useEffect(() => {
        if (isEditMode && editingBahan) {
            setFormData({
                kode_barang: editingBahan.kode_barang || '',
                nama_barang: editingBahan.nama_barang || '',
                kategori: editingBahan.kategori || '',
                satuan: editingBahan.satuan || '',
                stok_awal: editingBahan.stok_awal || '',
                stok_minimum: editingBahan.stok_minimum || '',
                lokasi: editingBahan.lokasi || '',
                kondisi: editingBahan.kondisi || '',
                ket: editingBahan.ket || '',
                gambar: editingBahan.gambar || '',  // URL foto dari server
            })
        }
    }, [isEditMode, editingBahan])
    const handleInputChange = (e) => {
        const { name, value } = e.target
        setFormData(prev => ({
            ...prev,
            [name]: value
        }))
        // Clear error when user starts typing (jika showErrors aktif)
        if (showErrors && errors[name]) {
            setErrors(prev => ({
                ...prev,
                [name]: ''
            }))
        }
    }
    const handleFileChange = (e) => {
        const { name, value } = e.target
        setFormData(prev => ({
            ...prev,
            [name]: value
        }))

        // Clear error for file field
        if (showErrors && errors[name]) {
            setErrors(prev => ({
                ...prev,
                [name]: ''
            }))
        }
    }
    const handleFileRemove = () => {
        setFormData(prev => ({
            ...prev,
            gambar: null
        }))
    }
    const validateForm = () => {
        const newErrors = validateBahanForm(formData)
        setErrors(newErrors)
        return Object.keys(newErrors).length === 0
    }
    const handleSubmit = async (e) => {
        e.preventDefault()

        // Set showErrors ke true untuk menampilkan error
        setShowErrors(true)

        if (!validateForm()) {
            return
        }

        setLoading(true)
        setErrors({})
        setShowErrors(false) // Reset setelah validasi sukses

        try {
            let submitData

            if (formData.gambar instanceof File) {
                submitData = new FormData()
                submitData.append('kode_barang', formData.kode_barang)
                submitData.append('nama_barang', formData.nama_barang)
                submitData.append('kategori', formData.kategori)
                submitData.append('ket', formData.ket)
                submitData.append('satuan', formData.satuan)
                submitData.append('stok_awal', formData.stok_awal)
                submitData.append('stok_minimum', formData.stok_minimum)
                submitData.append('lokasi', formData.lokasi)
                submitData.append('kondisi', formData.kondisi)
                submitData.append('gambar', formData.gambar)
            } else {
                // Jika mode edit dan gambar tidak diubah (null atau kosong), gunakan gambar yang sudah ada
                let gambarValue = formData.gambar || null
                if (isEditMode && editingBahan && (!gambarValue || gambarValue === '')) {
                    gambarValue = editingBahan.gambar || null
                }
                
                submitData = {
                    kode_barang: formData.kode_barang,
                    nama_barang: formData.nama_barang,
                    kategori: formData.kategori,
                    satuan: formData.satuan,
                    stok_awal: formData.stok_awal,
                    stok_minimum: formData.stok_minimum,
                    lokasi: formData.lokasi,
                    kondisi: formData.kondisi,
                    ket: formData.ket,
                    gambar: gambarValue,
                }
            }

            // Fix: gunakan postGedung bukan postUser
            if (postDataBahan) {
                await postDataBahan(submitData)
            } else {
                throw new Error('postDataBahan function not provided')
            }

            // Reset form
            setFormData({
                kode_barang: '',
                nama_barang: '',
                kategori: '',
                satuan: '',
                stok_awal: '',
                stok_minimum: '',
                lokasi: '',
                kondisi: '',
                ket: '',
                gambar: '',
            })

            // Reset error state
            setShowErrors(false)
            setErrors({})

            if (onSuccess) onSuccess(submitData)
            if (onClose) onClose()

        } catch (error) {
            console.error('Error saving bahan:', error)
            // Show error via alert instead of form error
            const errorMessage = error.response?.data?.message || error.message || 'Terjadi kesalahan saat menyimpan data'
            alert(errorMessage)
        } finally {
            setLoading(false)
        }
    }
    const kategoriOptions = [
        { value: 'alat laboratorium', label: 'Alat Laboratorium' },
        { value: 'bahan kimia', label: 'Bahan Kimia' },
        { value: 'peralatan praktikum', label: 'Peralatan Praktikum' },
        { value: 'instrumen praktikum', label: 'Instrumen Praktikum' },
        {value: 'lainnya', label: 'Lainnya'},
    ]
    const satuanOptions = [
        { value: 'pcs', label: 'Pcs' },
        { value: 'kg', label: 'Kg' },
        { value: 'gr', label: 'Gr' },
        { value: 'l', label: 'L' },
        { value: 'set', label: 'Set' },
        { value: 'box', label: 'Box' },
        { value: 'roll', label: 'Roll' },
        { value: 'unit', label: 'Unit' },
    ]
    return (
        <div>
            <form onSubmit={handleSubmit}>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Informasi Barang */}
                    <AInput
                        id="kode_barang"
                        icon={User}
                        name="kode_barang"
                        label="Kode Barang"
                        placeholder="Masukkan Kode Barang"
                        value={formData.kode_barang}
                        onChange={handleInputChange}
                        error={showErrors ? errors.kode_barang : ''}
                    />
                    
                    <AInput
                        id="nama_barang"
                        icon={Briefcase}
                        name="nama_barang"
                        label="Nama Barang"
                        placeholder="Masukkan Nama Barang"
                        value={formData.nama_barang}
                        onChange={handleInputChange}
                        error={showErrors ? errors.nama_barang : ''}
                    />
                    
                    <ASelect
                        id="kategori"
                        name="kategori"
                        label="Kategori"
                        placeholder="Pilih Kategori"
                        value={formData.kategori}
                        onChange={handleInputChange}
                        error={showErrors ? errors.kategori : ''}
                        options={kategoriOptions}
                    />
                    
                    <ASelect
                        id="satuan"
                        name="satuan"
                        label="Satuan"
                        placeholder="Pilih Satuan"
                        value={formData.satuan}
                        onChange={handleInputChange}
                        error={showErrors ? errors.satuan : ''}
                        options={satuanOptions}
                    />
                    
                    {/* Informasi Stok */}
                    <AInput
                        id="stok_awal"
                        icon={Gauge}
                        name="stok_awal"
                        label="Stok Awal"
                        placeholder="Masukkan Stok Awal"
                        value={formData.stok_awal}
                        onChange={handleInputChange}
                        error={showErrors ? errors.stok_awal : ''}
                    />
                    
                    <AInput
                        id="stok_minimum"
                        icon={Gauge}
                        name="stok_minimum"
                        label="Stok Minimum"
                        placeholder="Masukkan Stok Minimum"
                        value={formData.stok_minimum}
                        onChange={handleInputChange}
                        error={showErrors ? errors.stok_minimum : ''}
                    />
                    
                    <ASelect
                        id="lokasi"
                        name="lokasi"
                        label="Lokasi"
                        placeholder="Pilih Lokasi"
                        value={formData.lokasi}
                        onChange={handleInputChange}
                        error={showErrors ? errors.lokasi : ''}
                        options={labs.map((item) => ({
                            value: item.id,
                            label: item.nama_lab,
                        }))}
                    />
                    
                    {/* Kondisi - Full Width */}
                    <div className="md:col-span-2">
                        <ARadio
                            id="kondisi"
                            name="kondisi"
                            label="Kondisi"
                            options={[
                                { value: 'baik', label: 'Baik' },
                                { value: 'rusak', label: 'Rusak' },
                            ]}
                            value={formData.kondisi}
                            onChange={handleInputChange}
                            error={showErrors ? errors.kondisi : ''}
                            inline
                        />
                    </div>
                    
                    {/* Keterangan - Full Width */}
                    <div className="md:col-span-2">
                        <AInput
                            id="ket"
                            icon={NotebookText}
                            name="ket"
                            label="Keterangan"
                            placeholder="Masukkan Keterangan"
                            value={formData.ket}
                            onChange={handleInputChange}
                            error={showErrors ? errors.ket : ''}
                            multiline
                            rows={3}
                        />
                    </div>
                    
                    {/* Gambar - Full Width */}
                    <div className="md:col-span-2">
                        <AFile
                            id="gambar"
                            name="gambar"
                            label="Gambar"
                            placeholder="Pilih Gambar"
                            value={formData.gambar}
                            onChange={handleFileChange}
                            onRemove={handleFileRemove}
                            accept="image/*"
                            maxSize={2}
                            error={showErrors ? errors.gambar : ''}
                            helperText="Format: JPG, PNG, JPEG. Maksimal 2MB"
                        />
                    </div>
                    
                    {/* Required Fields Info - Full Width */}
                    <div className="md:col-span-2">
                        <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 text-blue-700 dark:text-blue-300 px-4 py-3 rounded-lg">
                            <p className="text-xs">
                                <span className="text-red-600 font-bold">*</span> = Wajib diisi
                            </p>
                        </div>
                    </div>
                    
                    {/* Action Buttons - Full Width */}
                    <div className="md:col-span-2 flex justify-end gap-3 pt-2">
                        {onClose && (
                            <Button 
                                type="button" 
                                onClick={onClose}
                                variant="secondary"
                            >
                                Batal
                            </Button>
                        )}
                        <Button 
                            type="submit" 
                            loading={loading}
                        >
                            {isEditMode ? 'Update Data' : 'Simpan Data'}
                        </Button>
                    </div>
                </div>
            </form>
        </div>
    )
}