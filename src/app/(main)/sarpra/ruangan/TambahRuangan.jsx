'use client'
import { useState, useEffect } from 'react'
import AInput from '@/components/AInput'
import AFile from '@/components/AFile'
import ARadio from '@/components/ARadio'
import ASelect from '@/components/ASelect'
import { User, NotebookText, Building, Gauge } from 'lucide-react'
import Button from '@/components/Button'
import { validateRuanganForm } from '@/app/utils/validator'
export default function TambahRuangan({
    onClose = null,
    onSuccess = null,
    postRuangan,
    editingRuangan = null,
    isEditMode = false,
    gedung
}) {
    const [form, setForm] = useState({
        ruangan: '',
        gedung_id: '',
        status: '',
        ket: '',
        luas: '',
        jenis: '',
        foto: null
    })
    const [errors, setErrors] = useState({})
    const [loading, setLoading] = useState(false)
    const [showErrors, setShowErrors] = useState(false)
    useEffect(() => {
        if (isEditMode && editingRuangan) {
            setForm({
                ruangan: editingRuangan.ruangan || '',
                gedung_id: editingRuangan.gedung_id || '',
                status: editingRuangan.status || '',
                ket: editingRuangan.ket || '',
                luas: editingRuangan.luas || '',
                jenis: editingRuangan.jenis || '',
                foto: editingRuangan.foto || '',
            })
        }
    }, [isEditMode, editingRuangan])
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
        const newErrors = validateRuanganForm(form)
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
                submitData.append('ruangan', form.ruangan)
                submitData.append('gedung_id', form.gedung_id)
                submitData.append('status', form.status)
                submitData.append('ket', form.ket)
                submitData.append('luas', form.luas)
                submitData.append('jenis', form.jenis)
                submitData.append('foto', form.foto)
            } else {
                submitData = {
                    ruangan: form.ruangan,
                    gedung_id: form.gedung_id,
                    status: form.status,
                    ket: form.ket,
                    luas: form.luas,
                    jenis: form.jenis,
                    foto: form.foto || null,
                }
            }

            if (postRuangan) {
                await postRuangan(submitData)
            } else {
                throw new Error('postRuangan function not provided')
            }

            setForm({
                ruangan: '',
                gedung_id: '',
                status: '',
                ket: '',
                luas: '',
                jenis: '',
                foto: '',
            })

            setShowErrors(false)
            setErrors({})

            if (onSuccess) onSuccess(submitData)
            if (onClose) onClose()

        } catch (error) {
            console.error('Error saving ruangan:', error)
            const errorMessage = error.response?.data?.message || error.message || 'Terjadi kesalahan saat menyimpan data'
            alert(errorMessage)
        } finally {
            setLoading(false)
        }
    }
    return (
        <div>
            <form onSubmit={handleSubmit}>
                <AInput
                    id="ruangan"
                    icon={Building}
                    name="ruangan"
                    label="Nama Ruangan"
                    placeholder="Masukkan Nama Ruangan"
                    value={form.ruangan}
                    onChange={handleInputChange}
                    error={showErrors ? errors.ruangan : ''}
                />
                <ASelect
                    id="gedung_id"
                    icon={Building}
                    name="gedung_id"
                    label="Gedung"
                    placeholder="Pilih Gedung"
                    value={form.gedung_id}
                    options={gedung.map((item) => ({
                        value: item.id,
                        label: item.gedung,
                    }))}
                    onChange={handleInputChange}
                    error={showErrors ? errors.gedung_id : ''}
                />
                <ARadio
                    id="status"
                    name="status"
                    label="Status"
                    options={[
                        { value: 'open', label: 'Open' },
                        { value: 'close', label: 'Close' },
                    ]}
                    value={form.status}
                    onChange={handleInputChange}
                    error={showErrors ? errors.status : ''}
                />
                <AInput
                    id="ket"
                    icon={NotebookText}
                    name="ket"
                    label="Keterangan"
                    placeholder="Masukkan Keterangan"
                    value={form.ket}
                    onChange={handleInputChange}
                    error={showErrors ? errors.ket : ''}
                />
                <ASelect
                    id="jenis"
                    icon={NotebookText}
                    name="jenis"
                    label="Jenis"
                    placeholder="Pilih Jenis"
                    value={form.jenis}
                    options={[
                        { value: 'rombel', label: 'Rombel' },
                        { value: 'gudang', label: 'Gudang' },
                        { value: 'aula', label: 'Aula' },
                        { value: 'ruang rapat', label: 'Ruang Rapat' },
                        { value: 'ruang kerja', label: 'Ruang Kerja' },
                        { value: 'ruang praktikum', label: 'Ruang Praktikum' },
                        { value: 'ruang aktivitas', label: 'Ruang Aktivitas' },
                    ]}
                    onChange={handleInputChange}
                    error={showErrors ? errors.jenis : ''}
                />
                <AInput
                    id="luas"
                    icon={Gauge}
                    name="luas"
                    label="Luas"
                    placeholder="Masukkan Luas"
                    value={form.luas}
                    onChange={handleInputChange}
                />
                <AFile
                    id="foto"
                    icon={User}
                    label="Foto"
                    name="foto"
                    value={form.foto}
                    onChange={handleFileChange}
                    onRemove={handleFileRemove}
                    error={showErrors ? errors.foto : ''}
                    required
                />
                <div className="flex justify-end gap-2 mt-6">
                    <Button type="submit" disabled={loading}>
                        {loading ? 'Menyimpan...' : 'Simpan'}
                    </Button>
                </div>
            </form>
        </div>
    )
}
