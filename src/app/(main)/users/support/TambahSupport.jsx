'use client'
import { useState, useEffect } from 'react'
import AInput from '@/components/AInput'
import AFile from '@/components/AFile'
import ARadio from '@/components/ARadio'
import ASelect from '@/components/ASelect'
import ADatePicker from '@/components/ADatePicker'
import { User, Hash, MapPin, Phone, Calendar, Image } from 'lucide-react'
import Button from '@/components/Button'
import { validateSupportForm } from '@/app/utils/validator'
export default function TambahSupport({
    onClose = null,
    onSuccess = null,
    postSupport,
    editingSupport = null,
    isEditMode = false,
}) {
    const [form, setForm] = useState({
        kode: '',
        nama: '',
        alamat: '',
        tgl_lahir: '',
        hp: '',
        jk: '',
        status: '',
        tmt: '',
        foto: null,
    })
    const [errors, setErrors] = useState({})
    const [loading, setLoading] = useState(false)
    const [showErrors, setShowErrors] = useState(false)
    useEffect(() => {
        if (isEditMode && editingSupport) {
            setForm({
                kode: editingSupport.kode || '',
                nama: editingSupport.nama || '',
                alamat: editingSupport.alamat || '',
                tgl_lahir: editingSupport.tgl_lahir || '',
                hp: editingSupport.hp || '',
                jk: editingSupport.jk || '',
                status: editingSupport.status || '',
                tmt: editingSupport.tmt || '',
                foto: editingSupport.foto || '',
            })
        }
    }, [isEditMode, editingSupport])
    const handleInputChange = (e) => {
        const { name, value } = e.target
        setForm(prev => ({
            ...prev,
            [name]: value
        }))
        if (showErrors && errors[name]) {
            setErrors(prev => ({
                ...prev,
                [name]: ''
            }))
        }
    }
    const handleFileChange = (e) => {
        const { name, value } = e.target
        setForm(prev => ({
            ...prev,
            [name]: value
        }))
        if (showErrors && errors[name]) {
            setErrors(prev => ({
                ...prev,
                [name]: ''
            }))
        }
    }
    const handleFileRemove = () => {
        setForm(prev => ({
            ...prev,
            foto: null
        }))
    }
    const validateForm = () => {
        const newErrors = validateSupportForm(form)
        setErrors(newErrors)
        return Object.keys(newErrors).length === 0
    }
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

            if (form.foto instanceof File) {
                submitData = new FormData()
                submitData.append('kode', form.kode)
                submitData.append('nama', form.nama)
                submitData.append('alamat', form.alamat)
                submitData.append('tgl_lahir', form.tgl_lahir)
                submitData.append('hp', form.hp)
                submitData.append('jk', form.jk)
                submitData.append('status', form.status)
                submitData.append('tmt', form.tmt)
                submitData.append('foto', form.foto)
            } else {
                submitData = {
                    kode: form.kode,
                    nama: form.nama,
                    alamat: form.alamat,
                    tgl_lahir: form.tgl_lahir,
                    hp: form.hp,
                    jk: form.jk,
                    status: form.status,
                    tmt: form.tmt,
                    foto: form.foto || null,
                }
            }

            if (postSupport) {
                await postSupport(submitData)
            } else {
                throw new Error('postSupport function not provided')
            }

            setForm({
                kode: '',
                nama: '',
                alamat: '',
                tgl_lahir: '',
                hp: '',
                jk: '',
                status: '',
                tmt: '',
                foto: '',
            })

            setShowErrors(false)
            setErrors({})

            if (onSuccess) onSuccess(submitData)
            if (onClose) onClose()

        } catch (error) {
            console.error('Error saving support:', error)
            const errorMessage = error.response?.data?.message || error.message || 'Terjadi kesalahan saat menyimpan data'
            alert(errorMessage)
        } finally {
            setLoading(false)
        }
    }
    return (
        <div>
            <form onSubmit={handleSubmit}>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Informasi Dasar */}
                    <AInput
                        id="kode"
                        icon={Hash}
                        name="kode"
                        label="Kode"
                        placeholder="Masukkan Kode"
                        value={form.kode}
                        onChange={handleInputChange}
                        error={showErrors ? errors.kode : ''}
                        required
                    />
                    
                    <AInput
                        id="nama"
                        icon={User}
                        name="nama"
                        label="Nama"
                        placeholder="Masukkan Nama"
                        value={form.nama}
                        onChange={handleInputChange}
                        error={showErrors ? errors.nama : ''}
                        required
                    />
                    
                    {/* Alamat - Full Width */}
                    <div className="md:col-span-2">
                        <AInput
                            id="alamat"
                            icon={MapPin}
                            name="alamat"
                            label="Alamat"
                            placeholder="Masukkan Alamat"
                            value={form.alamat}
                            onChange={handleInputChange}
                            error={showErrors ? errors.alamat : ''}
                            required
                            multiline
                            rows={3}
                        />
                    </div>
                    
                    {/* Informasi Personal */}
                    <ADatePicker
                        id="tgl_lahir"
                        name="tgl_lahir"
                        label="Tanggal Lahir"
                        placeholder="Pilih Tanggal Lahir"
                        value={form.tgl_lahir}
                        onChange={handleInputChange}
                        error={showErrors ? errors.tgl_lahir : ''}
                    />
                    
                    <AInput
                        id="hp"
                        icon={Phone}
                        name="hp"
                        label="No. HP"
                        placeholder="Masukkan No. HP"
                        value={form.hp}
                        onChange={handleInputChange}
                        error={showErrors ? errors.hp : ''}
                    />
                    
                    {/* Jenis Kelamin - Full Width */}
                    <div className="md:col-span-2">
                        <ARadio
                            id="jk"
                            name="jk"
                            label="Jenis Kelamin"
                            value={form.jk}
                            onChange={handleInputChange}
                            error={showErrors ? errors.jk : ''}
                            required
                            inline
                            options={[
                                { 
                                    value: 'laki-laki', 
                                    label: 'Laki-laki'
                                },
                                { 
                                    value: 'perempuan', 
                                    label: 'Perempuan'
                                }
                            ]}
                        />
                    </div>
                    
                    {/* Informasi Status */}
                    <div className="md:col-span-2">
                        <ARadio
                            id="status"
                            name="status"
                            label="Status"
                            value={form.status}
                            onChange={handleInputChange}
                            error={showErrors ? errors.status : ''}
                            required
                            inline
                            options={[
                                { 
                                    value: 'aktif', 
                                    label: 'Aktif'
                                },
                                { 
                                    value: 'non-aktif', 
                                    label: 'Non Aktif'
                                }
                            ]}
                        />
                    </div>
                    
                    <div className="md:col-span-2">
                        <ADatePicker
                            id="tmt"
                            name="tmt"
                            label="TMT (Terhitung Mulai Tanggal)"
                            placeholder="Pilih TMT"
                            value={form.tmt}
                            onChange={handleInputChange}
                            error={showErrors ? errors.tmt : ''}
                        />
                    </div>
                    
                    {/* Foto - Full Width */}
                    <div className="md:col-span-2">
                        <AFile
                            id="foto"
                            name="foto"
                            label="Foto"
                            value={form.foto}
                            onChange={handleFileChange}
                            onRemove={handleFileRemove}
                            accept="image/*"
                            maxSize={2}
                            error={showErrors ? errors.foto : ''}
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
                    <div className="md:col-span-2 flex gap-3 pt-2">
                        <Button 
                            type="submit" 
                            loading={loading}
                            className="flex-1"
                        >
                            {isEditMode ? 'Update Data' : 'Simpan Data'}
                        </Button>
                        <Button 
                            type="button" 
                            onClick={onClose}
                            variant="secondary"
                            className="flex-1"
                        >
                            Batal
                        </Button>
                    </div>
                </div>
            </form>
        </div>
    )
}